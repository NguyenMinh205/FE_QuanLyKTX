import axiosClient from '../../../lib/axiosClient';
import { mockRooms } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

export const roomApi = {
  // Tòa nhà
  getBuildings:    (params)   => (USE_MOCK ? mockRooms.getBuildings()             : axiosClient.get('/buildings', { params })),
  createBuilding:  (data)     => (USE_MOCK ? Promise.resolve({ data: {} })        : axiosClient.post('/buildings', data)),
  updateBuilding:  (id, data) => (USE_MOCK ? Promise.resolve({ data: {} })        : axiosClient.put(`/buildings/${id}`, data)),

  // Loại phòng
  getRoomTypes:    (params)   => (USE_MOCK ? mockRooms.getRoomTypes(params)       : axiosClient.get('/room-types', { params })),
  createRoomType:  (data)     => (USE_MOCK ? mockRooms.createRoomType(data)       : axiosClient.post('/room-types', data)),
  updateRoomType:  (id, data) => (USE_MOCK ? mockRooms.updateRoomType(id, data)   : axiosClient.put(`/room-types/${id}`, data)),

  // Phòng — giường được sinh tự động, không có API thêm/xóa giường
  getRooms:        (params)   => (USE_MOCK ? mockRooms.getRooms(params)           : axiosClient.get('/rooms', { params })),
  getAvailableRooms: (params) => (USE_MOCK ? mockRooms.getAvailableRooms(params)  : axiosClient.get('/rooms/available', { params })),
  getRoomById:     (id)       => (USE_MOCK ? mockRooms.getRoomById(id)            : axiosClient.get(`/rooms/${id}`)),
  createRoom:      (data)     => (USE_MOCK ? mockRooms.createRoom(data)           : axiosClient.post('/rooms', data)),
  updateRoom:      (id, data) => (USE_MOCK ? mockRooms.updateRoom(id, data)       : axiosClient.put(`/rooms/${id}`, data)),
  setBedStatus:    (id, status) => (USE_MOCK ? mockRooms.setBedStatus(id, status) : axiosClient.patch(`/beds/${id}/status`, { status })),
};
