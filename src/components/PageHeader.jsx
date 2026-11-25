import { Typography, Space, Breadcrumb } from 'antd';

const { Title, Text } = Typography;

/** Tiêu đề trang tối giản kiểu hệ thống vận hành chuyên nghiệp */
export default function PageHeader({ title, description, extra, breadcrumb }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {breadcrumb?.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 4, fontSize: 12 }}
          items={['Trang chủ', ...breadcrumb].map((label) => ({ title: label }))}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Title
            level={3}
            style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, color: 'var(--ink)' }}
          >
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ display: 'block', fontSize: 13.5, marginTop: 2 }}>{description}</Text>
          )}
        </div>
        {extra && <Space wrap size={8}>{extra}</Space>}
      </div>
    </div>
  );
}
