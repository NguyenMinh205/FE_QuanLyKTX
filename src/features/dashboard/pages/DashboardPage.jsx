import { Link } from 'react-router-dom';
import {
  Row, Col, Progress, Alert, Button, Typography, Tooltip,
} from 'antd';
import {
  ReloadOutlined, HomeOutlined, UserOutlined, CheckCircleOutlined, PieChartOutlined, TeamOutlined,
  CreditCardOutlined, ArrowRightOutlined, FileSearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/roles';
import { dashboardApi, occupancyRateOf } from '../api/dashboard.api';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency, formatPercent } from '../../../utils/formatter';
import StatCard from '../../../components/StatCard';
import OccupancyChart from '../components/OccupancyChart';
import RevenueChart from '../components/RevenueChart';

const { Text } = Typography;

/** SCR-10 Dashboard: KPI (FR-70), lấp đầy theo tòa (FR-71), doanh thu theo tháng — chỉ Admin (FR-72) */
export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const summaryApi = useApi(() => dashboardApi.getSummary(), []);
  const occupancyApi = useApi(() => dashboardApi.getOccupancy(), []);

  const s = summaryApi.data;
  const loading = summaryApi.loading && !s;
  const o = s?.occupancy;
  const rate = o ? occupancyRateOf(o) : null;
  // Backend phải bảo đảm tổng = đã ở + trống + bảo trì (API.md §10) — lệch thì báo to để sửa nguồn, không tự bù
  const consistent = !o || o.total === o.occupied + o.available + o.maintenance;
  const refreshAll = () => { summaryApi.refetch(); occupancyApi.refetch(); };

  const actionLink = (label, to) => <Link to={to}>{label} <ArrowRightOutlined /></Link>;

  return (
    <>
      <PageHeader
        breadcrumb={['Dashboard']}
        title="Dashboard tổng quan"
        description="Giường, sinh viên nội trú, đơn chờ duyệt, công nợ và doanh thu"
        extra={(
          <>
            <Text type="secondary" style={{ fontSize: 13 }}>Cập nhật lúc {dayjs().format('HH:mm')}</Text>
            <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={summaryApi.loading && !!s}>Làm mới dữ liệu</Button>
          </>
        )}
      />

      {summaryApi.error && <Alert type="error" showIcon title={summaryApi.error} style={{ marginBottom: 16 }} />}
      {!consistent && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          title="Số liệu giường không khớp"
          description={`Tổng ${o.total} ≠ đã ở ${o.occupied} + còn trống ${o.available} + bảo trì ${o.maintenance}. Báo lại cho nhóm backend.`}
        />
      )}

      {/* ---------- FR-70: giường ---------- */}
      <Row gutter={[16, 16]}>
        <Col xs={12} xl={6}>
          <StatCard label="Tổng số giường" icon={<HomeOutlined />} value={o?.total} loading={loading}
            footer={<Text type="secondary">Trong đó <b>{o?.maintenance ?? 0}</b> giường đang bảo trì</Text>} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard label="Đang có người ở" icon={<UserOutlined style={{ color: 'var(--brand)' }} />} iconBg="#E6F4FF" value={o?.occupied} valueColor="#1677FF" loading={loading}
            footer={<Text type="secondary">Giường đã xếp cho sinh viên</Text>} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard label="Còn trống" icon={<CheckCircleOutlined style={{ color: 'var(--success-text)' }} />} iconBg="#F6FFED" value={o?.available} valueColor="#389E0D" loading={loading}
            footer={<Text type="secondary">Sẵn sàng xếp khi duyệt đơn</Text>} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard
            label="Tỷ lệ lấp đầy" icon={<PieChartOutlined style={{ color: 'var(--brand)' }} />} iconBg="#E6F4FF" loading={loading}
            value={rate === null ? null : formatPercent(rate * 100)}
            badge={(
              <Tooltip title="Đã có người / (tổng giường − giường bảo trì)">
                <InfoCircleOutlined style={{ color: 'var(--text-tertiary)' }} aria-label="Cách tính tỷ lệ lấp đầy" />
              </Tooltip>
            )}
          >
            <Progress percent={Math.round((rate ?? 0) * 100)} showInfo={false} strokeColor="#1677FF" style={{ marginTop: 8 }} />
            <Text type="secondary" style={{ fontSize: 13 }}>{o ? `${o.occupied} / ${o.total - o.maintenance} giường dùng được` : ''}</Text>
          </StatCard>
        </Col>

        {/* ---------- FR-70: sinh viên, đơn chờ, công nợ ---------- */}
        <Col xs={12} md={8}>
          <StatCard
            label="Sinh viên đang nội trú" icon={<TeamOutlined />} value={s?.activeStudents} loading={loading}
            footer={<Text type="secondary">Kể cả hợp đồng đã hết hạn mà chưa trả phòng</Text>}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            label="Đơn đăng ký chờ duyệt" icon={<FileSearchOutlined style={{ color: 'var(--warning-text)' }} />} iconBg="#FFFBE6"
            value={s?.pendingApplications} valueColor={s?.pendingApplications ? 'var(--warning-text)' : undefined} loading={loading}
            footer={s?.pendingApplications ? actionLink('Duyệt đơn', '/admin/applications') : <Text type="secondary">Không có đơn nào đang chờ</Text>}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            label="Công nợ chưa thu" icon={<CreditCardOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0"
            value={s?.finance ? formatCurrency(s.finance.totalDebt) : null} valueColor="#CF1322" loading={loading}
            footer={s?.finance && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <Text type="secondary">Tiền phòng {formatCurrency(s.finance.roomDebt)} · điện nước {formatCurrency(s.finance.utilityDebt)}</Text>
                {s.finance.totalDebt > 0 && actionLink('Xem hóa đơn', '/admin/invoices?status=unpaid')}
              </div>
            )}
          />
        </Col>
      </Row>

      {/* ---------- FR-71 ---------- */}
      <div style={{ marginTop: 16 }}>
        <OccupancyChart data={occupancyApi.data} loading={occupancyApi.loading} error={occupancyApi.error} />
      </div>

      {/* ---------- FR-72: chỉ Admin (RBAC) — Staff không gọi API doanh thu ---------- */}
      {isAdmin && (
        <div style={{ marginTop: 16 }}>
          <RevenueChart />
        </div>
      )}
    </>
  );
}
