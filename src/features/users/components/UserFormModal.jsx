import { useState } from 'react';
import {
  Modal, Form, Input, Radio, Select, Alert, Typography, App,
} from 'antd';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { userApi } from '../api/user.api';
import { studentApi } from '../../students/api/student.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { ROLE_LABEL } from '../../../constants/roles';

const { Text } = Typography;
const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0 } } });

const ROLE_HINT = {
  admin: 'Toàn quyền, gồm quản lý tài khoản, giá thuê, danh mục phí',
  staff: 'Nghiệp vụ hằng ngày: duyệt đơn, hợp đồng, hóa đơn, thu tiền',
  viewer: 'Chỉ xem số liệu, không thao tác',
  student: 'Dùng cổng sinh viên — phải gắn với một hồ sơ sinh viên',
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
  const [keyword, setKeyword] = useState('');
  const search = useDebounce(keyword, 300);
  const isEdit = !!user;
  const isSelf = isEdit && user.id === currentUserId;

  const role = Form.useWatch('role', form) ?? (isEdit ? user.role : 'staff');

  const { data: studentRows, loading: studentsLoading } = useApi(
    () => (open && !isEdit && role === 'student' ? studentApi.getList({ search: search || undefined, limit: 10 }) : EMPTY_LIST),
    [open, isEdit, role, search],
  );

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await userApi.update(user.id, { email: values.email, fullName: values.fullName, role: values.role });
        message.success(res.data.message);
        onUpdated(res.data.data);
      } else {
        const res = await userApi.create({
          email: values.email, role: values.role,
          ...(values.role === 'student' ? { studentId: values.studentId } : { fullName: values.fullName }),
        });
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

  // Vai trò: sinh viên ↔ cán bộ không đổi qua lại được; tự sửa mình thì khóa vai trò
  const roleOptions = Object.keys(ROLE_LABEL).map((value) => ({
    value,
    label: ROLE_LABEL[value],
    disabled: isEdit && (isSelf || (value === 'student') !== (user.role === 'student')),
  }));

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa tài khoản ${user.email}` : 'Thêm tài khoản'}
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
          <Radio.Group optionType="button" buttonStyle="solid" options={roleOptions}
            onChange={() => form.setFields([{ name: 'studentId', value: undefined, errors: [] }])} />
        </Form.Item>

        <Form.Item
          name="email" label="Email đăng nhập"
          rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}
        >
          <Input placeholder="VD: nhanvien3@dorm.local" autoComplete="off" />
        </Form.Item>

        {!isEdit && role === 'student' ? (
          <Form.Item
            name="studentId" label="Hồ sơ sinh viên" rules={[{ required: true, message: 'Chọn hồ sơ sinh viên' }]}
            extra="Mỗi hồ sơ chỉ gắn một tài khoản. Họ tên lấy theo hồ sơ."
          >
            <Select
              showSearch={{ filterOption: false, onSearch: setKeyword }}
              placeholder="Tìm theo mã hoặc tên sinh viên"
              loading={studentsLoading}
              notFoundContent={studentsLoading ? 'Đang tìm...' : 'Không tìm thấy sinh viên'}
              options={(studentRows || []).map((s) => ({
                value: s.id,
                disabled: !!s.hasAccount,
                label: `${s.studentCode} · ${s.fullName}${s.hasAccount ? ' — đã có tài khoản' : ''}`,
              }))}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="fullName" label="Họ và tên"
            rules={user?.role === 'student' ? [] : [{ required: true, whitespace: true, message: 'Nhập họ tên' }]}
            extra={user?.role === 'student' ? 'Họ tên sinh viên sửa ở màn Sinh viên' : undefined}
          >
            <Input placeholder="VD: Nguyễn Thị Lan" disabled={user?.role === 'student'} maxLength={100} />
          </Form.Item>
        )}

        {!isEdit && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Hệ thống tự sinh mật khẩu tạm và hiện <b>một lần</b> sau khi tạo; người dùng phải đổi mật khẩu ở lần đăng nhập đầu tiên.
          </Text>
        )}
      </Form>
    </Modal>
  );
}
