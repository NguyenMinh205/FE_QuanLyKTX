import axiosClient from '../../../lib/axiosClient';

/** Tòa nhà 3 Cơ sở & Phòng KTX cấp phòng (API.md §4 — Manager CRUD, Staff xem) */
export const roomApi = {
  getBuildings:   (params)   => axiosClient.get('/buildings', { params }),
  createBuilding: (data)     => axiosClient.post('/buildings', data),
  updateBuilding: (id, data) => axiosClient.put(`/buildings/${id}`, data),

  getRooms:       (params)   => axiosClient.get('/rooms', { params }),
  getRoomById:    (id)       => axiosClient.get(`/rooms/${id}`),
  createRoom:     (data)     => axiosClient.post('/rooms', data),
  updateRoom:     (id, data) => axiosClient.put(`/rooms/${id}`, data),
};
