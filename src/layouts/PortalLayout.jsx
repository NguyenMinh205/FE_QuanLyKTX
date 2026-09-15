import { Layout, Dropdown, Avatar, Menu, Grid, Button, Typography, Tooltip } from 'antd';
import {
  HomeOutlined, BankOutlined, DollarOutlined, MailOutlined, ShoppingOutlined, ShoppingCartOutlined,
  UserOutlined, LogoutOutlined, LockOutlined, ProfileOutlined, DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { portalApi } from '../features/portal/api/portal.api';
import BrandLogo from '../components/BrandLogo';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

/** Menu chuẩn cổng sinh viên — docs/08 mục 3.2. `short` dùng cho tab bar điện thoại, `needsResidence` mờ khi chưa có chỗ ở */
const TABS = [
  { key: '/portal/home',         icon: <HomeOutlined />,     label: 'Trang chủ',        short: 'Trang chủ' },
  { key: '/portal/my-residence', icon: <BankOutlined />,     label: 'Chỗ ở & hợp đồng', short: 'Chỗ ở', needsResidence: true },
  { key: '/portal/my-invoices',  icon: <DollarOutlined />,   label: 'Hóa đơn',          short: 'Hóa đơn' },
  { key: '/portal/my-requests',  icon: <MailOutlined />,     label: 'Yêu cầu',          short: 'Yêu cầu' },
  { key: '/portal/shop',         icon: <ShoppingOutlined />, label: 'Mua sắm',          short: 'Mua sắm', needsResidence: true },
];
const NO_RESIDENCE_HINT = 'Mở sau khi bạn có chỗ ở tại ký túc xá';

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Sinh viên chưa có hợp đồng active: "Chỗ ở & hợp đồng", "Mua sắm", giỏ hàng hiển thị mờ (docs/08 mục 3.2).
  // Chưa tải xong hoặc lỗi thì không khóa gì — backend vẫn tự chặn.
  const { data: residence } = useApi(() => portalApi.getMyResidence(), [location.pathname === '/portal/home']);
  const locked = residence?.hasResidence === false;
  const roomText = residence?.contract?.bedCode ? `Phòng ${residence.contract.bedCode.split('-')[0]}` : null;

  const go = (tab) => {
    if (tab.needsResidence && locked) return;
    navigate(tab.key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <Header style={{
        background: '#fff', padding: '0 24px', display: 'flex', gap: 16, height: 64,
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }} onClick={() => navigate('/portal/home')}>
          <BrandLogo size={36} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>KÝ TÚC XÁ</div>
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
          {/* Số món trong giỏ bổ sung cùng màn Mua sắm (SCR-67) */}
          <Tooltip title={locked ? NO_RESIDENCE_HINT : 'Giỏ hàng'}>
            <Button type="text" icon={<ShoppingCartOutlined />} disabled={locked} onClick={() => navigate('/portal/shop')} aria-label="Giỏ hàng" />
          </Tooltip>
          <Dropdown
            menu={{ items: [
              { key: 'orders', icon: <ShoppingOutlined />, label: 'Đơn hàng của tôi', onClick: () => navigate('/portal/my-orders') },
              { key: 'profile', icon: <ProfileOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/portal/profile') },
              { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/portal/change-password') },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
            ] }}
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#1677FF' }} icon={<UserOutlined />} />
              {!isMobile && (
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{user?.fullName}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{roomText ?? (locked ? 'Chưa có chỗ ở' : 'Sinh viên')}</Text>
                </div>
              )}
              {!isMobile && <DownOutlined style={{ fontSize: 10, color: '#8C8C8C' }} />}
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: isMobile ? 12 : 24, paddingBottom: isMobile ? 72 : 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      {isMobile && (
        <Footer style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: 0,
          background: '#fff', borderTop: '1px solid #f0f0f0', zIndex: 20,
        }}>
          <div style={{ display: 'flex' }}>
            {TABS.map((tab) => {
              const active = location.pathname === tab.key;
              const disabled = tab.needsResidence && locked;
              return (
                <div key={tab.key} onClick={() => go(tab)} aria-disabled={disabled}
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px 0', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11,
                    color: active ? '#1677FF' : '#8C8C8C', opacity: disabled ? 0.4 : 1,
                  }}>
                  <div style={{ fontSize: 18 }}>{tab.icon}</div>
                  {tab.short}
                </div>
              );
            })}
          </div>
        </Footer>
      )}
    </Layout>
  );
}
