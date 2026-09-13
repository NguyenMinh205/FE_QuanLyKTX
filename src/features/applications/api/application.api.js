import axiosClient from '../../../lib/axiosClient';
import { mockApplications } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

export const applicationApi = {
  getList: (params)   => (USE_MOCK ? mockApplications.getList(params)    : axiosClient.get('/applications', { params })),
  getById: (id)       => (USE_MOCK ? mockApplications.getById(id)        : axiosClient.get(`/applications/${id}`)),
  /** Staff lập đơn hộ: { studentId, roomId, startDate, endDate, note } */
  create:  (data)     => (USE_MOCK ? mockApplications.create(data)       : axiosClient.post('/applications', data)),
  /** { roomId? } — KHÔNG bao giờ gửi bedId, hệ thống tự gán giường */
  approve: (id, data) => (USE_MOCK ? mockApplications.approve(id, data)  : axiosClient.patch(`/applications/${id}/approve`, data)),
  reject:  (id, data) => (USE_MOCK ? mockApplications.reject(id, data)   : axiosClient.patch(`/applications/${id}/reject`, data)),
};
