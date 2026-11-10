import { useState } from 'react';
import { Typography, Alert, Skeleton } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { formatCurrency } from '../../../../utils/formatter';

const { Text } = Typography;

/**
 * Ảnh QR theo chuẩn VietQR do img.vietqr.io dựng từ payload backend trả (FR-53): đúng số tiền, đúng nội dung.
 * ⚠️ Cần mạng tới img.vietqr.io; ảnh lỗi thì vẫn còn thông tin để chuyển khoản tay ngay bên dưới.
 */
const qrImageUrl = (q) => `https://img.vietqr.io/image/${q.bankBin}-${q.accountNumber}-compact2.png`
  + `?amount=${q.amount}&addInfo=${encodeURIComponent(q.transferContent)}&accountName=${encodeURIComponent(q.accountName)}`;

const Line = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children}</div>
  </div>
);

/** Khối chuyển khoản VietQR của một hóa đơn chưa nộp. Chuyển xong hóa đơn vẫn "Chưa thanh toán" tới khi cán bộ xác nhận */
export default function VietQrPanel({ invoice }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { data: qr, error } = useApi(() => portalApi.getMyInvoiceVietqr(invoice.id), [invoice.id]);
  const ready = qr && qr.amount === invoice.amount;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 16 }}>
      <Text strong><QrcodeOutlined style={{ color: 'var(--brand)' }} /> Chuyển khoản bằng mã VietQR</Text>
      {error && <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} />}
      {!error && !ready && <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 12 }} />}
      {!error && ready && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 220, maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
            {imageFailed
              ? <Alert type="warning" showIcon title="Không tải được ảnh QR" description="Chuyển khoản tay theo thông tin bên cạnh, nhớ ghi đúng nội dung." />
              : <img src={qrImageUrl(qr)} alt={`Mã VietQR ${formatCurrency(qr.amount)}`} width={220} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} onError={() => setImageFailed(true)} />}
            <Text type="secondary" style={{ fontSize: 12 }}>Mở app ngân hàng → Quét mã</Text>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Line label="Số tiền"><Text strong style={{ color: '#CF1322' }}>{formatCurrency(qr.amount)}</Text></Line>
            <Line label="Nội dung"><Text code copyable={{ text: qr.transferContent, tooltips: ['Sao chép', 'Đã sao chép'] }}>{qr.transferContent}</Text></Line>
            <Line label="Số tài khoản"><Text copyable={{ tooltips: ['Sao chép', 'Đã sao chép'] }}>{qr.accountNumber}</Text></Line>
            <Line label="Chủ tài khoản">{qr.accountName}</Line>
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
              Giữ nguyên số tiền và nội dung để văn phòng đối chiếu. Hóa đơn chuyển sang Đã thanh toán khi cán bộ xác nhận đã nhận tiền.
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
