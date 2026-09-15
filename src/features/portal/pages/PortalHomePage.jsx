import { Card, Typography, Alert, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';

const { Title, Text } = Typography;

/** Khung tạm của SCR-61 — bản đầy đủ 3 trạng thái làm ở màn tiếp theo (docs/08 mục 6.9) */
export default function PortalHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: residence } = useApi(() => portalApi.getMyResidence(), []);

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>Xin chào, {user?.fullName} 👋</Title>
        <Text type="secondary">Cổng thông tin sinh viên nội trú</Text>
      </Card>

      {residence?.hasResidence === false && (
        <Card>
          <Title level={5} style={{ marginTop: 0 }}>Bạn chưa có chỗ ở tại ký túc xá</Title>
          <Text type="secondary">Chọn loại phòng, chọn phòng và nộp đơn — ban quản lý sẽ duyệt trong 1–2 ngày làm việc.</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" onClick={() => navigate('/portal/apply')}>Đăng ký chỗ ở</Button>
          </div>
        </Card>
      )}

      <Alert
        type="info"
        showIcon
        title="Đây là khung cổng sinh viên"
        description="Trang chủ đầy đủ (đơn đang chờ duyệt, chỗ ở, công nợ, hóa đơn gần đây) làm ở màn SCR-61 — xem 08-THIET-KE-GIAO-DIEN.md mục 6.9."
      />
    </Space>
  );
}
