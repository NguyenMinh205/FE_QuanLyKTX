import { ROLES } from '../constants/roles';

/**
 * Ma trận quyền dùng cho GIAO DIỆN (ẩn/hiện nút) — khớp docs/07 mục 2.
 * Đây KHÔNG phải biện pháp bảo mật — backend vẫn phải kiểm tra lại.
 */
const { ADMIN, STAFF } = ROLES;
const OPS = [ADMIN, STAFF];

const PERMISSIONS = {
  'student:create': OPS,
  'student:update': OPS,
  'student:delete': OPS,

  'building:create': OPS,
  'building:delete': [ADMIN],
  'roomType:manage': [ADMIN],       // giá thuê + tiền cọc là quyết định tài chính
  'room:create': OPS,
  'room:update': OPS,
  'bed:update': OPS,                // chỉ bật/tắt bảo trì — không ai chọn giường

  'application:create': OPS,        // lập đơn hộ sinh viên đến trực tiếp
  'application:review': OPS,        // duyệt / từ chối
  'contract:update': OPS,
  'contract:terminate': OPS,
  'request:approve': OPS,

  'utilityReading:record': OPS,
  'invoice:create': OPS,
  'invoice:cancel': OPS,
  'payment:record': OPS,

  'supply:manage': OPS,
  'supplyOrder:deliver': OPS,
  'supplyOrder:cancel': OPS,

  'user:manage': [ADMIN],
  'feeType:manage': [ADMIN],
};

export const can = (user, action) => {
  if (!user) return false;
  return PERMISSIONS[action]?.includes(user.role) ?? false;
};
