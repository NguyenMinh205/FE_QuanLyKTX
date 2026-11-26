import axiosClient from '../../../lib/axiosClient';

/** Cổng dịch vụ Sinh viên (/api/portal — chỉ student, chống IDOR qua JWT) */
export const portalApi = {
  getProfile:              ()       => axiosClient.get('/portal/profile'),
  getMyResidence:          ()       => axiosClient.get('/portal/my-residence'),
  getMyContracts:          ()       => axiosClient.get('/portal/my-contracts'),
  applyFromPortal:         (data)   => axiosClient.post('/portal/applications', data),
  getCheckinQr:            (id)     => axiosClient.get(`/portal/my-contracts/${id}/checkin-qr`),

  getMyInvoices:           (params) => axiosClient.get('/portal/my-invoices', { params }),
  getMyInvoiceById:        (id)     => axiosClient.get(`/portal/my-invoices/${id}`),
  getMyInvoiceVietqr:      (id)     => axiosClient.get(`/portal/my-invoices/${id}/vietqr`),
  simulateMyInvoiceVietqr: (id)     => axiosClient.post(`/portal/my-invoices/${id}/simulate-vietqr`),
  getMyPayments:           (params) => axiosClient.get('/portal/my-payments', { params }),
  getMyRoomUtilityHistory: (params) => axiosClient.get('/portal/my-room/utility-history', { params }),

  getRequests:             (params) => axiosClient.get('/portal/requests', { params }),
  createRequest:           (data)   => axiosClient.post('/portal/requests', data),
  cancelRequest:           (id)     => axiosClient.patch(`/portal/requests/${id}/cancel`),

  getNotifications:        (params) => axiosClient.get('/portal/notifications', { params }),
  markNotificationRead:    (id)     => axiosClient.patch(`/portal/notifications/${id}/read`),
  markAllNotificationsRead: ()      => axiosClient.patch('/portal/notifications/read-all'),
};
