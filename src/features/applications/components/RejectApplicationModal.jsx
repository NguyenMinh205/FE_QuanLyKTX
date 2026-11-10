import { useState } from 'react';
import { Modal, Form, Input, Typography, App } from 'antd';
import { contractApi } from '../../contracts/api/contract.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

const { Text } = Typography;
const MIN_REASON = 10;

/** Từ chối đơn (FR-33) — bắt buộc lý do; hệ thống gửi email lý do cho sinh viên, không đụng giường */
export default function RejectApplicationModal({ app, open, onCancel, onRejected }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async ({ reason }) => {
    setSaving(true);
    try {
      const res = await contractApi.reject(app.id, { reason: reason.trim() });
      message.success(res.data.message);
      onRejected();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={app ? `Từ chối đơn ${app.contractCode}` : ''}
      okText="Từ chối đơn"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      {app && (
        <Text type="secondary">
          Hệ thống gửi email báo lý do cho {app.student.fullName} ({app.student.studentCode}); sinh viên cũng thấy lý do khi tra cứu đơn.
        </Text>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }} preserve={false}>
        <Form.Item
          name="reason"
          label="Lý do từ chối"
          rules={[
            { required: true, whitespace: true, message: 'Nhập lý do từ chối' },
            { validator: (_, v) => (!v || v.trim().length >= MIN_REASON ? Promise.resolve() : Promise.reject(new Error(`Lý do tối thiểu ${MIN_REASON} ký tự`))) },
          ]}
        >
          <Input.TextArea rows={4} maxLength={500} showCount placeholder="VD: Hồ sơ còn thiếu giấy xác nhận sinh viên" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
