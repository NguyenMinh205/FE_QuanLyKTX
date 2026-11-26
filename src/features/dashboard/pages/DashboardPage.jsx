import { Link } from 'react-router-dom';
import {
  Row, Col, Progress, Alert, Button, Typography, Tooltip, Space, Card, Skeleton,
} from 'antd';
import {
  ReloadOutlined, ArrowRightOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { dashboardApi, occupancyRateOf } from '../api/dashboard.api';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency, formatPercent } from '../../../utils/formatter';
import OccupancyChart from '../components/OccupancyChart';
import RevenueChart from '../components/RevenueChart';

const { Text } = Typography;

/**
 * Dashboard tổng quan KTX Cơ sở 1 (2 Tòa A14, A15):
 * - Dải 4 KPI liền mạch phân cách bằng đường kẻ mảnh
 * - Biểu đồ lấp đầy 2 tòa nhà (A14, A15)
 * - Biểu đồ Doanh thu thực thu (CHỈ Manager) | Tác vụ vận hành nhanh (Staff)
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const canViewRevenue = can(user, 'dashboard:revenue');

  const summaryApi = useApi(() => dashboardApi.getSummary(), []);
  const occupancyApi = useApi(() => dashboardApi.getOccupancy(), []);

  const s = summaryApi.data;
  const loading = summaryApi.loading && !s;
  const o = s?.occupancy;
  const rate = o ? occupancyRateOf(o) : null;

  const allBuildings = occupancyApi.data?.buildings || [];
  const actionTotal = (s?.awaitingDepositRefund ?? 0) + (s?.overduePaymentContracts ?? 0) + (s?.pendingRequests ?? 0);
  const refreshAll = () => { summaryApi.refetch(); occupancyApi.refetch(); };

  return (
    <>
      <PageHeader
        breadcrumb={['Tổng quan', 'Dashboard']}
        title="Tổng quan KTX Cơ sở 1"
        description="Trung tâm KTX Cầu Diễn — 2 Tòa nhà A14, A15"
        extra={(
          <Space>
            <Text type="secondary" className="mono" style={{ fontSize: 12 }}>Cập nhật {dayjs().format('HH:mm')}</Text>
            <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={summaryApi.loading && !!s}>Làm mới</Button>
          </Space>
        )}
      />

      {summaryApi.error && <Alert type="error" showIcon title={summaryApi.error} style={{ marginBottom: 16 }} />}

      {/* 1. DẢI 4 KPI LIỀN MẠCH */}
      <div className="haui-kpi-strip">
        <div className="haui-kpi-cell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Tỷ lệ lấp đầy</Text>
            <Tooltip title="Đang giữ chỗ / (Tổng sức chứa − Bảo trì)">
              <InfoCircleOutlined style={{ color: 'var(--text-tertiary)', fontSize: 13 }} />
            </Tooltip>
          </div>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 10 }} /> : (
            <>
              <div className="stat-card-value mono" style={{ marginTop: 6 }}>
                {rate === null ? '—' : formatPercent(rate * 100)}
              </div>
              <Progress percent={Math.round((rate ?? 0) * 100)} showInfo={false} strokeColor="#2563EB" size="small" style={{ margin: '8px 0 4px' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Còn <Text strong className="mono" style={{ color: 'var(--success-text)' }}>{o?.available ?? 0}</Text> trống · {o?.occupied ?? 0}/{o ? o.total - o.maintenance : 0} chỗ ({o?.totalRooms ?? 0} phòng)
              </Text>
            </>
          )}
        </div>

        <div className="haui-kpi-cell">
          <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Sinh viên đang nội trú</Text>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 10 }} /> : (
            <>
              <div className="stat-card-value mono" style={{ marginTop: 6 }}>{s?.activeStudents ?? '—'}</div>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 6 }}>
                {s?.pendingPaymentContracts ?? 0} hợp đồng chờ đóng phí giữ chỗ
              </Text>
              <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                <Link to="/admin/contracts" style={{ fontSize: 12.5, fontWeight: 500 }}>
                  Quản lý hợp đồng <ArrowRightOutlined style={{ fontSize: 11 }} />
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="haui-kpi-cell">
          <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Hàng đợi cần xử lý</Text>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 10 }} /> : (
            <>
              <div className="stat-card-value mono" style={{ marginTop: 6, color: actionTotal > 0 ? 'var(--warning-text)' : 'var(--success-text)' }}>
                {s ? actionTotal : '—'}
              </div>
              {s && (
                <div style={{ display: 'grid', gap: 4, marginTop: 8, fontSize: 12 }}>
                  <QueueLink label="Chờ hoàn cọc" count={s.awaitingDepositRefund} to="/admin/contracts?tab=refund" />
                  <QueueLink label="Quá hạn đóng phí" count={s.overduePaymentContracts} to="/admin/contracts?tab=pending_payment" danger />
                  <QueueLink label="Yêu cầu hỗ trợ" count={s.pendingRequests} to="/admin/requests" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="haui-kpi-cell">
          <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Công nợ chưa thu</Text>
          {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 10 }} /> : (
            <>
              <div className="stat-card-value mono" style={{ marginTop: 6, color: s?.finance?.totalDebt ? 'var(--danger-text)' : 'var(--success-text)' }}>
                {s?.finance ? formatCurrency(s.finance.totalDebt) : '—'}
              </div>
              {s?.finance && (
                <>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 6 }}>
                    Phòng <span className="mono">{formatCurrency(s.finance.roomDebt)}</span> · ĐN <span className="mono">{formatCurrency(s.finance.utilityDebt)}</span>
                  </Text>
                  <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <Link to="/admin/invoices?status=unpaid" style={{ fontSize: 12.5, fontWeight: 500 }}>
                      Xem hóa đơn <ArrowRightOutlined style={{ fontSize: 11 }} />
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. BIỂU ĐỒ LẤP ĐẦY 2 TÒA NHÀ */}
      <div style={{ marginTop: 16 }}>
        <OccupancyChart
          buildings={allBuildings}
          campusLabel="Cơ sở 1 (A14, A15)"
          loading={occupancyApi.loading && !occupancyApi.data}
          error={occupancyApi.error}
        />
      </div>

      {/* 3. DOANH THU (CHỈ MANAGER) HOẶC LỐI TẮT VẬN HÀNH NHANH (STAFF) */}
      <div style={{ marginTop: 16 }}>
        {canViewRevenue ? (
          <RevenueChart />
        ) : (
          <Card title="Tác vụ vận hành nhanh" styles={{ body: { padding: 16 } }}>
            <Row gutter={[12, 12]}>
              {[
                { to: '/admin/contracts?tab=refund', title: 'Quyết toán hoàn cọc', sub: `${s?.awaitingDepositRefund ?? 0} hợp đồng chờ hoàn` },
                { to: '/admin/contracts', title: 'Check-in QR & Hợp đồng', sub: `${s?.pendingPaymentContracts ?? 0} chờ đóng phí` },
                { to: '/admin/requests', title: 'Xử lý yêu cầu SV', sub: `${s?.pendingRequests ?? 0} phiếu chờ` },
                { to: '/admin/utility-readings', title: 'Ghi chỉ số điện nước', sub: 'Chốt kỳ hàng tháng' },
              ].map((item) => (
                <Col xs={12} md={6} key={item.to}>
                  <Link to={item.to}>
                    <div className="portal-quick-tile" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: 13.5, color: 'var(--ink)' }}>{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.sub}</Text>
                      </div>
                      <ArrowRightOutlined style={{ color: 'var(--text-tertiary)', fontSize: 12 }} />
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </>
  );
}

function QueueLink({ label, count = 0, to, danger }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: count > 0 ? (danger ? 'var(--danger-text)' : 'var(--ink)') : 'var(--text-tertiary)',
      }}
    >
      <span>{label}</span>
      <span className="mono" style={{ fontWeight: 600, color: count > 0 ? (danger ? 'var(--danger-text)' : 'var(--brand)') : 'var(--text-tertiary)' }}>
        {count} →
      </span>
    </Link>
  );
}
