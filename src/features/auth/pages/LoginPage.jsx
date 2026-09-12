import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/roles';
import { getErrorMessage } from '../../../lib/axiosClient';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Đã đăng nhập rồi thì không vào lại trang này
  if (isAuthenticated) {
    const home = user.role === ROLES.STUDENT ? '/portal/home' : '/admin/dashboard';
    return <Navigate to={home} replace />;
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await login(values.email, values.password);
      message.success('Đăng nhập thành công');

      const from = location.state?.from;
      const home = loggedIn.role === ROLES.STUDENT ? '/portal/home' : '/admin/dashboard';
      navigate(from && from !== '/login' ? from : home, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5F5F5', padding: 16,
    }}>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🏢</div>
          <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>
            Hệ thống quản lý ký túc xá
          </Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={handleSubmit} size="large" autoComplete="off">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@dorm.local" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>

        {import.meta.env.VITE_USE_MOCK === 'true' && (
          <Alert
            style={{ marginTop: 16 }}
            type="info"
            message="Đang chạy chế độ dữ liệu giả"
            description={
              <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                <div>Quản trị: <code>admin@dorm.local</code> / <code>Admin@123</code></div>
                <div>Nhân viên: <code>staff@dorm.local</code> / <code>Staff@123</code></div>
                <div>Người xem: <code>viewer@dorm.local</code> / <code>Viewer@123</code></div>
                <div>Sinh viên: <code>sv001@dorm.local</code> / <code>Student@123</code></div>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
}
