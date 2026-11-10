import { useState } from 'react';
import {
  Card, Typography, Skeleton, Alert, Select, Table,
} from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useApi } from '../../../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import { formatCurrency } from '../../../utils/formatter';
import { BRAND, TEXT_TERTIARY } from '../../../theme/tokens';

const { Text } = Typography;

/**
 * Hai nhóm cố định: tiền phòng (xanh dương) và điện nước (xanh ngọc — cùng màu nhãn "Điện nước" ở màn Hóa đơn).
 * Đã chạy kiểm bảng màu (dataviz validate_palette): đạt phân biệt màu cho người mù màu; xanh ngọc tương phản thấp
 * với nền nên BẮT BUỘC có bảng số bên dưới biểu đồ.
 */
const SERIES = [
  { key: 'roomRevenue', label: 'Tiền phòng trọn gói', color: BRAND },
  { key: 'utilityRevenue', label: 'Tiền điện nước', color: '#13C2C2' },
];

const monthShort = (m) => { const [y, mm] = m.split('-'); return `T${Number(mm)}/${y.slice(2)}`; };
const millions = (v) => (v >= 1e6 ? `${Math.round(v / 1e5) / 10}tr` : v ? `${Math.round(v / 1e3)}k` : '0');

/** Điền tháng trống giữa tháng đầu và tháng cuối có thu, để trục thời gian không bị nhảy cóc */
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
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}>
      <Text strong>Tháng {r.month.split('-').reverse().join('/')}</Text>
      {SERIES.map((s) => (
        <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 6 }} />{s.label}</span>
          <b>{formatCurrency(r[s.key])}</b>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>Tổng: <b>{formatCurrency(r.total)}</b></div>
    </div>
  );
}

/** FR-72 Doanh thu theo tháng, tách tiền phòng và điện nước. Không tính tiền cọc (hoàn lại khi trả phòng). Chỉ admin */
export default function RevenueChart() {
  const thisYear = dayjs().year();
  const [year, setYear] = useState(thisYear);
  const { data, loading, error } = useApi(() => dashboardApi.getRevenue({ year }), [year]);
  const rows = fillMonths(data || []);
  const sum = (k) => rows.reduce((t, r) => t + r[k], 0);

  const columns = [
    { title: 'Tháng', dataIndex: 'month', render: (v) => v.split('-').reverse().join('/') },
    ...SERIES.map((s) => ({ title: s.label, dataIndex: s.key, align: 'right', render: (v) => formatCurrency(v) })),
    { title: 'Tổng', dataIndex: 'total', align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
  ];

  return (
    <Card
      title={(
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <RiseOutlined style={{ color: 'var(--brand)', fontSize: 18 }} />
          <span>
            <div>Doanh thu theo tháng</div>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>Theo ngày thu tiền · không tính tiền cọc</Text>
          </span>
        </span>
      )}
      extra={(
        <Select
          aria-label="Năm" value={year} onChange={setYear} style={{ width: 110 }}
          options={[thisYear, thisYear - 1, thisYear - 2].map((y) => ({ value: y, label: `Năm ${y}` }))}
        />
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {/* useApi giữ dữ liệu cũ khi tải lại — đổi năm thì ẩn hẳn để không hiện số năm trước dưới nhãn năm mới */}
      {!error && loading && <Skeleton active paragraph={{ rows: 5 }} />}
      {!error && !loading && data && rows.length === 0 && <Text type="secondary">Năm {year} chưa thu được khoản nào.</Text>}
      {!error && !loading && rows.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
            {SERIES.map((s) => (
              <span key={s.key}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: s.color, marginRight: 6 }} />
                <Text type="secondary">{s.label}: </Text><Text strong>{formatCurrency(sum(s.key))}</Text>
              </span>
            ))}
            <span><Text type="secondary">Cả năm: </Text><Text strong>{formatCurrency(sum('total'))}</Text></span>
          </div>
          <div role="img" aria-label={`Doanh thu ${year}: ${rows.map((r) => `${monthShort(r.month)} ${formatCurrency(r.total)}`).join('; ')}`} style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="month" tickFormatter={monthShort} tick={{ fontSize: 12, fill: TEXT_TERTIARY }} axisLine={{ stroke: '#D9D9D9' }} tickLine={false} />
                <YAxis tickFormatter={millions} tick={{ fontSize: 12, fill: TEXT_TERTIARY }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(22,119,255,0.04)' }} />
                {/* Viền trắng 2px = khe giữa hai đoạn chồng. Bo cả hai: tháng chỉ có tiền phòng thì đoạn dưới là đầu cột */}
                <Bar dataKey="roomRevenue" stackId="rev" fill={SERIES[0].color} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="utilityRevenue" stackId="rev" fill={SERIES[1].color} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table
            rowKey="month" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 520 }} style={{ marginTop: 12 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><Text strong>Cả năm</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">{formatCurrency(sum('roomRevenue'))}</Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">{formatCurrency(sum('utilityRevenue'))}</Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right"><Text strong>{formatCurrency(sum('total'))}</Text></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </>
      )}
    </Card>
  );
}
