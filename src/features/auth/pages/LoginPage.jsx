import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Checkbox, Popover, Divider, Grid, App } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { safeRedirectPath } from '../../../routes/paths';
import { APP_VERSION, SUPPORT_CONTACT } from '../../../constants/app';
import BrandLogo from '../../../components/BrandLogo';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const STUDENT_DEMO = [
  ['SV đang ở (A14-101 · nợ ĐN)', 'sv001@dorm.local', 'Student@123'],
  ['SV sạch nợ (A15-101)', 'sv002@dorm.local', 'Student@123'],
  ['Cựu SV đã hoàn cọc (đăng ký lại)', 'sv003@dorm.local', 'Student@123'],
  ['SV chờ đóng phí (A14-205 · VietQR Test)', 'sv004@dorm.local', 'Student@123'],
  ['SV quá hạn phí (A15-305)', 'sv005@dorm.local', 'Student@123'],
  ['SV đổi MK lần đầu', '2026600051', '2026600051'],
];

const ADMIN_DEMO = [
  ['Admin (Hệ thống)', 'admin@dorm.local', 'Admin@123'],
  ['Manager (Trưởng ban KTX)', 'manager@dorm.local', 'Manager@123'],
  ['Staff (Cán bộ KTX)', 'staff@dorm.local', 'Staff@123'],
  ['Staff đổi MK lần đầu', 'doimk@dorm.local', 'Tam@12345'],
];

const STUDENT_POINTS = [
  'Theo dõi hợp đồng nội trú, số phòng và bạn cùng phòng',
  'Thanh toán tiền phòng & hóa đơn điện nước nhanh qua VietQR',
  'Mở mã QR Check-in nhận phòng và gửi yêu cầu sửa chữa trực tuyến',
];

const ADMIN_POINTS = [
  'Phân quyền chặt chẽ Admin, Trưởng ban KTX và Cán bộ quản sinh',
  'Hệ thống tự động xếp phòng từ tầng thấp lên cao ngay khi SV đăng ký',
  'Quản lý quỹ phòng Cơ sở 1 (A14, A15), đối soát thu chi và hoàn cọc minh bạch',
];

const SupportPopoverContent = () => (
  <div style={{ maxWidth: 280, fontSize: 13 }}>
    <Text strong style={{ display: 'block' }}>Hỗ trợ KTX HaUI</Text>
    <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>{SUPPORT_CONTACT.office}</Text>
    <div style={{ marginTop: 6 }}>Hotline: <Text strong className="mono">{SUPPORT_CONTACT.hotline}</Text></div>
    <Text type="secondary" style={{ fontSize: 12 }}>{SUPPORT_CONTACT.workingHours}</Text>
  </div>
);

/**
 * 2 Cổng Đăng nhập tách biệt hoàn toàn:
 *  - `/login` (`portal="student"`): Nền xanh nhẹ HaUI (#EFF6FF) sáng sang, dùng logo chính thức nguyên màu
 *  - `/admin/login` (`portal="admin"`): Nền slate nội bộ (#0F172A) tách biệt tuyệt đối
 */
