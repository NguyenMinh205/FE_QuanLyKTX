import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Grid, Drawer, Button, Badge } from 'antd';
import {
  DashboardOutlined, TeamOutlined, HomeOutlined, FileTextOutlined,
  MailOutlined, DollarOutlined, SettingOutlined, ShoppingOutlined,
  UserOutlined, LogoutOutlined, MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABEL } from '../constants/roles';
import { useApi } from '../hooks/useApi';
import { dashboardApi } from '../features/dashboard/api/dashboard.api';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

/** Nhãn menu kèm số đếm việc cần xử lý — cơ chế nhắc việc duy nhất của v1 (docs/08 mục 3.1) */
const withBadge = (label, count) => (count
  ? <span style={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
      {label}<Badge count={count} size="small" style={{ boxShadow: 'none' }} />
    </span>
  : label);

/** Menu chuẩn — nguồn duy nhất, KHÔNG chép sidebar từ các frame Stitch */
const buildMenu = (role, counts = {}) => {
  const items = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/students',  icon: <TeamOutlined />,      label: 'Sinh viên' },
    {
      key: 'rooms', icon: <HomeOutlined />, label: 'Cơ sở vật chất',
      children: [
        { key: '/admin/buildings',  label: 'Tòa nhà' },
        { key: '/admin/room-types', label: 'Loại phòng' },
        { key: '/admin/rooms',      label: 'Phòng' },
      ],
    },
    {
      key: 'residency', icon: <FileTextOutlined />, label: 'Lưu trú & hợp đồng',
      children: [
        { key: '/admin/applications', label: withBadge('Duyệt đơn đăng ký', counts.applications) },
        { key: '/admin/contracts',    label: 'Hợp đồng' },
      ],
    },
    { key: '/admin/requests', icon: <MailOutlined />, label: withBadge('Yêu cầu', counts.requests) },
    {
      key: 'fees', icon: <DollarOutlined />, label: 'Tài chính',
      children: [
        { key: '/admin/utility-readings', label: 'Chỉ số điện nước' },
        { key: '/admin/invoices',         label: 'Hóa đơn' },
        { key: '/admin/payments',         label: 'Thanh toán' },
      ],
    },
    { key: '/admin/supplies', icon: <ShoppingOutlined />, label: withBadge('Nhu yếu phẩm', counts.supplies) },
  ];

  if (role === ROLES.ADMIN) {
    items.push({
      key: 'system', icon: <SettingOutlined />, label: 'Hệ thống',
      children: [
        { key: '/admin/users',     label: 'Tài khoản' },
        { key: '/admin/fee-types', label: 'Danh mục loại phí' },
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

  const { data: summary } = useApi(() => dashboardApi.getSummary(), []);
  const menuItems = buildMenu(user?.role, {
    applications: summary?.pendingApplications,
    requests: (summary?.pendingRequests?.renewal ?? 0) + (summary?.pendingRequests?.checkout ?? 0),
    supplies: summary?.supplyOrdersReady,
  });

  // Trang chi tiết (VD /admin/invoices/:id) vẫn sáng mục cha
  const selectedKey = location.pathname.split('/').slice(0, 3).join('/');

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
      selectedKeys={[selectedKey]}
      defaultOpenKeys={['rooms', 'residency', 'fees']}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderInlineEnd: 0 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider width={240} style={{ overflow: 'auto', position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{
            height: 64, display: 'flex', alignItems: 'center',
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
                  onClick: () => navigate('/admin/change-password') },
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
          <div style={{ background: '#fff', padding: isMobile ? 16 : 24, borderRadius: 8, minHeight: 400 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
