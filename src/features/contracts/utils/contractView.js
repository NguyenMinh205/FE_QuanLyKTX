import dayjs from 'dayjs';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

export const EXPIRING_DAYS = 30;

export const daysLeftOf = (endDate) => dayjs(endDate).startOf('day').diff(dayjs().startOf('day'), 'day');

/** Quản lý cấp Phòng (không còn số giường) */
export const placeTextOf = (c) => (c?.room ? `Phòng ${roomLabelOf(c.room)}` : '—');

/** Trạng thái tiền cọc của hợp đồng */
export const depositStateOf = (c) => {
  if (c.status === 'cancelled') return { text: 'Đã hủy', color: 'default' };
  if (c.status === 'pending_payment') return { text: 'Chờ nộp cọc', color: 'processing' };
  if (c.isDepositRefunded) return { text: 'Đã quyết toán cọc', color: 'success' };
  if (c.status === 'terminated') return { text: 'Chờ hoàn cọc', color: 'warning' };
  return { text: 'Đang giữ cọc', color: 'default' };
};
