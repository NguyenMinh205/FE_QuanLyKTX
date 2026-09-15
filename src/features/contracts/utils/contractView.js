import dayjs from 'dayjs';

/** Ngưỡng "sắp hết hạn" — BR-29, khớp core/config/settings.js ở backend */
export const EXPIRING_DAYS = 30;

/** Số ngày còn lại tới ngày kết thúc (âm = đã qua) */
export const daysLeftOf = (endDate) => dayjs(endDate).startOf('day').diff(dayjs().startOf('day'), 'day');

/** Thời hạn hợp đồng tính theo tháng, làm tròn lên — "01/09/2026 → 30/06/2027" = 10 */
export const contractMonths = (startDate, endDate) => {
  const s = dayjs(startDate);
  const e = dayjs(endDate);
  if (!e.isAfter(s)) return 0;
  return Math.ceil(e.diff(s, 'month', true) - 0.01);
};

/** "B203-03" → "B203 · Giường 03" */
export const bedTextOf = (bedCode) => {
  if (!bedCode) return '—';
  const [room, bed] = bedCode.split('-');
  return bed ? `${room} · Giường ${bed}` : room;
};
