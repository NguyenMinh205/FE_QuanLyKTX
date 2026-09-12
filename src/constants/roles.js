export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  VIEWER: 'viewer',
  STUDENT: 'student',
};

export const ROLE_LABEL = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  viewer: 'Người xem',
  student: 'Sinh viên',
};

/** Các vai trò làm việc trong khu quản trị */
export const ADMIN_AREA_ROLES = [ROLES.ADMIN, ROLES.STAFF, ROLES.VIEWER];
