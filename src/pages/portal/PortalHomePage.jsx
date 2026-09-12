import { Card, Typography, Alert, Space } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function PortalHomePage() {
  const { user } = useAuth();

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>Xin chào, {user?.fullName} 👋</Title>
        <Text type="secondary">Cổng thông tin sinh viên nội trú</Text>
      </Card>

      <Alert
        type="info"
        showIcon
        message="Đây là khung cổng sinh viên (T5.5)"
        description="Các thẻ 'Chỗ ở của tôi', 'Cần thanh toán' và 'Thao tác nhanh' sẽ bổ sung ở Sprint 4 — xem docs/08 mục 6, màn hình SCR-61."
      />
    </Space>
  );
}
