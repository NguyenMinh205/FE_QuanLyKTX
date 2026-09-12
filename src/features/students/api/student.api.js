import axiosClient from '../../../lib/axiosClient';
import { mockStudentList } from '../../../mocks/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const studentApi = {
  getList: (params) => (USE_MOCK ? mockStudentList(params) : axiosClient.get('/students', { params })),
  getById: (id) => axiosClient.get(`/students/${id}`),
  create: (data) => axiosClient.post('/students', data),
  update: (id, data) => axiosClient.put(`/students/${id}`, data),
  deactivate: (id) => axiosClient.patch(`/students/${id}/deactivate`),
};
