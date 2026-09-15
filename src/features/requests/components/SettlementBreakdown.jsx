import { useState } from 'react';
import { Typography, Divider } from 'antd';
import { DownOutlined, UpOutlined, WarningFilled } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import { INVOICE_TYPE } from '../../../constants/statuses';
import { periodText } from '../utils/requestView';

const { Text } = Typography;

function Line({ dot, label, value, danger, children }) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ color: danger ? '#CF1322' : undefined }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dot, marginRight: 8 }} />
          {label}
        </Text>
        <Text strong style={{ color: danger ? '#CF1322' : undefined, whiteSpace: 'nowrap' }}>{value}</Text>
      </div>
      {children}
    </div>
  );
}

/**
 * Bảng quyết toán tiền cọc khi trả phòng (BR-76) — dùng cho cả số tạm tính lẫn kết quả đã chốt.
 * @param s  { depositAmount, outstandingDebt, proratedRent, proratedDays?, daysInMonth?, proratedPeriod?, refundAmount, studentStillOwes }
 * @param unpaidInvoices  danh sách hóa đơn còn nợ (tùy chọn, chỉ có ở bản tạm tính)
 */
export default function SettlementBreakdown({ s, unpaidInvoices, final = false }) {
  const [showInvoices, setShowInvoices] = useState(false);
  const owes = s.studentStillOwes > 0;

  return (
    <div>
      <Line dot="#BFBFBF" label="Tiền cọc đã nộp" value={formatCurrency(s.depositAmount)} />
      <Line dot="#FF4D4F" danger label="Trừ: công nợ chưa thanh toán" value={`− ${formatCurrency(s.outstandingDebt)}`}>
        {unpaidInvoices?.length > 0 && (
          <div style={{ paddingLeft: 16, marginTop: 4 }}>
            <a onClick={() => setShowInvoices((v) => !v)}>
              {showInvoices ? <UpOutlined /> : <DownOutlined />} Xem {unpaidInvoices.length} hóa đơn còn nợ
            </a>
            {showInvoices && (
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                {unpaidInvoices.map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 10px', background: '#FAFAFA', borderRadius: 6, fontSize: 13 }}>
                    <span>
                      <Text code>{i.invoiceCode}</Text> {INVOICE_TYPE[i.type]?.label}{i.billingPeriod ? ` ${periodText(i.billingPeriod)}` : ''}
                      <Text type="secondary"> · hạn {formatDate(i.dueDate)}</Text>
                    </span>
                    <Text strong>{formatCurrency(i.remainingAmount)}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Line>
      {s.proratedRent > 0 && (
        <Line
          dot="#FF4D4F" danger
          label={`Trừ: tiền phòng tháng ${periodText(s.proratedPeriod)}${s.proratedDays ? ` (${s.proratedDays}/${s.daysInMonth} ngày ở)` : ''}`}
          value={`− ${formatCurrency(s.proratedRent)}`}
        />
      )}

      <Divider dashed style={{ margin: '12px 0', borderColor: '#BFBFBF' }} />

      <div style={{
        padding: '14px 16px', borderRadius: 10,
        background: owes ? '#FFF1F0' : '#F6FFED', border: `1px solid ${owes ? '#FFCCC7' : '#B7EB8F'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <Text strong style={{ fontSize: 16, color: owes ? '#CF1322' : '#389E0D' }}>
            {owes ? 'Sinh viên còn phải nộp thêm' : 'Hoàn trả cho sinh viên'}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {owes ? 'Khoản thiếu sau khi đã trừ hết tiền cọc' : 'Số tiền cọc sinh viên nhận lại sau quyết toán'}
            </Text>
          </div>
        </div>
        <Text strong style={{ fontSize: 26, color: owes ? '#CF1322' : '#389E0D' }}>
          {formatCurrency(owes ? s.studentStillOwes : s.refundAmount)}
        </Text>
      </div>

      {owes && !final && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 8 }}>
          <Text style={{ color: '#AD6800' }}>
            <WarningFilled /> <b>Tiền cọc bị trừ hết.</b> Hệ thống sẽ tạo hóa đơn quyết toán {formatCurrency(s.studentStillOwes)} để sinh viên thanh toán.
          </Text>
        </div>
      )}
    </div>
  );
}
