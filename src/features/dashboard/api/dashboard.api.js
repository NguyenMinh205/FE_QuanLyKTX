import axiosClient from '../../../lib/axiosClient';
import { mockDashboard } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';


export const dashboardApi = {
  getSummary:   () => (USE_MOCK ? mockDashboard.getSummary()   : axiosClient.get('/dashboard/summary')),
  getOccupancy: () => (USE_MOCK ? mockDashboard.getOccupancy() : axiosClient.get('/dashboard/occupancy')),
};
