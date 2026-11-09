import axiosClient from '../../../lib/axiosClient';
import { mockPortal } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Mọi endpoint cổng sinh viên lấy danh tính từ JWT — không bao giờ gửi studentId */
export const portalApi = {
  getProfile:        ()       => (USE_MOCK ? mockPortal.getProfile()             : axiosClient.get('/portal/profile')),
  getMyResidence:    ()       => (USE_MOCK ? mockPortal.getMyResidence()         : axiosClient.get('/portal/my-residence')),
  getMyContracts:    ()       => (USE_MOCK ? mockPortal.getMyContracts()         : axiosClient.get('/portal/my-contracts')),
  getMyInvoices:     (params) => (USE_MOCK ? mockPortal.getMyInvoices(params)    : axiosClient.get('/portal/my-invoices', { params })),
  getMyInvoiceById:  (id)     => (USE_MOCK ? mockPortal.getMyInvoiceById(id)     : axiosClient.get(`/portal/my-invoices/${id}`)),
  getMyPayments:     (params) => (USE_MOCK ? mockPortal.getMyPayments(params)    : axiosClient.get('/portal/my-payments', { params })),

  // Đăng ký chỗ ở — loại phòng/phòng còn chỗ đã lọc theo giới tính ở backend
  getRoomTypes:      (params) => (USE_MOCK ? mockPortal.getRoomTypes(params)
    : axiosClient.get('/room-types', { params: { ...params, isActive: true, withAvailability: true } })),
  getAvailableRooms: (params) => (USE_MOCK ? mockPortal.getAvailableRooms(params) : axiosClient.get('/rooms/available', { params })),
  getMyApplications: ()       => (USE_MOCK ? mockPortal.getMyApplications()      : axiosClient.get('/portal/my-applications')),
  /** { roomId, startDate, endDate, note } */
  createApplication: (data)   => (USE_MOCK ? mockPortal.createApplication(data)  : axiosClient.post('/portal/my-applications', data)),
  cancelApplication: (id)     => (USE_MOCK ? mockPortal.cancelApplication(id)    : axiosClient.delete(`/portal/my-applications/${id}`)),
};
