import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Button, Typography, Alert, Select, App,
} from 'antd';
import {
  IdcardOutlined, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { GENDER } from '../../../constants/statuses';

const { Text, Title } = Typography;

/** Mã lỗi hồ sơ không khớp → hiện ngay dưới ô Mã số sinh viên (FR-81) */
const STUDENT_FIELD_CODES = ['STUDENT_NOT_FOUND', 'STUDENT_INFO_MISMATCH', 'STUDENT_ALREADY_HAS_ACCOUNT'];

/** SCR-02 Đăng ký tài khoản sinh viên (FR-80, FR-81) — tài khoản gắn với hồ sơ ban quản lý đã có */
export default function RegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await register({
        studentCode: values.studentCode.trim().toUpperCase(),
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone?.trim() || undefined,
        gender: values.gender,
        password: values.password,
      });
      message.success('Đăng ký thành công — chào mừng bạn đến với ký túc xá');
      navigate('/portal/home', { replace: true });
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else if (STUDENT_FIELD_CODES.includes(code)) form.setFields([{ name: 'studentCode', errors: [getErrorMessage(err)] }]);
      else setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 4 }}>Đăng ký tài khoản sinh viên</Title>
          <Text type="secondary">Dành cho sinh viên đã có hồ sơ tại ký túc xá</Text>
        </div>

        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          title="Thông tin phải khớp hồ sơ ban quản lý đang giữ"
          description="Tài khoản được gắn với hồ sơ sinh viên có sẵn. Nếu chưa có hồ sơ hoặc thông tin sai, mang thẻ sinh viên đến văn phòng ban quản lý ký túc xá."
        />
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} initialValues={{ gender: 'male' }}>
          <Form.Item
            name="studentCode" label="Mã số sinh viên"
            normalize={(v) => (v || '').toUpperCase()}
            rules={[{ required: true, whitespace: true, message: 'Nhập mã số sinh viên' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="VD: SV2026001" maxLength={20} autoFocus />
          </Form.Item>

          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ và tên' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn An" maxLength={100} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 12 }}>
            <Form.Item
              name="email" label="Email"
              rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="ban@sv.edu.vn" maxLength={120} />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}>
              <Select options={Object.entries(GENDER).map(([value, g]) => ({ value, label: g.label }))} aria-label="Giới tính" />
            </Form.Item>
          </div>

          <Form.Item
            name="phone" label="Số điện thoại"
            rules={[{ pattern: /^0\d{9}$/, message: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0912000000" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="password" label="Mật khẩu"
            extra="Tối thiểu 8 ký tự, gồm cả chữ và số"
            rules={[
              { required: true, message: 'Nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
              { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Mật khẩu phải có cả chữ và số' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="confirmPassword" label="Nhập lại mật khẩu" dependencies={['password']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu' },
              ({ getFieldValue }) => ({
                validator: (_, value) => (!value || value === getFieldValue('password')
                  ? Promise.resolve()
                  : Promise.reject(new Error('Mật khẩu nhập lại không khớp'))),
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" maxLength={100} />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>Đăng ký</Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login"><ArrowLeftOutlined /> Đã có tài khoản? Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
