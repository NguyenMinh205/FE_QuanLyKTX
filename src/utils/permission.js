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
  'room:create': OPS,
  'room:update': OPS,

  'application:review': OPS,        // duyệt / từ chối
  'contract:update': OPS,
  'contract:terminate': OPS,

  'utilityReading:record': OPS,
  'invoice:create': OPS,
  'invoice:cancel': OPS,
  'payment:record': OPS,

  'user:manage': [ADMIN],
  'feeType:manage': [ADMIN],
};

export const can = (user, action) => {
  if (!user) return false;
  return PERMISSIONS[action]?.includes(user.role) ?? false;
};
