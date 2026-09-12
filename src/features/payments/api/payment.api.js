import axiosClient from '../../../lib/axiosClient';
import { mockPayments } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const paymentApi = {
  getList:       (params) => (USE_MOCK ? mockPayments.getList(params)       : axiosClient.get('/payments', { params })),
  recordOffline: (data)   => (USE_MOCK ? mockPayments.recordOffline(data)   : axiosClient.post('/payments/offline', data)),
  checkout:      (data)   => (USE_MOCK ? mockPayments.checkout(data)        : axiosClient.post('/payments/online/checkout', data)),
  reconcile:     (id)     => (USE_MOCK ? Promise.resolve({ data: {} })      : axiosClient.post(`/payments/${id}/reconcile`)),
};
