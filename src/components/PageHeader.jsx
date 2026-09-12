import { Typography, Space } from 'antd';

const { Title, Text } = Typography;

/** Tiêu đề trang + mô tả + vùng nút hành động bên phải */
export default function PageHeader({ title, description, extra }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      flexWrap: 'wrap', gap: 12, marginBottom: 20,
    }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {description && <Text type="secondary">{description}</Text>}
      </div>
      {extra && <Space wrap>{extra}</Space>}
    </div>
  );
}
