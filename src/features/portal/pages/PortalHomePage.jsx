import { Card, Typography, Alert, Skeleton, Tag } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
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
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#E6F4FF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <SmileOutlined style={{ fontSize: 26, color: '#1677FF' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <Title level={4} style={{ margin: 0 }}>Xin chào, {profile?.fullName ?? user?.fullName}</Title>
            <Text type="secondary">
              {profile?.studentCode && <>Mã sinh viên: <Text>{profile.studentCode}</Text></>}
              {profile?.faculty && <> · Khoa: <Text>{profile.faculty}</Text></>}
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
        </div>
      </Card>

      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && !residence && <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>}
      {!error && residence && (hasResidence ? <ResidentHome residence={residence} /> : <NoResidenceHome />)}
    </div>
  );
}
