import axiosClient from '../../../lib/axiosClient';
import { mockPayments } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** API.md §8 — luôn thu đủ số tiền hóa đơn; phản hồi `{ payment, invoice }`, `payment` là biên lai */
export const paymentApi = {
  /** ?method=&type=&from=&to=&search=&page=&limit= → kèm summary { totalAmount, cashAmount, vietqrAmount } */
  getList:       (params) => (USE_MOCK ? mockPayments.getList(params)       : axiosClient.get('/payments', { params })),
  /** { invoiceId, payerStudentId?, note? } — payerStudentId bắt buộc với hóa đơn điện nước */
  collectCash:   (data)   => (USE_MOCK ? mockPayments.collectCash(data)     : axiosClient.post('/payments/cash', data)),
  /** như collectCash + transactionCode? (FR-54: không bắt buộc) */
  confirmVietqr: (data)   => (USE_MOCK ? mockPayments.confirmVietqr(data)   : axiosClient.post('/payments/vietqr/confirm', data)),
  /** ⚠️ Luồng VNPay thử của cổng SV (v1) — M8 thay bằng mã VietQR rồi xoá */
  checkout:      (data)   => (USE_MOCK ? mockPayments.checkout(data)        : axiosClient.post('/payments/online/checkout', data)),
};
