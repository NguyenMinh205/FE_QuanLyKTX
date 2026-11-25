/**
 * Mức lấp đầy cấp Phòng trên sơ đồ tầng — bảng màu kiến trúc trầm, dùng thanh màu cạnh trái thay vì tô nền pastel.
 */
export const FILL_LEVEL = {
  available:   { label: 'Còn chỗ',      hint: 'từ 2 chỗ trống', color: '#16A34A', text: '#15803D', rail: '#16A34A' },
  almost:      { label: 'Sắp đầy',      hint: 'còn 1 chỗ',      color: '#D97706', text: '#B45309', rail: '#D97706' },
  full:        { label: 'Đã đầy',       hint: 'hết chỗ',        color: '#94A3B8', text: '#667085', rail: '#94A3B8' },
  closed:      { label: 'Đang bảo trì', hint: 'ngừng nhận đơn', color: '#DC2626', text: '#B91C1C', rail: '#DC2626' },
};

export const LEGEND_LEVELS = ['available', 'almost', 'full', 'closed'];

export const fillLevelOf = (room) => {
  if (room.status === 'maintenance') return 'closed';
  if ((room.availableSlots ?? 0) === 0) return 'full';
  if (room.availableSlots === 1) return 'almost';
  return 'available';
};

export const slotTextOf = (room) => {
  const level = fillLevelOf(room);
  if (level === 'closed') return 'Đang bảo trì';
  if (level === 'full') return 'Đã đầy';
  return `Còn ${room.availableSlots} chỗ`;
};

/** VD "A14-101" */
export const roomLabelOf = (room) => {
  if (!room) return '';
  const number = String(room.roomNumber ?? '');
  const building = String(room.buildingCode ?? '');
  return building && !number.toUpperCase().startsWith(building.toUpperCase()) ? `${building}-${number}` : number;
};

/** Tỷ lệ lấp đầy cấp phòng = đang giữ chỗ / (tổng chỗ − bảo trì) */
export const occupancyRate = (occupied, total, maintenance = 0) => {
  const usable = (total || 0) - (maintenance || 0);
  return usable > 0 ? (occupied || 0) / usable : 0;
};
