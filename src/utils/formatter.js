import dayjs from 'dayjs';

/** 646000 -> "646.000 đ" */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0 đ';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
};

/** "2026-12-15" -> "15/12/2026" */
export const formatDate = (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

/** "2026-12-15T14:30:00" -> "15/12/2026 14:30" */
export const formatDateTime = (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—');

/** (10, 2026) -> "Tháng 10/2026" */
export const formatPeriod = (month, year) => (month && year ? `Tháng ${month}/${year}` : '—');

/** "0912345678" -> "0912 345 678" */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

/** 87.745 -> "87,75%" */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(2).replace('.', ',')}%`;
};
