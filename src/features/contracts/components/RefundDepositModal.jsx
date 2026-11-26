import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Alert, App } from 'antd';
import { contractApi } from '../api/contract.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';

/** Modal Quyết toán hoàn tiền cọc tài sản (hỗ trợ khấu trừ hư hại & tự sinh phiếu chi REF-...) */
export default function RefundDepositModal({ contract, open, onCancel, onRefunded }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const depositAmount = contract?.depositAmount || 0;
  const watchedDeduction = Form.useWatch('deductionAmount', form) || 0;
  const netRefund = Math.max(0, depositAmount - Number(watchedDeduction || 0));

  useEffect(() => {
    if (open && contract) {
      form.setFieldsValue({ deductionAmount: 0, reason: '' });
    }
  }, [open, contract, form]);

  const handleFinish = async (values) => {
    if (!contract?.id) return;
    setSaving(true);
    try {
      const res = await contractApi.refundDeposit(contract.id, {
        deductionAmount: Number(values.deductionAmount || 0),
        reason: values.reason?.trim() || '',
      });
      message.success(res.data.message || 'Đã xác nhận quyết toán hoàn cọc');
      form.resetFields();
      onRefunded?.(res.data.data);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Quyết toán hoàn cọc — ${contract?.contractCode || ''}`}
      okText="Xác nhận hoàn cọc"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 12 }}>
        {contract?.student && (
          <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
            Sinh viên: <b style={{ color: 'var(--ink)' }}>{contract.student.fullName}</b> ({contract.student.studentCode})
          </div>
        )}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 14 }}
          title={`Tiền cọc gốc: ${formatCurrency(depositAmount)} → Hoàn trả thực tế: ${formatCurrency(netRefund)}`}
          description="Hệ thống sẽ lập phiếu chi hoàn cọc (REF-...) tách riêng khỏi báo cáo doanh thu và gửi thông báo tới sinh viên."
        />
        <Form.Item
          name="deductionAmount"
          label="Tiền khấu trừ hư hại tài sản (VNĐ — để 0 nếu hoàn đủ)"
          rules={[{ type: 'number', min: 0, max: depositAmount, message: 'Số tiền khấu trừ không vượt quá tiền cọc' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} max={depositAmount} step={10000} precision={0} suffix="đ" />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Ghi chú / Lý do khấu trừ"
          rules={watchedDeduction > 0 ? [{ required: true, whitespace: true, message: 'Nhập lý do khi có khấu trừ tiền cọc' }] : []}
        >
          <Input.TextArea rows={2} maxLength={300} placeholder="VD: Bàn giao đủ tài sản / Làm vỡ kính cửa sổ..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
