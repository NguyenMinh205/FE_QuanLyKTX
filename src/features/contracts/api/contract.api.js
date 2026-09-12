import axiosClient from '../../../lib/axiosClient';
import { mockContracts } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const contractApi = {
  getList:   (params)   => (USE_MOCK ? mockContracts.getList(params)   : axiosClient.get('/contracts', { params })),
  getById:   (id)       => (USE_MOCK ? mockContracts.getById(id)       : axiosClient.get(`/contracts/${id}`)),
  create:    (data)     => (USE_MOCK ? Promise.resolve({ data: {} })   : axiosClient.post('/contracts', data)),
  update:    (id, data) => (USE_MOCK ? Promise.resolve({ data: {} })   : axiosClient.put(`/contracts/${id}`, data)),
  activate:  (id)       => (USE_MOCK ? mockContracts.activate(id)      : axiosClient.patch(`/contracts/${id}/activate`)),
  terminate: (id, data) => (USE_MOCK ? mockContracts.terminate(id)     : axiosClient.patch(`/contracts/${id}/terminate`, data)),
  getExpiring: (days = 30) =>
    (USE_MOCK ? mockContracts.getList({ expiringInDays: days }) : axiosClient.get('/contracts/expiring', { params: { days } })),
};
