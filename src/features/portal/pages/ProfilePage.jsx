import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Alert, Skeleton, Button, Tag, Divider,
} from 'antd';
import {
  UserOutlined, IdcardOutlined, PhoneOutlined, MailOutlined, TeamOutlined, LockOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { portalApi } from '../api/portal.api';
import { GENDER } from '../../../constants/statuses';
import { formatDate, formatPhone } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import { initialsOf } from '../../applications/utils/applicationView';
import { placeTextOf } from '../../contracts/utils/contractView';

const { Text, Title } = Typography;

const Info = ({ label, icon, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{icon} {label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children || <Text type="secondary">—</Text>}</div>
  </div>
);

/** SCR-69 Hồ sơ cá nhân — chỉ đọc (FR-86); sửa thông tin phải liên hệ ban quản lý */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, loading, error } = useApi(() => portalApi.getProfile(), []);
  const { data: residence, error: residenceError } = useApi(() => portalApi.getMyResidence(), []);

  const header = <PageHeader title="Hồ sơ cá nhân" description="Thông tin do ban quản lý ký túc xá lưu giữ" />;
  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được hồ sơ" description={error} /></>;
  if (loading && !profile) return <>{header}<Card><Skeleton active avatar paragraph={{ rows: 6 }} /></Card></>;

  const emergency = profile?.emergencyContact;
  const contract = residence?.hasResidence ? residence.contract : null;

  return (
    <>
      {header}

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        title="Hồ sơ chỉ để xem"
        description="Thông tin cá nhân do ban quản lý cập nhật. Nếu có sai sót, mang thẻ sinh viên đến văn phòng ban quản lý để chỉnh sửa."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card style={{ height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                width: 84, height: 84, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)',
                display: 'inline-grid', placeItems: 'center', fontSize: 30, fontWeight: 600,
              }}>{initialsOf(profile?.fullName)}</span>
              <Title level={4} style={{ margin: '12px 0 4px' }}>{profile?.fullName}</Title>
              <Text type="secondary">{profile?.studentCode}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={profile?.gender === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>{GENDER[profile?.gender]?.label ?? '—'}</Tag>
              </div>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Info label="Chỗ ở hiện tại" icon={<HomeOutlined />}>
              {residenceError ? <Text type="danger">Không tải được</Text>
                : !residence ? <Text type="secondary">Đang tải…</Text>
                  : contract
                    ? <>{placeTextOf(contract)}<div><Text type="secondary" style={{ fontSize: 12 }}>{contract.room?.buildingName}</Text></div></>
                    : <Text type="secondary">Chưa có chỗ ở</Text>}
            </Info>
            <Info label="Tài khoản đăng nhập" icon={<MailOutlined />}>{user?.email}</Info>
            <div style={{ marginTop: 16 }}>
              <Button icon={<LockOutlined />} block onClick={() => navigate('/portal/change-password')}>Đổi mật khẩu</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card title={<span><IdcardOutlined style={{ color: 'var(--brand)' }} /> Thông tin sinh viên</span>} style={{ marginBottom: 16 }}>
            <Info label="Họ và tên" icon={<UserOutlined />}>{profile?.fullName}</Info>
            <Info label="Mã sinh viên" icon={<IdcardOutlined />}><Text code>{profile?.studentCode}</Text></Info>
            <Info label="Ngày sinh">{profile?.dob ? formatDate(profile.dob) : null}</Info>
            <Info label="Số CCCD">{profile?.citizenId}</Info>
            <Info label="Địa chỉ thường trú">{profile?.address}</Info>
            <Info label="Khoa">{profile?.faculty}</Info>
            <Info label="Lớp">{profile?.className}</Info>
            <Info label="Số điện thoại" icon={<PhoneOutlined />}>{profile?.phone ? formatPhone(profile.phone) : null}</Info>
            <Info label="Email" icon={<MailOutlined />}>{profile?.email}</Info>
          </Card>

          <Card title={<span><TeamOutlined style={{ color: 'var(--brand)' }} /> Liên hệ khẩn cấp</span>}>
            {emergency?.name ? (
              <>
                <Info label="Họ tên">{emergency.name}</Info>
                <Info label="Quan hệ">{emergency.relationship}</Info>
                <Info label="Số điện thoại" icon={<PhoneOutlined />}>{formatPhone(emergency.phone)}</Info>
              </>
            ) : (
              <Text type="secondary">Chưa có thông tin liên hệ khẩn cấp. Bạn nên báo văn phòng ban quản lý để bổ sung.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
