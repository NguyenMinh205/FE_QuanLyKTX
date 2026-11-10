import axiosClient from '../../../lib/axiosClient';
import { mockPublic } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/**
 * Cổng công khai (API.md §5) — không cần đăng nhập.
 * Cán bộ cũng dùng danh sách phòng trống này khi chọn giường thay thế lúc duyệt đơn.
 */
export const applyApi = {
  /** { gender, buildingId?, limit? } → phòng còn giường nhận đơn, đã sắp tầng thấp → số phòng nhỏ (BR-07) */
  getAvailableRooms: (params) => (USE_MOCK ? mockPublic.getAvailableRooms(params) : axiosClient.get('/public/rooms/available', { params })),
  /** Hồ sơ sinh viên + { roomId, bedNumber, term } — giá do backend lấy từ phòng */
  submit:            (data)   => (USE_MOCK ? mockPublic.registerOnline(data)      : axiosClient.post('/contracts/register-online', data)),
  /** { studentCode, email } */
  getStatus:         (params) => (USE_MOCK ? mockPublic.getApplicationStatus(params) : axiosClient.get('/public/applications/status', { params })),
};
