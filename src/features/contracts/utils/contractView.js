import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** Ngưỡng "sắp hết hạn" hiển thị ở danh sách và trang chủ sinh viên */
export const EXPIRING_DAYS = 30;

/** Số ngày còn lại tới ngày kết thúc (âm = đã qua) */
export const daysLeftOf = (endDate) => dayjs(endDate).startOf('day').diff(dayjs().startOf('day'), 'day');

/** "K1-203 · Giường 03" từ RoomRef + số giường của hợp đồng */
export const placeTextOf = (c) => (c?.room ? `${roomLabelOf(c.room)} · Giường ${String(c.bedNumber).padStart(2, '0')}` : '—');

/** Trạng thái tiền cọc của một hợp đồng (FR-35, BR-08) → { text, color } để hiện nhãn */
export const depositStateOf = (c) => {
  if (c.isDepositRefunded) return { text: 'Đã hoàn cọc', color: 'success' };
  if (c.status === 'terminated') return { text: 'Chờ hoàn cọc', color: 'warning' };
  return { text: 'Đang giữ cọc', color: 'default' };
};
