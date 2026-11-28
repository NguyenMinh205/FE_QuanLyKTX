import { Typography, Divider } from 'antd';
import { CheckCircleFilled, RollbackOutlined } from '@ant-design/icons';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import { roomTextOf } from '../../fees/utils/invoiceView';

const { Text, Title } = Typography;

/** Khi in qua printReceipt() (utils/printReceipt.js) chỉ để lại chứng từ kèm phần chữ ký */
const PRINT_CSS = `@media print {
  body.printing-receipt * { visibility: hidden !important; }
  body.printing-receipt .payment-receipt, body.printing-receipt .payment-receipt * { visibility: visible !important; }
  body.printing-receipt .payment-receipt {
    position: absolute; left: 0; top: 0; width: 100%;
    border: 1px solid #1E293B !important; border-radius: 0 !important; padding: 28px 32px !important;
  }
  body.printing-receipt .receipt-signatures { display: grid !important; }
}`;

const Line = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children}</div>
  </div>
);

/**
 * Chứng từ tài chính chuẩn hành chính: phân tách rõ PHIẾU THU (PAY-...) và PHIẾU CHI HOÀN CỌC (REF-...).
 * Hỗ trợ bóc tách phí đầu kỳ (tiền phòng + tiền cọc) và phần ký tên khi in A4/PDF.
 */
export default function PaymentReceipt({ payment: p, invoice }) {
  const isRefund = p.paymentType === 'refund';
  const showInitialBreakdown = !isRefund && invoice?.type === 'initial_payment' && invoice?.roomFeeAmount != null;

  return (
    <div className="payment-receipt" style={{ border: '1px dashed #CBD5E1', borderRadius: 10, padding: '18px 22px', background: '#fff' }}>
      <style>{PRINT_CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 0.6 }}>TRUNG TÂM HỖ TRỢ SINH VIÊN · ĐH CÔNG NGHIỆP HÀ NỘI</div>
        <Text strong style={{ letterSpacing: 1, fontSize: 12.5, color: isRefund ? '#6D28D9' : 'var(--brand)' }}>
          {isRefund ? 'KÝ TÚC XÁ HaUI · PHIẾU CHI HOÀN CỌC' : 'KÝ TÚC XÁ HaUI · PHIẾU THU'}
        </Text>
        <Title level={3} style={{ margin: '6px 0 2px', color: isRefund ? '#722ED1' : 'var(--success-text)' }}>
          {isRefund ? <RollbackOutlined /> : <CheckCircleFilled />} {isRefund ? `−${formatCurrency(p.amount)}` : formatCurrency(p.amount)}
        </Title>
        <Text code className="mono" style={{ fontSize: 13 }}>{p.paymentCode}</Text>
      </div>

      <Divider style={{ margin: '12px 0 6px' }} />

      {isRefund ? (
        <>
          {p.contractCode && <Line label="Hợp đồng thanh lý"><Text strong className="mono">{p.contractCode}</Text></Line>}
          <Line label="Người nhận tiền">
            {p.payer ? <>{p.payer.fullName} <Text type="secondary">({p.payer.studentCode})</Text></> : '—'}
            {p.room && <div><Text type="secondary" style={{ fontSize: 12 }}>Phòng {roomTextOf(p.room)}</Text></div>}
          </Line>
          {p.depositAmount != null && <Line label="Tiền cọc gốc"><span className="mono">{formatCurrency(p.depositAmount)}</span></Line>}
          {p.depositDeductionAmount > 0 && (
            <Line label="Khấu trừ hư hại">
              <Text type="danger" className="mono">−{formatCurrency(p.depositDeductionAmount)}</Text>
            </Line>
          )}
          <Line label="Số tiền thực chi"><Text strong className="mono" style={{ color: '#722ED1' }}>{formatCurrency(p.amount)}</Text></Line>
          <Line label="Hình thức chi">{PAYMENT_METHOD[p.method]?.label ?? p.method}</Line>
          <Line label="Cán bộ chi trả">{p.collectedByName || 'Cán bộ KTX'}</Line>
          <Line label="Thời gian">{formatDateTime(p.paidAt)}</Line>
          {(p.depositRefundReason || p.note) && <Line label="Lý do quyết toán">{p.depositRefundReason || p.note}</Line>}
        </>
      ) : (
        <>
          <Line label="Hóa đơn">
            <Text strong className="mono">{p.invoiceCode}</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{invoice?.description ?? INVOICE_TYPE[p.invoiceType]?.label}</Text></div>
          </Line>
          {showInitialBreakdown && (
            <>
              <Line label="· Tiền phòng cả kỳ"><span className="mono">{formatCurrency(invoice.roomFeeAmount)}</span></Line>
              <Line label="· Tiền cọc tài sản"><span className="mono">{formatCurrency(invoice.depositAmount || 0)}</span></Line>
            </>
          )}
          <Line label="Người nộp">
            {p.payer ? <>{p.payer.fullName} <Text type="secondary">({p.payer.studentCode})</Text></> : '—'}
            {p.room && <div><Text type="secondary" style={{ fontSize: 12 }}>Phòng {roomTextOf(p.room)}{p.invoiceType === 'utility' ? ' · nộp cho cả phòng' : ''}</Text></div>}
          </Line>
          <Line label="Hình thức">
            {PAYMENT_METHOD[p.method]?.label ?? p.method}
            {p.transactionCode && <div><Text code className="mono" style={{ fontSize: 12 }}>{p.transactionCode}</Text></div>}
          </Line>
          <Line label="Người thu">{p.collectedByName || <Text type="secondary">Hệ thống VietQR tự động</Text>}</Line>
          <Line label="Thời gian">{formatDateTime(p.paidAt)}</Line>
          {p.note && <Line label="Ghi chú">{p.note}</Line>}
        </>
      )}

      {/* Khối chữ ký chuẩn chứng từ khi in A4 / Lưu PDF */}
      <div
        className="receipt-signatures"
        style={{
          display: 'none',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          marginTop: 28,
          paddingTop: 16,
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{isRefund ? 'Người nhận tiền' : 'Người nộp tiền'}</div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 48 }}>(Ký, ghi rõ họ tên)</div>
          <div style={{ fontSize: 13 }}>{p.payer?.fullName || ''}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{isRefund ? 'Cán bộ chi trả' : 'Cán bộ thu tiền'}</div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 48 }}>(Ký, ghi rõ họ tên)</div>
          <div style={{ fontSize: 13 }}>{p.collectedByName || 'Hệ thống VietQR tự động'}</div>
        </div>
      </div>
    </div>
  );
}
