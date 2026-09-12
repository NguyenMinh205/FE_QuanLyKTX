import axiosClient from '../../../lib/axiosClient';
import { mockFees } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const feeApi = {
  // Danh mục phí
  getFeeTypes:        ()        => (USE_MOCK ? mockFees.getFeeTypes()              : axiosClient.get('/fee-types')),
  createFeeType:      (data)    => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.post('/fee-types', data)),

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
