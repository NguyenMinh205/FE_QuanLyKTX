import axiosClient from '../../../lib/axiosClient';
import { mockPortal } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** API.md §9 — mọi endpoint cổng sinh viên lấy danh tính từ JWT, không bao giờ gửi studentId */
export const portalApi = {
  getProfile:        ()       => (USE_MOCK ? mockPortal.getProfile()             : axiosClient.get('/portal/profile')),
  /** debtSummary chỉ tính hóa đơn cá nhân; hóa đơn của phòng lấy qua getMyInvoices({ scope: 'room' }) */
  getMyResidence:    ()       => (USE_MOCK ? mockPortal.getMyResidence()         : axiosClient.get('/portal/my-residence')),
  /** Mọi hợp đồng và đơn của chính sinh viên, mới nhất lên đầu */
  getMyContracts:    ()       => (USE_MOCK ? mockPortal.getMyContracts()         : axiosClient.get('/portal/my-contracts')),
  /** ?scope=personal|room&status=&page=&limit= — hóa đơn của mình và của phòng đang ở (FR-62) */
  getMyInvoices:     (params) => (USE_MOCK ? mockPortal.getMyInvoices(params)    : axiosClient.get('/portal/my-invoices', { params })),
  getMyInvoiceById:  (id)     => (USE_MOCK ? mockPortal.getMyInvoiceById(id)     : axiosClient.get(`/portal/my-invoices/${id}`)),
  /** { bankBin, accountNumber, accountName, amount, transferContent } (FR-53). 409 INVOICE_ALREADY_PAID */
  getMyInvoiceVietqr: (id)    => (USE_MOCK ? mockPortal.getMyInvoiceVietqr(id)   : axiosClient.get(`/portal/my-invoices/${id}/vietqr`)),
  /** Phiếu thu của mình và của phòng mình (FR-63) */
  getMyPayments:     (params) => (USE_MOCK ? mockPortal.getMyPayments(params)    : axiosClient.get('/portal/my-payments', { params })),
  /** Các tháng đã chốt của phòng đang ở, mới nhất trước (FR-42) */
  getMyRoomUtilityHistory: (params) => (USE_MOCK ? mockPortal.getMyRoomUtilityHistory(params) : axiosClient.get('/portal/my-room/utility-history', { params })),
};
