import axiosClient from '../../../lib/axiosClient';

/** Đơn đăng ký, Hợp đồng, QR Check-in & Hoàn cọc (/api/contracts — Manager & Staff) */
export const contractApi = {
  getList:       (params)   => axiosClient.get('/contracts', { params }),
  getById:       (id)       => axiosClient.get(`/contracts/${id}`),
  approve:       (id, data) => axiosClient.patch(`/contracts/${id}/approve`, data || {}),
  autoApprove:   (data)     => axiosClient.post('/contracts/auto-approve', data || {}),
  reject:        (id, data) => axiosClient.patch(`/contracts/${id}/reject`, data),
  cancel:        (id, data) => axiosClient.patch(`/contracts/${id}/cancel`, data || {}),
  cancelOverdue: ()         => axiosClient.post('/contracts/cancel-overdue'),
  checkinQr:     (data)     => axiosClient.post('/contracts/checkin-qr', data),
  terminate:     (id)       => axiosClient.patch(`/contracts/${id}/terminate`),
  refundDeposit: (id, data) => axiosClient.patch(`/contracts/${id}/deposit-refund`, data || {}),
};
