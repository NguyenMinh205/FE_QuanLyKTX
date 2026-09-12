import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Breadcrumb, Grid, Drawer, Button } from 'antd';
import {
  DashboardOutlined, TeamOutlined, HomeOutlined, FileTextOutlined,
  MailOutlined, DollarOutlined, BarChartOutlined, SettingOutlined,
  UserOutlined, LogoutOutlined, MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABEL } from '../../constants/roles';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const buildMenu = (role) => {
  const items = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/students',  icon: <TeamOutlined />,      label: 'Sinh viên' },
    {
      key: 'facilities', icon: <HomeOutlined />, label: 'Cơ sở vật chất',
      children: [
        { key: '/admin/buildings', label: 'Tòa nhà' },
        { key: '/admin/rooms',     label: 'Phòng' },
        { key: '/admin/beds/available', label: 'Giường trống' },
      ],
    },
    {
      key: 'contracts', icon: <FileTextOutlined />, label: 'Hợp đồng',
      children: [
        { key: '/admin/contracts',          label: 'Tất cả hợp đồng' },
        { key: '/admin/contracts/pending',  label: 'Đơn chờ duyệt' },
        { key: '/admin/contracts/expiring', label: 'Sắp hết hạn' },
      ],
    },
    { key: '/admin/requests', icon: <MailOutlined />, label: 'Yêu cầu' },
    {
      key: 'finance', icon: <DollarOutlined />, label: 'Tài chính',
      children: [
        { key: '/admin/invoices',         label: 'Hóa đơn' },
        { key: '/admin/utility-readings', label: 'Chỉ số điện nước' },
        { key: '/admin/payments',         label: 'Thanh toán' },
      ],
    },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
  ];

  if (role === ROLES.ADMIN) {
    items.push({
      key: 'system', icon: <SettingOutlined />, label: 'Hệ thống',
      children: [
        { key: '/admin/users',     label: 'Tài khoản' },
        { key: '/admin/fee-types', label: 'Danh mục phí' },
        { key: '/admin/settings',  label: 'Cấu hình' },
      ],
    });
  }
  return items;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = buildMenu(user?.role);

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menu = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={['facilities', 'contracts', 'finance']}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderInlineEnd: 0 }}
    />
  );

  // Breadcrumb đơn giản dựng từ nhãn menu
  const currentLabel = (() => {
    for (const item of menuItems) {
      if (item.key === location.pathname) return item.label;
      const child = item.children?.find((c) => c.key === location.pathname);
      if (child) return `${item.label} / ${child.label}`;
    }
    return '';
  })();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider width={240} style={{ overflow: 'auto', position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{
            height: 64, display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 16px', color: '#fff', fontWeight: 600, fontSize: 15,
          }}>
            🏢 QUẢN LÝ KÝ TÚC XÁ
          </div>
          {menu}
        </Sider>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={240}
        styles={{ body: { padding: 0, background: '#001529' }, header: { display: 'none' } }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 16px', color: '#fff', fontWeight: 600 }}>
          🏢 QUẢN LÝ KÝ TÚC XÁ
        </div>
        {menu}
      </Drawer>

      <Layout>
        <Header style={{
          background: '#fff', padding: '0 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10,
        }}>
          {isMobile
            ? <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
            : <span />}

          <Dropdown
            menu={{
              items: [
                { key: 'password', icon: <UserOutlined />, label: 'Đổi mật khẩu',
                  onClick: () => navigate('/change-password') },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true,
                  onClick: handleLogout },
              ],
            }}
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.fullName}</span>
              <span style={{ color: '#8C8C8C', fontSize: 12 }}>({ROLE_LABEL[user?.role]})</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: isMobile ? 12 : 24, background: '#F5F5F5' }}>
          {currentLabel && (
            <Breadcrumb style={{ marginBottom: 16 }}
              items={[{ title: 'Trang chủ' }, ...currentLabel.split(' / ').map((t) => ({ title: t }))]} />
          )}
          <div style={{ background: '#fff', padding: isMobile ? 16 : 24, borderRadius: 8, minHeight: 400 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
