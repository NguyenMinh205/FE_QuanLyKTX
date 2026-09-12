import axiosClient from '../../../lib/axiosClient';
import { mockRooms } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const roomApi = {
  getBuildings:      (params) => (USE_MOCK ? mockRooms.getBuildings()            : axiosClient.get('/buildings', { params })),
  createBuilding:    (data)   => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.post('/buildings', data)),
  updateBuilding:    (id, d)  => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.put(`/buildings/${id}`, d)),

  getRooms:          (params) => (USE_MOCK ? mockRooms.getRooms(params)          : axiosClient.get('/rooms', { params })),
  createRoom:        (data)   => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.post('/rooms', data)),
  updateRoom:        (id, d)  => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.put(`/rooms/${id}`, d)),

  getBeds:           (roomId) => (USE_MOCK ? mockRooms.getBeds(roomId)           : axiosClient.get(`/rooms/${roomId}/beds`)),
  generateBeds:      (roomId) => (USE_MOCK ? Promise.resolve({ data: {} })       : axiosClient.post(`/rooms/${roomId}/beds/generate`)),
  getAvailableBeds:  (params) => (USE_MOCK ? mockRooms.getAvailableBeds(params)  : axiosClient.get('/beds/available', { params })),
  setBedStatus:      (id, status) => (USE_MOCK ? mockRooms.setBedStatus(id, status) : axiosClient.patch(`/beds/${id}/status`, { status })),
};
