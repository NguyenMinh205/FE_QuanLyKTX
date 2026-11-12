import { useEffect, useState } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, AutoComplete, Row, Col, App,
} from 'antd';
import dayjs from 'dayjs';
import { studentApi } from '../api/student.api';
import { GENDER_OPTIONS } from '../../../constants/statuses';
import { FACULTY_OPTIONS } from '../../../constants/app';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

/**
 * Thêm (FR-12) và sửa (FR-13) hồ sơ sinh viên. Chỉ tạo hồ sơ, không tạo tài khoản đăng nhập.
 * student = null → thêm mới; ngược lại → sửa. Đổi MSSV được nhưng backend chặn trùng.
 * Mọi trường bắt buộc, cùng luật với đơn đăng ký và nhập Excel (API.md §3) — hồ sơ tạo từ đường nào cũng sửa được ở đây.
 */
export default function StudentFormModal({ open, student, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!student;
  // Mở sửa từ drawer chi tiết nên có `contracts`; thiếu thì chỉ dựa vào `residence`
  const genderLocked = isEdit && (!!student.residence || !!student.contracts?.some((c) => c.status === 'pending'));

  useEffect(() => {
    if (!open) return;
    // ⚠️ Luôn xoá form trước: form sống lâu hơn modal, sinh viên thiếu trường (nhập Excel) sẽ mang giá trị của người sửa trước
    form.resetFields();
    if (isEdit) form.setFieldsValue({ ...student, dob: student.dob ? dayjs(student.dob) : null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, dob: values.dob.format('YYYY-MM-DD') };
      const res = isEdit ? await studentApi.update(student.id, payload) : await studentApi.create(payload);
      message.success(res.data.message);
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field.split('.'), errors: [e.message] })));
      else message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa hồ sơ ${student.fullName}` : 'Thêm sinh viên'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
      width={640}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Row gutter={12}>
          <Col xs={24} sm={10}>
            <Form.Item
              name="studentCode" label="Mã sinh viên"
              rules={[{ required: true, message: 'Nhập mã sinh viên' }, { pattern: /^\d{10}$/, message: 'Mã sinh viên gồm đúng 10 chữ số' }]}
              extra={isEdit ? 'Đổi MSSV thì sinh viên đăng nhập bằng mã mới' : null}
            >
              <Input placeholder="VD: 2021601234" maxLength={10} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ và tên' }]}>
              <Input placeholder="VD: Nguyễn Văn An" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}
              // BR-01: đang ở hoặc có đơn chờ duyệt thì giường thuộc phòng theo giới tính hiện tại — khóa ô (backend cũng chặn, 422)
              extra={genderLocked ? 'Đang ở hoặc có đơn chờ duyệt — thanh lý / từ chối đơn trước khi đổi giới tính' : 'Quyết định tòa và phòng được xếp'}
            >
              <Select options={GENDER_OPTIONS} placeholder="Chọn giới tính" disabled={genderLocked} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" disabledDate={(d) => !d.isBefore(dayjs(), 'day')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name="citizenId" label="Số CCCD" rules={[{ required: true, message: 'Nhập số CCCD' }, { pattern: /^\d{12}$/, message: 'Gồm đúng 12 chữ số' }]}>
              <Input placeholder="VD: 001204012345" maxLength={12} inputMode="numeric" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, whitespace: true, message: 'Nhập địa chỉ thường trú' }]}>
              <Input placeholder="Số nhà, xã/phường, quận/huyện, tỉnh/thành" maxLength={200} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }, { pattern: /^0\d{9}$/, message: '10 số, bắt đầu bằng 0' }]}>
              <Input placeholder="VD: 0912345678" maxLength={10} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]} extra="Dùng để gửi kết quả duyệt đơn">
              <Input placeholder="VD: an.nv@gmail.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name="className" label="Lớp" rules={[{ required: true, whitespace: true, message: 'Nhập lớp' }]}>
              <Input placeholder="VD: KTPM01-K16" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={14}>
            <Form.Item name="faculty" label="Khoa" rules={[{ required: true, whitespace: true, message: 'Nhập khoa' }]}>
              <AutoComplete options={FACULTY_OPTIONS} placeholder="VD: Công nghệ thông tin"
                filterOption={(input, o) => String(o?.value ?? '').toLowerCase().includes(String(input).toLowerCase())} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name={['emergencyContact', 'name']} label="Người liên hệ khẩn cấp" rules={[{ required: true, whitespace: true, message: 'Nhập họ tên người thân' }]}>
              <Input placeholder="VD: Nguyễn Văn B" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={7}>
            <Form.Item name={['emergencyContact', 'relationship']} label="Quan hệ" rules={[{ required: true, whitespace: true, message: 'Nhập quan hệ' }]}>
              <Input placeholder="VD: Bố" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={7}>
            <Form.Item name={['emergencyContact', 'phone']} label="SĐT người thân" rules={[{ required: true, message: 'Nhập SĐT' }, { pattern: /^0\d{9}$/, message: '10 số, bắt đầu bằng 0' }]}>
              <Input placeholder="09…" maxLength={10} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
