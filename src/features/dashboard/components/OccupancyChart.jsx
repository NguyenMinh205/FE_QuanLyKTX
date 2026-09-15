import { Card, Typography, Skeleton, Alert } from 'antd';
import { BankOutlined, ToolOutlined, TeamOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { formatPercent } from '../../../utils/formatter';

const { Text } = Typography;

const COLORS = { occupied: '#1677FF', available: '#E6F4FF', maintenance: '#FFCCC7' };
const LABEL = { occupied: 'Đã có người', available: 'Còn trống', maintenance: 'Bảo trì' };

/** Tỷ lệ lấp đầy đúng docs: đã sử dụng / (tổng − bảo trì) — không dùng `rate` backend trả về */
const rateOf = (b) => {
  const usable = (b.total ?? 0) - (b.maintenance ?? 0);
  return usable > 0 ? b.occupied / usable : 0;
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Text strong>{b.buildingName}</Text>
      {['occupied', 'available', 'maintenance'].map((k) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: COLORS[k], border: '1px solid #D9D9D9', marginRight: 6 }} />{LABEL[k]}</span>
          <b>{b[k] ?? 0} giường</b>
        </div>
      ))}
      <div style={{ marginTop: 4, fontSize: 13 }}>Tỷ lệ lấp đầy: <b>{formatPercent(rateOf(b) * 100)}</b></div>
    </div>
  );
}

/** Biểu đồ thanh ngang "Tỷ lệ lấp đầy theo tòa" — GET /dashboard/occupancy (docs/08 mục 6.1) */
export default function OccupancyChart({ data, loading, error }) {
  const rows = (data?.byBuilding || []).map((b) => ({
    ...b,
    maintenance: b.maintenance ?? 0,
    available: b.available ?? Math.max(0, (b.total ?? 0) - (b.occupied ?? 0) - (b.maintenance ?? 0)),
    label: `${formatPercent(rateOf(b) * 100)} · ${b.occupied}/${(b.total ?? 0) - (b.maintenance ?? 0)} giường`,
  }));
  const overall = data?.overall;
  const maintenanceText = rows.filter((b) => b.maintenance > 0).map((b) => `${b.buildingName}: ${b.maintenance}`).join(', ');

  return (
    <Card
      title={(
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: '#E6F4FF', display: 'grid', placeItems: 'center' }}><BankOutlined style={{ color: '#1677FF' }} /></span>
          <span>
            <div>Tỷ lệ lấp đầy theo tòa</div>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>Đã sử dụng / (tổng giường − giường bảo trì)</Text>
          </span>
        </span>
      )}
      extra={(
        <span style={{ fontSize: 13 }}>
          {['occupied', 'available', 'maintenance'].map((k) => (
            <span key={k} style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[k], border: '1px solid #D9D9D9', marginRight: 6 }} />
              {LABEL[k]}
            </span>
          ))}
        </span>
      )}
      style={{ height: '100%' }}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && !data && <Skeleton active paragraph={{ rows: 4 }} />}
      {!error && data && rows.length === 0 && <Text type="secondary">Chưa có tòa nhà nào.</Text>}
      {!error && rows.length > 0 && (
        <>
          <div role="img" aria-label={`Biểu đồ lấp đầy: ${rows.map((b) => `${b.buildingName} ${b.label}`).join('; ')}`} style={{ width: '100%', height: Math.max(140, rows.length * 70 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }} barCategoryGap={18}>
                <CartesianGrid horizontal={false} stroke="#F0F0F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#8C8C8C' }} />
                <YAxis yAxisId="name" type="category" dataKey="buildingName" width={120} tick={{ fontSize: 13, fill: '#262626' }} />
                {/* Nhãn % ở trục phải — LabelList trên thanh không vẽ khi thanh rộng 0 (VD tòa chưa có ai ở, không bảo trì) */}
                <YAxis yAxisId="rate" orientation="right" type="category" dataKey="label" width={170} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#262626', fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                <Bar yAxisId="name" dataKey="occupied" stackId="beds" fill={COLORS.occupied} radius={[4, 0, 0, 4]} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="available" stackId="beds" fill={COLORS.available} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="maintenance" stackId="beds" fill={COLORS.maintenance} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12, padding: 12, background: '#FAFAFA', borderRadius: 8 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}><TeamOutlined /> Công suất tiếp nhận hiện tại</Text>
              <div><Text strong>{(overall?.total ?? 0) - (overall?.maintenance ?? 0)} giường dùng được</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}><ToolOutlined /> Giường đang bảo trì</Text>
              <div><Text strong>{overall?.maintenance ?? 0} giường{maintenanceText ? ` (${maintenanceText})` : ''}</Text></div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
