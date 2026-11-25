import axiosClient from '../../../lib/axiosClient';

/** Thanh toán, Đối soát & Giả lập Webhook VietQR (/api/payments — Manager & Staff) */
export const paymentApi = {
  getList:         (params) => axiosClient.get('/payments', { params }),
  collectCash:     (data)   => axiosClient.post('/payments/cash', data),
  confirmVietqr:   (data)   => axiosClient.post('/payments/vietqr/confirm', data),
  simulateWebhook: (data)   => axiosClient.post('/payments/webhook/simulate', data),
};
