import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

export const METER_FIELDS = ['electricityStart', 'electricityEnd', 'waterStart', 'waterEnd'];

/** "2026-10" → "Tháng 10/2026" */
export const periodLabel = (period) => {
  const [y, m] = String(period || '').split('-');
  return y && m ? `Tháng ${Number(m)}/${y}` : '—';
};

export const currentPeriod = () => dayjs().format('YYYY-MM');
export const previousPeriod = (period) => dayjs(`${period}-01`).subtract(1, 'month').format('YYYY-MM');

/** Kỳ hiện tại và `count − 1` kỳ trước — không nhập trước kỳ tương lai */
export const periodOptions = (count = 12) => Array.from({ length: count }, (_, i) => {
  const value = dayjs().startOf('month').subtract(i, 'month').format('YYYY-MM');
  return { value, label: periodLabel(value) };
});

/** Danh sách có thể là mảng hoặc { items } (backend hiện trả mảng cho utility-readings) */
export const itemsOf = (body) => (Array.isArray(body) ? body : body?.items || []);

/**
 * Chia đều tiền của phòng, dư dồn cho một người (DATA-SCHEMA 3.9): base = floor(total / n), remainder = total − base × n.
 * Tổng các phần luôn bằng đúng tổng tiền phòng.
 */
export const splitEvenly = (total, n) => {
  if (!n) return { base: 0, remainder: 0 };
  const base = Math.floor(total / n);
  return { base, remainder: total - base * n };
};

const isBlank = (v) => v === null || v === undefined || v === '';

/**
 * Tính trạng thái một dòng phòng từ dữ liệu đã lưu + bản nháp đang gõ.
 * @param room      phòng (occupied, capacity, roomNumber…)
 * @param saved     chỉ số kỳ này đã lưu (hoặc undefined)
 * @param previous  chỉ số kỳ trước (hoặc undefined) — chỉ số đầu kỳ tự điền từ đây (BR-51)
 * @param draft     { field: value } người dùng đã sửa
 * @param prices    đơn giá hiện tại { electricity, water } — dòng đã lưu dùng giá đã chốt (BR-52)
 * @param serverError lỗi backend trả về lần lưu trước
 */
export const buildRow = ({ room, saved, previous, draft, prices, serverError }) => {
  const occupants = room.occupied ?? 0;
  const base = saved
    ? Object.fromEntries(METER_FIELDS.map((f) => [f, saved[f]]))
    : {
      electricityStart: previous?.electricityEnd ?? null,
      electricityEnd: null,
      waterStart: previous?.waterEnd ?? null,
      waterEnd: null,
    };
  const values = { ...base, ...draft };
  const dirty = !!draft && METER_FIELDS.some((f) => (draft[f] ?? null) !== (base[f] ?? null) && f in draft);
  const invoiced = !!saved?.isInvoiced;
  const skipped = !saved && occupants === 0;

  // Ô trống khi đang nhập dở chưa phải lỗi — dòng chỉ bị giữ lại, không lưu; lỗi thật là cuối < đầu (BR-50)
  const errors = {};
  const complete = METER_FIELDS.every((f) => !isBlank(values[f]));
  if (dirty) {
    if (!isBlank(values.electricityEnd) && !isBlank(values.electricityStart) && values.electricityEnd < values.electricityStart) errors.electricityEnd = 'Nhỏ hơn chỉ số cũ';
    if (!isBlank(values.waterEnd) && !isBlank(values.waterStart) && values.waterEnd < values.waterStart) errors.waterEnd = 'Nhỏ hơn chỉ số cũ';
  }
  const hasError = Object.keys(errors).length > 0 || (!!serverError && dirty);

  // BR-51: sửa chỉ số đầu kỳ khác cuối kỳ trước → chỉ cảnh báo, không chặn
  const warnings = {};
  if (previous && !isBlank(values.electricityStart) && values.electricityStart !== previous.electricityEnd) warnings.electricityStart = `Kỳ trước ${previous.electricityEnd}`;
  if (previous && !isBlank(values.waterStart) && values.waterStart !== previous.waterEnd) warnings.waterStart = `Kỳ trước ${previous.waterEnd}`;

  const electricityConsumption = complete && !errors.electricityEnd ? values.electricityEnd - values.electricityStart : null;
  const waterConsumption = complete && !errors.waterEnd ? values.waterEnd - values.waterStart : null;
  const electricityPrice = saved?.electricityUnitPrice ?? prices.electricity;
  const waterPrice = saved?.waterUnitPrice ?? prices.water;
  const total = electricityConsumption !== null && waterConsumption !== null
    ? electricityConsumption * electricityPrice + waterConsumption * waterPrice
    : null;

  let status = 'empty';
  if (invoiced) status = 'invoiced';
  else if (hasError) status = 'error';
  else if (dirty && !complete) status = 'incomplete';
  else if (dirty) status = 'unsaved';
  else if (saved) status = 'saved';
  else if (skipped) status = 'skipped';

  return {
    key: room.id, room, roomLabel: roomLabelOf(room), saved, previous, values, dirty, invoiced, skipped, errors, warnings, serverError: dirty ? serverError : null,
    complete, status, occupants, electricityConsumption, waterConsumption, electricityPrice, waterPrice, total,
    share: total !== null ? splitEvenly(total, occupants) : null,
  };
};

export const READING_STATUS = {
  saved:    { label: 'Đã lưu',     color: 'success' },
  unsaved:  { label: 'Chưa lưu',   color: 'processing' },
  error:    { label: 'Lỗi',        color: 'error' },
  incomplete: { label: 'Nhập dở',  color: 'warning' },
  empty:    { label: 'Chưa nhập',  color: 'warning' },
  skipped:  { label: 'Bỏ qua',     color: 'default' },
  invoiced: { label: 'Đã lập HĐ',  color: 'purple' },
};
