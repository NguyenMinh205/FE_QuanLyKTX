import { Layout, Dropdown, Grid, Typography, Tooltip } from 'antd';
import {
  HomeOutlined, BankOutlined, DollarOutlined, ToolOutlined,
  LogoutOutlined, LockOutlined, ProfileOutlined, DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { portalApi } from '../features/portal/api/portal.api';
import { APP_VERSION, SUPPORT_CONTACT } from '../constants/app';
import BrandLogo from '../components/BrandLogo';
import ErrorBoundary from '../components/ErrorBoundary';
import { roomLabelOf } from '../features/rooms/utils/roomStatus';
import { initialsOf } from '../features/applications/utils/applicationView';
import RoomInvoiceBell from '../features/portal/components/RoomInvoiceBell';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const TABS = [
  { key: '/portal/home',         icon: <HomeOutlined />,   label: 'Trang chủ',  short: 'Trang chủ' },
  { key: '/portal/my-residence', icon: <BankOutlined />,   label: 'Chỗ ở & HĐ', short: 'Chỗ ở',   needsContract: true },
  { key: '/portal/my-invoices',  icon: <DollarOutlined />, label: 'Hóa đơn',    short: 'Hóa đơn' },
  { key: '/portal/requests',     icon: <ToolOutlined />,   label: 'Yêu cầu',    short: 'Yêu cầu', needsActive: true },
];

/** Cổng Sinh viên — Header dùng logo HaUI chính thức, Footer gọn đầy đủ thông tin hỗ trợ */
export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const canFetchPortal = !user?.mustChangePassword;
  const { data: residence } = useApi(
    () => (canFetchPortal ? portalApi.getMyResidence() : Promise.resolve({ data: { data: null } })),
    [canFetchPortal, location.pathname],
  );
  const hasActive = residence?.hasResidence === true;
  const hasAnyCurrent = hasActive || residence?.hasPendingPayment === true;
  const roomText = residence?.contract?.room ? `Phòng ${roomLabelOf(residence.contract.room)}` : null;

  const isLocked = (tab) => {
    if (tab.needsActive) return Boolean(residence && !hasActive);
    if (tab.needsContract) return Boolean(residence && !hasAnyCurrent);
    return false;
  };

  const lockHint = (tab) => (
    tab.needsActive
      ? 'Mở sau khi hoàn tất đóng phí và hợp đồng kích hoạt'
      : 'Mở sau khi đơn đăng ký KTX được duyệt'
  );

  const go = (tab) => {
    if (isLocked(tab)) return;
    navigate(tab.key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--layout-bg)' }}>
      <Header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#FFFFFF',
        padding: '0 20px',
        height: 64,
        lineHeight: 'normal',
        borderBottom: '1px solid var(--line)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          maxWidth: 1160,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/portal/home')}>
            <BrandLogo height={isMobile ? 26 : 30} />
            {screens.lg && (
              <>
                <span style={{ width: 1, height: 22, background: 'var(--line-strong)' }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--brand-deep)', whiteSpace: 'nowrap' }}>
                  Cổng Sinh viên
                </span>
              </>
            )}
          </div>

          {!isMobile && (
            <nav aria-label="Điều hướng cổng sinh viên" style={{ display: 'flex', alignItems: 'center', gap: 4, height: '100%' }}>
              {TABS.map((tab) => {
                const active = location.pathname === tab.key;
                const disabled = isLocked(tab);
                const btn = (
                  <button
                    key={tab.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => go(tab)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      height: '100%',
                      padding: '0 14px',
                      border: 'none',
                      borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}`,
                      marginBottom: -1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      whiteSpace: 'nowrap',
                      color: active ? 'var(--brand-hover)' : 'var(--text-secondary)',
                      background: 'transparent',
                      opacity: disabled ? 0.42 : 1,
                    }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
                return disabled ? <Tooltip key={tab.key} title={lockHint(tab)}>{btn}</Tooltip> : btn;
              })}
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {canFetchPortal && <RoomInvoiceBell refreshKey={location.pathname} />}
            <Dropdown
              trigger={['hover', 'click']}
              menu={{
                items: [
                  { key: 'profile', icon: <ProfileOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/portal/profile') },
                  { key: 'password', icon: <LockOutlined />, label: 'Đổi mật khẩu', onClick: () => navigate('/portal/change-password') },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
                ],
              }}
            >
              <button
                type="button"
                aria-label="Tài khoản"
                style={{
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
                  background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
                }}
              >
                <span className="haui-avatar-box">
                  {initialsOf(user?.fullName)}
                </span>
                {screens.lg && (
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{user?.fullName}</div>
                    <Text type="secondary" className={roomText ? 'mono' : undefined} style={{ fontSize: 11.5 }}>
                      {roomText ?? (residence?.hasPendingPayment ? 'Chờ đóng phí' : 'Cựu nội trú / Chưa xếp phòng')}
                    </Text>
                  </div>
                )}
                {screens.lg && <DownOutlined style={{ fontSize: 10, color: 'var(--text-tertiary)' }} />}
              </button>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content style={{ flex: 1, padding: isMobile ? 12 : '24px 20px 40px', paddingBottom: isMobile ? 76 : 40 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <ErrorBoundary key={location.pathname}><Outlet /></ErrorBoundary>
        </div>
      </Content>

      {!isMobile && (
        <Footer style={{ background: '#FFFFFF', borderTop: '1px solid var(--line)', padding: '18px 20px' }}>
          <div style={{
            maxWidth: 1160,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12.5,
            color: 'var(--text-secondary)',
          }}>
            <div>
              <Text strong style={{ fontSize: 12.5 }}>Trung tâm Hỗ trợ sinh viên HaUI</Text>
              <span style={{ marginLeft: 10 }}>Hotline <span className="mono">{SUPPORT_CONTACT.hotline}</span> · {SUPPORT_CONTACT.workingHours}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Link to="/" style={{ color: 'var(--text-secondary)' }}>Thông tin &amp; Bảng giá</Link>
              <Link to="/portal/profile" style={{ color: 'var(--text-secondary)' }}>Hồ sơ cá nhân</Link>
              <span className="mono" style={{ color: 'var(--text-tertiary)' }}>{APP_VERSION}</span>
            </div>
          </div>
        </Footer>
      )}

      {isMobile && (
        <Footer style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: 0,
          background: '#FFFFFF', borderTop: '1px solid var(--line)', zIndex: 20,
        }}>
          <div style={{ display: 'flex' }}>
            {TABS.map((tab) => {
              const active = location.pathname === tab.key;
              const disabled = isLocked(tab);
              return (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => go(tab)}
                  disabled={disabled}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px 0', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11,
                    color: active ? 'var(--brand-hover)' : 'var(--text-tertiary)', fontWeight: active ? 600 : 400,
                    opacity: disabled ? 0.4 : 1, background: 'none', border: 'none', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: 17 }}>{tab.icon}</div>
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
