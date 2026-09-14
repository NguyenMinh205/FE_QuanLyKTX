import { Card, Typography, Alert, Space } from 'antd';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text } = Typography;

export default function PortalHomePage() {
  const { user } = useAuth();

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>Xin chào, {user?.fullName} 👋</Title>
        <Text type="secondary">Cổng thông tin sinh viên nội trú</Text>
      </Card>

      <Alert
        type="info"
        showIcon
        title="Đây là khung cổng sinh viên"
        description="Các thẻ 'Chỗ ở của tôi', 'Cần thanh toán' và 'Thao tác nhanh' sẽ bổ sung ở Sprint 4 — xem 08-THIET-KE-GIAO-DIEN.md."
      />
    </Space>
  );
}
