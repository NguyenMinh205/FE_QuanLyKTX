import axiosClient from '../../../lib/axiosClient';
import { mockUsers } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Quản lý tài khoản — chỉ Admin (docs/07 mục 2), trừ reset mật khẩu cho phép cả Staff (FR-09) */
export const userApi = {
  getList:       (params)   => (USE_MOCK ? mockUsers.getList(params)       : axiosClient.get('/users', { params })),
  /** { email, fullName, role, studentId? } → { user, temporaryPassword } */
  create:        (data)     => (USE_MOCK ? mockUsers.create(data)          : axiosClient.post('/users', data)),
  /** { email, fullName, role } */
  update:        (id, data) => (USE_MOCK ? mockUsers.update(id, data)      : axiosClient.put(`/users/${id}`, data)),
  /** { isActive } */
  setStatus:     (id, data) => (USE_MOCK ? mockUsers.setStatus(id, data)   : axiosClient.patch(`/users/${id}/status`, data)),
  /** → { temporaryPassword, mustChangePassword: true } — mật khẩu tạm chỉ trả về một lần */
  resetPassword: (id)       => (USE_MOCK ? mockUsers.resetPassword(id)     : axiosClient.post(`/users/${id}/reset-password`)),
};
