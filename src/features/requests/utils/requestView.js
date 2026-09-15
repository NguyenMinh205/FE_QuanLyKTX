import dayjs from 'dayjs';

/** "B105-02" → "B105" */
export const roomOfBedCode = (bedCode) => (bedCode ? bedCode.split('-')[0] : '—');

/** "B105-02" → "B105 · Giường 02" */
export const bedTextOf = (bedCode) => {
  if (!bedCode) return '—';
  const [room, bed] = bedCode.split('-');
  return bed ? `${room} · Giường ${bed}` : room;
};

/** Số tháng thêm khi gia hạn, làm tròn lên; cuối tháng → cuối tháng tính tròn tháng — "30/06/2027 → 31/12/2027" = 6 */
export const extraMonthsOf = (from, to) => {
  if (!from || !to) return 0;
  const a = dayjs(from);
  const b = dayjs(to);
  if (!b.isAfter(a)) return 0;
  const lastDay = (d) => d.date() === d.daysInMonth();
  const partial = b.date() > a.date() && !(lastDay(a) && lastDay(b));
  return (b.year() - a.year()) * 12 + (b.month() - a.month()) + (partial ? 1 : 0);
};

/** Số ngày từ hôm nay tới ngày (âm = đã qua) */
export const daysFromToday = (date) => dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');

/** "2026-09" → "9/2026" */
export const periodText = (period) => {
  if (!period) return '';
  const [y, m] = period.split('-');
  return `${Number(m)}/${y}`;
};

export const REFUND_METHODS = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
];
