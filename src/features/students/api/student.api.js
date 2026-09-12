import axiosClient from '../../../lib/axiosClient';
import { mockStudents } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const studentApi = {
  getList:    (params)   => (USE_MOCK ? mockStudents.getList(params)      : axiosClient.get('/students', { params })),
  getById:    (id)       => (USE_MOCK ? mockStudents.getById(id)          : axiosClient.get(`/students/${id}`)),
  create:     (data)     => (USE_MOCK ? mockStudents.create(data)         : axiosClient.post('/students', data)),
  update:     (id, data) => (USE_MOCK ? mockStudents.update(id, data)     : axiosClient.put(`/students/${id}`, data)),
  deactivate: (id)       => (USE_MOCK ? mockStudents.deactivate(id)       : axiosClient.patch(`/students/${id}/deactivate`)),
};
