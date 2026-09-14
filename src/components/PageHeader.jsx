import { Typography, Space, Breadcrumb } from 'antd';

const { Title, Text } = Typography;

/**
 * Breadcrumb + tiêu đề trang + mô tả + vùng nút hành động bên phải.
 * @example <PageHeader breadcrumb={['Cơ sở vật chất', 'Loại phòng']} title="Loại phòng" extra={<Button />} />
 */
export default function PageHeader({ title, description, extra, breadcrumb }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {breadcrumb?.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 8 }}
          items={['Trang chủ', ...breadcrumb].map((label) => ({ title: label }))}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>{title}</Title>
          {description && <Text type="secondary">{description}</Text>}
        </div>
        {extra && <Space wrap>{extra}</Space>}
      </div>
    </div>
  );
}
