import axiosClient from '../../../lib/axiosClient';
import { mockStudents } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** API.md §3. Đặt lại mật khẩu sinh viên dùng userApi.resetPassword(student.userId) */
export const studentApi = {
  /** ?search=&gender=&faculty=&status=&hasAccount=&page=&limit= */
  getList:    (params)   => (USE_MOCK ? mockStudents.getList(params)      : axiosClient.get('/students', { params })),
  /** kèm currentContract, contracts[], unpaidInvoices[] */
  getById:    (id)       => (USE_MOCK ? mockStudents.getById(id)          : axiosClient.get(`/students/${id}`)),
  create:     (data)     => (USE_MOCK ? mockStudents.create(data)         : axiosClient.post('/students', data)),
  update:     (id, data) => (USE_MOCK ? mockStudents.update(id, data)     : axiosClient.put(`/students/${id}`, data)),
  /** { rows: [{ row, ...Student }] } → { successCount, errorCount, errors[{ row, studentCode, field, message }] } */
  importMany: (data)     => (USE_MOCK ? mockStudents.importMany(data)     : axiosClient.post('/students/import', data)),
  deactivate: (id)       => (USE_MOCK ? mockStudents.deactivate(id)       : axiosClient.patch(`/students/${id}/deactivate`)),
};
