import { useState } from 'react';
import {
  Modal, Form, Input, Radio, Alert, Typography, App,
} from 'antd';
import { userApi } from '../api/user.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { ROLE_LABEL } from '../../../constants/roles';

const { Text } = Typography;

const ROLE_HINT = {
  admin: 'Chỉ quản trị kỹ thuật & tài khoản hệ thống (tách biệt khỏi nghiệp vụ và doanh thu KTX)',
  manager: 'Trưởng ban KTX: mở đợt đăng ký, cấu hình tòa/phòng 3 cơ sở, duyệt chuyển phòng và xem báo cáo doanh thu',
  staff: 'Cán bộ quản sinh: vận hành hằng ngày (hồ sơ SV, duyệt đơn, QR Check-in, điện nước, thu tiền, báo hỏng)',
  student: 'Tài khoản sinh viên do hệ thống tự cấp khi duyệt đơn đăng ký KTX',
};

export default function UserFormModal({ open, user, currentUserId, onCancel, onCreated, onUpdated }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!user;
  const isSelf = isEdit && user.id === currentUserId;

  const role = Form.useWatch('role', form) ?? (isEdit ? user.role : 'staff');

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await userApi.update(user.id, { email: values.email, fullName: values.fullName, role: values.role });
        message.success(res.data.message);
        onUpdated(res.data.data);
      } else {
        const res = await userApi.create({ email: values.email, fullName: values.fullName, role: values.role });
        message.success(res.data.message);
        onCreated(res.data.data);
      }
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isStudentAccount = user?.role === 'student';
  const roleOptions = (isStudentAccount ? ['student'] : ['admin', 'manager', 'staff']).map((value) => ({
    value,
    label: ROLE_LABEL[value],
    disabled: isSelf || isStudentAccount,
  }));

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa tài khoản ${user.email}` : 'Thêm tài khoản cán bộ / quản lý'}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={600}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}
        initialValues={isEdit ? { email: user.email, fullName: user.fullName, role: user.role } : { email: '', fullName: '', role: 'staff' }}
      >
        <Form.Item
          name="role" label="Vai trò" rules={[{ required: true, message: 'Chọn vai trò' }]}
          extra={isSelf ? 'Không tự đổi vai trò của chính mình' : (role && ROLE_HINT[role])}
        >
          <Radio.Group optionType="button" buttonStyle="solid" options={roleOptions} />
        </Form.Item>

        <Form.Item
          name="email" label="Email đăng nhập"
          rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}
        >
          <Input placeholder="VD: truongban@dorm.local" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="fullName" label="Họ và tên"
          rules={isStudentAccount ? [] : [{ required: true, whitespace: true, message: 'Nhập họ tên' }]}
          extra={isStudentAccount ? 'Họ tên sinh viên được quản lý tại màn Sinh viên' : undefined}
        >
          <Input placeholder="VD: Nguyễn Văn Quản Lý" disabled={isStudentAccount} maxLength={100} />
        </Form.Item>

        {!isEdit && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Hệ thống tự sinh mật khẩu tạm và hiển thị <b>một lần</b> sau khi tạo; người dùng bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.
          </Text>
        )}
      </Form>
    </Modal>
  );
}
