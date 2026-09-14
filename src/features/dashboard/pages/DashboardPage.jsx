import { Row, Col, Card, Statistic, Progress, Alert } from 'antd';
import { HomeOutlined, CheckCircleOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency, formatPercent } from '../../../utils/formatter';

export default function DashboardPage() {
  const { data, loading, error } = useApi(() => dashboardApi.getSummary(), []);

  if (error) return <Alert type="error" title={error} showIcon />;

  const o = data?.occupancy;
  const r = data?.residents;
  const f = data?.finance;
  const rq = data?.pendingRequests;

  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan tình hình ký túc xá" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Tổng số giường" value={o?.total} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Đã sử dụng" value={o?.occupied}
              styles={{ content: { color: '#1677FF' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Còn trống" value={o?.available} styles={{ content: { color: '#52C41A' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <div style={{ color: '#8C8C8C', fontSize: 14, marginBottom: 8 }}>Tỷ lệ lấp đầy</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{formatPercent((o?.rate || 0) * 100)}</div>
            <Progress percent={Math.round((o?.rate || 0) * 100)} size="small" showInfo={false} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Sinh viên đang ở" value={r?.activeStudents} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Hợp đồng sắp hết hạn" value={r?.expiringIn30Days} styles={{ content: { color: '#FAAD14' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Tổng công nợ" value={formatCurrency(f?.totalDebt)}
              styles={{ content: { color: '#FF4D4F', fontSize: 20 } }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Hóa đơn quá hạn" value={f?.overdueInvoiceCount} styles={{ content: { color: '#FF4D4F' } }} />
          </Card>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 24 }}
        type="info"
        showIcon
        title={`Cần xử lý: ${data?.pendingApplications ?? 0} đơn đăng ký chờ duyệt · ${rq?.renewal ?? 0} yêu cầu gia hạn · ${rq?.checkout ?? 0} yêu cầu trả phòng · ${data?.supplyOrdersReady ?? 0} đơn nhu yếu phẩm chờ nhận`}
        description="Biểu đồ tỷ lệ lấp đầy theo tòa bổ sung theo docs/08 mục 6.1."
      />
    </>
  );
}
