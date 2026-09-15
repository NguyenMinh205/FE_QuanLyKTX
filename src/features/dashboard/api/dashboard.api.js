import axiosClient from '../../../lib/axiosClient';
import { mockDashboard } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

const num = (...values) => {
  const v = values.find((x) => typeof x === 'number');
  return v === undefined ? null : v;
};

/**
 * Chuẩn hóa response GET /dashboard/summary về một dạng duy nhất (API.md mục 12).
 * Backend hiện tại trả tên trường khác (totalBeds, occupancyRate, queue.pendingRequests...) — chấp nhận cả hai,
 * trường nào backend chưa có thì để null để giao diện hiện "—" thay vì số sai.
 * Tỷ lệ lấp đầy KHÔNG lấy từ backend mà tính lại theo docs: đã sử dụng / (tổng − bảo trì).
 */
export const normalizeSummary = (d = {}) => {
  const o = d.occupancy || {};
  const total = num(o.total, o.totalBeds);
  const occupied = num(o.occupied, o.occupiedBeds);
  const available = num(o.available, o.availableBeds);
  const maintenance = num(o.maintenance, o.maintenanceBeds) ?? 0;
  const usable = total !== null ? total - maintenance : null;

  const queueRequests = d.pendingRequests ?? d.queue?.pendingRequests;
  return {
    occupancy: {
      total, occupied, available, maintenance,
      rate: usable ? occupied / usable : null,
      consistent: total === null || occupied === null || available === null || total === occupied + available + maintenance,
    },
    residents: {
      activeStudents: num(d.residents?.activeStudents),
      activeContracts: num(d.residents?.activeContracts),
      expiringIn30Days: num(d.residents?.expiringIn30Days, d.queue?.expiringContracts),
      contractsByStatus: d.residents?.contractsByStatus ?? null,
    },
    finance: {
      totalDebt: num(d.finance?.totalDebt, d.finance?.totalOutstandingDebt),
      overdueInvoiceCount: num(d.finance?.overdueInvoiceCount),
      overdueAmount: num(d.finance?.overdueAmount),
    },
    pendingRequests: typeof queueRequests === 'number'
      ? { renewal: null, checkout: null, total: queueRequests }
      : {
        renewal: num(queueRequests?.renewal),
        checkout: num(queueRequests?.checkout),
        total: num(queueRequests?.renewal) !== null ? (queueRequests.renewal + (queueRequests.checkout ?? 0)) : null,
      },
    pendingApplications: num(d.pendingApplications),
    supplyOrdersReady: num(d.supplyOrdersReady),
  };
};

const withNormalizedSummary = (promise) => promise.then((res) => ({
  ...res, data: { ...res.data, data: normalizeSummary(res.data?.data) },
}));

export const dashboardApi = {
  getSummary:   () => withNormalizedSummary(USE_MOCK ? mockDashboard.getSummary() : axiosClient.get('/dashboard/summary')),
  getOccupancy: () => (USE_MOCK ? mockDashboard.getOccupancy() : axiosClient.get('/dashboard/occupancy')),
};
