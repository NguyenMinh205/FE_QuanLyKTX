import { Typography } from 'antd';

const { Text } = Typography;

/** Một dòng "nhãn — giá trị" trong các thẻ tóm tắt bên phải màn Đăng ký chỗ ở */
export default function SummaryRow({ label, children, hint, strong }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <Text type="secondary">{label}</Text>
        <Text strong={strong} style={{ textAlign: 'right' }}>{children}</Text>
      </div>
      {hint && <Text type="secondary" style={{ display: 'block', textAlign: 'right', fontSize: 12 }}>{hint}</Text>}
    </div>
  );
}
