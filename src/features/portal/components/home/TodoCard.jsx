import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Grid } from 'antd';
import { ExclamationCircleFilled, CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const TONE = {
  danger: { color: '#CF1322', label: 'Cần làm ngay' },
  warning: { color: '#D46B08', label: 'Sắp tới hạn' },
};

/**
 * "Việc cần làm" ở trang chủ sinh viên: gộp công nợ và hạn hợp đồng thành một danh sách xếp theo mức độ.
 * Bản cũ chồng 2–3 khung đỏ / vàng làm người đọc không biết việc nào trước. Khung trung tính, chỉ biểu tượng mang màu.
 * @param items [{ key, tone: 'danger'|'warning', title, detail, action: { label, to } }] — đã xếp, nguy cấp trước
 */
export default function TodoCard({ items }) {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  if (!items.length) {
    return (
      <Card styles={{ body: { padding: '14px 20px' } }}>
        <Text><CheckCircleFilled style={{ color: '#52C41A', marginRight: 8 }} />Bạn không có khoản nào cần nộp và hợp đồng chưa tới hạn.</Text>
      </Card>
    );
  }

  return (
    <Card title={`Việc cần làm (${items.length})`} styles={{ body: { padding: '4px 20px' } }}>
      {items.map((it, i) => (
        <div
          key={it.key}
          style={{
            display: 'flex', gap: 12, alignItems: screens.sm ? 'center' : 'flex-start', flexWrap: screens.sm ? 'nowrap' : 'wrap',
            padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 'none',
          }}
        >
          <ExclamationCircleFilled aria-label={TONE[it.tone].label} style={{ color: TONE[it.tone].color, fontSize: 20, marginTop: screens.sm ? 0 : 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 15 }}>{it.title}</Text>
            <div><Text type="secondary" style={{ fontSize: 13 }}>{it.detail}</Text></div>
          </div>
          {it.action && (
            <Button
              type={i === 0 ? 'primary' : 'default'} onClick={() => navigate(it.action.to)}
              style={screens.sm ? undefined : { width: '100%', marginLeft: 32 }}
            >
              {it.action.label}
            </Button>
          )}
        </div>
      ))}
    </Card>
  );
}
