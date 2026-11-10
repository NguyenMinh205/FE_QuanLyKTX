import { Card, Typography, Skeleton } from 'antd';

const { Text } = Typography;

/**
 * Thẻ chỉ số (Dashboard, Hóa đơn, Phiếu thu…): biểu tượng nhỏ + nhãn · con số · dòng phụ dưới vạch kẻ.
 * Biểu tượng đi cùng nhãn, không đặt trong ô nền màu — bản cũ lặp ô màu ở mọi thẻ làm trang rối, khó dò số.
 * Cỡ số tự nhỏ lại trên điện thoại (index.css `.stat-card-value`) để xếp 2 thẻ một hàng.
 * @param value   null/undefined → hiện "—" (backend chưa trả trường này)
 * @param iconBg  giữ cho tương thích chỗ gọi cũ, không còn dùng
 */
// eslint-disable-next-line no-unused-vars
export default function StatCard({ label, icon, iconBg, value, valueColor, badge, footer, loading, children }) {
  const empty = value === null || value === undefined;
  return (
    <Card className="stat-card" style={{ height: '100%' }} styles={{ body: { padding: 18, height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        {icon && <span aria-hidden style={{ fontSize: 14, display: 'inline-flex' }}>{icon}</span>}
        {label}
      </Text>
      {loading ? <Skeleton active paragraph={{ rows: 1 }} title={false} style={{ marginTop: 12 }} /> : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <Text strong className="stat-card-value" style={{ color: empty ? 'var(--text-tertiary)' : valueColor }}>{empty ? '—' : value}</Text>
            {badge}
          </div>
          {children}
          {footer && (
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <div className="stat-card-footer" style={{ borderTop: '1px solid var(--line)', paddingTop: 10, fontSize: 13 }}>{footer}</div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
