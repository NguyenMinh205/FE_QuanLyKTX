import axiosClient from '../../../lib/axiosClient';

/** Quản lý tài khoản (/api/users — chỉ Admin; resetPassword cho cả Manager & Staff đối với SV) */
export const userApi = {
  getList:       (params)   => axiosClient.get('/users', { params }),
  create:        (data)     => axiosClient.post('/users', data),
  update:        (id, data) => axiosClient.put(`/users/${id}`, data),
  setStatus:     (id, data) => axiosClient.patch(`/users/${id}/status`, data),
  resetPassword: (id)       => axiosClient.post(`/users/${id}/reset-password`),
};
