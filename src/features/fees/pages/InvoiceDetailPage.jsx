import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Row, Col, Typography, Table, Timeline, Tooltip, Alert, Result, Skeleton, Tag, App,
} from 'antd';
import {
  PrinterOutlined, DollarOutlined, StopOutlined, WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  ProfileOutlined, UnorderedListOutlined, HistoryOutlined, InfoCircleOutlined, ArrowLeftOutlined, ExportOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { paymentApi } from '../../payments/api/payment.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { INVOICE_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import StatCard from '../../../components/StatCard';
import PageHeader from '../../../components/PageHeader';
import RecordPaymentModal from '../components/invoices/RecordPaymentModal';
import { roomLabelOf, splitBedCode } from '../../rooms/utils/roomStatus';
import {
  cancelBlockReason, isOpenInvoice, periodShort, splitLineDescription, transferNoteOf,
} from '../utils/invoiceView';

const { Text } = Typography;

/** Ẩn khung quản trị khi in — chỉ in phần hóa đơn */
const PRINT_CSS = `@media print {
  .ant-layout-sider, .ant-layout-header, .invoice-no-print { display: none !important; }
  .ant-layout, .ant-layout-content { margin: 0 !important; padding: 0 !important; background: #fff !important; }
}`;

const InfoRow = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
  </div>
);

const bedTextOf = (inv) => {
  const bed = inv.bedCode ? splitBedCode(String(inv.bedCode)).bed : null;
  const parts = [inv.buildingName, inv.roomNumber ? `Phòng ${roomLabelOf(inv)}` : null, bed ? `Giường ${bed}` : null].filter(Boolean);
  return parts.length ? parts.join(' - ') : (inv.bedCode || '—');
};

/** Lịch sử thanh toán: backend có thể chưa gửi kèm trong chi tiết → lấy từ GET /payments?invoiceId= */
const loadInvoice = async (id) => {
  const res = await feeApi.getInvoiceById(id);
  const inv = res.data.data;
  if (Array.isArray(inv.payments)) return res;
  try {
    const p = await paymentApi.getList({ invoiceId: id, limit: 100 });
    const body = p.data.data;
    const list = (Array.isArray(body) ? body : body?.items || [])
      .map((x) => ({
        ...x,
        method: x.method ?? x.paymentMethod,
        gatewayTransactionId: x.gatewayTransactionId ?? x.transactionId,
        recordedByName: x.recordedByName ?? x.recordedBy?.fullName ?? null,
        status: x.status === 'completed' ? 'success' : x.status,
      }));
    return { ...res, data: { ...res.data, data: { ...inv, payments: list } } };
  } catch {
    return { ...res, data: { ...res.data, data: { ...inv, payments: null } } };
  }
};

