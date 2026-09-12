import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, App } from 'antd';
import dayjs from 'dayjs';
import { studentApi } from '../../api/studentApi';
import { GENDER_OPTIONS } from '../../constants/statuses';
import { getErrorMessage, getFieldErrors } from '../../api/axiosClient';

/**
 * Modal dùng chung cho cả THÊM MỚI và SỬA (docs/14 mục 13.4).
 * student = null  -> thêm mới
 * student != null -> sửa
 */
export default function StudentFormModal({ open, student, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!student;

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      form.setFieldsValue({
        ...student,
        dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth) : null,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      if (isEdit) await studentApi.update(student.id, payload);
      else await studentApi.create(payload);

      message.success(isEdit ? 'Cập nhật thành công' : 'Thêm sinh viên thành công');
      onSaved();
    } catch (err) {
      // Lỗi theo từng trường -> hiển thị ngay dưới ô nhập tương ứng
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item
          name="studentCode"
          label="Mã số sinh viên"
          rules={[
            { required: true, message: 'Vui lòng nhập mã số sinh viên' },
            { pattern: /^[A-Za-z0-9]{6,20}$/, message: 'MSSV gồm 6–20 ký tự chữ và số' },
          ]}
        >
          <Input placeholder="VD: SV2024001" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input placeholder="VD: Trần Thị B" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
        >
          <Select options={GENDER_OPTIONS} placeholder="Chọn giới tính" />
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ pattern: /^0\d{9}$/, message: 'Số điện thoại gồm 10 số, bắt đầu bằng 0' }]}
        >
          <Input placeholder="VD: 0912345678" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input placeholder="VD: sv2024001@sv.edu.vn" />
        </Form.Item>

        <Form.Item name="className" label="Lớp">
          <Input placeholder="VD: CNTT2024A" />
        </Form.Item>

        <Form.Item name="faculty" label="Khoa">
          <Input placeholder="VD: Công nghệ thông tin" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
