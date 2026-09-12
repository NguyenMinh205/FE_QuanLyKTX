import { Row, Col, Card, Statistic, Progress, Alert } from 'antd';
import {
  HomeOutlined, CheckCircleOutlined, TeamOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useApi } from '../../hooks/useApi';
import { mockDashboardSummary } from '../../mocks/mockData';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency, formatPercent } from '../../utils/formatter';

// TODO(T6.1): đổi sang dashboardApi.getSummary() khi backend xong
const fetchSummary = () => mockDashboardSummary();

export default function DashboardPage() {
  const { data, loading, error } = useApi(fetchSummary, []);

  if (error) return <Alert type="error" message={error} showIcon />;

  const f = data?.facility;
  const r = data?.residents;
  const fi = data?.finance;

  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan tình hình ký túc xá" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Tổng số giường" value={f?.totalBeds} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Đã sử dụng" value={f?.occupiedBeds}
              valueStyle={{ color: '#1677FF' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Còn trống" value={f?.availableBeds} valueStyle={{ color: '#52C41A' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <div style={{ color: '#8C8C8C', fontSize: 14, marginBottom: 8 }}>Tỷ lệ lấp đầy</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{formatPercent(f?.occupancyRate)}</div>
            <Progress percent={Number(f?.occupancyRate?.toFixed(0) || 0)} size="small" showInfo={false} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Sinh viên đang ở" value={r?.activeStudents} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Đơn chờ duyệt" value={r?.pendingContracts} valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Tổng công nợ" value={formatCurrency(fi?.totalDebt)}
              valueStyle={{ color: '#FF4D4F', fontSize: 20 }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Hóa đơn quá hạn" value={fi?.overdueInvoiceCount} valueStyle={{ color: '#FF4D4F' }} />
          </Card>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 24 }}
        type="info"
        showIcon
        message="Đây là khung dashboard (T6.3)"
        description="Số liệu đang lấy từ dữ liệu giả. Biểu đồ lấp đầy theo tòa và doanh thu theo tháng sẽ bổ sung ở Sprint 4 — xem docs/08 mục 6, màn hình SCR-10."
      />
    </>
  );
}
