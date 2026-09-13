import axiosClient from '../../../lib/axiosClient';
import { mockSupplies } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

export const supplyApi = {
  // Danh mục sản phẩm
  getItems:     (params)   => (USE_MOCK ? mockSupplies.getItems(params)       : axiosClient.get('/supply-items', { params })),
  createItem:   (data)     => (USE_MOCK ? mockSupplies.createItem(data)       : axiosClient.post('/supply-items', data)),
  updateItem:   (id, data) => (USE_MOCK ? mockSupplies.updateItem(id, data)   : axiosClient.put(`/supply-items/${id}`, data)),

  // Đơn hàng — response danh sách có thêm `summary`, đọc qua meta.summary của useApi
  getOrders:    (params)   => (USE_MOCK ? mockSupplies.getOrders(params)      : axiosClient.get('/supply-orders', { params })),
  getOrderById: (id)       => (USE_MOCK ? mockSupplies.getOrderById(id)       : axiosClient.get(`/supply-orders/${id}`)),
  deliver:      (id)       => (USE_MOCK ? mockSupplies.deliver(id)            : axiosClient.patch(`/supply-orders/${id}/deliver`)),
  cancel:       (id, data) => (USE_MOCK ? mockSupplies.cancel(id, data)       : axiosClient.patch(`/supply-orders/${id}/cancel`, data)),
};
