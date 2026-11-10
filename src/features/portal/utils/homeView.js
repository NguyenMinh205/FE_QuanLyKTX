import dayjs from 'dayjs';

/** Số ngày ngưỡng "sắp hết hạn" — BR-29 (backend khai báo ở core/config/settings.js) */
export const EXPIRING_DAYS = 30;

/** Số ngày từ hôm nay tới `date` (âm = đã qua) */
export const daysUntil = (date) => (date ? dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day') : null);
