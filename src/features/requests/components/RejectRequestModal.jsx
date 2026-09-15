import { useState } from 'react';
import { Modal, Form, Input, Typography, App } from 'antd';
import { requestApi } from '../api/request.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { REQUEST_TYPE } from '../../../constants/statuses';

const { Text } = Typography;

/** Từ chối yêu cầu — bắt buộc lý do (BR-78) */
export default function RejectRequestModal({ request, open, onCancel, onRejected }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async ({ reviewNote }) => {
    setSaving(true);
    try {
      const res = await requestApi.reject(request.id, { reviewNote: reviewNote.trim() });
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
      title={request ? `Từ chối yêu cầu ${REQUEST_TYPE[request.type]?.label.toLowerCase()}` : ''}
      okText="Từ chối yêu cầu"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      {request && <Text type="secondary">{request.studentName} ({request.studentCode}) sẽ thấy lý do này ở mục Yêu cầu của tôi.</Text>}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }} preserve={false}>
        <Form.Item name="reviewNote" label="Lý do từ chối" rules={[{ required: true, whitespace: true, message: 'Nhập lý do từ chối' }]}>
          <Input.TextArea rows={4} maxLength={500} showCount autoFocus placeholder="VD: Chỉ gia hạn tối đa đến hết năm học tiếp theo" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
