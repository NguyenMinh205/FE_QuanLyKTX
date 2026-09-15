import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** "Trần Thị Bích" → "TB" (chữ đầu của họ + chữ đầu của tên) */
export const initialsOf = (fullName = '') => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
};

/** Phòng nguyện vọng đã hết giường trống — đơn "nghẽn chỗ" (BR-34: nộp đơn không giữ chỗ) */
export const isBlocked = (app) => app.status === 'pending' && app.requestedRoom?.availableSlots === 0;

/** "B205-04" → "04" */
export const bedNumberOfCode = (bedCode) => (bedCode ? bedCode.split('-').pop() : null);

/** "Phòng B203" */
export const roomTextOf = (room) => (room ? `Phòng ${roomLabelOf(room)}` : '—');
