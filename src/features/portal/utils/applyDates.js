import dayjs from 'dayjs';

/** Số tháng làm tròn lên, VD 01/09/2026 → 30/06/2027 = 10 tháng */
export const monthsBetween = (start, end) => {
  if (!start || !end || !end.isAfter(start)) return 0;
  return Math.ceil(end.diff(start, 'month', true) - 0.01);
};

/** Mặc định: từ hôm nay tới hết năm học (30/6) — sinh viên tự sửa được */
export const defaultStayPeriod = () => {
  const today = dayjs().startOf('day');
  const endYear = today.month() >= 5 ? today.year() + 1 : today.year();
  return { startDate: today, endDate: dayjs(`${endYear}-06-30`) };
};
