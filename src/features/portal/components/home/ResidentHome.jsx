import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Button, Typography, Row, Col, Table, Skeleton, Alert, Space, Modal, QRCode,
} from 'antd';
import { ArrowRightOutlined, ReloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/formatter';
import { INVOICE_TYPE } from '../../../../constants/statuses';
import StatusTag from '../../../../components/StatusTag';
import SupportCard from '../SupportCard';
import TodoCard from './TodoCard';
import { EXPIRING_DAYS, daysUntil } from '../../utils/homeView';
import { periodLabel } from '../../../fees/utils/readingSheet';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';

const { Text } = Typography;
const RECENT_COUNT = 3;

/** Trang chủ Sinh viên đang lưu trú — phẳng, gọn, bỏ lặp thẻ Phòng/HĐ và bỏ màu mè */
export default function ResidentHome({ residence }) {
  const navigate = useNavigate();
  const { contract, roommates = [], debtSummary = {} } = residence;
  const [qrOpen, setQrOpen] = useState(false);

  const { data: invoices, meta: invoiceMeta, loading: invLoading, error: invError, refetch: refetchInvoices } = useApi(
    () => portalApi.getMyInvoices({ limit: 100 }), [],
  );

  const { data: checkinQr, loading: qrLoading, error: qrError } = useApi(
    () => (qrOpen && contract?.id ? portalApi.getCheckinQr(contract.id) : Promise.resolve({ data: { data: null } })),
    [qrOpen, contract?.id],
  );

  const openInvoices = (invoices || []).filter((i) => i.status === 'unpaid');
  const roomOpen = openInvoices.filter((i) => i.scope === 'room');
  const roomDebt = roomOpen.reduce((t, i) => t + i.amount, 0);
  const personalOpen = openInvoices.filter((i) => i.scope === 'personal');
  const nearestDue = personalOpen.map((i) => i.dueDate).sort()[0];
  const dueIn = daysUntil(nearestDue);
  const roomDue = daysUntil(roomOpen.map((i) => i.dueDate).sort()[0]);
  const totalDebt = debtSummary.totalDebt ?? 0;
  const combinedDebt = totalDebt + roomDebt;

  const daysLeft = daysUntil(contract.endDate);
  const expired = contract.status === 'expired';
  const expiring = !expired && daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;
  const needCheckin = contract.status === 'active' && !contract.checkedInAt && contract.checkinCode;

  const dueText = (d) => (d === null ? '' : d < 0 ? ` (quá hạn ${-d} ngày)` : d === 0 ? ' (hôm nay)' : ` (còn ${d} ngày)`);
  const todos = [
    needCheckin && {
      key: 'checkin', tone: 'warning',
      title: 'Bạn chưa làm thủ tục Check-in nhận phòng',
      detail: `Xuất trình mã QR (${contract.checkinCode}) cùng CCCD tại văn phòng tòa ${contract.room?.buildingCode} để nhận chìa khóa.`,
      action: { label: 'Mở mã QR Check-in', onClick: () => setQrOpen(true) },
    },
    totalDebt > 0 && {
      key: 'debt', tone: dueIn !== null && dueIn < 0 ? 'danger' : 'warning',
      title: `Công nợ cá nhân cần nộp: ${formatCurrency(totalDebt)}`,
      detail: `${debtSummary.unpaidInvoiceCount ?? personalOpen.length} hóa đơn${nearestDue ? ` · hạn gần nhất ${formatDate(nearestDue)}${dueText(dueIn)}` : ''}`,
      action: { label: 'Thanh toán VietQR', to: '/portal/my-invoices' },
    },
    roomDebt > 0 && {
      key: 'room', tone: roomDue !== null && roomDue < 0 ? 'danger' : 'warning',
      title: `Điện nước của phòng: ${formatCurrency(roomDebt)}`,
      detail: `Một thành viên trong phòng quét VietQR nộp đủ cho cả phòng${dueText(roomDue)}`,
      action: { label: 'Xem hóa đơn phòng', to: '/portal/my-invoices?tab=room' },
    },
    expired && {
      key: 'expired', tone: 'danger',
      title: `Hợp đồng đã hết hạn ngày ${formatDate(contract.endDate)}`,
      detail: 'Hoàn tất công nợ và gửi phiếu Trả phòng trực tuyến hoặc đến văn phòng KTX để thanh lý & hoàn cọc.',
      action: { label: 'Gửi yêu cầu trả phòng', to: '/portal/requests' },
    },
    expiring && {
      key: 'expiring', tone: 'warning',
      title: `Hợp đồng còn ${daysLeft} ngày`,
      detail: `Hết hạn ngày ${formatDate(contract.endDate)}. Theo dõi các đợt mở đăng ký mới để tiếp tục lưu trú.`,
      action: { label: 'Xem hợp đồng', to: '/portal/my-residence' },
    },
  ].filter(Boolean).sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'danger' ? -1 : 1));

  const recent = [...(invoices || [])]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, RECENT_COUNT);

  const invoiceColumns = [
    {
      title: 'Hóa đơn', key: 'title',
      render: (_, i) => (
        <>
          <Text strong>{INVOICE_TYPE[i.type]?.label ?? i.type}{i.monthYear ? ` ${periodLabel(i.monthYear).toLowerCase()}` : ''}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{i.scope === 'room' ? 'Của phòng' : 'Cá nhân'}</Text></div>
        </>
      ),
    },
    { title: 'Số tiền', dataIndex: 'amount', align: 'right', width: 125, render: (v) => <Text strong className="mono">{formatCurrency(v)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', width: 155, render: (s) => <StatusTag type="invoice" value={s} /> },
    {
      title: '', key: 'action', width: 76, align: 'right',
      render: (_, i) => <Link to={`/portal/my-invoices?invoice=${i.id}`}>Chi tiết</Link>,
    },
  ];

  const quickTiles = [
    {
      key: 'pay',
      title: 'Đóng tiền VietQR',
      sub: combinedDebt > 0 ? `Cần nộp ${formatCurrency(combinedDebt)}` : 'Đã thanh toán đủ',
      danger: combinedDebt > 0,
      onClick: () => navigate('/portal/my-invoices'),
    },
    {
      key: 'qr',
      title: 'Mã QR Check-in',
      sub: contract.checkedInAt ? 'Đã nhận phòng' : 'Mở mã bàn giao',
      onClick: () => setQrOpen(true),
    },
    {
      key: 'req',
      title: 'Báo hỏng / Yêu cầu',
      sub: 'Sửa chữa · Chuyển phòng',
      onClick: () => navigate('/portal/requests'),
    },
    {
      key: 'res',
      title: 'Hồ sơ lưu trú',
      sub: `${roommates.length} bạn cùng phòng`,
      onClick: () => navigate('/portal/my-residence'),
    },
  ];

  return (
    <>
      {/* 1. BANNER CHỖ Ở PHẲNG + THANH NAVY CẠNH TRÁI */}
      <Card style={{ borderLeft: '4px solid var(--brand)' }} styles={{ body: { padding: '16px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <Space size={8} wrap align="center">
              <Text strong className="mono" style={{ fontSize: 17, color: 'var(--ink)' }}>
                Phòng {roomLabelOf(contract.room)}
              </Text>
              <Text type="secondary" style={{ fontSize: 13.5 }}>· {contract.room?.buildingName}</Text>
              <span
                className="haui-status"
                style={contract.checkedInAt
                  ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
                  : { background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
              >
                <span className="haui-status-dot" style={{ background: contract.checkedInAt ? '#16A34A' : '#D97706' }} />
                {contract.checkedInAt ? 'Đã Check-in' : 'Chưa Check-in'}
              </span>
            </Space>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              {contract.campusName || contract.room?.campusName} · HĐ <span className="mono">{contract.contractCode}</span> · Hết hạn <span className="mono">{formatDate(contract.endDate)}</span>
            </div>
          </div>
          <Space wrap>
            <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setQrOpen(true)}>Mã QR Check-in</Button>
            <Button onClick={() => navigate('/portal/my-residence')}>Chi tiết chỗ ở</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <TodoCard items={todos} />

            {/* 4 LỐI TẮT PHẲNG SẮC NÉT — chiều cao đồng đều trên mọi cỡ màn */}
            <Row gutter={[10, 10]} align="stretch">
              {quickTiles.map((tile) => (
                <Col xs={12} md={6} key={tile.key} style={{ display: 'flex' }}>
                  <button
                    type="button"
                    onClick={tile.onClick}
                    className="portal-quick-tile"
                    style={{
                      height: '100%',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 4,
                      padding: '12px 14px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Text strong style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.35 }}>{tile.title}</Text>
                    <Text
                      type={tile.danger ? 'danger' : 'secondary'}
                      style={{ fontSize: 12, fontWeight: tile.danger ? 500 : 400 }}
                    >
                      {tile.sub}
                    </Text>
                  </button>
                </Col>
              ))}
            </Row>

            {/* HÓA ĐƠN GẦN ĐÂY */}
            <Card
              title="Hóa đơn gần đây"
              extra={<Button type="text" icon={<ReloadOutlined />} onClick={refetchInvoices} aria-label="Tải lại hóa đơn" />}
              styles={{ body: { padding: 0 } }}
            >
              {invError && <Alert type="error" showIcon title={invError} style={{ margin: 16 }} />}
              {!invError && invLoading && !invoices && <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 3 }} /></div>}
              {!invError && invoices && (
                <Table
                  rowKey="id" size="middle" columns={invoiceColumns} dataSource={recent} pagination={false}
                  scroll={{ x: 520 }} locale={{ emptyText: 'Chưa có hóa đơn nào' }}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--line)', fontSize: 12.5 }}>
                <Text type="secondary">Hiển thị {recent.length} hóa đơn gần nhất</Text>
                <Link to="/portal/my-invoices" style={{ fontWeight: 500 }}>
                  Xem tất cả{invoiceMeta?.total ? ` (${invoiceMeta.total})` : ''} <ArrowRightOutlined style={{ fontSize: 11 }} />
                </Link>
              </div>
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <SupportCard title="Hỗ trợ sinh viên" />
        </Col>
      </Row>

      <Modal
        open={qrOpen}
        onCancel={() => setQrOpen(false)}
        footer={<Button type="primary" onClick={() => setQrOpen(false)}>Đóng</Button>}
        title="Mã QR Check-in nhận phòng"
        width={420}
        destroyOnHidden
      >
        {qrError && <Alert type="error" showIcon title={qrError} />}
        {qrLoading && !checkinQr && <Skeleton active paragraph={{ rows: 4 }} />}
        {checkinQr && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                className="haui-status"
                style={checkinQr.isCheckedIn
                  ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
                  : { background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
              >
                <span className="haui-status-dot" style={{ background: checkinQr.isCheckedIn ? '#16A34A' : '#D97706' }} />
                {checkinQr.isCheckedIn ? `Đã Check-in ${formatDateTime(checkinQr.checkedInAt)}` : 'Chưa Check-in nhận phòng'}
              </span>
            </div>
            <div style={{ display: 'inline-block' }}>
              <QRCode value={checkinQr.checkinCode} size={184} bordered />
            </div>
            <div style={{ marginTop: 12 }}>
              <Text code copyable strong className="mono" style={{ fontSize: 16 }}>{checkinQr.checkinCode}</Text>
            </div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <Text type="secondary">Bàn giao tại: </Text>
              <Text strong>{checkinQr.officeLocation}</Text>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
              Xuất trình mã này cùng CCCD tại văn phòng trực tòa để cán bộ xác nhận bàn giao chìa khóa.
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
}
