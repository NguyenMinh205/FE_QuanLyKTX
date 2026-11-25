import axiosClient from './axiosClient';

export const authApi = {
  login:          (data) => axiosClient.post('/auth/login', data),
  logout:         ()     => axiosClient.post('/auth/logout'),
  me:             ()     => axiosClient.get('/auth/me'),
  changePassword: (data) => axiosClient.patch('/auth/change-password', data),
};
