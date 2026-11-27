import axiosClient from '../../../lib/axiosClient';

/** Hợp đồng, QR Check-in & Hoàn cọc (/api/contracts — Manager & Staff) */
export const contractApi = {
  getList:       (params)   => axiosClient.get('/contracts', { params }),
  getById:       (id)       => axiosClient.get(`/contracts/${id}`),
  cancel:        (id, data) => axiosClient.patch(`/contracts/${id}/cancel`, data || {}),
  cancelOverdue: ()         => axiosClient.post('/contracts/cancel-overdue'),
  checkinQr:     (data)     => axiosClient.post('/contracts/checkin-qr', data),
  terminate:     (id)       => axiosClient.patch(`/contracts/${id}/terminate`),
  refundDeposit: (id, data) => axiosClient.patch(`/contracts/${id}/deposit-refund`, data || {}),
};
