import axiosClient from '../../../lib/axiosClient';
import { mockFees } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

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

  // Hóa đơn (API.md §8) — chỉ xem; sinh từ duyệt đơn và chốt điện nước, không lập tay, không hủy
  /** ?status=&type=&scope=&buildingId=&search=&page=&limit= → kèm summary { totalAmount, paidAmount, unpaidAmount, unpaidCount } */
  getInvoices:        (params)  => (USE_MOCK ? mockFees.getInvoices(params)      : axiosClient.get('/invoices', { params })),
  /** Kèm payments[]; hóa đơn điện nước kèm reading và members (người đang ở phòng) */
  getInvoiceById:     (id)      => (USE_MOCK ? mockFees.getInvoiceById(id)       : axiosClient.get(`/invoices/${id}`)),
};
