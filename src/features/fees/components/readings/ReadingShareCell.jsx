import { Tooltip, Typography } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../../utils/formatter';

const { Text } = Typography;

const num = (v) => Number(v).toLocaleString('vi-VN');

/** Tiền điện nước mỗi người + công thức chia (FR-59: floor, phần dư dồn cho SV có mã nhỏ nhất) */
export default function ReadingShareCell({ row }) {
  if (row.skipped) return <Text type="secondary" style={{ fontSize: 13 }}>Phòng trống — không chia</Text>;
  if (row.total === null) return <Text type="secondary">—</Text>;

  const { base, remainder } = row.share;
  const formula = (
    <div style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12, lineHeight: 1.7 }}>
      <div style={{ fontFamily: 'inherit', fontWeight: 600, marginBottom: 4 }}>Công thức chia tiền phòng {row.roomLabel}</div>
      <div>Điện: {num(row.electricityConsumption)} kWh × {num(row.electricityPrice)} = {formatCurrency(row.electricityConsumption * row.electricityPrice)}</div>
      <div>Nước: {num(row.waterConsumption)} m³ × {num(row.waterPrice)} = {formatCurrency(row.waterConsumption * row.waterPrice)}</div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: 4, paddingTop: 4 }}>
        {row.occupants
          ? <>Tổng {formatCurrency(row.total)} ÷ {row.occupants} người = <b>{formatCurrency(base)}</b></>
          : <>Tổng {formatCurrency(row.total)} — phòng không có người ở</>}
      </div>
      {remainder > 0 && <div>Dư {formatCurrency(remainder)} → SV mã nhỏ nhất trả {formatCurrency(base + remainder)}</div>}
      {row.saved && <div style={{ opacity: 0.75 }}>Đơn giá đã chốt lúc nhập (BR-52)</div>}
    </div>
  );

  return (
    <Tooltip title={formula} styles={{ root: { maxWidth: 420 } }}>
      <span style={{ whiteSpace: 'nowrap', cursor: 'help' }}>
        <Text strong style={{ fontVariantNumeric: 'tabular-nums' }}>{row.occupants ? formatCurrency(base) : formatCurrency(row.total)}</Text>
        {' '}<CalculatorOutlined style={{ color: '#1677FF' }} aria-label={`Công thức chia phòng ${row.roomLabel}`} />
      </span>
    </Tooltip>
  );
}