/** SCR-54 Chi tiết hóa đơn (FR-49, FR-58) + mở SCR-55 ghi nhận thanh toán */
export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modal, message, notification } = App.useApp();
  const canRecord = can(user, 'payment:record');
  const canCancel = can(user, 'invoice:cancel');
  const [payOpen, setPayOpen] = useState(false);
  const [payKey, setPayKey] = useState(0);

  const { data: inv, loading, error, refetch } = useApi(() => loadInvoice(id), [id]);

  if (error && !inv) {
    return (
      <Result
        status="404" title="Không mở được hóa đơn" subTitle={error}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/invoices')}>Về danh sách hóa đơn</Button>}
      />
    );
  }
  if (!inv) return <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>;

  const lines = inv.lineItems || [];
  const cancelled = inv.status === 'cancelled';
  const paidPct = inv.totalAmount ? (inv.paidAmount / inv.totalAmount) * 100 : 0;
  const cancelReason = cancelBlockReason(inv);
  const successPayments = (inv.payments || []).filter((p) => p.status === 'success');

  const openPayment = () => { setPayKey((k) => k + 1); setPayOpen(true); };

  const handleRecorded = (res) => {
    setPayOpen(false);
    if (res) notification.success({ title: res.message });
    refetch();
  };

  const cancelInvoice = () => {
    modal.confirm({
      title: `Hủy hóa đơn ${inv.invoiceCode}?`,
      content: 'Sinh viên không còn phải trả hóa đơn này. Hóa đơn đã hủy không khôi phục được — lập sai thì tạo hóa đơn mới.',
      okText: 'Hủy hóa đơn',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: async () => {
        try {
          const res = await feeApi.cancelInvoice(inv.id);
          message.success(res.data.message);
          refetch();
        } catch (err) {
          modal.warning({ title: 'Không hủy được hóa đơn', content: getErrorMessage(err) });
        }
      },
    });
  };

  const lineColumns = [
    {
      title: 'Khoản mục', key: 'description',
      render: (_, l) => {
        const { main, sub } = splitLineDescription(l.description);
        return <><div>{main}</div>{sub && <Text type="secondary" style={{ fontSize: 13 }}>{sub}</Text>}</>;
      },
    },
    { title: 'Đơn giá', dataIndex: 'unitPrice', align: 'right', width: 140, render: (v) => formatCurrency(v) },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'right', width: 100, render: (v) => Number(v).toLocaleString('vi-VN') },
    { title: 'Thành tiền', dataIndex: 'amount', align: 'right', width: 150, render: (v) => <Text strong>{formatCurrency(v)}</Text> },
  ];

  const timelineItems = [
    ...(inv.payments || []).map((p) => {
      const refund = p.type === 'refund';
      const color = p.status === 'success' ? (refund ? 'blue' : 'green') : p.status === 'pending' ? 'gray' : 'red';
      return {
        color,
        content: (
          <div>
            <Text>{formatDateTime(p.paidAt || p.createdAt)} · {PAYMENT_METHOD[p.method]?.label ?? p.method}</Text>
            <div style={{ margin: '4px 0' }}>
              <Tag color={p.status === 'success' ? (refund ? 'blue' : 'success') : PAYMENT_STATUS[p.status]?.color} style={{ margin: 0 }}>
                {refund ? '−' : '+'}{formatCurrency(p.amount)}{p.status !== 'success' ? ` · ${PAYMENT_STATUS[p.status]?.label ?? p.status}` : ''}
              </Tag>
            </div>
            {p.recordedByName && <div><Text type="secondary" style={{ fontSize: 13 }}>Người thu: {p.recordedByName}</Text></div>}
            {(p.bankReference || p.gatewayTransactionId) && (
              <div><Text type="secondary" style={{ fontSize: 13 }}>Mã giao dịch: <Text code>{p.bankReference || p.gatewayTransactionId}</Text></Text></div>
            )}
            {p.note && <div><Text type="secondary" style={{ fontSize: 13 }}>{p.note}</Text></div>}
          </div>
        ),
      };
    }),
    cancelled
      ? { color: 'gray', content: <Text type="secondary">Hóa đơn đã hủy</Text> }
      : inv.remainingAmount > 0
        ? {
          color: 'gray',
          content: (
            <div>
              <Text>Còn lại <Text type="danger">{formatCurrency(inv.remainingAmount)}</Text> chưa thanh toán</Text>
              <div><Text type={inv.status === 'overdue' ? 'danger' : 'secondary'} style={{ fontSize: 13 }}>
                {inv.status === 'overdue' ? `Đã quá hạn từ ${formatDate(inv.dueDate)}` : `Chờ sinh viên tất toán trước ${formatDate(inv.dueDate)}`}
              </Text></div>
            </div>
          ),
        }
        : { color: 'green', content: <Text type="success" strong><CheckCircleOutlined /> Đã thanh toán đủ</Text> },
  ];

  return (
    <>
      <style>{PRINT_CSS}</style>
      <PageHeader
        breadcrumb={['Tài chính', 'Hóa đơn', inv.invoiceCode]}
        title={<span>Hóa đơn {inv.invoiceCode} <StatusTag type="invoice" value={inv.status} /></span>}
        description={`${INVOICE_TYPE[inv.type]?.label ?? inv.type}${inv.billingPeriod ? ` · Kỳ ${periodShort(inv.billingPeriod)}` : ''}`}
        extra={(
          <span className="invoice-no-print" style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/invoices')}>Danh sách</Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In hóa đơn</Button>
            {canCancel && !cancelled && (
              <Tooltip title={cancelReason}>
                <Button danger icon={<StopOutlined />} disabled={!!cancelReason} onClick={cancelInvoice}>Hủy hóa đơn</Button>
              </Tooltip>
            )}
            {canRecord && isOpenInvoice(inv) && (
              <Button type="primary" icon={<DollarOutlined />} onClick={openPayment}>Ghi nhận thanh toán</Button>
            )}
          </span>
        )}
      />

      {loading && <Alert type="info" showIcon title="Đang cập nhật…" style={{ marginBottom: 16 }} className="invoice-no-print" />}
      {cancelled && <Alert type="warning" showIcon title="Hóa đơn đã hủy — sinh viên không phải trả khoản này" style={{ marginBottom: 16 }} />}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            label="Tổng tiền" icon={<WalletOutlined />} value={formatCurrency(inv.totalAmount)}
            badge={<Text type="secondary">{lines.length} khoản phí</Text>}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            label="Đã thanh toán" icon={<CheckCircleOutlined style={{ color: '#389E0D' }} />} iconBg="#F6FFED"
            value={formatCurrency(inv.paidAmount)} valueColor="#389E0D"
            badge={<Text type="success">{formatPercent(paidPct)}</Text>}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            label="Còn lại" icon={<ExclamationCircleOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0"
            value={cancelled ? '—' : formatCurrency(inv.remainingAmount)} valueColor={inv.remainingAmount > 0 && !cancelled ? '#CF1322' : '#389E0D'}
            badge={!cancelled && inv.remainingAmount > 0 ? <Text type="danger">Chưa thu {formatPercent(100 - paidPct)}</Text> : null}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card title={<span><ProfileOutlined style={{ color: '#1677FF' }} /> Thông tin chung</span>} extra={inv.billingPeriod ? <Text type="secondary">Kỳ {periodShort(inv.billingPeriod)}</Text> : null} style={{ marginBottom: 16 }}>
            <InfoRow label="Sinh viên">{inv.studentName} <Text type="secondary">({inv.studentCode})</Text></InfoRow>
            <InfoRow label="Chỗ ở">{bedTextOf(inv)}</InfoRow>
            <InfoRow label="Loại hóa đơn"><StatusTag type="invoiceType" value={inv.type} /></InfoRow>
            <InfoRow label="Kỳ thanh toán">{inv.billingPeriod ? `Tháng ${periodShort(inv.billingPeriod)}` : '—'}</InfoRow>
            <InfoRow label="Ngày lập">{formatDate(inv.issueDate || inv.createdAt)}</InfoRow>
            <InfoRow label="Hạn thanh toán"><Text type={inv.status === 'overdue' ? 'danger' : undefined}>{formatDate(inv.dueDate)}</Text></InfoRow>
            {inv.contractCode && (
              <InfoRow label="Hợp đồng">
                <Link to={`/admin/contracts?search=${encodeURIComponent(inv.contractCode)}`}>{inv.contractCode} <ExportOutlined /></Link>
              </InfoRow>
            )}
            {inv.note && <InfoRow label="Ghi chú">{inv.note}</InfoRow>}
          </Card>

          <Card
            title={<span><HistoryOutlined style={{ color: '#1677FF' }} /> Lịch sử thanh toán</span>}
            extra={<Text type="secondary">{successPayments.length} đợt thu</Text>}
          >
            {inv.payments === null
              ? <Alert type="warning" showIcon title="Không tải được lịch sử thanh toán" />
              : <Timeline items={timelineItems} />}
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card
            title={<span><UnorderedListOutlined style={{ color: '#1677FF' }} /> Chi tiết các khoản</span>}
            extra={<Text type="secondary">Tổng cộng: {lines.length} mục</Text>}
            styles={{ body: { padding: 0 } }}
          >
            <Table
              rowKey={(l) => `${l.feeTypeId}|${l.description}|${l.amount}`} columns={lineColumns} dataSource={lines} pagination={false} scroll={{ x: 560 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}><Text strong style={{ fontSize: 16 }}>Tổng cộng</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right"><Text strong style={{ fontSize: 20, color: '#1677FF' }}>{formatCurrency(inv.totalAmount)}</Text></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            {!cancelled && inv.remainingAmount > 0 && (
              <div style={{ padding: 16, borderTop: '1px solid #F0F0F0', display: 'flex', gap: 8 }}>
                <InfoCircleOutlined style={{ color: '#1677FF', marginTop: 4 }} />
                <div>
                  <Text strong>Ghi chú đối soát</Text>
                  <div>
                    <Text type="secondary">Sinh viên chuyển khoản ghi rõ nội dung </Text>
                    <Text code copyable={{ tooltips: ['Sao chép', 'Đã sao chép'] }}>{transferNoteOf(inv)}</Text>
                    <Text type="secondary"> để kế toán đối chiếu sao kê, rồi ghi nhận bằng hình thức Chuyển khoản kèm mã giao dịch.</Text>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {canRecord && (
        <RecordPaymentModal key={payKey} open={payOpen} invoice={inv} onCancel={() => setPayOpen(false)} onRecorded={handleRecorded} />
      )}
    </>
  );
}
