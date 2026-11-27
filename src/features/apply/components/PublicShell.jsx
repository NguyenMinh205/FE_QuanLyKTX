import { useState } from 'react';
import { Button, Col, Divider, Drawer, Grid, Row, Typography } from 'antd';
import {
  PhoneOutlined, MailOutlined, ClockCircleOutlined, EnvironmentOutlined, MenuOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { APP_VERSION, SUPPORT_CONTACT } from '../../../constants/app';
import BrandLogo from '../../../components/BrandLogo';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const NAV_LINKS = [
  { to: '/', label: 'Thông tin & Bảng giá' },
  { to: '/apply', label: 'Đăng ký KTX' },
  { to: '/apply/status', label: 'Tra cứu đơn' },
];

const CAMPUS_FOOTER_ITEMS = [
  { name: 'Nhà A14 (5 tầng · 20 phòng)', address: 'Tầng 1: Văn phòng Trung tâm KTX · Phòng Chất lượng cao & Tiêu chuẩn (>30m²)' },
  { name: 'Nhà A15 (5 tầng · 20 phòng)', address: 'Khu nội trú sinh viên — Phòng Chất lượng cao & Tiêu chuẩn (>30m²)' },
  { name: 'Địa chỉ Cơ sở 1', address: 'Ngõ 296 / Số 298 Đường Cầu Diễn, P. Tây Tựu, TP. Hà Nội' },
];

/**
 * Khung Cổng thông tin KTX công khai (chuẩn Mobile-first):
 * - Mobile (<768px): Header dính 1 hàng gọn 58px (Logo + Đăng nhập + Drawer điều hướng & thông tin liên hệ)
 * - Tablet/Desktop (>=768px): Thanh tiện ích 1 hàng (#153C88) + Thanh điều hướng trắng 1 hàng sắc nét
 * - Footer chuẩn đại học 4 cột trên nền xanh đậm (#0F294A)
 */
export default function PublicShell({ children, fullBleed = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isDesktopNav = Boolean(screens.md);
  const [menuOpen, setMenuOpen] = useState(false);

  const goMobile = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--layout-bg)' }}>
      {/* Tầng 1: Thanh tiện ích trên cùng — chỉ hiện từ Tablet trở lên để giữ màn hình mobile thoáng */}
      {isDesktopNav && (
        <div style={{ background: 'var(--brand-deep)', color: 'rgba(255,255,255,0.92)', fontSize: 12 }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '7px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                {screens.lg ? 'Trung tâm Hỗ trợ sinh viên — ĐH Công nghiệp Hà Nội' : 'Trung tâm Hỗ trợ SV HaUI'}
              </span>
              {screens.lg && (
                <span style={{ opacity: 0.78, whiteSpace: 'nowrap' }}>
                  <ClockCircleOutlined style={{ marginRight: 5 }} />
                  {SUPPORT_CONTACT.workingHours}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              <span className="mono" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                <PhoneOutlined style={{ marginRight: 5 }} />
                {SUPPORT_CONTACT.hotline}
              </span>
              <Link to="/admin/login" style={{ color: '#BFDBFE', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Cổng Ban quản lý →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tầng 2: Thanh điều hướng dính — luôn giữ đúng 1 hàng gọn trên cả Mobile, Tablet và Desktop */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--line)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: isDesktopNav ? 66 : 58,
          padding: isDesktopNav ? '0 20px' : '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit', flexShrink: 0 }}>
            <BrandLogo height={screens.lg ? 34 : (isDesktopNav ? 28 : 26)} />
          </Link>

          {isDesktopNav ? (
            <nav aria-label="Điều hướng công khai" style={{ display: 'flex', alignItems: 'center', gap: screens.lg ? 6 : 2 }}>
              {NAV_LINKS.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: screens.lg ? '8px 13px' : '7px 9px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      fontSize: screens.lg ? 13.5 : 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--brand-hover)' : 'var(--text-secondary)',
                      background: active ? 'var(--brand-soft)' : 'transparent',
                      transition: 'background-color 0.14s ease, color 0.14s ease',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Button type="primary" style={{ marginLeft: screens.lg ? 8 : 4 }} onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
            </nav>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Button type="primary" size="small" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button
                type="text"
                aria-label="Mở menu điều hướng"
                icon={<MenuOutlined style={{ fontSize: 18, color: 'var(--ink)' }} />}
                onClick={() => setMenuOpen(true)}
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer điều hướng (chuẩn Mobile-first) */}
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="right"
        size={290}
        title={<BrandLogo height={24} />}
        styles={{ body: { padding: '14px 16px' } }}
      >
        <div style={{ display: 'grid', gap: 6 }}>
          {NAV_LINKS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => goMobile(item.to)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: 14.5,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  background: active ? 'var(--brand-soft)' : 'transparent',
                  color: active ? 'var(--brand-hover)' : 'var(--ink)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <Divider style={{ margin: '14px 0' }} />

        <div style={{ display: 'grid', gap: 8 }}>
          <Button type="primary" block size="large" onClick={() => goMobile('/login')}>
            Đăng nhập Cổng Sinh viên
          </Button>
          <Button block onClick={() => goMobile('/admin/login')}>
            Cổng Ban quản lý →
          </Button>
        </div>

        <Divider style={{ margin: '16px 0 12px' }} />

        <div style={{ display: 'grid', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)' }}>
          <div><PhoneOutlined style={{ marginRight: 6, color: 'var(--brand)' }} />Hotline: <b className="mono">{SUPPORT_CONTACT.hotline}</b></div>
          <div><MailOutlined style={{ marginRight: 6, color: 'var(--brand)' }} />{SUPPORT_CONTACT.email}</div>
          <div><ClockCircleOutlined style={{ marginRight: 6, color: 'var(--brand)' }} />{SUPPORT_CONTACT.workingHours}</div>
        </div>
      </Drawer>

      <main style={{ flex: 1 }}>
        {fullBleed ? children : (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: isDesktopNav ? '26px 20px 44px' : '16px 14px 32px' }}>
            {children}
          </div>
        )}
      </main>

      {/* Footer chuẩn đại học 4 cột rõ ràng */}
      <footer style={{ background: 'var(--footer-bg)', color: '#CBD5E1', borderTop: '3px solid var(--brand)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isDesktopNav ? '38px 20px 28px' : '28px 16px 22px' }}>
          <Row gutter={[28, 24]}>
            <Col xs={24} md={12} lg={8}>
              <BrandLogo height={30} onDark />
              <div style={{ marginTop: 14, fontWeight: 600, fontSize: 14, color: '#FFFFFF' }}>
                Trung tâm Hỗ trợ sinh viên (SSC)
              </div>
              <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.65, color: '#94A3B8', maxWidth: 340 }}>
                Hệ thống quản lý nội trú Ký túc xá Cơ sở 1 (Nhà A14, A15) — ĐH Công nghiệp Hà Nội: tiếp nhận đăng ký, tự động xếp phòng ngay, thanh toán VietQR và hỗ trợ sinh viên.
              </div>
            </Col>

            <Col xs={24} md={12} lg={7}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#FFFFFF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ký túc xá Cơ sở 1 (A14, A15)
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {CAMPUS_FOOTER_ITEMS.map((c) => (
                  <div key={c.name} style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <div style={{ color: '#F1F5F9', fontWeight: 500 }}>
                      <EnvironmentOutlined style={{ marginRight: 6, color: '#60A5FA' }} />
                      {c.name}
                    </div>
                    <div style={{ color: '#94A3B8', paddingLeft: 19, fontSize: 12.5 }}>{c.address}</div>
                  </div>
                ))}
              </div>
            </Col>

            <Col xs={12} md={12} lg={4}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#FFFFFF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Liên kết nhanh
              </div>
              <div style={{ display: 'grid', gap: 9 }}>
                <Link to="/" className="haui-footer-link">Thông tin &amp; Bảng giá</Link>
                <Link to="/apply" className="haui-footer-link">Đăng ký ở KTX</Link>
                <Link to="/apply/status" className="haui-footer-link">Tra cứu tiến độ đơn</Link>
                <Link to="/login" className="haui-footer-link">Cổng Sinh viên</Link>
                <Link to="/admin/login" className="haui-footer-link">Cổng Ban quản lý</Link>
              </div>
            </Col>

            <Col xs={12} md={12} lg={5}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#FFFFFF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Liên hệ &amp; Hỗ trợ
              </div>
              <div style={{ display: 'grid', gap: 9, fontSize: 13 }}>
                <div>
                  <PhoneOutlined style={{ marginRight: 7, color: '#60A5FA' }} />
                  <span className="mono" style={{ color: '#FFFFFF', fontWeight: 600 }}>{SUPPORT_CONTACT.hotline}</span>
                </div>
                <div>
                  <MailOutlined style={{ marginRight: 7, color: '#60A5FA' }} />
                  <span>{SUPPORT_CONTACT.email}</span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: 12.5 }}>
                  <ClockCircleOutlined style={{ marginRight: 7, color: '#60A5FA' }} />
                  {SUPPORT_CONTACT.workingHours}
                </div>
                <div style={{ color: '#94A3B8', fontSize: 12.5, lineHeight: 1.5 }}>
                  {SUPPORT_CONTACT.office}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px' }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 12,
            color: '#94A3B8',
          }}>
            <span>© {new Date().getFullYear()} Trung tâm Hỗ trợ sinh viên — Trường Đại học Công nghiệp Hà Nội (HaUI)</span>
            <Text className="mono" style={{ color: '#94A3B8', fontSize: 12 }}>{APP_VERSION}</Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
