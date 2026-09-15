import dayjs from 'dayjs';

/** Số ngày ngưỡng "sắp hết hạn" — BR-29 (backend khai báo ở core/config/settings.js) */
export const EXPIRING_DAYS = 30;

export const OPEN_INVOICE_STATUSES = ['unpaid', 'partial', 'overdue'];

/** Số ngày từ hôm nay tới `date` (âm = đã qua) */
export const daysUntil = (date) => (date ? dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day') : null);

/** "B204-03" → { room: "B204", bed: "03" } */
export const splitBedCode = (bedCode = '') => {
  const [room, bed] = bedCode.split('-');
  return { room: room || null, bed: bed || null };
};

/** Kỳ hiển thị của hóa đơn: "Tháng 10/2026" hoặc tên loại khi không có kỳ */
export const invoicePeriodText = (inv, typeLabel) => {
  if (inv.billingPeriod) {
    const [y, m] = inv.billingPeriod.split('-');
    return `Tháng ${Number(m)}/${y}`;
  }
  return typeLabel;
};

/** "Điện, nước, tiền phòng" — gộp mô tả các dòng hóa đơn cho gọn */
export const invoiceSummaryText = (inv) => {
  const lines = inv.lineItems || [];
  if (inv.type === 'monthly') return 'Tiền phòng, điện, nước';
  if (inv.type === 'supplies') return lines.map((l) => l.description).join(', ') || 'Nhu yếu phẩm';
  return lines[0]?.description || '—';
};
