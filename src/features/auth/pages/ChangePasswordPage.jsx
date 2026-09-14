import { useState } from 'react';
import { Card, Form, Input, Button, App, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../lib/authApi';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { useAuth } from '../../../context/AuthContext';
import { homePathOf } from '../../../routes/paths';
import PageHeader from '../../../components/PageHeader';

/**
 * SCR-03 Đổi mật khẩu.
 * Body gửi lên: { oldPassword, newPassword } — khớp BE (auth.validation.js).
 * Khi user.mustChangePassword = true, RoleRoute khóa mọi trang khác cho tới khi đổi xong (BR-85).
 */
export default function ChangePasswordPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const forced = !!user?.mustChangePassword;

  const handleSubmit = async ({ oldPassword, newPassword }) => {
    setSaving(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
      updateUser({ mustChangePassword: false });
      navigate(homePathOf(user.role), { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else if (getErrorCode(err) === 'INVALID_CURRENT_PASSWORD') {
        form.setFields([{ name: 'oldPassword', errors: [getErrorMessage(err)] }]);
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={['Tài khoản', 'Đổi mật khẩu']}
        title="Đổi mật khẩu"
        description="Mật khẩu mới phải có ít nhất 8 ký tự, gồm cả chữ và số"
      />

      {forced && (
        <Alert
          type="warning"
          showIcon
          style={{ maxWidth: 480, marginBottom: 16 }}
          title="Bạn đang dùng mật khẩu tạm"
          description="Vì lý do bảo mật, bạn cần đặt mật khẩu mới trước khi sử dụng hệ thống. Mật khẩu hiện tại là mật khẩu tạm được ban quản lý cấp."
        />
      )}

      <Card style={{ maxWidth: 480 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="oldPassword"
            label={forced ? 'Mật khẩu tạm' : 'Mật khẩu hiện tại'}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            dependencies={['oldPassword']}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
              { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Mật khẩu phải có cả chữ và số' },
              ({ getFieldValue }) => ({
                validator: (_, value) => (!value || value !== getFieldValue('oldPassword')
                  ? Promise.resolve()
                  : Promise.reject(new Error('Mật khẩu mới không được trùng mật khẩu hiện tại'))),
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator: (_, value) => (!value || getFieldValue('newPassword') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Hai mật khẩu không khớp'))),
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" htmlType="submit" loading={saving}>Đổi mật khẩu</Button>
            {forced
              ? <Button onClick={logout}>Đăng xuất</Button>
              : <Button onClick={() => navigate(-1)}>Hủy</Button>}
          </div>
        </Form>
      </Card>
    </>
  );
}
