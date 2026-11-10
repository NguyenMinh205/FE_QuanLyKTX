import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Table, Alert, Skeleton, Divider, Space, Empty,
} from 'antd';
import {
  HomeOutlined, FileTextOutlined, TeamOutlined, DollarOutlined, ArrowRightOutlined,
  CalendarOutlined, GiftOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import { daysUntil, splitBedCode } from '../utils/homeView';

const { Text, Title } = Typography;

const Info = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
  </div>
);

/** SCR-63 Chỗ ở & hợp đồng (FR-82, FR-39) — chỉ xem; trả phòng làm trực tiếp tại văn phòng KTX (UC-07) */
export default function MyResidencePage() {
  const navigate = useNavigate();
  const { data: residence, loading, error } = useApi(() => portalApi.getMyResidence(), []);
  const { data: contracts, loading: histLoading } = useApi(() => portalApi.getMyContracts(), []);

  const header = <PageHeader title="Chỗ ở & hợp đồng" description="Thông tin phòng, giường và hợp đồng lưu trú của bạn" />;
  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được thông tin chỗ ở" description={error} /></>;
  if (loading && !residence) return <>{header}<Card><Skeleton active paragraph={{ rows: 8 }} /></Card></>;

  const history = (contracts || []).filter((c) => ['expired', 'terminated'].includes(c.status));

  if (!residence?.hasResidence) {
    return (
      <>
        {header}
        <Card>
          <Empty
            description={(
              <div>
                <Text strong style={{ fontSize: 16 }}>Bạn chưa có chỗ ở tại ký túc xá</Text>
                <div><Text type="secondary">Nộp đơn đăng ký để được ban quản lý xếp phòng.</Text></div>
              </div>
            )}
          >
            <Button type="primary" onClick={() => navigate('/apply')}>Nộp đơn đăng ký</Button>
          </Empty>
        </Card>
        {history.length > 0 && <ResidenceHistory history={history} loading={histLoading} />}
      </>
    );
  }

  const { contract, roomType, includedInRoom = [], roommates = [], debtSummary = {} } = residence;
  const { room, bed } = splitBedCode(contract.bedCode);
  const daysLeft = daysUntil(contract.endDate);
  const expiring = daysLeft !== null && daysLeft <= 30;

  return (
    <>
      {header}

      {expiring && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng còn ${daysLeft} ngày (hết hạn ${formatDate(contract.endDate)})`}
          description="Muốn ở tiếp, bạn nộp đơn đăng ký mới cho kỳ sau. Nếu không ở tiếp, bạn đến văn phòng KTX làm thủ tục trả phòng."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<span><HomeOutlined style={{ color: '#1677FF' }} /> Chỗ ở của tôi</span>} style={{ height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Title level={2} style={{ margin: 0 }}>{room}</Title>
              <Text type="secondary">{contract.buildingName} · Giường {bed}</Text>
            </div>
            <Info label="Loại phòng">
              {roomType?.name || contract.roomTypeName}
              {roomType?.pricePerMonth ? <div><Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(roomType.pricePerMonth)}/tháng</Text></div> : null}
            </Info>
            <Info label={<span><TeamOutlined /> Bạn cùng phòng</span>}>
              {roommates.length
                ? <Space orientation="vertical" size={2} style={{ alignItems: 'flex-end' }}>
                  {roommates.map((m) => <Text key={m.studentCode}>{m.fullName} <Text type="secondary">({m.studentCode})</Text></Text>)}
                </Space>
                : <Text type="secondary">Chưa có ai khác trong phòng</Text>}
            </Info>
            <div style={{ paddingTop: 12 }}>
              <Text type="secondary"><GiftOutlined /> Phòng đã có sẵn</Text>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {includedInRoom.length
                  ? includedInRoom.map((x) => <Tag key={x} style={{ margin: 0 }}>{x}</Tag>)
                  : <Text type="secondary">Không có đồ cấp sẵn</Text>}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span><FileTextOutlined style={{ color: '#1677FF' }} /> Hợp đồng lưu trú</span>}
            extra={<StatusTag type="contract" value={contract.status} />}
            style={{ height: '100%' }}
          >
            <Info label="Mã hợp đồng"><Text code>{contract.contractCode}</Text></Info>
            <Info label={<span><CalendarOutlined /> Thời hạn</span>}>
              {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
              {daysLeft !== null && daysLeft >= 0 && (
                <div><Text type={expiring ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>Còn {daysLeft} ngày</Text></div>
              )}
            </Info>
            <Info label="Tiền phòng">{formatCurrency(contract.monthlyPrice)}/tháng</Info>
            <Info label="Tiền cọc đã nộp">{formatCurrency(contract.depositAmount)}</Info>
            {contract.terms && <Info label="Điều khoản"><Text style={{ fontSize: 13 }}>{contract.terms}</Text></Info>}
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Muốn trả phòng, bạn đến văn phòng KTX làm thủ tục. Cán bộ kiểm tra công nợ và tài sản phòng rồi thanh lý hợp đồng.
            </Text>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title={<span><DollarOutlined style={{ color: '#1677FF' }} /> Công nợ</span>}
            extra={<a onClick={() => navigate('/portal/my-invoices')}>Xem hóa đơn <ArrowRightOutlined /></a>}
          >
            {debtSummary.totalDebt > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <Text type="danger" strong style={{ fontSize: 26 }}>{formatCurrency(debtSummary.totalDebt)}</Text>
                  <div><Text type="secondary">{debtSummary.unpaidInvoiceCount} hóa đơn chưa thanh toán</Text></div>
                </div>
                <Button type="primary" onClick={() => navigate('/portal/my-invoices')}>Thanh toán ngay</Button>
              </div>
            ) : (
              <Text type="success">Bạn không còn khoản nào phải thanh toán.</Text>
            )}
          </Card>
        </Col>
      </Row>

      <ResidenceHistory history={history} loading={histLoading} />
    </>
  );
}

/** Lịch sử lưu trú (FR-39) — hợp đồng cũ đã hết hạn hoặc đã chấm dứt */
function ResidenceHistory({ history, loading }) {
  const columns = [
    { title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 160, render: (v) => <Text code>{v}</Text> },
    { title: 'Chỗ ở', key: 'bed', render: (_, c) => `${c.buildingName} · ${c.bedCode}` },
    {
      title: 'Thời hạn', key: 'period', width: 230,
      render: (_, c) => `${formatDate(c.startDate)} → ${formatDate(c.endDate)}`,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 150,
      render: (v, c) => (
        <>
          <StatusTag type="contract" value={v} />
          {c.terminationReason && <div><Text type="secondary" style={{ fontSize: 12 }}>{c.terminationReason}</Text></div>}
        </>
      ),
    },
  ];

  return (
    <Card
      title={<span><HistoryOutlined style={{ color: '#1677FF' }} /> Lịch sử lưu trú</span>}
      style={{ marginTop: 16 }}
      styles={{ body: { padding: history.length ? 0 : 24 } }}
    >
      {history.length
        ? <Table rowKey="id" columns={columns} dataSource={history} loading={loading} pagination={false} scroll={{ x: 700 }} size="middle" />
        : <Text type="secondary">Đây là lần đầu bạn ở ký túc xá — chưa có hợp đồng cũ nào.</Text>}
    </Card>
  );
}
