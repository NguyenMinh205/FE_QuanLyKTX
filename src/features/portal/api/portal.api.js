import axiosClient from '../../../lib/axiosClient';
import { mockPortal } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Mọi endpoint cổng sinh viên lấy danh tính từ JWT — không bao giờ gửi studentId */
export const portalApi = {
  getProfile:        ()       => (USE_MOCK ? mockPortal.getProfile()             : axiosClient.get('/portal/profile')),
  getMyResidence:    ()       => (USE_MOCK ? mockPortal.getMyResidence()         : axiosClient.get('/portal/my-residence')),
  /** Mọi hợp đồng và đơn của chính sinh viên, mới nhất lên đầu */
  getMyContracts:    ()       => (USE_MOCK ? mockPortal.getMyContracts()         : axiosClient.get('/portal/my-contracts')),
  getMyInvoices:     (params) => (USE_MOCK ? mockPortal.getMyInvoices(params)    : axiosClient.get('/portal/my-invoices', { params })),
  getMyInvoiceById:  (id)     => (USE_MOCK ? mockPortal.getMyInvoiceById(id)     : axiosClient.get(`/portal/my-invoices/${id}`)),
  getMyPayments:     (params) => (USE_MOCK ? mockPortal.getMyPayments(params)    : axiosClient.get('/portal/my-payments', { params })),

};
