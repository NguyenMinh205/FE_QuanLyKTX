import axiosClient from '../../../lib/axiosClient';

/** Dashboard & Báo cáo 3 Cơ sở (/api/dashboard — Manager & Staff; Revenue chỉ Manager) */
export const dashboardApi = {
  getSummary:   (params) => axiosClient.get('/dashboard/summary', { params }),
  getOccupancy: (params) => axiosClient.get('/dashboard/occupancy', { params }),
  getRevenue:   (params) => axiosClient.get('/dashboard/revenue', { params }),
};

/** Tỷ lệ lấp đầy cấp phòng: occupied / (total - maintenance) */
export const occupancyRateOf = ({ total, occupied, maintenance = 0 } = {}) => {
  const usable = (total ?? 0) - maintenance;
  return usable > 0 ? occupied / usable : null;
};
