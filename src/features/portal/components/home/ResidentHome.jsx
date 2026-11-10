import { Link } from 'react-router-dom';
import {
  Card, Button, Typography, Row, Col, Table, Skeleton, Alert, Divider, Tooltip,
} from 'antd';
import {
  HomeOutlined, FileTextOutlined, ArrowRightOutlined, ReloadOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { formatCurrency, formatDate } from '../../../../utils/formatter';
import { CONTRACT_TERM, INVOICE_TYPE } from '../../../../constants/statuses';
import StatusTag from '../../../../components/StatusTag';
import SupportCard from '../SupportCard';
import TodoCard from './TodoCard';
import {
  EXPIRING_DAYS, daysUntil,
} from '../../utils/homeView';
import { periodLabel } from '../../../fees/utils/readingSheet';
import { placeTextOf } from '../../../contracts/utils/contractView';

const { Text } = Typography;
const RECENT_COUNT = 3;

function CardTitle({ icon, title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text strong style={{ fontSize: 15 }}>{title}</Text>
      </span>
      {extra}
    </div>
  );
}

function Row2({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '8px 0' }}>
      <Text type="secondary">{label}</Text>
      <div style={{ textAlign: 'right' }}>{children}</div>
    </div>
  );
}

/** Trang chủ khi đang lưu trú — hợp đồng `active`, hoặc `expired` mà chưa thanh lý (vẫn giữ giường) */
export default function ResidentHome({ residence }) {
  const { contract, roommates = [], debtSummary = {} } = residence;

  const { data: invoices, meta: invoiceMeta, loading: invLoading, error: invError, refetch: refetchInvoices } = useApi(
    () => portalApi.getMyInvoices({ limit: 100 }), [],
  );

  // ---- công nợ: nợ cá nhân lấy từ my-residence; hóa đơn điện nước của phòng tính riêng (một bạn đại diện nộp)
  const openInvoices = (invoices || []).filter((i) => i.status === 'unpaid');
  const roomOpen = openInvoices.filter((i) => i.scope === 'room');
  const roomDebt = roomOpen.reduce((t, i) => t + i.amount, 0);
  const personalOpen = openInvoices.filter((i) => i.scope === 'personal');
  const nearestDue = personalOpen.map((i) => i.dueDate).sort()[0];
  const dueIn = daysUntil(nearestDue);
  const roomDue = daysUntil(roomOpen.map((i) => i.dueDate).sort()[0]);
  const totalDebt = debtSummary.totalDebt ?? 0;

  // ---- hợp đồng sắp hết hạn (BR-29)
  const daysLeft = daysUntil(contract.endDate);
  const expired = contract.status === 'expired';
  const expiring = !expired && daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;

  // ---- việc cần làm: nguy cấp (quá hạn, hết hợp đồng) lên trước
  const dueText = (d) => (d === null ? '' : d < 0 ? ` (quá hạn ${-d} ngày)` : d === 0 ? ' (hôm nay)' : ` (còn ${d} ngày)`);
  const todos = [
    totalDebt > 0 && {
      key: 'debt', tone: dueIn !== null && dueIn < 0 ? 'danger' : 'warning',
      title: `Công nợ cần thanh toán: ${formatCurrency(totalDebt)}`,
      detail: `${debtSummary.unpaidInvoiceCount ?? personalOpen.length} hóa đơn của bạn${nearestDue ? ` · hạn gần nhất ${formatDate(nearestDue)}${dueText(dueIn)}` : ''}`,
      action: { label: 'Thanh toán ngay', to: '/portal/my-invoices' },
    },
    roomDebt > 0 && {
      key: 'room', tone: roomDue !== null && roomDue < 0 ? 'danger' : 'warning',
      title: `Điện nước của phòng: ${formatCurrency(roomDebt)}`,
      detail: `Phòng còn ${formatCurrency(roomDebt)} tiền điện nước — một bạn nộp đủ cho cả phòng${dueText(roomDue)}`,
      action: { label: 'Xem hóa đơn phòng', to: '/portal/my-invoices?tab=room' },
    },
    expired && {
      key: 'expired', tone: 'danger',
      title: `Hợp đồng đã hết hạn ngày ${formatDate(contract.endDate)}`,
      detail: 'Đến văn phòng KTX làm thủ tục trả phòng. Nộp hết hóa đơn còn nợ trước; tiền cọc được hoàn tại văn phòng sau khi trả phòng.',
      action: { label: 'Xem hợp đồng', to: '/portal/my-residence' },
    },
    expiring && {
      key: 'expiring', tone: 'warning',
      title: `Hợp đồng còn ${daysLeft} ngày`,
      detail: `Hết hạn ${formatDate(contract.endDate)}, không gia hạn. Hết hạn thì đến văn phòng KTX trả phòng; muốn ở kỳ sau, nộp đơn mới sau khi đã trả phòng.`,
      action: { label: 'Xem hợp đồng', to: '/portal/my-residence' },
    },
  ].filter(Boolean).sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'danger' ? -1 : 1));

  // ---- hóa đơn gần đây: mới tạo lên đầu
  const recent = [...(invoices || [])]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, RECENT_COUNT);

  const invoiceColumns = [
    {
      title: 'Hóa đơn', key: 'title',
      render: (_, i) => (
        <>
          <Text strong>{INVOICE_TYPE[i.type]?.label ?? i.type}{i.monthYear ? ` ${periodLabel(i.monthYear).toLowerCase()}` : ''}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{i.scope === 'room' ? 'Của phòng' : 'Của bạn'}</Text></div>
        </>
      ),
    },
    { title: 'Nội dung', dataIndex: 'description', ellipsis: true },
    { title: 'Số tiền', dataIndex: 'amount', align: 'right', width: 130, render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', width: 170, render: (s) => <StatusTag type="invoice" value={s} /> },
    {
      title: '', key: 'action', width: 90, align: 'right',
      render: (_, i) => <Link to={`/portal/my-invoices?invoice=${i.id}`}>Chi tiết</Link>,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <TodoCard items={todos} />

          {/* ---------- Chỗ ở + hợp đồng ---------- */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card style={{ height: '100%' }} title={<CardTitle icon={<HomeOutlined style={{ color: 'var(--brand)' }} />} title="Chỗ ở của tôi" />}>
                <Row2 label="Vị trí"><Text strong>{contract.room?.buildingName} · Phòng {placeTextOf(contract)}</Text></Row2>
                <Row2 label="Phòng"><Text>{contract.room?.capacity} chỗ · Tầng {contract.room?.floor}</Text></Row2>
                <Row2 label="Đơn giá"><Text strong style={{ color: 'var(--brand)' }}>{formatCurrency(contract.pricePerMonth)}</Text><Text type="secondary">/tháng</Text></Row2>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Tooltip title={roommates.length ? roommates.map((m) => `${m.fullName} (${m.studentCode})`).join(', ') : 'Chưa có bạn cùng phòng'}>
                    <Text type="secondary"><TeamOutlined /> Bạn cùng phòng: {roommates.length} người</Text>
                  </Tooltip>
                  <Link to="/portal/my-residence">Xem chi tiết <ArrowRightOutlined /></Link>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                style={{ height: '100%' }}
                title={<CardTitle icon={<FileTextOutlined style={{ color: 'var(--brand)' }} />} title="Hợp đồng của tôi" extra={<StatusTag type="contract" value={contract.status} />} />}
              >
                <Row2 label="Số hợp đồng"><Text strong style={{ fontFamily: 'monospace' }}>{contract.contractCode}</Text></Row2>
                <Row2 label="Gói thuê">
                  <Text strong>{CONTRACT_TERM[contract.term]?.label}</Text>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</Text></div>
                </Row2>
                <Row2 label="Tiền phòng cả kỳ"><Text strong>{formatCurrency(contract.totalRoomFee)}</Text></Row2>
                <Row2 label="Tiền cọc"><Text strong>{formatCurrency(contract.depositAmount)}</Text></Row2>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Text type="secondary">
                    {expired ? <Text type="danger">Quá hạn {-daysLeft} ngày</Text>
                      : expiring ? <Text type="warning">Còn {daysLeft} ngày</Text> : `Hết hạn ${formatDate(contract.endDate)}`}
                  </Text>
                  <Link to="/portal/my-residence">Xem chi tiết <ArrowRightOutlined /></Link>
                </div>
              </Card>
            </Col>
          </Row>

          {/* ---------- Hóa đơn gần đây ---------- */}
          <Card
            title={<CardTitle icon={<FileTextOutlined style={{ color: 'var(--brand)' }} />} title="Hóa đơn gần đây"
              extra={<Button type="text" icon={<ReloadOutlined />} onClick={refetchInvoices} aria-label="Tải lại hóa đơn" />} />}
            styles={{ body: { padding: 0 } }}
          >
            {invError && <Alert type="error" showIcon title={invError} style={{ margin: 16 }} />}
            {!invError && invLoading && !invoices && <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 3 }} /></div>}
            {!invError && invoices && (
              <Table
                rowKey="id" size="middle" columns={invoiceColumns} dataSource={recent} pagination={false}
                scroll={{ x: 600 }} locale={{ emptyText: 'Chưa có hóa đơn nào' }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
              <Text type="secondary">Hiển thị {recent.length} hóa đơn gần nhất</Text>
              <Link to="/portal/my-invoices">Xem tất cả hóa đơn{invoiceMeta?.total ? ` (${invoiceMeta.total})` : ''} <ArrowRightOutlined /></Link>
            </div>
          </Card>
        </div>
      </Col>

      <Col xs={24} lg={8}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <SupportCard title="Hỗ trợ sinh viên" />
        </div>
      </Col>
    </Row>
  );
}
