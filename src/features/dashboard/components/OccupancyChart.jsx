import { Card, Typography, Skeleton, Alert, Table } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { formatPercent } from '../../../utils/formatter';
import { occupancyRateOf } from '../api/dashboard.api';

const { Text } = Typography;

const COLORS = { occupied: '#1677FF', available: '#E6F4FF', maintenance: '#FFCCC7' };
const LABEL = { occupied: 'Đã có người', available: 'Còn trống', maintenance: 'Bảo trì' };

const rateText = (b) => {
  const r = occupancyRateOf(b);
  return r === null ? '—' : formatPercent(r * 100);
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Text strong>{b.buildingName}</Text> <Text type="secondary">· {b.totalRooms} phòng</Text>
      {['occupied', 'available', 'maintenance'].map((k) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: COLORS[k], border: '1px solid #D9D9D9', marginRight: 6 }} />{LABEL[k]}</span>
          <b>{b[k] ?? 0} giường</b>
        </div>
      ))}
      <div style={{ marginTop: 4, fontSize: 13 }}>Tỷ lệ lấp đầy: <b>{rateText(b)}</b></div>
    </div>
  );
}

/** FR-71 Lấp đầy theo tòa — biểu đồ thanh chồng + bảng số để cán bộ điều phối xếp phòng (GET /dashboard/occupancy) */
export default function OccupancyChart({ data, loading, error }) {
  const rows = (data || []).map((b) => ({
    ...b,
    total: b.totalBeds,
    label: `${rateText({ ...b, total: b.totalBeds })} · ${b.occupied}/${b.totalBeds - b.maintenance} giường`,
  }));

  const columns = [
    { title: 'Tòa', dataIndex: 'buildingName', render: (v) => <Text strong>{v}</Text> },
    { title: 'Phòng', dataIndex: 'totalRooms', align: 'right' },
    { title: 'Giường', dataIndex: 'totalBeds', align: 'right' },
    { title: 'Đã có người', dataIndex: 'occupied', align: 'right' },
    { title: 'Còn trống', dataIndex: 'available', align: 'right', render: (v) => <Text strong style={{ color: v ? '#389E0D' : undefined }}>{v}</Text> },
    { title: 'Bảo trì', dataIndex: 'maintenance', align: 'right' },
    { title: 'Lấp đầy', key: 'rate', align: 'right', render: (_, b) => rateText(b) },
  ];

  return (
    <Card
      title={(
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: '#E6F4FF', display: 'grid', placeItems: 'center' }}><BankOutlined style={{ color: '#1677FF' }} /></span>
          <span>
            <div>Lấp đầy theo tòa</div>
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
      {!error && data && rows.length === 0 && <Text type="secondary">Chưa có tòa nhà nào đang hoạt động.</Text>}
      {!error && rows.length > 0 && (
        <>
          <div role="img" aria-label={`Biểu đồ lấp đầy: ${rows.map((b) => `${b.buildingName} ${b.label}`).join('; ')}`} style={{ width: '100%', height: Math.max(140, rows.length * 70 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }} barCategoryGap={18}>
                <CartesianGrid horizontal={false} stroke="#F0F0F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#8C8C8C' }} />
                <YAxis yAxisId="name" type="category" dataKey="buildingName" width={90} tick={{ fontSize: 13, fill: '#262626' }} />
                {/* Nhãn % ở trục phải — LabelList trên thanh không vẽ khi thanh rộng 0 (VD tòa chưa có ai ở, không bảo trì) */}
                <YAxis yAxisId="rate" orientation="right" type="category" dataKey="label" width={170} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#262626', fontWeight: 500 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                <Bar yAxisId="name" dataKey="occupied" stackId="beds" fill={COLORS.occupied} radius={[4, 0, 0, 4]} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="available" stackId="beds" fill={COLORS.available} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="maintenance" stackId="beds" fill={COLORS.maintenance} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table rowKey="buildingId" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 560 }} style={{ marginTop: 12 }} />
        </>
      )}
    </Card>
  );
}
