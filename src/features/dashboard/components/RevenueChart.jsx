import { useState } from 'react';
import {
  Card, Typography, Skeleton, Alert, Select, Table, Segmented, Space,
} from 'antd';
import { BarChartOutlined, TableOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useApi } from '../../../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import { formatCurrency } from '../../../utils/formatter';
import { BRAND, TEXT_TERTIARY } from '../../../theme/tokens';

const { Text } = Typography;

const SERIES = [
  { key: 'roomRevenue', label: 'Tiền phòng trọn gói', color: BRAND },
  { key: 'utilityRevenue', label: 'Tiền điện nước', color: '#0F766E' },
];

const monthShort = (m) => { const [y, mm] = m.split('-'); return `T${Number(mm)}/${y.slice(2)}`; };
const millions = (v) => (v >= 1e6 ? `${Math.round(v / 1e5) / 10}tr` : v ? `${Math.round(v / 1e3)}k` : '0');

const fillMonths = (rows) => {
  if (!rows.length) return [];
  const byMonth = Object.fromEntries(rows.map((r) => [r.month, r]));
  const out = [];
  for (let m = dayjs(`${rows[0].month}-01`); !m.isAfter(dayjs(`${rows[rows.length - 1].month}-01`)); m = m.add(1, 'month')) {
    const key = m.format('YYYY-MM');
    out.push(byMonth[key] ?? { month: key, roomRevenue: 0, utilityRevenue: 0, total: 0 });
  }
  return out;
};

function RevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 12.5 }}>
      <Text strong>Tháng {r.month.split('-').reverse().join('/')}</Text>
      {SERIES.map((s) => (
        <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 6 }} />{s.label}</span>
          <b className="mono">{formatCurrency(r[s.key])}</b>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 4 }}>
        Tổng: <b className="mono">{formatCurrency(r.total)}</b>
      </div>
    </div>
  );
}

/** Báo cáo Doanh thu thực thu theo tháng — CHỈ Manager! */
export default function RevenueChart({ campus }) {
  const thisYear = dayjs().year();
  const [year, setYear] = useState(thisYear);
  const [view, setView] = useState('chart');
  const { data, loading, error } = useApi(() => dashboardApi.getRevenue({ year, campus }), [year, campus]);
  const rows = fillMonths(data || []);
  const sum = (k) => rows.reduce((t, r) => t + r[k], 0);

  const columns = [
    { title: 'Tháng', dataIndex: 'month', className: 'mono', render: (v) => v.split('-').reverse().join('/') },
    ...SERIES.map((s) => ({ title: s.label, dataIndex: s.key, align: 'right', className: 'mono', render: (v) => formatCurrency(v) })),
    { title: 'Tổng', dataIndex: 'total', align: 'right', render: (v) => <Text strong className="mono">{formatCurrency(v)}</Text> },
  ];

  return (
    <Card
      title={(
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Doanh thu thực thu theo tháng</div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            Trưởng ban KTX · Đã loại trừ tiền đặt cọc và phiếu chi hoàn cọc
          </Text>
        </div>
      )}
      extra={(
        <Space size={8} wrap>
          <Select
            size="small"
            aria-label="Năm" value={year} onChange={setYear} style={{ width: 118 }}
            options={[thisYear, thisYear - 1, thisYear - 2].map((y) => ({ value: y, label: `Năm ${y}` }))}
          />
          <Segmented
            size="small"
            value={view}
            onChange={setView}
            options={[
              { value: 'chart', label: 'Biểu đồ', icon: <BarChartOutlined /> },
              { value: 'table', label: 'Bảng số', icon: <TableOutlined /> },
            ]}
          />
        </Space>
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && <Skeleton active paragraph={{ rows: 5 }} />}
      {!error && !loading && data && rows.length === 0 && <Text type="secondary">Năm {year} chưa có khoản doanh thu nào trong phạm vi đã chọn.</Text>}
      {!error && !loading && rows.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 14, fontSize: 13 }}>
            {SERIES.map((s) => (
              <span key={s.key}>
                <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: s.color, marginRight: 6 }} />
                <Text type="secondary">{s.label}: </Text><Text strong className="mono">{formatCurrency(sum(s.key))}</Text>
              </span>
            ))}
            <span><Text type="secondary">Cả năm: </Text><Text strong className="mono" style={{ color: 'var(--brand)' }}>{formatCurrency(sum('total'))}</Text></span>
          </div>

          {view === 'chart' ? (
            <div style={{ width: '100%', height: 245 }}>
              <ResponsiveContainer>
                <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#EEF1F5" />
                  <XAxis dataKey="month" tickFormatter={monthShort} tick={{ fontSize: 12, fill: TEXT_TERTIARY }} axisLine={{ stroke: '#D5DCE4' }} tickLine={false} />
                  <YAxis tickFormatter={millions} tick={{ fontSize: 12, fill: TEXT_TERTIARY }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                  <Bar dataKey="roomRevenue" stackId="rev" fill={SERIES[0].color} stroke="#fff" strokeWidth={2} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="utilityRevenue" stackId="rev" fill={SERIES[1].color} stroke="#fff" strokeWidth={2} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Table
              rowKey="month" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 520 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}><Text strong>Cả năm</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right"><span className="mono">{formatCurrency(sum('roomRevenue'))}</span></Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right"><span className="mono">{formatCurrency(sum('utilityRevenue'))}</span></Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right"><Text strong className="mono">{formatCurrency(sum('total'))}</Text></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          )}
        </>
      )}
    </Card>
  );
}
