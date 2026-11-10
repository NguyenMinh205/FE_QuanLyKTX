import { useState } from 'react';
import {
  Modal, Form, Input, Radio, Alert, Typography, App,
} from 'antd';
import { userApi } from '../api/user.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { ROLE_LABEL } from '../../../constants/roles';

const { Text } = Typography;

const ROLE_HINT = {
  admin: 'Toàn quyền, gồm quản lý tài khoản và xem doanh thu',
  staff: 'Nghiệp vụ hằng ngày: duyệt đơn, hợp đồng, điện nước, thu tiền',
  student: 'Tài khoản sinh viên do hệ thống cấp khi duyệt đơn đăng ký',
};

/**
 * Thêm / sửa tài khoản — SCR-81.
 * user = null → thêm (hệ thống sinh mật khẩu tạm) · user != null → sửa email, họ tên, vai trò.
 */
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

  // Sinh viên ↔ cán bộ không đổi qua lại được; tự sửa mình thì khóa vai trò
  const isStudentAccount = user?.role === 'student';
  const roleOptions = (isStudentAccount ? ['student'] : ['admin', 'staff']).map((value) => ({
    value,
    label: ROLE_LABEL[value],
    disabled: isSelf || isStudentAccount,
  }));

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa tài khoản ${user.email}` : 'Thêm tài khoản cán bộ'}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {/* Cha đặt key theo tài khoản đang sửa nên initialValues luôn đúng mỗi lần mở */}
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
          <Input placeholder="VD: nhanvien3@dorm.local" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="fullName" label="Họ và tên"
          rules={isStudentAccount ? [] : [{ required: true, whitespace: true, message: 'Nhập họ tên' }]}
          extra={isStudentAccount ? 'Họ tên sinh viên sửa ở màn Sinh viên' : undefined}
        >
          <Input placeholder="VD: Nguyễn Thị Lan" disabled={isStudentAccount} maxLength={100} />
        </Form.Item>

        {!isEdit && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Hệ thống tự sinh mật khẩu tạm và hiện <b>một lần</b> sau khi tạo; người dùng phải đổi mật khẩu ở lần đăng nhập đầu tiên.
          </Text>
        )}
      </Form>
    </Modal>
  );
}
