import { useState } from 'react';
import {
  Card, Typography, Table, Button, Alert, Collapse, Skeleton, Space, App,
} from 'antd';
import {
  ClockCircleOutlined, SafetyCertificateOutlined, CreditCardOutlined, FileTextOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { paymentApi } from '../../../payments/api/payment.api';
import { getErrorMessage } from '../../../../lib/axiosClient';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/formatter';
import StatusTag from '../../../../components/StatusTag';
import { daysUntil } from '../../utils/homeView';
import { splitLineDescription, utilityNotesOf } from '../../utils/invoiceNote';

const { Text, Title } = Typography;

const columns = [
  {
    title: 'Khoản thu', key: 'description',
    render: (_, l) => {
      const { main, sub } = splitLineDescription(l.description);
      return <><div>{main}</div>{sub && <Text type="secondary" style={{ fontSize: 12 }}>{sub}</Text>}</>;
    },
  },
  { title: 'Thành tiền', dataIndex: 'amount', align: 'right', width: 130, render: (v) => <Text strong>{formatCurrency(v)}</Text> },
];

/** Chi tiết hóa đơn của sinh viên + thanh toán trực tuyến (SCR-64, FR-52) */
export default function MyInvoiceDetail({ invoice, loading, onPaid }) {
  const { modal } = App.useApp();
  const [paying, setPaying] = useState(false);

  if (loading && !invoice) return <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>;
  if (!invoice) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FileTextOutlined style={{ fontSize: 34, color: '#BFBFBF' }} />
          <div style={{ marginTop: 12 }}><Text type="secondary">Chọn một hóa đơn bên trái để xem chi tiết</Text></div>
        </div>
      </Card>
    );
  }

  const remaining = invoice.remainingAmount ?? Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const payable = ['unpaid', 'partial', 'overdue'].includes(invoice.status) && remaining > 0;
  const daysLeft = daysUntil(invoice.dueDate);
  const overdue = invoice.status === 'overdue' || (payable && daysLeft !== null && daysLeft < 0);
  const notes = utilityNotesOf(invoice.lineItems);
  const payments = (invoice.payments || []).filter((p) => p.status === 'success');

  const pay = async () => {
    setPaying(true);
    try {
      const res = await paymentApi.checkout({ invoiceId: invoice.id, gateway: 'vnpay', amount: remaining });
      const { redirectUrl, transactionRef } = res.data.data;
      // Lưu mã giao dịch trước khi rời trang để màn kết quả còn tra lại được (SCR-65)
      try { sessionStorage.setItem('lastPaymentRef', transactionRef); } catch { /* chế độ riêng tư: bỏ qua */ }
      onPaid?.(transactionRef);
      window.location.href = redirectUrl;
    } catch (err) {
      modal.warning({ title: 'Chưa mở được cổng thanh toán', content: getErrorMessage(err) });
      setPaying(false);
    }
  };

  return (
    <Card
      title={<Space size={8} wrap><Text strong style={{ fontSize: 16 }}>{invoice.invoiceCode}</Text><StatusTag type="invoice" value={invoice.status} /></Space>}
      extra={<Text type="secondary">{INVOICE_TYPE[invoice.type]?.label ?? invoice.type}</Text>}
    >
      <div style={{ background: payable ? '#FFF7E6' : '#F6FFED', borderRadius: 10, padding: '20px 16px', textAlign: 'center', marginBottom: 16 }}>
        <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>
          {payable ? 'Số tiền cần thanh toán' : 'Hóa đơn đã thanh toán'}
        </Text>
        <Title level={2} style={{ margin: '4px 0 6px' }}>{formatCurrency(payable ? remaining : invoice.totalAmount)}</Title>
        {payable ? (
          <Text type={overdue ? 'danger' : 'warning'}>
            <ClockCircleOutlined /> Hạn thanh toán: {formatDate(invoice.dueDate)}
            {daysLeft !== null && (overdue ? ` (quá hạn ${Math.abs(daysLeft)} ngày)` : daysLeft === 0 ? ' (hôm nay)' : ` (còn ${daysLeft} ngày)`)}
          </Text>
        ) : (
          <Text type="success"><CheckCircleOutlined /> Đã thanh toán đủ</Text>
        )}
      </div>

      <Table
        rowKey={(l) => `${l.feeTypeId}|${l.description}`}
        columns={columns}
        dataSource={invoice.lineItems || []}
        pagination={false}
        size="middle"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><Text strong style={{ fontSize: 16, color: '#1677FF' }}>{formatCurrency(invoice.totalAmount)}</Text></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      {notes.length > 0 && (
        <Collapse
          style={{ marginTop: 16 }}
          items={[{
            key: 'utility',
            label: 'Cách tính tiền điện nước',
            children: (
              <Space orientation="vertical" size={4}>
                {notes.map((n) => <Text key={n} type="secondary" style={{ fontSize: 13 }}>{n}</Text>)}
                <Text type="secondary" style={{ fontSize: 13 }}>Tiền điện nước của phòng được chia đều cho số người đang ở; phần lẻ do bạn có mã sinh viên nhỏ nhất chịu.</Text>
              </Space>
            ),
          }]}
        />
      )}

      {payments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Đã thanh toán</Text>
          {payments.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
              <Text type="secondary">{formatDateTime(p.paidAt)} · {PAYMENT_METHOD[p.method]?.label ?? p.method}</Text>
              <Text type="success">+{formatCurrency(p.amount)}</Text>
            </div>
          ))}
        </div>
      )}

      {invoice.status === 'cancelled' && <Alert type="info" showIcon style={{ marginTop: 16 }} title="Hóa đơn đã hủy — bạn không phải thanh toán khoản này" />}

      {payable && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Text strong>Phương thức thanh toán</Text>
            <Text type="success" style={{ fontSize: 13 }}><SafetyCertificateOutlined /> Thanh toán qua cổng VNPay</Text>
          </div>
          <Button type="primary" size="large" block icon={<CreditCardOutlined />} loading={paying} onClick={pay}>
            Thanh toán {formatCurrency(remaining)} qua VNPay
          </Button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Hoặc nộp tiền mặt trực tiếp tại văn phòng ban quản lý ký túc xá</Text>
          </div>
        </div>
      )}
    </Card>
  );
}
