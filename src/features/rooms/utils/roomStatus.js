/**
 * Mức lấp đầy của một phòng trên sơ đồ tầng — docs/08 mục 6.3.
 * Chỗ trống luôn là số giường `available` (BR-05), không phải capacity − số người ở.
 * Thứ tự ưu tiên: phòng đang bảo trì > có giường bảo trì > đã đầy > còn 1 chỗ > còn chỗ.
 * `color` cho thanh / chấm chú thích; `text` cho chữ — màu nhạt (#52C41A, #FAAD14) không đủ tương phản để làm chữ.
 */
export const FILL_LEVEL = {
  available:   { label: 'Còn chỗ',           hint: 'còn từ 2 chỗ',  color: '#52C41A', text: 'var(--success-text)', bg: '#F6FFED', border: '#D9F7BE' },
  almost:      { label: 'Sắp đầy',           hint: 'còn 1 chỗ',     color: '#FAAD14', text: 'var(--warning-text)', bg: '#FFFBE6', border: '#FFE58F' },
  full:        { label: 'Đã đầy',            hint: 'hết chỗ',       color: 'var(--text-tertiary)', text: 'var(--text-tertiary)', bg: '#FAFAFA', border: 'var(--line)' },
  maintenance: { label: 'Có giường bảo trì', hint: 'cần xử lý',     color: '#FF4D4F', text: 'var(--danger-text)', bg: '#FFF1F0', border: '#FFCCC7' },
  closed:      { label: 'Đang bảo trì',      hint: '',              color: '#BFBFBF', text: 'var(--text-tertiary)', bg: 'var(--layout-bg)', border: '#E8E8E8' },
};

export const LEGEND_LEVELS = ['available', 'almost', 'full', 'maintenance'];

export const fillLevelOf = (room) => {
  if (room.status === 'maintenance') return 'closed';
  if (room.maintenanceBeds > 0) return 'maintenance';
  if (room.availableSlots === 0) return 'full';
  if (room.availableSlots === 1) return 'almost';
  return 'available';
};

/** Dòng trạng thái ngắn trên ô phòng */
export const slotTextOf = (room) => {
  const level = fillLevelOf(room);
  if (level === 'closed') return 'Đang bảo trì';
  if (level === 'full') return 'Đã đầy';
  const slots = room.availableSlots > 0 ? `Còn ${room.availableSlots} chỗ` : 'Hết chỗ';
  return level === 'maintenance' ? `${slots} · ${room.maintenanceBeds} bảo trì` : slots;
};

/**
 * VD "K1-302" — mã tòa + số phòng khi có, không thì chỉ số phòng.
 * Dữ liệu thực tế có nơi đã nhập sẵn mã tòa vào số phòng ("A101"); khi đó
 * không ghép thêm lần nữa để tránh hiện "AA101".
 */
export const roomLabelOf = (room) => {
  const number = String(room.roomNumber ?? '');
  const building = String(room.buildingCode ?? '');
  return building && !number.toUpperCase().startsWith(building.toUpperCase()) ? `${building}-${number}` : number;
};

/** VD "G05" */
export const bedLabelOf = (bed) => `G${String(bed.bedNumber).padStart(2, '0')}`;

/** Tỷ lệ lấp đầy = đang ở / (tổng giường − bảo trì), đúng công thức dashboard (03 mục 5.1) */
export const occupancyRate = (occupied, total, maintenance) => {
  const usable = total - maintenance;
  return usable > 0 ? occupied / usable : 0;
};
