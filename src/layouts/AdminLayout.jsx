import { useState } from 'react';
import { Layout, Menu, Dropdown, Grid, Drawer, Button, ConfigProvider, Typography } from 'antd';
import {
  DashboardOutlined, TeamOutlined, BankOutlined, AppstoreOutlined, FileTextOutlined,
  AuditOutlined, ThunderboltOutlined, FileDoneOutlined, WalletOutlined, SettingOutlined,
  LogoutOutlined, MenuOutlined, LockOutlined, CalendarOutlined, ToolOutlined,
  NotificationOutlined, DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, OPS_ROLES, ROLE_LABEL } from '../constants/roles';
import { useApi } from '../hooks/useApi';
import { dashboardApi } from '../features/dashboard/api/dashboard.api';
import BrandLogo from '../components/BrandLogo';
import ErrorBoundary from '../components/ErrorBoundary';
import { initialsOf } from '../features/applications/utils/applicationView';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const withCount = (label, count, urgent = false) => (count
  ? (
    <span style={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span
        className="mono"
        style={{
          fontSize: 11,
          fontWeight: 600,
          lineHeight: '18px',
          padding: '0 6px',
          borderRadius: 5,
          flexShrink: 0,
          background: urgent ? '#FEF2F2' : '#EFF6FF',
          color: urgent ? '#DC2626' : '#1D4ED8',
          border: `1px solid ${urgent ? '#FECACA' : '#BFDBFE'}`,
        }}
      >
        {count}
      </span>
    </span>
  )
  : label);

const buildMenu = (role, counts = {}) => {
  if (role === ROLES.ADMIN) {
    return [
      {
        type: 'group',
        label: 'Quản trị hệ thống',
        children: [
          { key: '/admin/users', icon: <SettingOutlined />, label: 'Quản lý tài khoản' },
        ],
      },
    ];
  }

  return [
    {
      type: 'group',
      label: 'Tổng quan',
      children: [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      ],
    },
    {
      type: 'group',
      label: 'Tuyển sinh & Lưu trú',
      children: [
        { key: '/admin/periods', icon: <CalendarOutlined />, label: 'Đợt đăng ký' },
        { key: '/admin/applications', icon: <AuditOutlined />, label: withCount('Duyệt đơn KTX', counts.applications, true) },
        { key: '/admin/contracts', icon: <FileTextOutlined />, label: withCount('Hợp đồng KTX', counts.overduePayments, true) },
      ],
    },
    {
      type: 'group',
      label: 'Quản lý & Hỗ trợ',
      children: [
        { key: '/admin/students', icon: <TeamOutlined />, label: 'Sinh viên' },
        { key: '/admin/buildings', icon: <BankOutlined />, label: 'Tòa nhà (3 Cơ sở)' },
        { key: '/admin/rooms', icon: <AppstoreOutlined />, label: 'Phòng ở' },
        { key: '/admin/requests', icon: <ToolOutlined />, label: withCount('Phiếu yêu cầu SV', counts.requests, false) },
        { key: '/admin/notifications', icon: <NotificationOutlined />, label: 'Bảng tin KTX' },
      ],
    },
    {
      type: 'group',
      label: 'Tài chính',
      children: [
        { key: '/admin/utility-readings', icon: <ThunderboltOutlined />, label: 'Chỉ số điện nước' },
        { key: '/admin/invoices', icon: <FileDoneOutlined />, label: 'Hóa đơn' },
        { key: '/admin/payments', icon: <WalletOutlined />, label: 'Thu chi & Hoàn cọc' },
      ],
    },
  ];
};

const MENU_THEME = {
  components: {
    Menu: {
      itemSelectedBg: 'var(--brand-soft)',
      itemSelectedColor: 'var(--brand-hover)',
      itemHoverBg: '#F8FAFC',
      itemMarginInline: 10,
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

  const canLoadSummary = OPS_ROLES.includes(user?.role) && !user?.mustChangePassword;
  const { data: summary } = useApi(
    () => (canLoadSummary ? dashboardApi.getSummary() : Promise.resolve({ data: { data: null } })),
    [canLoadSummary, location.pathname],
  );

  const menuItems = buildMenu(user?.role, {
    applications: summary?.pendingApplications,
    overduePayments: summary?.overduePaymentContracts,
    requests: summary?.pendingRequests,
  });

  const selectedKey = location.pathname.split('/').slice(0, 3).join('/');

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const menu = (
    <ConfigProvider theme={MENU_THEME}>
      <Menu
        className="admin-sidebar-menu"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderInlineEnd: 0, paddingBlock: 10 }}
      />
    </ConfigProvider>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--layout-bg)' }}>
      <Header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#FFFFFF',
        height: 62,
        lineHeight: 'normal',
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderBottom: '1px solid var(--line)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {isMobile && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />}
          <BrandLogo height={isMobile ? 26 : 30} />
          {!isMobile && (
            <>
              <span style={{ width: 1, height: 22, background: 'var(--line-strong)' }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--brand-deep)', whiteSpace: 'nowrap' }}>
                Quản trị Ký túc xá
              </span>
            </>
          )}
        </div>

        <Dropdown
          trigger={['hover', 'click']}
          menu={{
            items: [
              { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/admin/change-password') },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
            ],
          }}
        >
          <button
            type="button"
            aria-label="Tài khoản"
            style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', padding: '4px 6px', borderRadius: 6,
              fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
            }}
          >
            <span className="haui-avatar-box">
              {initialsOf(user?.fullName)}
            </span>
            {!isMobile && (
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{user?.fullName}</div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>{ROLE_LABEL[user?.role]}</Text>
              </div>
            )}
            {!isMobile && <DownOutlined style={{ fontSize: 10, color: 'var(--text-tertiary)' }} />}
          </button>
        </Dropdown>
      </Header>

      <Layout style={{ background: 'var(--layout-bg)' }}>
        {!isMobile && (
          <Sider
            width={254}
            theme="light"
            style={{ borderRight: '1px solid var(--line)', overflow: 'auto', position: 'sticky', top: 62, height: 'calc(100vh - 62px)' }}
          >
            {menu}
          </Sider>
        )}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          size={264}
          styles={{ body: { padding: 0 } }}
          title="Menu quản trị"
        >
          {menu}
        </Drawer>

        <Content style={{ padding: isMobile ? 14 : '22px 24px 36px', background: 'var(--layout-bg)', minWidth: 0 }}>
          <div style={{ maxWidth: 1360, margin: '0 auto' }}>
            <ErrorBoundary key={location.pathname}><Outlet /></ErrorBoundary>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
