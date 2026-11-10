import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Progress, Alert, Button, Tag, Typography, Tooltip, Skeleton,
} from 'antd';
import {
  ReloadOutlined, HomeOutlined, UserOutlined, CheckCircleOutlined, PieChartOutlined, TeamOutlined,
  ClockCircleOutlined, CreditCardOutlined, WarningOutlined, ArrowRightOutlined,
  FileSearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import { contractApi } from '../../contracts/api/contract.api';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/formatter';
import StatCard from '../../../components/StatCard';
import OccupancyChart from '../components/OccupancyChart';
import { placeTextOf } from '../../contracts/utils/contractView';

const { Text } = Typography;
const EXPIRING_DAYS = 30;
const ROW_STYLE = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5' };

/** SCR-10 Dashboard (docs/08 mục 6.1, FR-70 → FR-74) */
export default function DashboardPage() {
  const navigate = useNavigate();

  const summaryApi = useApi(() => dashboardApi.getSummary(), []);
  const occupancyApi = useApi(() => dashboardApi.getOccupancy(), []);
  const expiringApi = useApi(() => contractApi.getList({ expiringInDays: EXPIRING_DAYS, limit: 5 }), []);

  const s = summaryApi.data;
  const loading = summaryApi.loading && !s;
  const o = s?.occupancy;
  const refreshAll = () => { summaryApi.refetch(); occupancyApi.refetch(); expiringApi.refetch(); };

  const actionLink = (label, to, danger) => (
    <a onClick={() => navigate(to)} style={danger ? { color: '#CF1322' } : undefined}>{label} <ArrowRightOutlined /></a>
  );

  const queue = [
    { key: 'app', icon: <FileSearchOutlined />, label: 'đơn đăng ký chờ duyệt', value: s?.pendingApplications, to: '/admin/applications' },
  ];
  const queueTotal = queue.reduce((sum, q) => sum + (q.value ?? 0), 0);
  const expiring = expiringApi.data || [];

  return (
    <>
      <PageHeader
        breadcrumb={['Dashboard']}
        title="Dashboard tổng quan"
        description="Tình hình lưu trú, giường, công nợ và các việc cần xử lý"
        extra={(
          <>
            <Text type="secondary" style={{ fontSize: 13 }}>Cập nhật lúc {dayjs().format('HH:mm')}</Text>
            <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={summaryApi.loading && !!s}>Làm mới dữ liệu</Button>
          </>
        )}
      />

      {summaryApi.error && <Alert type="error" showIcon title={summaryApi.error} style={{ marginBottom: 16 }} />}
      {o && !o.consistent && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          title="Số liệu giường không khớp"
          description={`Tổng ${o.total} ≠ đã sử dụng ${o.occupied} + còn trống ${o.available} + bảo trì ${o.maintenance} (FR-70). Báo lại cho nhóm backend.`}
        />
      )}

      {/* ---------- Hàng 1: giường ---------- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard label="Tổng số giường" icon={<HomeOutlined />} value={o?.total} loading={loading}
            footer={<Text type="secondary">Trong đó <b>{o?.maintenance ?? 0}</b> giường đang bảo trì</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard label="Đã sử dụng" icon={<UserOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" value={o?.occupied} valueColor="#1677FF" loading={loading}
            footer={<Text type="secondary">Giường đang có sinh viên ở</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard label="Còn trống" icon={<CheckCircleOutlined style={{ color: '#389E0D' }} />} iconBg="#F6FFED" value={o?.available} valueColor="#389E0D" loading={loading}
            footer={<Text type="secondary"><span style={{ color: '#52C41A' }}>●</span> Sẵn sàng xếp khi duyệt đơn</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Tỷ lệ lấp đầy" icon={<PieChartOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" loading={loading}
            value={o?.rate === null || o?.rate === undefined ? null : formatPercent(o.rate * 100)}
            badge={(
              <Tooltip title="Đã sử dụng / (tổng giường − giường bảo trì)">
                <InfoCircleOutlined style={{ color: '#8C8C8C' }} />
              </Tooltip>
            )}
          >
            <Progress percent={Math.round((o?.rate ?? 0) * 100)} showInfo={false} strokeColor="#1677FF" style={{ marginTop: 8 }} />
            <Text type="secondary" style={{ fontSize: 13 }}>{o ? `${o.occupied} / ${o.total - o.maintenance} giường dùng được` : ''}</Text>
          </StatCard>
        </Col>

        {/* ---------- Hàng 2: sinh viên, hợp đồng, công nợ ---------- */}
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Sinh viên đang ở" icon={<TeamOutlined />} value={s?.residents?.activeStudents} loading={loading}
            footer={s?.residents?.contractsByStatus
              ? <Text type="secondary">Hợp đồng: <b>{s.residents.contractsByStatus.active}</b> hiệu lực · {s.residents.contractsByStatus.expired} hết hạn · {s.residents.contractsByStatus.terminated} chấm dứt</Text>
              : <Text type="secondary">{s?.residents?.activeContracts ?? '—'} hợp đồng đang hiệu lực</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Hợp đồng sắp hết hạn" icon={<ClockCircleOutlined style={{ color: '#D48806' }} />} iconBg="#FFFBE6"
            value={s?.residents?.expiringIn30Days} valueColor="#D48806" loading={loading}
            badge={<Tag color="warning" style={{ margin: 0 }}>Trong {EXPIRING_DAYS} ngày tới</Tag>}
            footer={actionLink('Xem danh sách', '/admin/contracts?tab=active')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Tổng công nợ" icon={<CreditCardOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0"
            value={s?.finance?.totalDebt === null || s?.finance?.totalDebt === undefined ? null : formatCurrency(s.finance.totalDebt)}
            valueColor="#CF1322" loading={loading}
            footer={<Text type="secondary">Hóa đơn chưa thanh toán đủ (phòng, điện nước)</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Hóa đơn quá hạn" icon={<WarningOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0"
            value={s?.finance?.overdueInvoiceCount} valueColor="#CF1322" loading={loading}
            badge={s?.finance?.overdueInvoiceCount > 0 && <Tag color="error" style={{ margin: 0 }}>Cần đôn đốc</Tag>}
            footer={(
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <Text type="secondary">{s?.finance?.overdueAmount !== null && s?.finance?.overdueAmount !== undefined ? `Còn nợ ${formatCurrency(s.finance.overdueAmount)}` : ''}</Text>
                {actionLink('Xem hóa đơn', '/admin/invoices?status=unpaid', true)}
              </div>
            )}
          />
        </Col>
      </Row>

      {/* ---------- Lấp đầy theo tòa ---------- */}
      <div style={{ marginTop: 16 }}>
        <OccupancyChart data={occupancyApi.data} loading={occupancyApi.loading} error={occupancyApi.error} />
      </div>

      {/* ---------- Hợp đồng sắp hết hạn (FR-73) ---------- */}
      <Card
        style={{ marginTop: 16 }}
        title={<span><ClockCircleOutlined style={{ color: '#D48806' }} /> Hợp đồng sắp hết hạn gần nhất</span>}
        extra={expiringApi.meta?.total > 0 && actionLink(`Xem tất cả (${expiringApi.meta.total})`, '/admin/contracts?tab=active')}
      >
        {expiringApi.error && <Alert type="error" showIcon title={expiringApi.error} />}
        {!expiringApi.error && expiringApi.loading && !expiringApi.data && <Skeleton active paragraph={{ rows: 3 }} />}
        {!expiringApi.error && expiringApi.data && (
          <div>
            {expiring.length === 0 && <Text type="secondary">Không có hợp đồng nào hết hạn trong {EXPIRING_DAYS} ngày tới</Text>}
            {expiring.map((c) => {
              const left = dayjs(c.endDate).startOf('day').diff(dayjs().startOf('day'), 'day');
              return (
                <div
                  key={c.id} data-row="expiring" role="button" tabIndex={0}
                  style={{ ...ROW_STYLE, cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/contracts?search=${encodeURIComponent(c.contractCode)}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/contracts?search=${encodeURIComponent(c.contractCode)}`)}
                >
                  <div style={{ minWidth: 0 }}>
                    <Text strong>{c.studentName}</Text> <Text type="secondary">· {c.studentCode}</Text>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>{c.contractCode} · {placeTextOf(c)} · hết hạn {formatDate(c.endDate)}</Text></div>
                  </div>
                  <Tag color={left <= 7 ? 'error' : 'warning'} style={{ margin: 0 }}>{left === 0 ? 'Hôm nay' : `Còn ${left} ngày`}</Tag>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ---------- Cần xử lý (FR-74) ---------- */}
      <Card style={{ marginTop: 16, borderLeft: '4px solid #1677FF' }} styles={{ body: { padding: '14px 20px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Tag color="blue" style={{ margin: 0 }}>Cần xử lý{s ? ` · ${queueTotal}` : ''}</Tag>
          {queue.map((q) => (
            <span key={q.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {q.icon}
              {!q.value
                ? <Text><b>{q.value ?? '—'}</b> {q.label}</Text>
                : <a onClick={() => navigate(q.to)}><b>{q.value}</b> {q.label}</a>}
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}
