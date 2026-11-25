import axiosClient from '../../../lib/axiosClient';

/** Điện nước bảng lưới & Hóa đơn (/api/utility-readings, /api/invoices — Manager & Staff) */
export const feeApi = {
  getUtilitySheet:   (params) => axiosClient.get('/utility-readings/sheet', { params }),
  saveUtilityBulk:   (data)   => axiosClient.post('/utility-readings/bulk', data),
  publishUtility:    (data)   => axiosClient.post('/utility-readings/publish', data),
  getUtilityHistory: (params) => axiosClient.get('/utility-readings/history', { params }),

  getInvoices:       (params) => axiosClient.get('/invoices', { params }),
  getInvoiceById:    (id)     => axiosClient.get(`/invoices/${id}`),
};
