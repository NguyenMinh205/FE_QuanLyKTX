import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Table, Alert, Skeleton, Divider, Space, Empty,
} from 'antd';
import {
  HomeOutlined, FileTextOutlined, TeamOutlined, DollarOutlined, ArrowRightOutlined,
  CalendarOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { CONTRACT_TERM } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import { EXPIRING_DAYS, daysUntil } from '../utils/homeView';
import { placeTextOf } from '../../contracts/utils/contractView';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

const { Text, Title } = Typography;

const Info = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
  </div>
);

/** SCR-63 Chỗ ở & hợp đồng (FR-82, FR-39) — chỉ xem; trả phòng và nhận lại cọc làm tại văn phòng KTX (UC-07, D1) */
export default function MyResidencePage() {
  const navigate = useNavigate();
  const { data: residence, loading, error } = useApi(() => portalApi.getMyResidence(), []);
  const { data: contracts, loading: histLoading } = useApi(() => portalApi.getMyContracts(), []);

  const header = <PageHeader title="Chỗ ở & hợp đồng" description="Thông tin phòng, giường và hợp đồng lưu trú của bạn" />;
  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được thông tin chỗ ở" description={error} /></>;
  if (loading && !residence) return <>{header}<Card><Skeleton active paragraph={{ rows: 8 }} /></Card></>;

  // Hợp đồng hết hạn chưa thanh lý vẫn là chỗ ở hiện tại, không phải lịch sử
  const history = (contracts || []).filter((c) => c.status === 'terminated');

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

  const { contract, roommates = [], debtSummary = {} } = residence;
  const daysLeft = daysUntil(contract.endDate);
  const expired = contract.status === 'expired';
  const expiring = !expired && daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;
  const term = CONTRACT_TERM[contract.term];

  return (
    <>
      {header}

      {expiring && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng còn ${daysLeft} ngày (hết hạn ${formatDate(contract.endDate)})`}
          description="Ký túc xá không gia hạn hợp đồng. Hết hạn, bạn đến văn phòng KTX làm thủ tục trả phòng. Muốn ở kỳ sau, bạn nộp đơn mới sau khi đã trả phòng."
        />
      )}
      {expired && (
        <Alert
          type="error" showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng đã hết hạn ngày ${formatDate(contract.endDate)}`}
          description="Bạn đến văn phòng KTX làm thủ tục trả phòng. Cần thanh toán hết hóa đơn còn nợ trước khi trả phòng."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<span><HomeOutlined style={{ color: '#1677FF' }} /> Chỗ ở của tôi</span>} style={{ height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Title level={2} style={{ margin: 0 }}>{roomLabelOf(contract.room)}</Title>
              <Text type="secondary">{contract.room?.buildingName} · Giường {String(contract.bedNumber).padStart(2, '0')}</Text>
            </div>
            <Info label="Phòng">{contract.room?.capacity} chỗ · Tầng {contract.room?.floor}</Info>
            <Info label={<span><TeamOutlined /> Bạn cùng phòng</span>}>
              {roommates.length
                ? <Space orientation="vertical" size={2} style={{ alignItems: 'flex-end' }}>
                  {roommates.map((m) => <Text key={m.studentCode}>{m.fullName} <Text type="secondary">({m.studentCode})</Text></Text>)}
                </Space>
                : <Text type="secondary">Chưa có ai khác trong phòng</Text>}
            </Info>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span><FileTextOutlined style={{ color: '#1677FF' }} /> Hợp đồng lưu trú</span>}
            extra={<StatusTag type="contract" value={contract.status} />}
            style={{ height: '100%' }}
          >
            <Info label="Mã hợp đồng"><Text code>{contract.contractCode}</Text></Info>
            <Info label="Gói thuê">{term?.label} ({term?.hint})</Info>
            <Info label={<span><CalendarOutlined /> Thời hạn</span>}>
              {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
              {daysLeft !== null && (
                <div>
                  {expired
                    ? <Text type="danger" style={{ fontSize: 12 }}>Quá hạn {-daysLeft} ngày</Text>
                    : <Text type={expiring ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>Còn {daysLeft} ngày</Text>}
                </div>
              )}
            </Info>
            <Info label="Đơn giá">{formatCurrency(contract.pricePerMonth)}/tháng</Info>
            <Info label="Tiền phòng cả kỳ">{formatCurrency(contract.totalRoomFee)}</Info>
            <Info label="Tiền cọc">
              {formatCurrency(contract.depositAmount)}
              <div><Text type="secondary" style={{ fontSize: 12 }}>Hoàn lại tại văn phòng sau khi trả phòng</Text></div>
            </Info>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Muốn trả phòng, bạn đến văn phòng KTX. Cán bộ kiểm tra công nợ và tài sản phòng, thanh lý hợp đồng rồi hoàn cọc cho bạn.
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

/** Lịch sử lưu trú (FR-39) — hợp đồng đã thanh lý, kèm trạng thái nhận lại cọc (FR-35) */
function ResidenceHistory({ history, loading }) {
  const columns = [
    { title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 150, render: (v) => <Text code>{v}</Text> },
    { title: 'Chỗ ở', key: 'place', width: 200, render: (_, c) => `${c.room?.buildingName ?? ''} · ${placeTextOf(c)}` },
    {
      title: 'Thời hạn', key: 'period', width: 220,
      render: (_, c) => (
        <>
          <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>Trả phòng {formatDate(c.terminatedAt)}</Text>
        </>
      ),
    },
    {
      title: 'Tiền cọc', key: 'deposit', width: 230,
      render: (_, c) => (c.isDepositRefunded
        ? <Tag color="success" style={{ margin: 0 }}>Đã nhận lại cọc ngày {formatDate(c.depositRefundedAt)}</Tag>
        : (
          <>
            <Tag color="warning" style={{ margin: 0 }}>Chưa nhận lại {formatCurrency(c.depositAmount)}</Tag>
            <div><Text type="secondary" style={{ fontSize: 12 }}>Đến văn phòng KTX để nhận</Text></div>
          </>
        )),
    },
  ];

  return (
    <Card
      title={<span><HistoryOutlined style={{ color: '#1677FF' }} /> Lịch sử lưu trú</span>}
      style={{ marginTop: 16 }}
      styles={{ body: { padding: history.length ? 0 : 24 } }}
    >
      {history.length
        ? <Table rowKey="id" columns={columns} dataSource={history} loading={loading} pagination={false} scroll={{ x: 800 }} size="middle" />
        : <Text type="secondary">Đây là lần đầu bạn ở ký túc xá — chưa có hợp đồng cũ nào.</Text>}
    </Card>
  );
}
