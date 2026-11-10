import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Checkbox, Popover, Collapse, Grid, App } from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined, FormOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
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
    ['SV đang ở', 'sv001@dorm.local', 'Student@123'],
    ['SV chưa có chỗ', 'sv002@dorm.local', 'Student@123'],
    ['SV sắp hết hạn hợp đồng', 'sv004@dorm.local', 'Student@123'],
    ['SV bị từ chối đơn', 'sv005@dorm.local', 'Student@123'],
    ['SV có đơn chờ duyệt', 'sv006@dorm.local', 'Student@123'],
    ['SV từng ở, có lịch sử', 'sv007@dorm.local', 'Student@123'],
    ['SV vừa được cấp tài khoản (MSSV)', '2021600005', '2021600005'],
    ['Mật khẩu tạm (buộc đổi)', 'doimk@dorm.local', 'Tam@12345'],
  ]
  : [
    ['Quản trị', 'admin@dorm.local', 'Admin@123'],
    ['Nhân viên', 'staff1@dorm.local', 'Staff@123'],
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
  const navigate = useNavigate();

  // Đã đăng nhập (kể cả ngay sau khi bấm nút) → về trang cũ nếu cùng khu vực, không thì về trang chủ theo vai trò.
  // Tài khoản mật khẩu tạm sẽ bị RoleRoute chuyển tiếp sang trang đổi mật khẩu.
  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(user.role, location.state?.from)} replace />;
  }

  const handleSubmit = async ({ identifier, password, remember }) => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await login(identifier.trim(), password, remember);
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
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
      {/* ---------- Nửa trái: nhận diện + những việc làm được trên hệ thống (đều là tính năng có thật) ---------- */}
      {screens.md && (
        <div style={{
          flex: 1, background: 'linear-gradient(160deg, #0E4FB0 0%, var(--brand) 70%)', color: '#fff', position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px',
        }}>
          <div style={{ maxWidth: 440 }}>
            {/* Logo cạnh tên (không xếp ô logo trên tiêu đề). ⚠️ Chữ trên nền xanh để trắng đặc: làm mờ (opacity 0.85) chỉ còn 4.48:1, dưới AA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <BrandLogo size={56} variant="glass" />
              <div>
                <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>Ký túc xá HaUI</div>
                <div style={{ fontSize: 15, marginTop: 4 }}>Trường Đại học Công nghiệp Hà Nội</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'grid', gap: 16 }}>
              {[
                ['Sinh viên', 'Đăng ký ở ký túc xá, tra cứu đơn, xem hợp đồng và hóa đơn, nộp tiền bằng mã VietQR.'],
                ['Cán bộ', 'Duyệt đơn và xếp giường, chốt điện nước theo phòng, thu tiền, theo dõi lấp đầy.'],
                ['Tài khoản', 'Cấp khi đơn được duyệt. Đăng nhập lần đầu bằng mã sinh viên và đổi mật khẩu.'],
              ].map(([head, text]) => (
                <li key={head} style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12, fontSize: 14, lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 600 }}>{head}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ position: 'absolute', bottom: 24, left: 56, right: 56, fontSize: 12 }}>
            © {new Date().getFullYear()} Ký túc xá Đại học Công nghiệp Hà Nội · Phiên bản {APP_VERSION}
          </div>
        </div>
      )}

      {/* ---------- Nửa phải: biểu mẫu ---------- */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!screens.md && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <BrandLogo size={40} />
              <Text strong style={{ fontSize: 16 }}>KÝ TÚC XÁ HaUI</Text>
            </div>
          )}

          <Title level={2} style={{ marginBottom: 4 }}>Đăng nhập</Title>
          <Text type="secondary">Sinh viên dùng mã sinh viên, cán bộ dùng email</Text>

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
              name="identifier"
              label="Email hoặc mã sinh viên"
              rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập email hoặc mã sinh viên' }]}
            >
              <Input prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="VD: 2021601234" autoComplete="username" autoFocus />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />} placeholder="••••••••" autoComplete="current-password" />
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

          {/* Sinh viên chưa có tài khoản nộp đơn ở cổng công khai (FR-30) */}
          <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            <Button block icon={<FormOutlined />} onClick={() => navigate('/apply')}>Đăng ký ở ký túc xá</Button>
            <Text type="secondary" style={{ textAlign: 'center', fontSize: 13 }}>
              Đã nộp đơn? <Link to="/apply/status">Tra cứu tiến độ</Link>
            </Text>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>Quên mật khẩu? Liên hệ ban quản lý ký túc xá.</Text>
          </div>

          <div style={{
            marginTop: 32, padding: '12px 16px', borderRadius: 8, background: '#FAFAFA', border: '1px solid var(--line)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <InfoCircleOutlined style={{ color: 'var(--brand)', marginTop: 3 }} />
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
                    {DEMO_ACCOUNTS.map(([label, identifier, password]) => (
                      <a key={identifier} onClick={() => form.setFieldsValue({ identifier, password })}>
                        {label}: <code>{identifier}</code> / <code>{password}</code>
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
