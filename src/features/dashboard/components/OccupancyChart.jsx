import { useState } from 'react';
import { Card, Grid, Typography, Skeleton, Alert, Table, Segmented } from 'antd';
import { BarChartOutlined, TableOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { formatPercent } from '../../../utils/formatter';
import { BRAND, TEXT_TERTIARY } from '../../../theme/tokens';
import { occupancyRateOf } from '../api/dashboard.api';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const COLORS = { occupied: BRAND, available: '#CBD5E1', maintenance: '#FCA5A5' };
const LABEL = { occupied: 'Đang giữ chỗ', available: 'Còn trống', maintenance: 'Bảo trì' };

const rateText = (b) => {
  const r = occupancyRateOf({ total: b.totalCapacity ?? b.total, occupied: b.occupied, maintenance: b.maintenance });
  return r === null ? '—' : formatPercent(r * 100);
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
      <Text strong>{b.buildingCode} · {b.buildingName}</Text> <Text type="secondary">({b.totalRooms} phòng)</Text>
      {['occupied', 'available', 'maintenance'].map((k) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12.5, marginTop: 2 }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: COLORS[k], marginRight: 6 }} />{LABEL[k]}</span>
          <b className="mono">{b[k] ?? 0} chỗ</b>
        </div>
      ))}
      <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid var(--line)', fontSize: 12.5 }}>
        Tỷ lệ lấp đầy: <b className="mono">{rateText(b)}</b>
      </div>
    </div>
  );
}

/** Lấp đầy theo Tòa nhà — Biểu đồ | Bảng số (không nhân đôi bảng dưới biểu đồ) */
export default function OccupancyChart({ buildings = [], campusLabel, loading, error }) {
  const [view, setView] = useState('chart');
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const rows = buildings.map((b) => {
    const cap = b.totalCapacity ?? b.total ?? 0;
    return {
      ...b,
      totalCapacity: cap,
      shortName: b.buildingCode,
      label: `${rateText(b)} · ${b.occupied}/${cap - (b.maintenance || 0)}`,
    };
  });

  const columns = [
    { title: 'Tòa nhà', key: 'name', render: (_, b) => <Text strong>{b.buildingCode} — {b.buildingName}</Text> },
    { title: 'Phòng', dataIndex: 'totalRooms', align: 'right', className: 'mono' },
    { title: 'Sức chứa', dataIndex: 'totalCapacity', align: 'right', className: 'mono' },
    { title: 'Đang giữ chỗ', dataIndex: 'occupied', align: 'right', className: 'mono' },
    { title: 'Còn trống', dataIndex: 'available', align: 'right', render: (v) => <Text strong className="mono" style={{ color: v ? 'var(--success-text)' : undefined }}>{v}</Text> },
    { title: 'Bảo trì', dataIndex: 'maintenance', align: 'right', className: 'mono' },
    { title: 'Lấp đầy', key: 'rate', align: 'right', render: (_, b) => <Text strong className="mono">{rateText(b)}</Text> },
  ];

  return (
    <Card
      title={(
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Lấp đầy theo Tòa nhà {campusLabel ? `— ${campusLabel}` : ''}</div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>Quản lý cấp Phòng · Đang giữ chỗ / (Tổng sức chứa − Bảo trì)</Text>
        </div>
      )}
      extra={(
        <Segmented
          size="small"
          value={view}
          onChange={setView}
          options={[
            { value: 'chart', label: 'Biểu đồ', icon: <BarChartOutlined /> },
            { value: 'table', label: 'Bảng số', icon: <TableOutlined /> },
          ]}
        />
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && <Skeleton active paragraph={{ rows: 4 }} />}
      {!error && !loading && rows.length === 0 && <Text type="secondary">Chưa có tòa nhà nào trong phạm vi đã chọn.</Text>}

      {!error && !loading && rows.length > 0 && view === 'chart' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 8, fontSize: 12 }}>
            {['occupied', 'available', 'maintenance'].map((k) => (
              <span key={k} style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: COLORS[k], marginRight: 6 }} />
                {LABEL[k]}
              </span>
            ))}
          </div>
          <div style={{ width: '100%', height: Math.max(150, rows.length * 46 + 30) }}>
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: isMobile ? 0 : 8 }} barCategoryGap={12}>
                <CartesianGrid horizontal={false} stroke="#EEF1F5" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: TEXT_TERTIARY }} />
                <YAxis yAxisId="name" type="category" dataKey="shortName" width={isMobile ? 48 : 92} tick={{ fontSize: 12.5, fill: '#111827', fontWeight: 500 }} />
                {!isMobile && (
                  <YAxis yAxisId="rate" orientation="right" type="category" dataKey="label" width={145} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475467', fontWeight: 500 }} />
                )}
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                <Bar yAxisId="name" dataKey="occupied" stackId="slots" fill={COLORS.occupied} radius={[3, 0, 0, 3]} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="available" stackId="slots" fill={COLORS.available} isAnimationActive={false} />
                <Bar yAxisId="name" dataKey="maintenance" stackId="slots" fill={COLORS.maintenance} radius={[0, 3, 3, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!error && !loading && rows.length > 0 && view === 'table' && (
        <Table rowKey="buildingId" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 680 }} />
      )}
    </Card>
  );
}
