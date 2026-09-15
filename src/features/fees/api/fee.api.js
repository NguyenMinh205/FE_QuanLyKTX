import axiosClient from '../../../lib/axiosClient';
import { mockFees } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Mã loại phí của backend hiện tại (v1.1) → mã theo DATA-SCHEMA 3.8 */
const LEGACY_FEE_CODES = { ROOM_FEE: 'rent' };

/**
 * Chuẩn hóa một loại phí về dạng DATA-SCHEMA 3.8 (`code` chữ thường, `defaultAmount`, `isRecurring`).
 * Backend hiện tại trả `ELECTRICITY`, `ROOM_FEE`, `unitPrice`, `isMetered` — nhận cả hai.
 * Chưa có `isRecurring` thì suy ra: đồng hồ điện nước hoặc đơn vị "tháng" là thu hằng tháng.
 */
export const normalizeFeeType = (t = {}) => {
  const rawCode = String(t.code || '');
  return {
    ...t,
    code: LEGACY_FEE_CODES[rawCode] || rawCode.toLowerCase(),
    defaultAmount: t.defaultAmount ?? t.unitPrice ?? 0,
    isRecurring: t.isRecurring ?? (!!t.isMetered || t.unit === 'tháng'),
  };
};

const withNormalizedFeeTypes = (promise) => promise.then((res) => ({
  ...res, data: { ...res.data, data: (res.data?.data || []).map(normalizeFeeType) },
}));

/**
 * Chuẩn hóa hóa đơn về dạng DATA-SCHEMA 3.10. Backend hiện tại populate `studentId` thành object,
 * dùng `items[{ name }]` thay cho `lineItems[{ description }]` và không trả `remainingAmount` — nhận cả hai.
 */
export const normalizeInvoice = (inv = {}) => {
  const student = inv.studentId && typeof inv.studentId === 'object' ? inv.studentId : null;
  const lineItems = inv.lineItems ?? (inv.items || []).map((it) => ({ ...it, description: it.description ?? it.name }));
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
  // Danh mục phí
  getFeeTypes:        (params)  => withNormalizedFeeTypes(USE_MOCK ? mockFees.getFeeTypes(params) : axiosClient.get('/fee-types', { params })),
  createFeeType:      (data)    => (USE_MOCK ? mockFees.createFeeType(data)        : axiosClient.post('/fee-types', data)),
  updateFeeType:      (id, data) => (USE_MOCK ? mockFees.updateFeeType(id, data)   : axiosClient.put(`/fee-types/${id}`, data)),

  // Chỉ số điện nước
  getUtilityReadings: (params)  => (USE_MOCK ? mockFees.getUtilityReadings(params) : axiosClient.get('/utility-readings', { params })),
  saveUtilityReading: (data)    => (USE_MOCK ? mockFees.saveUtilityReading(data)   : axiosClient.post('/utility-readings', data)),
  updateUtilityReading: (id, data) => (USE_MOCK ? mockFees.updateUtilityReading(id, data) : axiosClient.put(`/utility-readings/${id}`, data)),

  // Hóa đơn
  getInvoices:        (params)  => withNormalizedInvoiceList(USE_MOCK ? mockFees.getInvoices(params) : axiosClient.get('/invoices', { params })),
  getInvoiceById:     (id)      => (USE_MOCK ? mockFees.getInvoiceById(id)         : axiosClient.get(`/invoices/${id}`)),
  createInvoice:      (data)    => (USE_MOCK ? mockFees.createInvoice(data)        : axiosClient.post('/invoices', data)),
  // Xem trước dùng GET riêng: không bao giờ ghi dữ liệu, kể cả khi backend chưa hỗ trợ (POST dryRun bị backend bỏ qua sẽ lập hóa đơn thật)
  previewInvoiceGeneration: (params) => (USE_MOCK ? mockFees.previewInvoiceGeneration(params)
    : axiosClient.get('/invoices/generation-preview', { params: { ...params, buildingIds: params.buildingIds?.join(',') || undefined } })),
  generateInvoices:   (data)    => (USE_MOCK ? mockFees.generateInvoices(data)     : axiosClient.post('/invoices/generate', data)),
  cancelInvoice:      (id)      => (USE_MOCK ? mockFees.cancelInvoice(id)          : axiosClient.patch(`/invoices/${id}/cancel`)),
};
