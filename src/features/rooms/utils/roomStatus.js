import { ROOM_TIER } from '../../../constants/statuses';

/**
 * Mức lấp đầy của một phòng trên sơ đồ tầng — docs/08 mục 6.3.
 * Chỗ trống luôn là số giường `available` (BR-05), không phải capacity − số người ở.
 * Thứ tự ưu tiên: ngừng hoạt động > có giường bảo trì > đã đầy > còn 1 chỗ > còn chỗ.
 */
export const FILL_LEVEL = {
  available:   { label: 'Còn chỗ',           hint: 'còn từ 2 chỗ',  color: '#52C41A', bg: '#F6FFED', border: '#D9F7BE' },
  almost:      { label: 'Sắp đầy',           hint: 'còn 1 chỗ',     color: '#FAAD14', bg: '#FFFBE6', border: '#FFE58F' },
  full:        { label: 'Đã đầy',            hint: 'hết chỗ',       color: '#8C8C8C', bg: '#FAFAFA', border: '#F0F0F0' },
  maintenance: { label: 'Có giường bảo trì', hint: 'cần xử lý',     color: '#FF4D4F', bg: '#FFF1F0', border: '#FFCCC7' },
  inactive:    { label: 'Ngừng hoạt động',   hint: '',              color: '#BFBFBF', bg: '#F5F5F5', border: '#E8E8E8' },
};

export const LEGEND_LEVELS = ['available', 'almost', 'full', 'maintenance'];

export const fillLevelOf = (room) => {
  if (room.status === 'inactive') return 'inactive';
  if (room.maintenanceBeds > 0) return 'maintenance';
  if (room.availableSlots === 0) return 'full';
  if (room.availableSlots === 1) return 'almost';
  return 'available';
};

/** Dòng trạng thái ngắn trên ô phòng */
export const slotTextOf = (room) => {
  const level = fillLevelOf(room);
  if (level === 'inactive') return 'Ngừng hoạt động';
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

/** VD "TC · 6" */
export const tierShortOf = (room) => `${ROOM_TIER[room.tier]?.short ?? ''} · ${room.capacity}`;

/** "K1-302-03" → { room: "K1-302", bed: "03" }. ⚠️ Mã tòa/phòng có thể chứa "-", nên số giường là phần sau dấu "-" CUỐI */
export const splitBedCode = (bedCode = '') => {
  const cut = bedCode.lastIndexOf('-');
  return cut < 0 ? { room: bedCode || null, bed: null } : { room: bedCode.slice(0, cut), bed: bedCode.slice(cut + 1) };
};

/** VD "G05" */
export const bedLabelOf = (bed) => `G${String(bed.bedNumber).padStart(2, '0')}`;

/** Tỷ lệ lấp đầy = đang ở / (tổng giường − bảo trì), đúng công thức dashboard (03 mục 5.1) */
export const occupancyRate = (occupied, total, maintenance) => {
  const usable = total - maintenance;
  return usable > 0 ? occupied / usable : 0;
};
