import { ROLES } from '../constants/roles';

/**
 * Ma trận quyền dùng cho GIAO DIỆN (ẩn/hiện nút).
 * Đây KHÔNG phải biện pháp bảo mật — backend vẫn phải kiểm tra lại.
 * Xem docs/07 mục 2 để biết ma trận đầy đủ.
 */
const PERMISSIONS = {
  'student:create':   [ROLES.ADMIN, ROLES.STAFF],
  'student:update':   [ROLES.ADMIN, ROLES.STAFF],
  'student:delete':   [ROLES.ADMIN, ROLES.STAFF],

  'building:create':  [ROLES.ADMIN, ROLES.STAFF],
  'building:delete':  [ROLES.ADMIN],
  'room:create':      [ROLES.ADMIN, ROLES.STAFF],
  'bed:update':       [ROLES.ADMIN, ROLES.STAFF],

  'contract:create':  [ROLES.ADMIN, ROLES.STAFF],
  'contract:approve': [ROLES.ADMIN, ROLES.STAFF],
  'contract:terminate': [ROLES.ADMIN, ROLES.STAFF],

  'invoice:create':   [ROLES.ADMIN, ROLES.STAFF],
  'invoice:cancel':   [ROLES.ADMIN, ROLES.STAFF],
  'payment:record':   [ROLES.ADMIN, ROLES.STAFF],

  'request:approve':  [ROLES.ADMIN, ROLES.STAFF],

  'user:manage':      [ROLES.ADMIN],
  'feeType:manage':   [ROLES.ADMIN],
  'settings:manage':  [ROLES.ADMIN],
};

export const can = (user, action) => {
  if (!user) return false;
  return PERMISSIONS[action]?.includes(user.role) ?? false;
};
