import axiosClient from '../../../lib/axiosClient';

/** Quản lý Đợt đăng ký KTX (/api/periods — Manager CRUD, Staff xem) */
export const periodApi = {
  getList:   (params)   => axiosClient.get('/periods', { params }),
  getById:   (id)       => axiosClient.get(`/periods/${id}`),
  create:    (data)     => axiosClient.post('/periods', data),
  update:    (id, data) => axiosClient.put(`/periods/${id}`, data),
  setStatus: (id, data) => axiosClient.patch(`/periods/${id}/status`, data),
};
