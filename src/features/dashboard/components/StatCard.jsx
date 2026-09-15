import { Card, Typography, Skeleton } from 'antd';

const { Text } = Typography;

/**
 * Thẻ chỉ số dashboard: nhãn + biểu tượng · con số lớn · dòng phụ dưới vạch kẻ.
 * @param value   null/undefined → hiện "—" (backend chưa trả trường này)
 */
export default function StatCard({
  label, icon, iconBg = '#F5F5F5', value, valueColor, badge, footer, loading, children,
}) {
  const empty = value === null || value === undefined;
  return (
    <Card style={{ height: '100%' }} styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <Text type="secondary">{label}</Text>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</span>
      </div>
      {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 12 }} /> : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <Text strong style={{ fontSize: 30, lineHeight: 1.2, color: empty ? '#BFBFBF' : valueColor }}>{empty ? '—' : value}</Text>
            {badge}
          </div>
          {children}
          {footer && (
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 10, fontSize: 13 }}>{footer}</div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
