import { useState } from 'react';
import { Modal, Form, Input, Typography, App } from 'antd';
import { applicationApi } from '../api/application.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

const { Text } = Typography;
const MIN_REASON = 10; // BR-37

/** Từ chối đơn — bắt buộc lý do tối thiểu 10 ký tự */
export default function RejectApplicationModal({ app, open, onCancel, onRejected }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async ({ reviewNote }) => {
    setSaving(true);
    try {
      const res = await applicationApi.reject(app.id, { reviewNote: reviewNote.trim() });
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
      title={app ? `Từ chối đơn ${app.applicationCode}` : ''}
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
          Sinh viên {app.student.fullName} ({app.student.studentCode}) sẽ thấy lý do này trong cổng sinh viên.
        </Text>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }} preserve={false}>
        <Form.Item
          name="reviewNote"
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
