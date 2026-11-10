import { Typography, Divider } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import { roomTextOf } from '../../fees/utils/invoiceView';

const { Text, Title } = Typography;

/** Khi in qua printReceipt() (utils/printReceipt.js) chỉ để lại biên lai */
const PRINT_CSS = `@media print {
  body.printing-receipt * { visibility: hidden !important; }
  body.printing-receipt .payment-receipt, body.printing-receipt .payment-receipt * { visibility: visible !important; }
  body.printing-receipt .payment-receipt { position: absolute; left: 0; top: 0; width: 100%; }
}`;

const Line = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children}</div>
  </div>
);

/**
 * Biên lai một lần thu (UC-06): mã phiếu, số tiền, người nộp, người thu, thời gian.
 * `invoice` (tuỳ chọn) để hiện nội dung hóa đơn — phiếu thu tự nó chỉ có mã và loại hóa đơn.
 */
export default function PaymentReceipt({ payment: p, invoice }) {
  return (
    <div className="payment-receipt" style={{ border: '1px dashed #D9D9D9', borderRadius: 10, padding: '16px 20px', background: '#fff' }}>
      <style>{PRINT_CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ letterSpacing: 1, fontSize: 12 }}>KÝ TÚC XÁ HaUI · PHIẾU THU</Text>
        <Title level={3} style={{ margin: '4px 0 0', color: 'var(--success-text)' }}>
          <CheckCircleFilled /> {formatCurrency(p.amount)}
        </Title>
        <Text code style={{ fontSize: 13 }}>{p.paymentCode}</Text>
      </div>
      <Divider style={{ margin: '12px 0 6px' }} />
      <Line label="Hóa đơn">
        <Text strong>{p.invoiceCode}</Text>
        <div><Text type="secondary" style={{ fontSize: 12 }}>{invoice?.description ?? INVOICE_TYPE[p.invoiceType]?.label}</Text></div>
      </Line>
      <Line label="Người nộp">
        {p.payer ? <>{p.payer.fullName} <Text type="secondary">({p.payer.studentCode})</Text></> : '—'}
        {p.room && <div><Text type="secondary" style={{ fontSize: 12 }}>Phòng {roomTextOf(p.room)}{p.invoiceType === 'utility' ? ' · nộp cho cả phòng' : ''}</Text></div>}
      </Line>
      <Line label="Hình thức">
        {PAYMENT_METHOD[p.method]?.label ?? p.method}
        {p.transactionCode && <div><Text code style={{ fontSize: 12 }}>{p.transactionCode}</Text></div>}
      </Line>
      <Line label="Người thu">{p.collectedByName || <Text type="secondary">Tự động</Text>}</Line>
      <Line label="Thời gian">{formatDateTime(p.paidAt)}</Line>
      {p.note && <Line label="Ghi chú">{p.note}</Line>}
    </div>
  );
}
