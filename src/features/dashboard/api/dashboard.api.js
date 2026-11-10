import axiosClient from '../../../lib/axiosClient';
import { mockDashboard } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

/** API.md §10 */
export const dashboardApi = {
  /** KPI FR-70: { occupancy{ total, occupied, available, maintenance }, activeStudents, pendingApplications, finance{ totalDebt, roomDebt, utilityDebt } } */
  getSummary:   ()       => (USE_MOCK ? mockDashboard.getSummary()         : axiosClient.get('/dashboard/summary')),
  /** FR-71: [{ buildingId, buildingCode, buildingName, totalRooms, totalBeds, occupied, available, maintenance }] */
  getOccupancy: ()       => (USE_MOCK ? mockDashboard.getOccupancy()       : axiosClient.get('/dashboard/occupancy')),
  /** FR-72, chỉ admin: [{ month, roomRevenue, utilityRevenue, total }] theo tháng có thu tiền, cũ trước */
  getRevenue:   (params) => (USE_MOCK ? mockDashboard.getRevenue(params)   : axiosClient.get('/dashboard/revenue', { params })),
};

/** Tỷ lệ lấp đầy: đã sử dụng / (tổng − bảo trì) — giường bảo trì không xếp được nên không tính vào mẫu */
export const occupancyRateOf = ({ total, occupied, maintenance = 0 }) => {
  const usable = (total ?? 0) - maintenance;
  return usable > 0 ? occupied / usable : null;
};
