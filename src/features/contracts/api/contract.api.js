import axiosClient from '../../../lib/axiosClient';
import { mockContracts } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Đơn đăng ký là hợp đồng `pending` (API.md §6). Đơn mới nộp ở cổng công khai — xem features/apply */
export const contractApi = {
  getList:     (params)   => (USE_MOCK ? mockContracts.getList(params)        : axiosClient.get('/contracts', { params })),
  getById:     (id)       => (USE_MOCK ? mockContracts.getById(id)            : axiosClient.get(`/contracts/${id}`)),
  /** Không có body — trả phòng tại văn phòng (FR-34). 422 OUTSTANDING_INVOICES kèm `data.invoices` (BR-04) */
  terminate:   (id)       => (USE_MOCK ? mockContracts.terminate(id)          : axiosClient.patch(`/contracts/${id}/terminate`)),
  /** Không có body — xác nhận đã trả cọc, chỉ sau thanh lý (FR-35, BR-08) */
  refundDeposit: (id)     => (USE_MOCK ? mockContracts.refundDeposit(id)      : axiosClient.patch(`/contracts/${id}/deposit-refund`)),
  /** { roomId?, bedNumber? } — bỏ trống là khóa đúng giường sinh viên đã chọn (FR-32) */
  approve:     (id, data) => (USE_MOCK ? mockContracts.approve(id, data)      : axiosClient.patch(`/contracts/${id}/approve`, data)),
  /** { reason } */
  reject:      (id, data) => (USE_MOCK ? mockContracts.reject(id, data)       : axiosClient.patch(`/contracts/${id}/reject`, data)),
  // Sắp hết hạn (BR-29) dùng chính `getList({ expiringInDays })` — KHÔNG dùng `/contracts/expiring`:
  // endpoint đó của backend bỏ qua tham số ngày nên trả về mọi hợp đồng đang hiệu lực.
};
