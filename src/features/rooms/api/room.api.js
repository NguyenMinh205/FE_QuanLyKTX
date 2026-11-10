import axiosClient from '../../../lib/axiosClient';
import { mockRooms } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

export const roomApi = {
  // Tòa nhà
  /** params.includeInactive=true → cả tòa ngừng hoạt động (chỉ màn Tòa nhà dùng) */
  getBuildings:    (params)   => (USE_MOCK ? mockRooms.getBuildings(params)       : axiosClient.get('/buildings', { params })),
  createBuilding:  (data)     => (USE_MOCK ? mockRooms.createBuilding(data)       : axiosClient.post('/buildings', data)),
  updateBuilding:  (id, data) => (USE_MOCK ? mockRooms.updateBuilding(id, data)   : axiosClient.put(`/buildings/${id}`, data)),

  // ⚠️ Tạm thời cho màn Đăng ký và Duyệt đơn cũ, xoá ở M4
  getRoomTypes:    (params)   => (USE_MOCK ? mockRooms.getRoomTypes(params)       : axiosClient.get('/room-types', { params })),

  // Phòng — giường, giá, cọc nằm trên phòng; giường được sinh tự động theo sức chứa
  getRooms:        (params)   => (USE_MOCK ? mockRooms.getRooms(params)           : axiosClient.get('/rooms', { params })),
  getAvailableRooms: (params) => (USE_MOCK ? mockRooms.getAvailableRooms(params)  : axiosClient.get('/rooms/available', { params })),
  getRoomById:     (id)       => (USE_MOCK ? mockRooms.getRoomById(id)            : axiosClient.get(`/rooms/${id}`)),
  createRoom:      (data)     => (USE_MOCK ? mockRooms.createRoom(data)           : axiosClient.post('/rooms', data)),
  updateRoom:      (id, data) => (USE_MOCK ? mockRooms.updateRoom(id, data)       : axiosClient.put(`/rooms/${id}`, data)),
};
