import axiosClient from './axiosClient';
import { mockLogin } from '../mocks/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authApi = {
  login: (data) => (USE_MOCK ? mockLogin(data) : axiosClient.post('/auth/login', data)),
  register: (data) => axiosClient.post('/auth/register', data),
  logout: () => (USE_MOCK ? Promise.resolve() : axiosClient.post('/auth/logout')),
  me: () => axiosClient.get('/auth/me'),
  changePassword: (data) => axiosClient.patch('/auth/change-password', data),
};
