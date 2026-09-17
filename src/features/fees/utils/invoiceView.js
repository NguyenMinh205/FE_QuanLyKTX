import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** "2026-10" → "10/2026"; null → "—" */
export const periodShort = (period) => {
  const [y, m] = String(period || '').split('-');
  return y && m ? `${m}/${y}` : '—';
};

/** "A" + "101" → "A101"; không có phòng thì lấy phần phòng của mã giường "A101-02" */
export const invoiceRoomOf = (inv) => (inv.roomNumber
  ? roomLabelOf(inv)
  : (inv.bedCode ? String(inv.bedCode).split('-')[0] : '—'));

const OPEN_STATUSES = ['unpaid', 'partial', 'overdue'];
export const isOpenInvoice = (inv) => OPEN_STATUSES.includes(inv.status);

/** null = hủy được; chuỗi = lý do không hủy được (BR-46, FR-58) */
export const cancelBlockReason = (inv) => {
  if (inv.status === 'cancelled') return 'Hóa đơn đã hủy';
  if (inv.type === 'supplies') return 'Hóa đơn nhu yếu phẩm hủy theo đơn hàng ở màn Nhu yếu phẩm';
  if (inv.type === 'settlement') return 'Hóa đơn quyết toán sinh ra khi duyệt trả phòng, không hủy được';
  if (inv.paidAmount > 0) return 'Đã có thanh toán — không hủy được (BR-46)';
  return null;
};

/** Hạn thanh toán mặc định của một kỳ: ngày 10 tháng kế tiếp */
export const defaultDueDateOf = (period) => dayjs(`${period}-01`).add(1, 'month').date(10);

/** "Tiền điện tháng 9/2026 (56 kWh, chia đều 2 người)" → { main: "Tiền điện tháng 9/2026", sub: "56 kWh, chia đều 2 người" } */
export const splitLineDescription = (text) => {
  const m = String(text || '').match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return m ? { main: m[1], sub: m[2] } : { main: text || '—', sub: null };
};

/** Nội dung chuyển khoản gợi ý để kế toán đối soát: mã hóa đơn bỏ dấu "-" + MSSV */
export const transferNoteOf = (inv) => `${String(inv.invoiceCode || '').replace(/-/g, '')} ${inv.studentCode || ''}`.trim();
