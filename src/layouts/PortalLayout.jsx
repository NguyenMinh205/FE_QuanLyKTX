import { Layout, Dropdown, Avatar, Menu, Grid, Typography, Tooltip } from 'antd';
import {
  HomeOutlined, BankOutlined, DollarOutlined,
  UserOutlined, LogoutOutlined, LockOutlined, ProfileOutlined, DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { portalApi } from '../features/portal/api/portal.api';
import BrandLogo from '../components/BrandLogo';
import ErrorBoundary from '../components/ErrorBoundary';
import { roomLabelOf } from '../features/rooms/utils/roomStatus';
import RoomInvoiceBell from '../features/portal/components/RoomInvoiceBell';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

/** Menu chuẩn cổng sinh viên — docs/08 mục 3.2. `short` dùng cho tab bar điện thoại, `needsResidence` mờ khi chưa có chỗ ở */
const TABS = [
  { key: '/portal/home',         icon: <HomeOutlined />,     label: 'Trang chủ',        short: 'Trang chủ' },
  { key: '/portal/my-residence', icon: <BankOutlined />,     label: 'Chỗ ở & hợp đồng', short: 'Chỗ ở', needsResidence: true },
  { key: '/portal/my-invoices',  icon: <DollarOutlined />,   label: 'Hóa đơn',          short: 'Hóa đơn' },
];
const NO_RESIDENCE_HINT = 'Mở sau khi bạn có chỗ ở tại ký túc xá';

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Sinh viên chưa có hợp đồng active: "Chỗ ở & hợp đồng" hiển thị mờ (docs/08 mục 3.2).
  // Chưa tải xong hoặc lỗi thì không khóa gì — backend vẫn tự chặn.
  const { data: residence } = useApi(() => portalApi.getMyResidence(), [location.pathname === '/portal/home']);
  const locked = residence?.hasResidence === false;
  const roomText = residence?.contract?.room ? `Phòng ${roomLabelOf(residence.contract.room)}` : null;

  const go = (tab) => {
    if (tab.needsResidence && locked) return;
    navigate(tab.key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--layout-bg)' }}>
      <Header style={{
        background: '#fff', padding: '0 24px', display: 'flex', gap: 16, height: 64,
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }} onClick={() => navigate('/portal/home')}>
          <BrandLogo size={36} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>KÝ TÚC XÁ HaUI</div>
            {!isMobile && <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Cổng thông tin sinh viên</Text>}
          </div>
        </div>

        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={TABS.map((tab) => ({
              key: tab.key,
              icon: tab.icon,
              disabled: tab.needsResidence && locked,
              label: tab.needsResidence && locked ? <Tooltip title={NO_RESIDENCE_HINT}>{tab.label}</Tooltip> : tab.label,
            }))}
            onClick={({ key }) => go(TABS.find((t) => t.key === key))}
            style={{ flex: 1, justifyContent: 'center', borderBottom: 'none', minWidth: 0, lineHeight: '62px' }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {residence?.hasResidence && <RoomInvoiceBell refreshKey={location.pathname} />}
          <Dropdown
            trigger={['hover', 'click']}
            menu={{ items: [
              { key: 'profile', icon: <ProfileOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/portal/profile') },
              { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/portal/change-password') },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
            ] }}
          >
            <button type="button" aria-label="Tài khoản" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textAlign: 'left' }}>
              <Avatar style={{ background: 'var(--brand)' }} icon={<UserOutlined />} />
              {!isMobile && (
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{user?.fullName}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{roomText ?? (locked ? 'Chưa có chỗ ở' : 'Sinh viên')}</Text>
                </div>
              )}
              {!isMobile && <DownOutlined style={{ fontSize: 10, color: 'var(--text-tertiary)' }} />}
            </button>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: isMobile ? 12 : 24, paddingBottom: isMobile ? 72 : 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Một màn hỏng không kéo sập menu; key theo đường dẫn nên bấm sang màn khác là dựng lại từ đầu */}
          <ErrorBoundary key={location.pathname}><Outlet /></ErrorBoundary>
        </div>
      </Content>

      {isMobile && (
        <Footer style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: 0,
          background: '#fff', borderTop: '1px solid var(--line)', zIndex: 20,
        }}>
          <div style={{ display: 'flex' }}>
            {TABS.map((tab) => {
              const active = location.pathname === tab.key;
              const disabled = tab.needsResidence && locked;
              return (
                <button type="button" key={tab.key} onClick={() => go(tab)} disabled={disabled} aria-current={active ? 'page' : undefined}
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px 0', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11,
                    color: active ? 'var(--brand)' : 'var(--text-tertiary)', opacity: disabled ? 0.4 : 1, background: 'none', border: 'none', font: 'inherit',
                  }}>
                  <div style={{ fontSize: 18 }}>{tab.icon}</div>
                  {tab.short}
                </button>
              );
            })}
          </div>
        </Footer>
      )}
    </Layout>
  );
}
