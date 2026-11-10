import { roomLabelOf } from '../../rooms/utils/roomStatus';

/** "Trần Thị Bích" → "TB" (chữ đầu của họ + chữ đầu của tên) */
export const initialsOf = (fullName = '') => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
};

/** "Phòng K1-203" */
export const roomTextOf = (room) => (room ? `Phòng ${roomLabelOf(room)}` : '—');

/** 3 → "03" */
export const pad2 = (n) => String(n).padStart(2, '0');
