import { Layout, Dropdown, Avatar, Menu, Grid, Button } from 'antd';
import {
  HomeOutlined, BankOutlined, DollarOutlined, MailOutlined, ShoppingOutlined, ShoppingCartOutlined,
  UserOutlined, LogoutOutlined, LockOutlined, ProfileOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

/** Menu chuẩn cổng sinh viên — docs/08 mục 3.2. `short` dùng cho tab bar điện thoại */
const TABS = [
  { key: '/portal/home',         icon: <HomeOutlined />,     label: 'Trang chủ',        short: 'Trang chủ' },
  { key: '/portal/my-residence', icon: <BankOutlined />,     label: 'Chỗ ở & hợp đồng', short: 'Chỗ ở' },
  { key: '/portal/my-invoices',  icon: <DollarOutlined />,   label: 'Hóa đơn',          short: 'Hóa đơn' },
  { key: '/portal/my-requests',  icon: <MailOutlined />,     label: 'Yêu cầu',          short: 'Yêu cầu' },
  { key: '/portal/shop',         icon: <ShoppingOutlined />, label: 'Mua sắm',          short: 'Mua sắm' },
];

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <Header style={{
        background: '#fff', padding: '0 24px', display: 'flex', gap: 16,
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => navigate('/portal/home')}>
          🏢 KTX
        </div>

        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={TABS.map(({ key, icon, label }) => ({ key, icon, label }))}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, justifyContent: 'center', borderBottom: 'none', minWidth: 0 }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Số món trong giỏ bổ sung cùng màn Mua sắm (SCR-67) */}
          <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => navigate('/portal/shop')} aria-label="Giỏ hàng" />
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
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile && <span style={{ whiteSpace: 'nowrap' }}>{user?.fullName}</span>}
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
              return (
                <div key={tab.key} onClick={() => navigate(tab.key)}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 0', cursor: 'pointer', color: active ? '#1677FF' : '#8C8C8C', fontSize: 11 }}>
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
