import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** Bốn ô nhập của một phòng — trùng tên trường trong `rows[]` của POST /utility-readings/bulk */
export const METER_FIELDS = ['electricityOldIndex', 'electricityNewIndex', 'waterOldIndex', 'waterNewIndex'];

/** "2026-10" → "Tháng 10/2026" */
export const periodLabel = (period) => {
  const [y, m] = String(period || '').split('-');
  return y && m ? `Tháng ${Number(m)}/${y}` : '—';
};

export const currentPeriod = () => dayjs().format('YYYY-MM');

/** Tháng hiện tại và `count − 1` tháng trước — không nhập trước tháng tương lai */
export const periodOptions = (count = 12) => Array.from({ length: count }, (_, i) => {
  const value = dayjs().startOf('month').subtract(i, 'month').format('YYYY-MM');
  return { value, label: periodLabel(value) };
});

const isBlank = (v) => v === null || v === undefined || v === '';

/** Giá trị 4 ô đang lưu của một bản ghi */
const valuesOf = (reading) => ({
  electricityOldIndex: reading.electricity.oldIndex,
  electricityNewIndex: reading.electricity.newIndex,
  waterOldIndex: reading.water.oldIndex,
  waterNewIndex: reading.water.newIndex,
});

/**
 * Trạng thái một dòng phòng từ dữ liệu của lưới + bản nháp đang gõ.
 * @param sheetRow   một phần tử `rows[]` của GET /utility-readings/sheet: { room, previous, reading }
 * @param draft      { field: value } người dùng đã sửa
 * @param prices     đơn giá đang hiển thị ở đầu lưới { electricity, water }
 * @param priceDirty đơn giá vừa đổi → mọi phòng đã lưu nhưng chưa chốt phải lưu lại với giá mới
 * @param serverError lỗi backend trả về cho dòng này ở lần lưu trước
 */
export const buildRow = ({ sheetRow, draft, prices, priceDirty, serverError }) => {
  const { room, previous, reading } = sheetRow;
  const occupants = room.occupied ?? 0;
  const base = reading
    ? valuesOf(reading)
    : {
      electricityOldIndex: previous?.electricityNewIndex ?? null,
      electricityNewIndex: null,
      waterOldIndex: previous?.waterNewIndex ?? null,
      waterNewIndex: null,
    };
  const values = { ...base, ...draft };
  const dirty = !!draft && METER_FIELDS.some((f) => f in draft && (draft[f] ?? null) !== (base[f] ?? null));
  const billed = !!reading?.isBilled;
  // Phòng trống chưa có bản ghi: không cần nhập, không bao giờ lập hóa đơn (FR-41)
  const skipped = !reading && occupants === 0;
  const repriced = priceDirty && !!reading && !billed;

  // Ô trống khi đang nhập dở chưa phải lỗi — dòng chỉ bị giữ lại, không lưu; lỗi thật là mới < cũ
  const errors = {};
  const complete = METER_FIELDS.every((f) => !isBlank(values[f]));
  if (dirty) {
    if (!isBlank(values.electricityNewIndex) && !isBlank(values.electricityOldIndex) && values.electricityNewIndex < values.electricityOldIndex) errors.electricityNewIndex = 'Nhỏ hơn chỉ số cũ';
    if (!isBlank(values.waterNewIndex) && !isBlank(values.waterOldIndex) && values.waterNewIndex < values.waterOldIndex) errors.waterNewIndex = 'Nhỏ hơn chỉ số cũ';
  }
  const hasError = Object.keys(errors).length > 0 || (!!serverError && (dirty || repriced));

  // BR-51: chỉ số cũ khác chỉ số mới tháng trước → chỉ cảnh báo (thay công tơ, ghi nhầm tháng trước), không chặn
  const warnings = {};
  if (previous && !isBlank(values.electricityOldIndex) && values.electricityOldIndex !== previous.electricityNewIndex) warnings.electricityOldIndex = `Tháng trước ${previous.electricityNewIndex}`;
  if (previous && !isBlank(values.waterOldIndex) && values.waterOldIndex !== previous.waterNewIndex) warnings.waterOldIndex = `Tháng trước ${previous.waterNewIndex}`;

  const electricityUsage = complete && !errors.electricityNewIndex ? values.electricityNewIndex - values.electricityOldIndex : null;
  const waterUsage = complete && !errors.waterNewIndex ? values.waterNewIndex - values.waterOldIndex : null;
  // Đã chốt, hoặc đã lưu mà không sửa và không đổi giá: đúng giá trên bản ghi — đó là số sẽ phát hành.
  // Chỉ dòng sắp lưu (sửa hoặc đổi giá) mới tính theo giá đầu lưới
  const usesStoredPrice = billed || (!!reading && !dirty && !repriced);
  const electricityPrice = usesStoredPrice ? reading.electricity.unitPrice : prices.electricity;
  const waterPrice = usesStoredPrice ? reading.water.unitPrice : prices.water;
  const total = electricityUsage !== null && waterUsage !== null
    ? electricityUsage * electricityPrice + waterUsage * waterPrice
    : null;
  // Chỉ để tham khảo (BR-03): cả phòng trả chung một hóa đơn. Đã chốt thì dùng số chốt lúc phát hành
  const headcount = billed ? reading.occupantsCount : occupants;
  const perPerson = billed ? reading.perStudentAmount : (total !== null && occupants ? Math.round(total / occupants) : null);

  let status = 'empty';
  if (billed) status = 'billed';
  else if (hasError) status = 'error';
  else if (dirty && !complete) status = 'incomplete';
  else if ((dirty || repriced) && complete) status = 'unsaved';
  else if (reading) status = 'saved';
  else if (skipped) status = 'skipped';

  return {
    key: room.id, room, roomLabel: roomLabelOf(room), reading, previous, values, dirty, billed, skipped, errors, warnings,
    serverError: dirty || repriced ? serverError : null,
    complete, status, occupants, headcount, electricityUsage, waterUsage, electricityPrice, waterPrice, total, perPerson,
    /** Đủ điều kiện vào lần Chốt & phát hành tới: đã lưu, chưa chốt, phòng có người */
    publishable: !!reading && !billed && occupants > 0,
  };
};

export const READING_STATUS = {
  saved:      { label: 'Đã lưu',        color: 'success' },
  unsaved:    { label: 'Chưa lưu',      color: 'processing' },
  error:      { label: 'Lỗi',           color: 'error' },
  incomplete: { label: 'Nhập dở',       color: 'warning' },
  empty:      { label: 'Chưa nhập',     color: 'warning' },
  skipped:    { label: 'Phòng trống',   color: 'default' },
  billed:     { label: 'Đã phát hành',  color: 'purple' },
};
