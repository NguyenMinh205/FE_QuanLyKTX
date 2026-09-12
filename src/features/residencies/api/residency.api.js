import axiosClient from '../../../lib/axiosClient';
import { mockResidencies } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const residencyApi = {
  getList: (params) => (USE_MOCK ? mockResidencies.getList(params) : axiosClient.get('/residencies', { params })),
  create:  (data)   => (USE_MOCK ? mockResidencies.create(data)    : axiosClient.post('/residencies', data)),
  close:   (id)     => (USE_MOCK ? Promise.resolve({ data: {} })   : axiosClient.patch(`/residencies/${id}/close`)),
};
