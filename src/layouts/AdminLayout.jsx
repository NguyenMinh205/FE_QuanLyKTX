import { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Grid, Drawer, Button, Badge, ConfigProvider, Typography } from 'antd';
import {
  DashboardOutlined, TeamOutlined, BankOutlined, FileTextOutlined, MailOutlined,
  DollarOutlined, SettingOutlined, ShoppingOutlined, UserOutlined, LogoutOutlined,
  MenuOutlined, LockOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABEL } from '../constants/roles';
import { useApi } from '../hooks/useApi';
import { dashboardApi } from '../features/dashboard/api/dashboard.api';
import BrandLogo from '../components/BrandLogo';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

/** Nhãn menu kèm số đếm việc cần xử lý — cơ chế nhắc việc duy nhất của v1 (docs/08 mục 3.1) */
const withBadge = (label, count) => (count
  ? (
    <span style={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      {label}<Badge count={count} size="small" style={{ boxShadow: 'none' }} />
    </span>
  )
  : label);

/** Menu chuẩn — nguồn duy nhất, KHÔNG chép sidebar từ các frame thiết kế */
const buildMenu = (role, counts = {}) => {
  const items = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/students', icon: <TeamOutlined />, label: 'Sinh viên' },
    {
      key: 'rooms', icon: <BankOutlined />, label: 'Cơ sở vật chất',
      children: [
        { key: '/admin/buildings', label: 'Tòa nhà' },
        { key: '/admin/room-types', label: 'Loại phòng' },
        { key: '/admin/rooms', label: 'Phòng' },
      ],
    },
    {
      key: 'residency', icon: <FileTextOutlined />, label: 'Lưu trú & hợp đồng',
      children: [
        { key: '/admin/applications', label: withBadge('Duyệt đơn đăng ký', counts.applications) },
        { key: '/admin/contracts', label: 'Hợp đồng' },
      ],
    },
    { key: '/admin/requests', icon: <MailOutlined />, label: withBadge('Yêu cầu', counts.requests) },
    {
      key: 'fees', icon: <DollarOutlined />, label: 'Tài chính',
      children: [
        { key: '/admin/utility-readings', label: 'Chỉ số điện nước' },
        { key: '/admin/invoices', label: 'Hóa đơn' },
        { key: '/admin/payments', label: 'Thanh toán' },
      ],
    },
    { key: '/admin/supplies', icon: <ShoppingOutlined />, label: withBadge('Nhu yếu phẩm', counts.supplies) },
  ];

  if (role === ROLES.ADMIN) {
    items.push({
      key: 'system', icon: <SettingOutlined />, label: 'Hệ thống',
      children: [
        { key: '/admin/users', label: 'Tài khoản' },
        { key: '/admin/fee-types', label: 'Danh mục loại phí' },
      ],
    });
  }
  return items;
};

/** Mục menu cha chứa đường dẫn đang mở — để submenu tự bung đúng chỗ */
const parentKeyOf = (items, path) =>
  items.find((it) => it.children?.some((c) => c.key === path))?.key;

const MENU_THEME = {
  components: {
    Menu: {
      itemSelectedBg: '#E6F4FF',
      subMenuItemBg: '#FFFFFF',
      itemSelectedColor: '#1677FF',
      activeBarWidth: 3,
      itemMarginInline: 8,
      itemBorderRadius: 6,
    },
  },
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
    requests: summary?.pendingRequests?.total,
    supplies: summary?.supplyOrdersReady,
  });

  // Trang chi tiết (VD /admin/invoices/:id) vẫn sáng mục cha
  const selectedKey = location.pathname.split('/').slice(0, 3).join('/');
  const openKey = parentKeyOf(menuItems, selectedKey);

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menu = (
    <ConfigProvider theme={MENU_THEME}>
      <Menu
        key={openKey || 'root'}
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKey ? [openKey] : []}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderInlineEnd: 0, paddingBlock: 8 }}
      />
    </ConfigProvider>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff', height: 72, lineHeight: 'normal', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {isMobile && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />}
          <BrandLogo size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3, whiteSpace: 'nowrap' }}>QUẢN LÝ KÝ TÚC XÁ</div>
            {!isMobile && <Text type="secondary" style={{ fontSize: 12 }}>Hệ thống Quản lý Ký túc xá Đại học</Text>}
          </div>
        </div>

        <Dropdown
          menu={{
            items: [
              { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/admin/change-password') },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
            ],
          }}
        >
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar icon={<UserOutlined />} style={{ background: '#E6F4FF', color: '#1677FF' }} />
            {!isMobile && (
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 500 }}>{user?.fullName}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{ROLE_LABEL[user?.role]}</Text>
              </div>
            )}
          </div>
        </Dropdown>
      </Header>

      <Layout>
        {!isMobile && (
          <Sider
            width={240}
            theme="light"
            style={{ borderRight: '1px solid #f0f0f0', overflow: 'auto', position: 'sticky', top: 72, height: 'calc(100vh - 72px)' }}
          >
            {menu}
          </Sider>
        )}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          size={260}
          styles={{ body: { padding: 0 } }}
          title="Menu"
        >
          {menu}
        </Drawer>

        <Content style={{ padding: isMobile ? 16 : 24, background: '#F5F5F5', minWidth: 0 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
