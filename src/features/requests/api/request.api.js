import axiosClient from '../../../lib/axiosClient';
import { mockRequests } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const requestApi = {
  getList: (params)   => (USE_MOCK ? mockRequests.getList(params)   : axiosClient.get('/requests', { params })),
  getById: (id)       => (USE_MOCK ? mockRequests.getById(id)       : axiosClient.get(`/requests/${id}`)),
  approve: (id, data) => (USE_MOCK ? mockRequests.approve(id, data) : axiosClient.patch(`/requests/${id}/approve`, data)),
  reject:  (id, data) => (USE_MOCK ? mockRequests.reject(id, data)  : axiosClient.patch(`/requests/${id}/reject`, data)),
};
