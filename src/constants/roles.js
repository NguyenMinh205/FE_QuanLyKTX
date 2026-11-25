export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  STUDENT: 'student',
};

export const ROLE_LABEL = {
  admin: 'Quản trị hệ thống',
  manager: 'Trưởng ban KTX',
  staff: 'Cán bộ KTX',
  student: 'Sinh viên',
};

/** Các vai trò làm việc trong khu quản trị (/admin/*) */
export const ADMIN_AREA_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

/** Các vai trò vận hành nghiệp vụ KTX (không gồm admin hệ thống) */
export const OPS_ROLES = [ROLES.MANAGER, ROLES.STAFF];
