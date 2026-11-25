import axiosClient from '../../../lib/axiosClient';

/** Hồ sơ sinh viên (/api/students — Manager & Staff) */
export const studentApi = {
  getList:    (params)   => axiosClient.get('/students', { params }),
  getById:    (id)       => axiosClient.get(`/students/${id}`),
  create:     (data)     => axiosClient.post('/students', data),
  update:     (id, data) => axiosClient.put(`/students/${id}`, data),
  importMany: (data)     => axiosClient.post('/students/import', data),
  deactivate: (id)       => axiosClient.patch(`/students/${id}/deactivate`),
};
