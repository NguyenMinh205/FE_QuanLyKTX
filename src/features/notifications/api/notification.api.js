import axiosClient from '../../../lib/axiosClient';

/** Bảng tin KTX (/api/notifications/announcements — Manager & Staff tạo, Manager xóa) */
export const notificationApi = {
  getAnnouncements:   (params) => axiosClient.get('/notifications/announcements', { params }),
  createAnnouncement: (data)   => axiosClient.post('/notifications/announcements', data),
  deleteAnnouncement: (id)     => axiosClient.delete(`/notifications/announcements/${id}`),
};
