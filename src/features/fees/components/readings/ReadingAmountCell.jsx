import { Tooltip, Typography } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../../utils/formatter';

const { Text } = Typography;

const num = (v) => Number(v).toLocaleString('vi-VN');

/**
 * Tiền điện nước của cả phòng + số tham khảo mỗi người. Phòng trả chung MỘT hóa đơn, một bạn đại diện nộp (BR-03),
 * nên "mỗi người" chỉ để các bạn tự chia, hệ thống không thu theo số này.
 */
export default function ReadingAmountCell({ row }) {
  if (row.skipped) return <Text type="secondary" style={{ fontSize: 13 }}>Không lập hóa đơn</Text>;
  if (row.total === null) return <Text type="secondary">—</Text>;

  const formula = (
    <div style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12, lineHeight: 1.7 }}>
      <div style={{ fontFamily: 'inherit', fontWeight: 600, marginBottom: 4 }}>Tiền điện nước phòng {row.roomLabel}</div>
      <div>Điện: {num(row.electricityUsage)} kWh × {num(row.electricityPrice)} = {formatCurrency(row.electricityUsage * row.electricityPrice)}</div>
      <div>Nước: {num(row.waterUsage)} m³ × {num(row.waterPrice)} = {formatCurrency(row.waterUsage * row.waterPrice)}</div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: 4, paddingTop: 4 }}>
        Cả phòng: <b>{formatCurrency(row.total)}</b> — một hóa đơn
      </div>
      {row.perPerson !== null && <div>Tham khảo: ÷ {row.headcount} người ≈ {formatCurrency(row.perPerson)}</div>}
      {row.billed && <div style={{ opacity: 0.75 }}>Số người và đơn giá đã chốt lúc phát hành</div>}
    </div>
  );

  return (
    <Tooltip title={formula} styles={{ root: { maxWidth: 420 } }}>
      <span style={{ cursor: 'help', display: 'inline-block', textAlign: 'right' }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          <Text strong style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(row.total)}</Text>
          {' '}<CalculatorOutlined style={{ color: '#1677FF' }} aria-label={`Cách tính tiền phòng ${row.roomLabel}`} />
        </span>
        {row.perPerson !== null && (
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>≈ {formatCurrency(row.perPerson)}/người</Text>
        )}
      </span>
    </Tooltip>
  );
}
