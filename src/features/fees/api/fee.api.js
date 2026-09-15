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

export const feeApi = {
  // Danh mục phí
  getFeeTypes:        (params)  => withNormalizedFeeTypes(USE_MOCK ? mockFees.getFeeTypes(params) : axiosClient.get('/fee-types', { params })),
  createFeeType:      (data)    => (USE_MOCK ? mockFees.createFeeType(data)        : axiosClient.post('/fee-types', data)),
  updateFeeType:      (id, data) => (USE_MOCK ? mockFees.updateFeeType(id, data)   : axiosClient.put(`/fee-types/${id}`, data)),

  // Chỉ số điện nước
  getUtilityReadings: (params)  => (USE_MOCK ? mockFees.getUtilityReadings(params) : axiosClient.get('/utility-readings', { params })),
  saveUtilityReading: (data)    => (USE_MOCK ? mockFees.saveUtilityReading(data)   : axiosClient.post('/utility-readings', data)),

  // Hóa đơn
  getInvoices:        (params)  => (USE_MOCK ? mockFees.getInvoices(params)        : axiosClient.get('/invoices', { params })),
  getInvoiceById:     (id)      => (USE_MOCK ? mockFees.getInvoiceById(id)         : axiosClient.get(`/invoices/${id}`)),
  createInvoice:      (data)    => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.post('/invoices', data)),
  generateInvoices:   (data)    => (USE_MOCK ? mockFees.generateInvoices(data)     : axiosClient.post('/invoices/generate', data)),
  cancelInvoice:      (id)      => (USE_MOCK ? mockFees.cancelInvoice(id)          : axiosClient.patch(`/invoices/${id}/cancel`)),
};
