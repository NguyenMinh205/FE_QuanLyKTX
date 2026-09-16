import { Link } from 'react-router-dom';
import { Drawer, Typography, Button, Tag, Alert, Space } from 'antd';
import { SyncOutlined, ExportOutlined } from '@ant-design/icons';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import { isReconcilable } from '../utils/paymentView';

const { Text } = Typography;

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children}</div>
  </div>
);

/** Chi tiết một giao dịch (SCR-56) — xem để đối soát, có nút hỏi lại cổng thanh toán khi giao dịch treo */
export default function PaymentDetailDrawer({ payment, onClose, onReconcile, reconciling, canReconcile }) {
  const p = payment;
  const refund = p?.type === 'refund';
  // Chỉ tô màu tiền khi giao dịch đã thành công — treo hay thất bại thì chưa có tiền vào
  const amountColor = p?.status !== 'success' ? '#8C8C8C' : refund ? '#1677FF' : '#389E0D';

  return (
    <Drawer
      open={!!p}
      onClose={onClose}
      title={p ? <span>Giao dịch <Text code>{p.transactionRef}</Text></span> : ''}
      size="default"
      destroyOnHidden
      extra={p && canReconcile && isReconcilable(p) && (
        <Button type="primary" icon={<SyncOutlined />} loading={reconciling} onClick={() => onReconcile(p)}>Đối soát lại</Button>
      )}
    >
      {p && (
        <>
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: amountColor }}>
              {refund ? '−' : '+'}{formatCurrency(p.amount)}
            </div>
            <Space size={8} style={{ marginTop: 8 }}>
              <StatusTag type="payment" value={p.status} />
              <Tag style={{ margin: 0 }}>{refund ? 'Hoàn tiền' : 'Thu tiền'}</Tag>
            </Space>
          </div>

          {p.status === 'pending' && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 16 }}
              title="Giao dịch đang chờ cổng thanh toán phản hồi"
              description="Chưa cộng vào hóa đơn. Bấm Đối soát lại để hỏi cổng thanh toán; quá 15 phút không phản hồi sẽ chuyển thành Hết hạn."
            />
          )}
          {p.status === 'expired' && <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Giao dịch hết hạn — sinh viên cần thanh toán lại" />}
          {p.status === 'failed' && <Alert type="error" showIcon style={{ marginBottom: 16 }} title="Giao dịch thất bại — không trừ tiền của sinh viên" />}

          <Row label="Sinh viên">{p.studentName} {p.studentCode ? <Text type="secondary">({p.studentCode})</Text> : null}</Row>
          <Row label="Hóa đơn">
            {p.invoiceId
              ? (
                <>
                  <Link to={`/admin/invoices/${p.invoiceId}`}>{p.invoiceCode} <ExportOutlined /></Link>
                  {p.invoiceType && <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></div>}
                </>
              )
              : <Text type="secondary">—</Text>}
          </Row>
          <Row label="Hình thức">{PAYMENT_METHOD[p.method]?.label ?? p.method}</Row>
          <Row label="Thời điểm tạo">{formatDateTime(p.createdAt) === '—' ? '—' : formatDateTime(p.createdAt)}</Row>
          <Row label="Thời điểm thành công">{p.paidAt ? formatDateTime(p.paidAt) : '—'}</Row>
          {p.bankReference && <Row label="Mã giao dịch ngân hàng"><Text code>{p.bankReference}</Text></Row>}
          {p.gatewayTransactionId && <Row label="Mã giao dịch cổng"><Text code>{p.gatewayTransactionId}</Text></Row>}
          <Row label="Người ghi nhận">{p.recordedByName || <Text type="secondary">Sinh viên tự thanh toán</Text>}</Row>
          {p.note && <Row label="Ghi chú">{p.note}</Row>}
        </>
      )}
    </Drawer>
  );
}
