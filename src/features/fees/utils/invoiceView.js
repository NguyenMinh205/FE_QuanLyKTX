import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** "K1-302" từ RoomRef */
export const roomTextOf = (room) => (room ? roomLabelOf(room) : '—');

/** Ai phải trả: sinh viên (hóa đơn cá nhân) hoặc cả phòng (điện nước) */
export const subjectOf = (inv) => (inv.scope === 'room'
  ? { name: `Cả phòng ${roomTextOf(inv.room)}`, sub: inv.room?.buildingName ?? '' }
  : { name: inv.student?.fullName ?? '—', sub: [inv.student?.studentCode, inv.room && roomTextOf(inv.room)].filter(Boolean).join(' · ') });

/** Chưa trả và đã qua hạn — v2 không có trạng thái "quá hạn", chỉ tô đỏ ngày (API.md §8) */
export const isPastDue = (inv) => inv.status === 'unpaid' && !!inv.dueDate && dayjs(inv.dueDate).isBefore(dayjs(), 'day');

/**
 * Nội dung chuyển khoản sinh viên ghi khi quét VietQR (API.md §9) — cán bộ dò sao kê theo chuỗi này.
 * Bỏ dấu "-" vì app ngân hàng có thể lược mất.
 */
export const transferContentOf = (inv) => {
  const code = String(inv.invoiceCode || '').replace(/-/g, '');
  return inv.scope === 'room' ? `HAUI ${code} P${inv.room?.roomNumber ?? ''}` : `HAUI ${code} ${inv.student?.studentCode ?? ''}`;
};
