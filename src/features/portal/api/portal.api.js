import axiosClient from '../../../lib/axiosClient';
import { mockPortal } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/**
 * ⚠️ TẠM cho tới M8: các màn cổng SV còn đọc hóa đơn kiểu v1 (totalAmount, paidAmount, lineItems, billingPeriod).
 * API trả model v2 (API.md §8) — chuyển ở đây để các màn đó không gãy. M8 viết lại các màn rồi xoá hàm này.
 */
const toLegacyInvoice = (inv) => inv && ({
  ...inv,
  totalAmount: inv.amount,
  paidAmount: inv.status === 'paid' ? inv.amount : 0,
  remainingAmount: inv.status === 'paid' ? 0 : inv.amount,
  lineItems: [{ feeTypeId: inv.type, description: inv.description, quantity: 1, unitPrice: inv.amount, amount: inv.amount }],
  billingPeriod: inv.monthYear ?? null,
  issueDate: inv.createdAt,
  studentName: inv.student?.fullName ?? null,
  studentCode: inv.student?.studentCode ?? null,
  payments: inv.payments?.map((p) => ({ ...p, status: 'success' })),
});
const legacyList = (promise) => promise.then((res) => {
  const body = res.data?.data;
  const items = (Array.isArray(body) ? body : body?.items || []).map(toLegacyInvoice);
  return { ...res, data: { ...res.data, data: Array.isArray(body) ? items : { ...body, items } } };
});
const legacyOne = (promise) => promise.then((res) => ({ ...res, data: { ...res.data, data: toLegacyInvoice(res.data?.data) } }));

/** Mọi endpoint cổng sinh viên lấy danh tính từ JWT — không bao giờ gửi studentId */
export const portalApi = {
  getProfile:        ()       => (USE_MOCK ? mockPortal.getProfile()             : axiosClient.get('/portal/profile')),
  getMyResidence:    ()       => (USE_MOCK ? mockPortal.getMyResidence()         : axiosClient.get('/portal/my-residence')),
  /** Mọi hợp đồng và đơn của chính sinh viên, mới nhất lên đầu */
  getMyContracts:    ()       => (USE_MOCK ? mockPortal.getMyContracts()         : axiosClient.get('/portal/my-contracts')),
  getMyInvoices:     (params) => legacyList(USE_MOCK ? mockPortal.getMyInvoices(params) : axiosClient.get('/portal/my-invoices', { params })),
  getMyInvoiceById:  (id)     => legacyOne(USE_MOCK ? mockPortal.getMyInvoiceById(id)   : axiosClient.get(`/portal/my-invoices/${id}`)),
  getMyPayments:     (params) => (USE_MOCK ? mockPortal.getMyPayments(params)    : axiosClient.get('/portal/my-payments', { params })),
};
