import { useState } from 'react';
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
import { ROLES } from '../../../constants/roles';
import { CAMPUS } from '../../../constants/statuses';
import { dashboardApi, occupancyRateOf } from '../api/dashboard.api';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import { formatCurrency, formatPercent } from '../../../utils/formatter';
import OccupancyChart from '../components/OccupancyChart';
import RevenueChart from '../components/RevenueChart';

const { Text } = Typography;

/**
 * Dashboard tổng quan 3 Cơ sở — Thiết kế bảng điều khiển vận hành phẳng:
 * - Dải 4 KPI liền mạch phân cách bằng đường kẻ mảnh (không lặp 4 card giống nhau)
 * - Dải lọc 3 cơ sở tương tác (Toàn trường / CS1 / CS2 / CS3)
 * - Biểu đồ lấp đầy + Doanh thu (Manager) hoặc Hàng đợi vận hành nhanh (Staff)
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const isManager = user?.role === ROLES.MANAGER;
  const [campus, setCampus] = useState(undefined);

  const summaryApi = useApi(() => dashboardApi.getSummary({ campus }), [campus]);
  const occupancyApi = useApi(() => dashboardApi.getOccupancy({}), []);

  const s = summaryApi.data;
  const loading = summaryApi.loading && !s;
  const o = s?.occupancy;
  const rate = o ? occupancyRateOf(o) : null;

  const byCampus = occupancyApi.data?.byCampus || [];
  const allBuildings = occupancyApi.data?.buildings || [];
  const filteredBuildings = campus ? allBuildings.filter((b) => b.campus === campus) : allBuildings;

  const totalAll = byCampus.reduce((acc, c) => ({
    buildings: acc.buildings + (c.totalBuildings || 0),
    rooms: acc.rooms + (c.totalRooms || 0),
    cap: acc.cap + (c.totalCapacity || 0),
    occ: acc.occ + (c.occupied || 0),
    avail: acc.avail + (c.available || 0),
    maint: acc.maint + (c.maintenance || 0),
  }), { buildings: 0, rooms: 0, cap: 0, occ: 0, avail: 0, maint: 0 });
  const totalAllPct = Math.round((occupancyRateOf({ total: totalAll.cap, occupied: totalAll.occ, maintenance: totalAll.maint }) ?? 0) * 100);

  const actionTotal = (s?.pendingApplications ?? 0) + (s?.overduePaymentContracts ?? 0) + (s?.pendingRequests ?? 0);
  const refreshAll = () => { summaryApi.refetch(); occupancyApi.refetch(); };
  const campusTitle = campus ? CAMPUS[campus]?.label : 'Toàn trường (3 Cơ sở)';

  return (
    <>
      <PageHeader
        breadcrumb={['Tổng quan', 'Dashboard']}
        title="Tổng quan Ký túc xá"
        description={`Phạm vi hiển thị: ${campusTitle}`}
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
                Còn <Text strong className="mono" style={{ color: 'var(--success-text)' }}>{o?.available ?? 0}</Text> trống · {o?.occupied ?? 0}/{o ? o.total - o.maintenance : 0} chỗ
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
                  <QueueLink label="Đơn chờ duyệt" count={s.pendingApplications} to="/admin/applications" />
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

      {/* 2. DẢI LỌC 3 CƠ SỞ TƯƠNG TÁC */}
      {byCampus.length > 0 && (
        <Row gutter={[12, 12]} style={{ marginTop: 14 }}>
          <Col xs={12} lg={6}>
            <CampusFilterCard
              active={!campus}
              onClick={() => setCampus(undefined)}
              header={<Text strong style={{ fontSize: 13 }}>Toàn trường</Text>}
              occupied={totalAll.occ}
              capacity={totalAll.cap}
              percent={totalAllPct}
              sub={`${totalAll.buildings} tòa · ${totalAll.rooms} phòng · Trống ${totalAll.avail}`}
            />
          </Col>
          {byCampus.map((c) => {
            const pct = Math.round((occupancyRateOf({ total: c.totalCapacity, occupied: c.occupied, maintenance: c.maintenance }) ?? 0) * 100);
            const active = campus === c.campus;
            return (
              <Col xs={12} lg={6} key={c.campus}>
                <CampusFilterCard
                  active={active}
                  onClick={() => setCampus(active ? undefined : c.campus)}
                  header={<StatusTag type="campus" value={c.campus} />}
                  occupied={c.occupied}
                  capacity={c.totalCapacity}
                  percent={pct}
                  sub={`${c.totalBuildings} tòa · ${c.totalRooms} phòng · Trống ${c.available}`}
                />
              </Col>
            );
          })}
        </Row>
      )}

      {/* 3. BIỂU ĐỒ LẤP ĐẦY */}
      <div style={{ marginTop: 16 }}>
        <OccupancyChart
          buildings={filteredBuildings}
          campusLabel={campusTitle}
          loading={occupancyApi.loading && !occupancyApi.data}
          error={occupancyApi.error}
        />
      </div>

      {/* 4. DOANH THU (MANAGER) HOẶC LỐI TẮT VẬN HÀNH (STAFF) */}
      <div style={{ marginTop: 16 }}>
        {isManager ? (
          <RevenueChart campus={campus} />
        ) : (
          <Card title="Tác vụ vận hành nhanh" styles={{ body: { padding: 16 } }}>
            <Row gutter={[12, 12]}>
              {[
                { to: '/admin/applications', title: 'Duyệt đơn đăng ký', sub: `${s?.pendingApplications ?? 0} đơn đang chờ` },
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

function CampusFilterCard({ active, onClick, header, occupied, capacity, percent, sub }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
      style={{
        height: '100%',
        padding: '13px 15px',
        borderRadius: 10,
        cursor: 'pointer',
        background: active ? 'var(--brand-soft)' : '#FFFFFF',
        border: `1px solid ${active ? 'var(--brand-border)' : 'var(--line)'}`,
        borderTop: `3px solid ${active ? 'var(--brand)' : 'transparent'}`,
        boxShadow: 'var(--card-shadow)',
        transition: 'border-color 0.14s ease, background-color 0.14s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px 8px', marginBottom: 6 }}>
        {header}
        <Text strong className="mono" style={{ fontSize: 12.5, whiteSpace: 'nowrap', flexShrink: 0 }}>{occupied}/{capacity}</Text>
      </div>
      <Progress percent={percent} size="small" strokeColor={active ? '#2563EB' : '#94A3B8'} showInfo={false} style={{ marginBottom: 4 }} />
      <Text type="secondary" style={{ fontSize: 12 }}>{sub}</Text>
    </div>
  );
}
