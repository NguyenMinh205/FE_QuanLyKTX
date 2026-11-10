import { Card, Typography, Alert, Skeleton, Tag } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import NoResidenceHome from '../components/home/NoResidenceHome';
import ResidentHome from '../components/home/ResidentHome';

const { Title, Text } = Typography;

/** SCR-61 Trang chủ sinh viên — nội dung đổi theo tình trạng lưu trú (docs/08 mục 6.9) */
export default function PortalHomePage() {
  const { user } = useAuth();
  const { data: profile } = useApi(() => portalApi.getProfile(), []);
  const { data: residence, loading, error } = useApi(() => portalApi.getMyResidence(), []);

  const hasResidence = residence?.hasResidence === true;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>Xin chào, {profile?.fullName ?? user?.fullName}</Title>
        <Text type="secondary">
          {profile?.studentCode && <>Mã sinh viên {profile.studentCode}</>}
          {profile?.faculty && <> · {profile.faculty}</>}
          {residence && (
            <>
              {' · '}
              {hasResidence
                ? <Tag color="success" style={{ margin: 0 }}>Đang ở</Tag>
                : <Tag style={{ margin: 0 }}>Chưa có chỗ ở</Tag>}
            </>
          )}
        </Text>
      </div>

      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && !residence && <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>}
      {!error && residence && (hasResidence ? <ResidentHome residence={residence} /> : <NoResidenceHome />)}
    </div>
  );
}
