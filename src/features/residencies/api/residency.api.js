import axiosClient from '../../../lib/axiosClient';
import { mockResidencies } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** Lưu trú chỉ được tạo khi duyệt đơn đăng ký — xem applicationApi */
export const residencyApi = {
  getList: (params) => (USE_MOCK ? mockResidencies.getList(params) : axiosClient.get('/residencies', { params })),
  close:   (id)     => (USE_MOCK ? Promise.resolve({ data: {} })   : axiosClient.patch(`/residencies/${id}/close`)),
};
