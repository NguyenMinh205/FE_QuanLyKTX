import { Card, Typography, Skeleton } from 'antd';

const { Text } = Typography;

/** Thẻ chỉ số tối giản — ưu tiên độ tương phản số liệu (tabular mono), bỏ trang trí rườm rà */
export default function StatCard({ label, value, valueColor, badge, footer, loading, children }) {
  const empty = value === null || value === undefined;
  return (
    <Card className="stat-card" style={{ height: '100%' }} styles={{ body: { padding: '16px 18px', height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</Text>
        {badge}
      </div>
      {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 12 }} /> : (
        <>
          <div style={{ marginTop: 8 }}>
            <Text strong className="stat-card-value mono" style={{ color: empty ? 'var(--text-tertiary)' : (valueColor || 'var(--ink)') }}>
              {empty ? '—' : value}
            </Text>
          </div>
          {children}
          {footer && (
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <div className="stat-card-footer" style={{ borderTop: '1px solid var(--line)', paddingTop: 9, fontSize: 12.5 }}>{footer}</div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
