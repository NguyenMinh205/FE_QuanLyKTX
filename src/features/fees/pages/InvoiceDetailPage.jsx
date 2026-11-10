import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Row, Col, Typography, Table, Alert, Result, Skeleton, Space,
} from 'antd';
import {
  PrinterOutlined, DollarOutlined, ProfileOutlined, ArrowLeftOutlined, ExportOutlined,
  ThunderboltOutlined, TeamOutlined, FileDoneOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { INVOICE_SCOPE, INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import PageHeader from '../../../components/PageHeader';
import CollectPaymentModal from '../components/invoices/CollectPaymentModal';
import PaymentReceipt from '../../payments/components/PaymentReceipt';
import { printReceipt } from '../../payments/utils/printReceipt';
import { periodLabel } from '../utils/readingSheet';
import {
  isPastDue, roomTextOf, subjectOf, transferContentOf,
} from '../utils/invoiceView';

const { Text } = Typography;

/** In hóa đơn: ẩn khung quản trị và các nút */
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

const num = (v) => Number(v).toLocaleString('vi-VN');

/** SCR-54 Chi tiết hóa đơn (FR-51): thông tin, chỉ số điện nước và thành viên phòng, biên lai khi đã thu */
export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCollect = can(user, 'payment:record');
  const [collecting, setCollecting] = useState(false);

  const { data: inv, loading, error, refetch } = useApi(() => feeApi.getInvoiceById(id), [id]);

  if (error && !inv) {
    return (
      <Result
        status="404" title="Không mở được hóa đơn" subTitle={error}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/invoices')}>Về danh sách hóa đơn</Button>}
      />
    );
  }
  if (!inv) return <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>;

  const subject = subjectOf(inv);
  const paid = inv.status === 'paid';
  const reading = inv.reading;

  const meterRows = reading ? [
    { key: 'e', name: 'Điện', unit: 'kWh', ...reading.electricity },
    { key: 'w', name: 'Nước', unit: 'm³', ...reading.water },
  ] : [];
  const meterColumns = [
    { title: '', dataIndex: 'name', width: 70, render: (v) => <Text strong>{v}</Text> },
    { title: 'Chỉ số', key: 'idx', render: (_, m) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{num(m.oldIndex)} → {num(m.newIndex)}</span> },
    { title: 'Tiêu thụ', key: 'usage', align: 'right', render: (_, m) => `${num(m.usage)} ${m.unit}` },
    { title: 'Đơn giá', dataIndex: 'unitPrice', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Thành tiền', dataIndex: 'amount', align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
  ];

  return (
    <>
      <style>{PRINT_CSS}</style>
      <PageHeader
        breadcrumb={['Tài chính', 'Hóa đơn', inv.invoiceCode]}
        title={<span>Hóa đơn {inv.invoiceCode} <StatusTag type="invoice" value={inv.status} /></span>}
        description={`${INVOICE_TYPE[inv.type]?.label ?? inv.type} · ${INVOICE_SCOPE[inv.scope]?.label ?? ''}`}
        extra={(
          <span className="invoice-no-print" style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/invoices')}>Danh sách</Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In hóa đơn</Button>
            {canCollect && !paid && (
              <Button type="primary" icon={<DollarOutlined />} onClick={() => setCollecting(true)}>Thu tiền</Button>
            )}
          </span>
        )}
      />

      {loading && <Alert type="info" showIcon title="Đang cập nhật…" style={{ marginBottom: 16 }} className="invoice-no-print" />}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<span><ProfileOutlined style={{ color: '#1677FF' }} /> Thông tin hóa đơn</span>} style={{ marginBottom: 16 }}>
            <InfoRow label="Người phải trả"><Text strong>{subject.name}</Text>{subject.sub && <div><Text type="secondary" style={{ fontSize: 12 }}>{subject.sub}</Text></div>}</InfoRow>
            <InfoRow label="Phòng">{inv.room ? `${inv.room.buildingName} · ${roomTextOf(inv.room)}` : '—'}</InfoRow>
            <InfoRow label="Nội dung">{inv.description}</InfoRow>
            <InfoRow label="Số tiền"><Text strong style={{ fontSize: 20, color: paid ? '#389E0D' : '#CF1322' }}>{formatCurrency(inv.amount)}</Text></InfoRow>
            <InfoRow label="Ngày tạo">{formatDateTime(inv.createdAt)}</InfoRow>
            <InfoRow label="Hạn nộp">
              <Text type={isPastDue(inv) ? 'danger' : undefined}>{formatDate(inv.dueDate)}</Text>
              {isPastDue(inv) && <div><Text type="danger" style={{ fontSize: 12 }}>Đã qua hạn, chưa thu</Text></div>}
            </InfoRow>
            {inv.contractCode && (
              <InfoRow label="Hợp đồng">
                <Link to={`/admin/contracts?search=${encodeURIComponent(inv.contractCode)}`}>{inv.contractCode} <ExportOutlined /></Link>
              </InfoRow>
            )}
          </Card>

          {inv.type === 'utility' && (
            <>
              <Card
                title={<span><ThunderboltOutlined style={{ color: '#1677FF' }} /> Chỉ số điện nước {inv.monthYear ? `· ${periodLabel(inv.monthYear)}` : ''}</span>}
                styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}
              >
                {reading ? (
                  <>
                    <Table rowKey="key" size="small" columns={meterColumns} dataSource={meterRows} pagination={false} scroll={{ x: 480 }} />
                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderTop: '1px solid #F0F0F0' }}>
                      <Text type="secondary">Chốt lúc phát hành: {reading.occupantsCount} người · ≈ {formatCurrency(reading.perStudentAmount)}/người (tham khảo)</Text>
                      <Text strong>Cả phòng: {formatCurrency(reading.totalAmount)}</Text>
                    </div>
                  </>
                ) : <div style={{ padding: 16 }}><Text type="secondary">Không tìm thấy bản ghi chỉ số</Text></div>}
              </Card>
              <Card title={<span><TeamOutlined style={{ color: '#1677FF' }} /> Đang ở phòng ({inv.members?.length ?? 0})</span>}>
                {(inv.members || []).length
                  ? (inv.members.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                      <Text>{m.fullName}</Text><Text type="secondary">{m.studentCode}</Text>
                    </div>
                  )))
                  : <Text type="secondary">Phòng không còn ai ở</Text>}
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>Một bạn trong phòng nộp đủ cho cả phòng (BR-03).</Text>
              </Card>
            </>
          )}
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span><FileDoneOutlined style={{ color: '#1677FF' }} /> Thanh toán</span>}
            extra={paid && inv.payments?.length > 0 && (
              <Button size="small" icon={<PrinterOutlined />} onClick={printReceipt} className="invoice-no-print">In biên lai</Button>
            )}
          >
            {paid
              ? (inv.payments || []).map((p) => <PaymentReceipt key={p.id} payment={p} invoice={inv} />)
              : (
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  <Text>Chưa thu. Sinh viên trả tiền mặt tại văn phòng, hoặc chuyển khoản VietQR với nội dung:</Text>
                  <Text code copyable style={{ fontSize: 14 }}>{transferContentOf(inv)}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>Thấy tiền vào sao kê thì bấm Thu tiền → chọn VietQR để xác nhận.</Text>
                  {canCollect && (
                    <Button type="primary" icon={<DollarOutlined />} onClick={() => setCollecting(true)} className="invoice-no-print">Thu tiền</Button>
                  )}
                </Space>
              )}
          </Card>
        </Col>
      </Row>

      {canCollect && (
        <CollectPaymentModal
          invoiceId={inv.id}
          open={collecting}
          onClose={(changed) => { setCollecting(false); if (changed) refetch(); }}
        />
      )}
    </>
  );
}
