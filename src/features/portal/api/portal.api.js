import axiosClient from '../../../lib/axiosClient';
import { mockPortal } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const portalApi = {
  getProfile:     ()       => (USE_MOCK ? mockPortal.getProfile()        : axiosClient.get('/portal/profile')),
  getMyResidence: ()       => (USE_MOCK ? mockPortal.getMyResidence()    : axiosClient.get('/portal/my-residence')),
  getMyContracts: ()       => (USE_MOCK ? mockPortal.getMyContracts()    : axiosClient.get('/portal/my-contracts')),
  getMyInvoices:  (params) => (USE_MOCK ? mockPortal.getMyInvoices(params) : axiosClient.get('/portal/my-invoices', { params })),
  getMyPayments:  ()       => (USE_MOCK ? mockPortal.getMyPayments()     : axiosClient.get('/portal/my-payments')),
  getMyRequests:  ()       => (USE_MOCK ? mockPortal.getMyRequests()     : axiosClient.get('/portal/my-requests')),
  createRequest:  (data)   => (USE_MOCK ? mockPortal.createRequest(data) : axiosClient.post('/portal/my-requests', data)),
  cancelRequest:  (id)     => (USE_MOCK ? Promise.resolve({ data: {} })  : axiosClient.delete(`/portal/my-requests/${id}`)),
};
