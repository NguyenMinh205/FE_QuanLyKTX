import { Layout, Dropdown, Avatar, Menu, Grid } from 'antd';
import {
  HomeOutlined, BankOutlined, FileTextOutlined,
  DollarOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const TABS = [
  { key: '/portal/home',         icon: <HomeOutlined />,     label: 'Trang chủ' },
  { key: '/portal/my-residence', icon: <BankOutlined />,     label: 'Chỗ ở' },
  { key: '/portal/my-contracts', icon: <FileTextOutlined />, label: 'Hợp đồng' },
  { key: '/portal/my-invoices',  icon: <DollarOutlined />,   label: 'Hóa đơn' },
  { key: '/portal/profile',      icon: <UserOutlined />,     label: 'Cá nhân' },
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
        background: '#fff', padding: '0 16px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ fontWeight: 600 }}>🏢 KTX ABC</div>

        {!isMobile && (
          <Menu mode="horizontal" selectedKeys={[location.pathname]} items={TABS}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, justifyContent: 'center', borderBottom: 'none' }} />
        )}

        <Dropdown
          menu={{ items: [
            { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
          ] }}
        >
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} />
            {!isMobile && <span>{user?.fullName}</span>}
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: isMobile ? 12 : 24, paddingBottom: isMobile ? 72 : 24 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
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
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px 0', cursor: 'pointer',
                    color: active ? '#1677FF' : '#8C8C8C', fontSize: 11,
                  }}>
                  <div style={{ fontSize: 18 }}>{tab.icon}</div>
                  {tab.label}
                </div>
              );
            })}
          </div>
        </Footer>
      )}
    </Layout>
  );
}
