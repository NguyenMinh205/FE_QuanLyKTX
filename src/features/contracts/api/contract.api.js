import axiosClient from '../../../lib/axiosClient';
import { mockContracts } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Hợp đồng được tạo sẵn trạng thái active khi duyệt đơn — không có API tạo/kích hoạt */
export const contractApi = {
  getList:     (params)   => (USE_MOCK ? mockContracts.getList(params)        : axiosClient.get('/contracts', { params })),
  getById:     (id)       => (USE_MOCK ? mockContracts.getById(id)            : axiosClient.get(`/contracts/${id}`)),
  update:      (id, data) => (USE_MOCK ? mockContracts.update(id, data)       : axiosClient.put(`/contracts/${id}`, data)),
  terminate:   (id, data) => (USE_MOCK ? mockContracts.terminate(id, data)    : axiosClient.patch(`/contracts/${id}/terminate`, data)),
  getExpiring: (days = 30) =>
    (USE_MOCK ? mockContracts.getList({ expiringInDays: days }) : axiosClient.get('/contracts/expiring', { params: { days } })),
};
