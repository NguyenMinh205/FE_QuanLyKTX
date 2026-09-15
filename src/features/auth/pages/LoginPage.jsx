import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Checkbox, Popover, Collapse, Grid, App } from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { USE_MOCK } from '../../../lib/env';
import { safeRedirectPath } from '../../../routes/paths';
import { APP_VERSION, SUPPORT_CONTACT } from '../../../constants/app';
import BrandLogo from '../../../components/BrandLogo';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/** Tài khoản thử — CHỈ hiện khi chạy dev. Bản thật khớp dữ liệu seed trên DB Atlas chung của nhóm (BE: src/scripts/seed.js) */
const DEMO_ACCOUNTS = USE_MOCK
  ? [
    ['Quản trị', 'admin@dorm.local', 'Admin@123'],
    ['Nhân viên', 'staff@dorm.local', 'Staff@123'],
    ['Người xem', 'viewer@dorm.local', 'Viewer@123'],
    ['SV đang ở', 'sv001@dorm.local', 'Student@123'],
    ['SV chưa có chỗ', 'sv002@dorm.local', 'Student@123'],
    ['SV sắp hết hạn hợp đồng', 'sv004@dorm.local', 'Student@123'],
    ['SV bị từ chối đơn', 'sv005@dorm.local', 'Student@123'],
    ['SV có đơn chờ duyệt', 'sv006@dorm.local', 'Student@123'],
    ['Mật khẩu tạm (buộc đổi)', 'doimk@dorm.local', 'Tam@12345'],
  ]
  : [
    ['Quản trị', 'admin@dorm.local', 'Admin@123'],
    ['Nhân viên', 'staff1@dorm.local', 'Staff@123'],
    ['Người xem', 'viewer@dorm.local', 'Viewer@123'],
    ['Sinh viên nam', 'student.nam@dorm.local', 'Student@123'],
    ['Sinh viên nữ', 'student.nu@dorm.local', 'Student@123'],
  ];

const SupportInfo = () => (
  <Text type="secondary" style={{ fontSize: 13 }}>
    <Text strong>Hỗ trợ kỹ thuật:</Text> {SUPPORT_CONTACT.office} · Hotline:{' '}
    <Text strong>{SUPPORT_CONTACT.hotline}</Text>
  </Text>
);

/** SCR-01 Đăng nhập */
export default function LoginPage() {
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Đã đăng nhập (kể cả ngay sau khi bấm nút) → về trang cũ nếu cùng khu vực, không thì về trang chủ theo vai trò.
  // Tài khoản mật khẩu tạm sẽ bị RoleRoute chuyển tiếp sang trang đổi mật khẩu.
  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(user.role, location.state?.from)} replace />;
  }

  const handleSubmit = async ({ email, password, remember }) => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await login(email.trim(), password, remember);
      if (loggedIn.mustChangePassword) message.warning('Bạn đang dùng mật khẩu tạm, vui lòng đổi mật khẩu để tiếp tục');
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
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
      {/* ---------- Nửa trái: nhận diện ---------- */}
      {screens.md && (
        <div style={{
          flex: 1, background: '#1677FF', color: '#fff', position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center',
        }}>
          <BrandLogo size={96} variant="glass" />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1, marginTop: 28, lineHeight: 1.2 }}>QUẢN LÝ KÝ TÚC XÁ</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 10 }}>Hệ thống quản lý ký túc xá sinh viên</div>
          <div style={{
            marginTop: 36, padding: '6px 16px', borderRadius: 999, fontSize: 13,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52C41A' }} />
            Phiên bản {APP_VERSION} · Dành cho ban quản lý và sinh viên nội trú
          </div>
          <div style={{ position: 'absolute', bottom: 24, fontSize: 12, opacity: 0.7 }}>
            © {new Date().getFullYear()} Hệ thống Ký túc xá Đại học. Tất cả quyền được bảo lưu.
          </div>
        </div>
      )}

      {/* ---------- Nửa phải: biểu mẫu ---------- */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!screens.md && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <BrandLogo size={40} />
              <Text strong style={{ fontSize: 16 }}>QUẢN LÝ KÝ TÚC XÁ</Text>
            </div>
          )}

          <Title level={2} style={{ marginBottom: 4 }}>Đăng nhập</Title>
          <Text type="secondary">Sử dụng tài khoản do nhà trường cấp</Text>

          {error && (
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 24 }}
              title={error.message}
              description={error.locked ? `Liên hệ ${SUPPORT_CONTACT.office} để được mở khóa.` : undefined}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            size="large"
           
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            onValuesChange={() => error && setError(null)}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#8C8C8C' }} />} placeholder="email@dorm.local" autoComplete="username" autoFocus />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#8C8C8C' }} />} placeholder="••••••••" autoComplete="current-password" />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Popover trigger="click" placement="bottomRight" content={<div style={{ maxWidth: 280 }}><SupportInfo /></div>}>
                <a>Cần trợ giúp?</a>
              </Popover>
            </div>

            <Button type="primary" htmlType="submit" block loading={loading}>Đăng nhập</Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Quên mật khẩu? Liên hệ ban quản lý ký túc xá.</Text>
          </div>

          <div style={{
            marginTop: 32, padding: '12px 16px', borderRadius: 8, background: '#FAFAFA', border: '1px solid #F0F0F0',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <InfoCircleOutlined style={{ color: '#1677FF', marginTop: 3 }} />
            <SupportInfo />
          </div>

          {import.meta.env.DEV && (
            <Collapse
              ghost
              size="small"
              style={{ marginTop: 16 }}
              items={[{
                key: 'demo',
                label: <Text type="secondary" style={{ fontSize: 12 }}>Tài khoản thử ({USE_MOCK ? 'dữ liệu giả' : 'seed của backend'}) — chỉ hiện khi chạy dev</Text>,
                children: (
                  <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                    {DEMO_ACCOUNTS.map(([label, email, password]) => (
                      <a key={email} onClick={() => form.setFieldsValue({ email, password })}>
                        {label}: <code>{email}</code> / <code>{password}</code>
                      </a>
                    ))}
                  </div>
                ),
              }]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
