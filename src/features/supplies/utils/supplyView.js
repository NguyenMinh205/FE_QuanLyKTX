import { SUPPLY_CATEGORY } from '../../../constants/statuses';

export const CATEGORY_OPTIONS = Object.entries(SUPPLY_CATEGORY).map(([value, c]) => ({ value, label: c.label }));

/** "Vỏ đệm ×1, Vỏ gối ×2" — tóm tắt sản phẩm trong đơn */
export const itemsTextOf = (order) => (order.items || []).map((it) => `${it.name} ×${it.quantity}`).join(', ');

/** Phòng của sinh viên trên đơn: "B203". Backend có thể chỉ trả số phòng + tên tòa ("Tòa B") */
export const orderRoomOf = (order) => {
  if (order.roomCode) return order.roomCode;
  if (!order.roomNumber) return '—';
  const code = order.buildingCode ?? String(order.buildingName || '').replace(/^Tòa\s*/i, '');
  return `${code}${order.roomNumber}`;
};

/** null = hủy được; chuỗi = lý do không hủy được (FR-105) */
export const cancelOrderBlockReason = (order) => {
  if (order.status === 'cancelled') return 'Đơn đã hủy';
  if (order.status === 'delivered') return 'Đơn đã giao cho sinh viên';
  if (order.status === 'ready') return 'Sinh viên đã thanh toán — chỉ hủy được đơn chưa thanh toán';
  return null;
};

/** Backend có thể populate student/invoice thành object */
export const normalizeOrder = (o = {}) => {
  const student = o.student && typeof o.student === 'object' ? o.student : null;
  return {
    ...o,
    studentName: o.studentName ?? student?.fullName ?? null,
    studentCode: o.studentCode ?? student?.studentCode ?? null,
    items: o.items || [],
  };
};
