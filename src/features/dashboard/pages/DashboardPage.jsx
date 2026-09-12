import { Row, Col, Card, Statistic, Progress, Alert } from 'antd';
import { HomeOutlined, CheckCircleOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency, formatPercent } from '../../../utils/formatter';

export default function DashboardPage() {
  const { data, loading, error } = useApi(() => dashboardApi.getSummary(), []);

  if (error) return <Alert type="error" message={error} showIcon />;

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
              valueStyle={{ color: '#1677FF' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Còn trống" value={o?.available} valueStyle={{ color: '#52C41A' }} />
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
            <Statistic title="Hợp đồng sắp hết hạn" value={r?.expiringIn30Days} valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Tổng công nợ" value={formatCurrency(f?.totalDebt)}
              valueStyle={{ color: '#FF4D4F', fontSize: 20 }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Hóa đơn quá hạn" value={f?.overdueInvoiceCount} valueStyle={{ color: '#FF4D4F' }} />
          </Card>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 24 }}
        type="info"
        showIcon
        message={`Đang chờ xử lý: ${rq?.renewal ?? 0} yêu cầu gia hạn · ${rq?.checkout ?? 0} yêu cầu trả phòng`}
        description="Biểu đồ tỷ lệ lấp đầy theo tòa sẽ bổ sung ở Sprint 4 — xem 08-THIET-KE-GIAO-DIEN.md."
      />
    </>
  );
}
