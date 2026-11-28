import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Grid, Typography, Button, Table, Alert, Skeleton, Space, Empty, Tabs, Divider, QRCode,
} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { CONTRACT_TERM } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import { EXPIRING_DAYS, daysUntil } from '../utils/homeView';
import { placeTextOf } from '../../contracts/utils/contractView';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import RoomUtilityHistoryCard from '../components/RoomUtilityHistoryCard';
import ContractPrintModal from '../../contracts/components/ContractPrintModal';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const Info = ({ label, children, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
    <Text type="secondary" style={{ flexShrink: 0, fontSize: 13 }}>{label}</Text>
    <div className={mono ? 'mono' : undefined} style={{ textAlign: 'right', minWidth: 0, fontSize: 13 }}>{children}</div>
  </div>
);

/** Chỗ ở & Hợp đồng — Hồ sơ lưu trú sạch sẽ, bỏ icon màu trước tiêu đề và dùng QRCode nội bộ */
export default function MyResidencePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [printOpen, setPrintOpen] = useState(false);
  const { data: residence, loading, error } = useApi(() => portalApi.getMyResidence(), []);
  const { data: profile } = useApi(() => portalApi.getProfile(), []);
  const { data: contracts, loading: histLoading, error: histError } = useApi(() => portalApi.getMyContracts(), []);

  const currentContract = residence?.contract;
  const isActive = residence?.hasResidence === true;
  const { data: checkinQr } = useApi(
    () => (isActive && currentContract?.id
      ? portalApi.getCheckinQr(currentContract.id)
      : Promise.resolve({ data: { data: null } })),
    [isActive, currentContract?.id],
  );

  const header = (
    <PageHeader
      breadcrumb={['Cổng Sinh viên', 'Chỗ ở & hợp đồng']}
      title="Chỗ ở & hợp đồng"
      description="Thông tin phòng ở, bạn cùng phòng, hợp đồng, mã QR Check-in và chỉ số điện nước."
    />
  );

  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được thông tin chỗ ở" description={error} /></>;
  if (loading && !residence) return <>{header}<Card><Skeleton active paragraph={{ rows: 8 }} /></Card></>;

  const history = (contracts || []).filter((c) => ['terminated', 'cancelled'].includes(c.status));

  if (!currentContract) {
    return (
      <>
        {header}
        <Card style={{ marginBottom: 16 }}>
          <Empty description={<Text strong>Bạn chưa có hợp đồng lưu trú hiện tại</Text>}>
            <Button type="primary" onClick={() => navigate('/portal/home')}>Về trang chủ đăng ký</Button>
          </Empty>
        </Card>
        {history.length > 0 && (
          <Card title="Lịch sử hợp đồng cũ">
            <HistoryTable history={history} loading={histLoading && !contracts} error={histError} />
          </Card>
        )}
      </>
    );
  }

  const { roommates = [] } = residence;
  const daysLeft = currentContract.endDate ? daysUntil(currentContract.endDate) : null;
  const expired = currentContract.status === 'expired';
  const expiring = !expired && currentContract.status === 'active' && daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;
  const term = CONTRACT_TERM[currentContract.term];

  const tabItems = [
    ...(isActive ? [{
      key: 'utility',
      label: isMobile ? 'Điện nước (12T)' : 'Điện nước của phòng (12 tháng)',
      children: <RoomUtilityHistoryCard embedded />,
    }] : []),
    {
      key: 'history',
      label: isMobile ? `Hợp đồng cũ (${history.length})` : `Lịch sử hợp đồng cũ (${history.length})`,
      children: <HistoryTable history={history} loading={histLoading && !contracts} error={histError} />,
    },
  ];

  return (
    <>
      {header}

      {residence.hasPendingPayment && (
        <Alert
          type={currentContract.isPaymentOverdue ? 'error' : 'warning'}
          showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng ${currentContract.contractCode} đang chờ đóng phí giữ chỗ (hạn ${formatDate(currentContract.paymentDeadline)})`}
          description="Mở mục Hóa đơn để quét VietQR. Hoàn tất thanh toán hệ thống sẽ tự kích hoạt hợp đồng và sinh mã QR Check-in."
          action={<Button type="primary" onClick={() => navigate('/portal/my-invoices')}>Thanh toán ngay</Button>}
        />
      )}
      {expiring && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng còn ${daysLeft} ngày (hết hạn ${formatDate(currentContract.endDate)})`}
          description="Bạn có thể gửi yêu cầu trả phòng hoặc đăng ký đợt tiếp theo khi có thông báo mở cổng."
        />
      )}
      {expired && (
        <Alert
          type="error" showIcon style={{ marginBottom: 16 }}
          title={`Hợp đồng đã hết hạn ngày ${formatDate(currentContract.endDate)}`}
          description="Thanh toán sạch hóa đơn còn nợ và gửi phiếu Trả phòng để thanh lý & hoàn cọc."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Phòng ở của tôi" style={{ height: '100%' }}>
            <div style={{ padding: '4px 0 14px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
              <Title level={2} className="mono" style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em', color: 'var(--brand)' }}>
                Phòng {roomLabelOf(currentContract.room)}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {currentContract.room?.buildingName} · {currentContract.campusName || currentContract.room?.campusName}
              </Text>
            </div>
            <Info label="Hạng phòng"><StatusTag type="roomTier" value={currentContract.room?.roomTier || 'standard'} /></Info>
            <Info label="Sức chứa / Tầng">{currentContract.room?.capacity} người · Tầng {currentContract.room?.floor}</Info>
            <Info label={`Bạn cùng phòng (${roommates.length})`}>
              {roommates.length ? (
                <Space orientation="vertical" size={2} style={{ alignItems: 'flex-end' }}>
                  {roommates.map((m) => (
                    <Text key={m.studentCode}>
                      {m.fullName} <Text type="secondary" className="mono" style={{ fontSize: 12 }}>({m.studentCode})</Text>
                    </Text>
                  ))}
                </Space>
              ) : <Text type="secondary">Chưa có bạn cùng phòng khác</Text>}
            </Info>
            {isActive && (
              <div style={{ marginTop: 16 }}>
                <Button block onClick={() => navigate('/portal/requests')}>
                  Báo hỏng / Xin chuyển phòng / Trả phòng
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Hợp đồng & QR Check-in"
            extra={(
              <Space size={8}>
                <Button size="small" icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>In HĐ A4</Button>
                <StatusTag type="contract" value={currentContract.status} />
              </Space>
            )}
            style={{ height: '100%' }}
          >
            <Info label="Mã hợp đồng" mono><Text strong>{currentContract.contractCode}</Text></Info>
            <Info label="Gói thuê">{term?.label} ({term?.hint})</Info>
            {currentContract.startDate && (
              <Info label="Thời hạn" mono>
                {formatDate(currentContract.startDate)} → {formatDate(currentContract.endDate)}
                {daysLeft !== null && (
                  <div>
                    {expired
                      ? <Text type="danger" style={{ fontSize: 12 }}>Quá hạn {-daysLeft} ngày</Text>
                      : <Text type={expiring ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>Còn {daysLeft} ngày</Text>}
                  </div>
                )}
              </Info>
            )}
            <Info label="Tiền phòng cả kỳ" mono>
              <Text strong>{formatCurrency(currentContract.totalRoomFee)}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(currentContract.pricePerMonth)}/tháng</Text></div>
            </Info>
            <Info label="Tiền cọc tài sản" mono>
              <Text strong>{formatCurrency(currentContract.depositAmount)}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>Hoàn lại sau khi nghiệm thu thanh lý</Text></div>
            </Info>

            {isActive && checkinQr && (
              <>
                <Divider style={{ margin: '14px 0' }} />
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 14, alignItems: isMobile ? 'flex-start' : 'center' }}>
                  <QRCode value={checkinQr.checkinCode} size={102} bordered style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span
                        className="haui-status"
                        style={checkinQr.isCheckedIn
                          ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
                          : { background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
                      >
                        <span className="haui-status-dot" style={{ background: checkinQr.isCheckedIn ? '#16A34A' : '#D97706' }} />
                        {checkinQr.isCheckedIn ? 'Đã Check-in' : 'Chưa Check-in'}
                      </span>
                      {checkinQr.isCheckedIn && (
                        <Text type="secondary" className="mono" style={{ fontSize: 12 }}>
                          {formatDateTime(checkinQr.checkedInAt)}
                        </Text>
                      )}
                    </div>
                    <div style={{ marginBottom: 4, wordBreak: 'break-all' }}>
                      <Text code copyable strong className="mono" style={{ fontSize: 13 }}>{checkinQr.checkinCode}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Bàn giao tại <b>{checkinQr.officeLocation}</b> (mang theo CCCD).
                    </Text>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { paddingTop: 4 } }}>
        <Tabs defaultActiveKey={tabItems[0]?.key} items={tabItems} />
      </Card>

      <ContractPrintModal
        contract={currentContract}
        student={profile}
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
      />
    </>
  );
}

function HistoryTable({ history, loading, error }) {
  const columns = [
    { title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 145, render: (v) => <Text className="mono" strong>{v}</Text> },
    { title: 'Phòng', key: 'place', width: 200, render: (_, c) => `${c.room?.buildingName ?? ''} · ${placeTextOf(c)}` },
    {
      title: 'Thời hạn', key: 'period', width: 210,
      render: (_, c) => (
        <>
          <div className="mono">{c.startDate ? `${formatDate(c.startDate)} → ${formatDate(c.endDate)}` : '—'}</div>
          {c.terminatedAt && <Text type="secondary" style={{ fontSize: 12 }}>Thanh lý {formatDate(c.terminatedAt)}</Text>}
        </>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, render: (v) => <StatusTag type="contract" value={v} /> },
    {
      title: 'Quyết toán cọc', key: 'deposit', width: 220,
      render: (_, c) => (c.status === 'cancelled'
        ? <Text type="secondary">Đã hủy</Text>
        : c.isDepositRefunded
          ? (
            <>
              <span className="haui-status" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }}>
                <span className="haui-status-dot" style={{ background: '#16A34A' }} />
                Đã hoàn {formatCurrency(c.depositRefundAmount)}
              </span>
              {c.depositDeductionAmount > 0 && (
                <div><Text type="secondary" style={{ fontSize: 11.5 }}>Khấu trừ: {formatCurrency(c.depositDeductionAmount)}</Text></div>
              )}
            </>
          )
          : (
            <span className="haui-status" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}>
              <span className="haui-status-dot" style={{ background: '#D97706' }} />
              Chờ hoàn {formatCurrency(c.depositAmount)}
            </span>
          )),
    },
  ];

  if (error) return <Alert type="error" showIcon title="Không tải được lịch sử lưu trú" description={error} />;
  if (loading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!history.length) return <Text type="secondary">Chưa có hợp đồng cũ nào.</Text>;
  return <Table rowKey="id" columns={columns} dataSource={history} pagination={false} scroll={{ x: 820 }} size="middle" />;
}