export default function LoginPage({ portal = 'student' }) {
  const isAdmin = portal === 'admin';
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(user.role, location.state?.from)} replace />;
  }

  const demoList = isAdmin ? ADMIN_DEMO : STUDENT_DEMO;
  const highlights = isAdmin ? ADMIN_POINTS : STUDENT_POINTS;

  const handleSubmit = async ({ identifier, password, remember }) => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await login(identifier.trim(), password, remember, portal);
      if (loggedIn.mustChangePassword) message.warning('Vui lòng đổi mật khẩu để tiếp tục');
      else message.success('Đăng nhập thành công');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else {
        const code = getErrorCode(err);
        setError({
          message: getErrorMessage(err, 'Đăng nhập thất bại, vui lòng thử lại'),
          locked: code === 'ACCOUNT_LOCKED',
          wrongPortal: code === 'WRONG_LOGIN_PORTAL',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const switchPath = isAdmin ? '/login' : '/admin/login';
  const switchLabel = isAdmin ? 'Sang Cổng Sinh viên' : 'Sang Cổng Ban quản lý';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FFFFFF' }}>
      {screens.md && (
        <div
          style={{
            flex: '0 0 46%',
            backgroundColor: isAdmin ? '#0F172A' : '#EFF6FF',
            color: isAdmin ? '#FFFFFF' : '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '42px 50px',
            borderRight: `1px solid ${isAdmin ? '#1E293B' : '#DBEAFE'}`,
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
            <BrandLogo height={34} onDark={isAdmin} />
          </Link>

          <div style={{ maxWidth: 430 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '4px 10px',
              borderRadius: 6,
              background: isAdmin ? 'rgba(59, 130, 246, 0.16)' : '#FFFFFF',
              border: `1px solid ${isAdmin ? 'rgba(96, 165, 250, 0.35)' : '#BFDBFE'}`,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isAdmin ? '#93C5FD' : '#1D4ED8',
              marginBottom: 16,
            }}>
              {isAdmin ? 'Hệ thống quản trị nội bộ' : 'Cổng dịch vụ sinh viên nội trú'}
            </div>

            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 14 }}>
              {isAdmin
                ? 'Vận hành & điều phối Ký túc xá Cơ sở 1 (A14, A15)'
                : 'Quản lý chỗ ở, thanh toán VietQR và thủ tục trực tuyến'}
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
              {highlights.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isAdmin ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    border: `1px solid ${isAdmin ? 'rgba(255, 255, 255, 0.09)' : '#DCE7F7'}`,
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: isAdmin ? '#E2E8F0' : '#334155',
                  }}
                >
                  <CheckCircleOutlined style={{ color: isAdmin ? '#60A5FA' : '#2563EB', marginTop: 3, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: 12,
            color: isAdmin ? '#94A3B8' : '#64748B',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${isAdmin ? 'rgba(255,255,255,0.1)' : '#DBEAFE'}`,
          }}>
            <span>© {new Date().getFullYear()} Trung tâm Hỗ trợ sinh viên HaUI</span>
            <span className="mono">{APP_VERSION}</span>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 24px', background: '#FFFFFF' }}>
        <div style={{ width: '100%', maxWidth: 390 }}>
          {!screens.md && (
            <div style={{ marginBottom: 24 }}>
              <Link to="/"><BrandLogo height={32} /></Link>
            </div>
          )}

          <Title level={2} style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {isAdmin ? 'Đăng nhập Ban quản lý' : 'Đăng nhập Sinh viên'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13.5 }}>
            {isAdmin
              ? 'Dành cho Quản trị viên, Trưởng ban KTX và Cán bộ trực tòa.'
              : 'Dùng mã sinh viên (10 chữ số) hoặc email đã đăng ký KTX (TK = MK = MSSV).'}
          </Text>

          {error && (
            <Alert
              type="error" showIcon style={{ marginTop: 18 }}
              title={error.message}
              description={error.locked ? `Liên hệ ${SUPPORT_CONTACT.office} để được mở khóa.` : undefined}
              action={error.wrongPortal && (
                <Button size="small" onClick={() => navigate(switchPath)}>{switchLabel}</Button>
              )}
            />
          )}

          <Form
            form={form} layout="vertical" size="large" initialValues={{ identifier: '', password: '', remember: true }}
            onFinish={handleSubmit} onValuesChange={() => error && setError(null)}
            autoComplete="off"
            style={{ marginTop: 22 }}
          >
            <Form.Item
              name="identifier"
              label={isAdmin ? 'Email cán bộ' : 'Mã sinh viên hoặc Email'}
              rules={[{ required: true, whitespace: true, message: isAdmin ? 'Vui lòng nhập email cán bộ' : 'Vui lòng nhập MSSV hoặc email' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder={isAdmin ? 'manager@dorm.local' : '2024600001 hoặc sv001@dorm.local'}
                autoComplete="off"
                autoFocus
              />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="Nhập mật khẩu" autoComplete="new-password" />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Popover trigger="click" placement="bottomRight" content={<SupportPopoverContent />}>
                <a style={{ fontSize: 13 }}>Cần trợ giúp?</a>
              </Popover>
            </div>

            <Button type="primary" htmlType="submit" block loading={loading}>
              {isAdmin ? 'Đăng nhập Quản trị' : 'Đăng nhập Cổng Sinh viên'}
            </Button>
          </Form>

          {!isAdmin && (
            <>
              <Divider style={{ margin: '18px 0 14px', fontSize: 12 }}><Text type="secondary">Chưa từng ở KTX?</Text></Divider>
              <Button block size="large" onClick={() => navigate('/apply')}>
                Đăng ký ở ký túc xá
              </Button>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18, fontSize: 13 }}>
            <Link to="/">Thông tin &amp; Bảng giá</Link>
            {!isAdmin && (
              <>
                <Text type="secondary">·</Text>
                <Link to="/apply/status">Tra cứu đơn</Link>
              </>
            )}
            {import.meta.env.DEV && (
              <>
                <Text type="secondary">·</Text>
                <Popover
                  open={demoOpen}
                  onOpenChange={setDemoOpen}
                  trigger="click"
                  placement="top"
                  title={isAdmin ? 'Tài khoản Cán bộ mẫu (dev)' : 'Tài khoản Sinh viên mẫu (dev)'}
                  content={(
                    <div style={{ display: 'grid', gap: 6, fontSize: 12, maxWidth: 310 }}>
                      {demoList.map(([label, identifier, password]) => (
                        <a
                          key={identifier}
                          onClick={() => { form.setFieldsValue({ identifier, password }); setDemoOpen(false); }}
                        >
                          <b>{label}:</b> <code className="mono">{identifier}</code>
                        </a>
                      ))}
                    </div>
                  )}
                >
                  <a><KeyOutlined /> Tài khoản mẫu</a>
                </Popover>
              </>
            )}
          </div>

          <Divider style={{ margin: '18px 0 12px' }} />
          <div style={{ textAlign: 'center', fontSize: 13 }}>
            <Text type="secondary">{isAdmin ? 'Bạn là sinh viên? ' : 'Cán bộ quản lý? '}</Text>
            <Link to={switchPath} style={{ fontWeight: 600 }}>
              {isAdmin ? 'Đăng nhập Cổng Sinh viên' : 'Đăng nhập Ban quản lý'} <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
