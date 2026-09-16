import { useState } from 'react';
import { Modal, Form, Input, Alert, Typography } from 'antd';
import { supplyApi } from '../api/supply.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import { itemsTextOf } from '../utils/supplyView';

const { Text } = Typography;

/** Hủy đơn nhu yếu phẩm chưa thanh toán (FR-105) — hủy đơn thì hóa đơn đi kèm cũng bị hủy */
export default function CancelOrderModal({ open, order, onCancel, onCancelled }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    try {
      const res = await supplyApi.cancel(order.id, { cancelReason: values.cancelReason.trim() });
      onCancelled(res.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      title={`Hủy đơn ${order.orderCode}?`}
      okText="Hủy đơn hàng"
      okButtonProps={{ danger: true }}
      cancelText="Không"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      mask={{ closable: false }}
      destroyOnHidden
      width={520}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <p style={{ marginBottom: 4 }}>
        {order.studentName} <Text type="secondary">({order.studentCode})</Text> · {formatCurrency(order.totalAmount)}
      </p>
      <Text type="secondary">{itemsTextOf(order)}</Text>
      <Alert
        type="info" showIcon style={{ margin: '12px 0' }}
        title="Hóa đơn đi kèm cũng bị hủy"
        description="Sinh viên không phải trả khoản này. Đơn đã hủy không khôi phục được — cần mua lại thì sinh viên đặt đơn mới."
      />
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="cancelReason" label="Lý do hủy"
          rules={[{ required: true, whitespace: true, message: 'Nhập lý do hủy' }, { min: 5, message: 'Lý do ít nhất 5 ký tự' }]}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea rows={3} maxLength={300} showCount placeholder="VD: Sinh viên báo không mua nữa" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
