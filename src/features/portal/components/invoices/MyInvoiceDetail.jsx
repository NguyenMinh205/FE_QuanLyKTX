import {
  Card, Typography, Table, Alert, Skeleton, Space,
} from 'antd';
import {
  ClockCircleOutlined, FileTextOutlined, CheckCircleOutlined, TeamOutlined,
} from '@ant-design/icons';
import { INVOICE_SCOPE, INVOICE_TYPE, PAYMENT_METHOD } from '../../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/formatter';
import StatusTag from '../../../../components/StatusTag';
import PaymentReceipt from '../../../payments/components/PaymentReceipt';
import { roomTextOf } from '../../../fees/utils/invoiceView';
import { periodLabel } from '../../../fees/utils/readingSheet';
import { daysUntil } from '../../utils/homeView';
import VietQrPanel from './VietQrPanel';

const { Text, Title } = Typography;

const num = (v) => Number(v).toLocaleString('vi-VN');

const Line = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
  </div>
);

/** Chi tiết một hóa đơn của sinh viên (SCR-64): số tiền, cách tính điện nước, mã VietQR khi chưa nộp, biên lai khi đã nộp */
export default function MyInvoiceDetail({ invoice, loading }) {
  if (loading && !invoice) return <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>;
  if (!invoice) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FileTextOutlined style={{ fontSize: 34, color: '#BFBFBF' }} />
          <div style={{ marginTop: 12 }}><Text type="secondary">Chọn một hóa đơn để xem chi tiết</Text></div>
        </div>
      </Card>
    );
  }

  const unpaid = invoice.status === 'unpaid';
  const room = invoice.scope === 'room';
  const daysLeft = daysUntil(invoice.dueDate);
  const pastDue = unpaid && daysLeft !== null && daysLeft < 0;
  const reading = invoice.reading;
  const payment = invoice.payments?.[0];

  const meterColumns = [
    { title: '', dataIndex: 'name', width: 60, render: (v) => <Text strong>{v}</Text> },
    { title: 'Tiêu thụ', key: 'u', render: (_, m) => <>{num(m.usage)} {m.unit}<div><Text type="secondary" style={{ fontSize: 12 }}>{num(m.oldIndex)} → {num(m.newIndex)}</Text></div></> },
    { title: 'Đơn giá', dataIndex: 'unitPrice', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Thành tiền', dataIndex: 'amount', align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
  ];

  return (
    <Card
      title={<Space size={8} wrap><Text strong style={{ fontSize: 16 }}>{invoice.invoiceCode}</Text><StatusTag type="invoice" value={invoice.status} /></Space>}
      extra={<Text type="secondary">{INVOICE_TYPE[invoice.type]?.label ?? invoice.type} · {INVOICE_SCOPE[invoice.scope]?.label}</Text>}
    >
      <div style={{ background: unpaid ? '#FFF7E6' : '#F6FFED', borderRadius: 10, padding: '20px 16px', textAlign: 'center', marginBottom: 16 }}>
        <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>
          {unpaid ? (room ? 'Cả phòng cần nộp' : 'Số tiền cần nộp') : 'Đã thanh toán'}
        </Text>
        <Title level={2} style={{ margin: '4px 0 6px' }}>{formatCurrency(invoice.amount)}</Title>
        {unpaid ? (
          <Text type={pastDue ? 'danger' : 'warning'}>
            <ClockCircleOutlined /> Hạn nộp: {formatDate(invoice.dueDate)}
            {daysLeft !== null && (pastDue ? ` (đã qua ${Math.abs(daysLeft)} ngày)` : daysLeft === 0 ? ' (hôm nay)' : ` (còn ${daysLeft} ngày)`)}
          </Text>
        ) : (
          <Text type="success">
            <CheckCircleOutlined /> {formatDateTime(invoice.paidAt)}{payment ? ` · ${PAYMENT_METHOD[payment.method]?.label ?? payment.method}` : ''}
            {room && invoice.payer && <div>Đại diện nộp: <Text strong>{invoice.payer.fullName}</Text></div>}
          </Text>
        )}
      </div>

      <Line label="Nội dung">{invoice.description}</Line>
      {invoice.room && <Line label="Phòng">{invoice.room.buildingName} · {roomTextOf(invoice.room)}</Line>}
      <Line label="Ngày tạo">{formatDate(invoice.createdAt)}</Line>

      {room && reading && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Điện nước {invoice.monthYear ? periodLabel(invoice.monthYear).toLowerCase() : ''}</Text>
          <Table
            rowKey="name" size="small" pagination={false} columns={meterColumns} style={{ marginTop: 8 }} scroll={{ x: 380 }}
            dataSource={[{ name: 'Điện', unit: 'kWh', ...reading.electricity }, { name: 'Nước', unit: 'm³', ...reading.water }]}
          />
          <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 8 }}>
            <TeamOutlined /> Phòng {reading.occupantsCount} người · tham khảo ≈ {formatCurrency(reading.perStudentAmount)}/người. Các bạn tự chia nhau, hệ thống chỉ thu một lần cho cả phòng.
          </Text>
        </div>
      )}

      {unpaid ? (
        <div style={{ marginTop: 20 }}>
          {room && (
            <Alert
              type="info" showIcon style={{ marginBottom: 12 }}
              title="Một bạn nộp đủ cho cả phòng"
              description="Thống nhất với bạn cùng phòng để chỉ một người chuyển khoản, tránh nộp hai lần."
            />
          )}
          <VietQrPanel invoice={invoice} />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Hoặc nộp tiền mặt tại văn phòng ban quản lý ký túc xá</Text>
          </div>
        </div>
      ) : (
        payment && <div style={{ marginTop: 20 }}><PaymentReceipt payment={payment} invoice={invoice} /></div>
      )}
    </Card>
  );
}
