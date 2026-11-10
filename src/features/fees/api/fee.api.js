import axiosClient from '../../../lib/axiosClient';
import { mockFees } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/**
 * Chuẩn hóa hóa đơn về dạng DATA-SCHEMA 3.10. Backend hiện tại populate `studentId` thành object,
 * dùng `items[{ name }]` thay cho `lineItems[{ description }]` và không trả `remainingAmount` — nhận cả hai.
 */
export const normalizeInvoice = ({ items, ...inv } = {}) => {
  const student = inv.studentId && typeof inv.studentId === 'object' ? inv.studentId : null;
  // Bỏ hẳn `items` cũ: useApi coi mọi response có mảng `items` là danh sách phân trang
  const lineItems = inv.lineItems ?? (items || []).map((it) => ({ ...it, description: it.description ?? it.name }));
  return {
    ...inv,
    studentId: student ? (student.id ?? student._id) : inv.studentId,
    studentName: inv.studentName ?? student?.fullName ?? null,
    studentCode: inv.studentCode ?? student?.studentCode ?? null,
    lineItems,
    remainingAmount: inv.remainingAmount ?? Math.max(0, (inv.totalAmount ?? 0) - (inv.paidAmount ?? 0)),
  };
};

const withNormalizedInvoiceList = (promise) => promise.then((res) => {
  const body = res.data?.data;
  const items = Array.isArray(body) ? body : body?.items || [];
  const list = Array.isArray(body) ? { items, total: items.length, page: 1, limit: items.length } : body;
  return { ...res, data: { ...res.data, data: { ...list, items: items.map(normalizeInvoice) } } };
});

export const feeApi = {
  // Chỉ số điện nước (API.md §7)
  /** { buildingId, monthYear } → lưới một tòa một tháng, kèm chỉ số tháng trước và đơn giá mặc định */
  getUtilitySheet:    (params)  => (USE_MOCK ? mockFees.getUtilitySheet(params)  : axiosClient.get('/utility-readings/sheet', { params })),
  /** { buildingId, monthYear, electricityUnitPrice, waterUnitPrice, rows[] } → { savedCount, errors[{ roomId, message }] } */
  saveUtilityBulk:    (data)    => (USE_MOCK ? mockFees.saveUtilityBulk(data)    : axiosClient.post('/utility-readings/bulk', data)),
  /** { buildingId, monthYear } → { publishedCount, notifiedCount, skipped[] }. 422 NOTHING_TO_PUBLISH */
  publishUtility:     (data)    => (USE_MOCK ? mockFees.publishUtility(data)     : axiosClient.post('/utility-readings/publish', data)),
  /** { roomId, limit } → Reading[] mới nhất lên đầu (FR-42) */
  getUtilityHistory:  (params)  => (USE_MOCK ? mockFees.getUtilityHistory(params) : axiosClient.get('/utility-readings/history', { params })),

  // Hóa đơn — màn danh sách/chi tiết làm lại ở M7
  getInvoices:        (params)  => withNormalizedInvoiceList(USE_MOCK ? mockFees.getInvoices(params) : axiosClient.get('/invoices', { params })),
  getInvoiceById:     (id)      => (USE_MOCK ? mockFees.getInvoiceById(id)         : axiosClient.get(`/invoices/${id}`))
    .then((res) => ({ ...res, data: { ...res.data, data: normalizeInvoice(res.data?.data) } })),
  cancelInvoice:      (id)      => (USE_MOCK ? mockFees.cancelInvoice(id)          : axiosClient.patch(`/invoices/${id}/cancel`)),
};
