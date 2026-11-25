import axiosClient from '../../../lib/axiosClient';

/** Phiếu yêu cầu SV (/api/requests — Manager & Staff; chuyển phòng chỉ Manager duyệt) */
export const requestApi = {
  getList:      (params)   => axiosClient.get('/requests', { params }),
  updateStatus: (id, data) => axiosClient.patch(`/requests/${id}/status`, data),
};
