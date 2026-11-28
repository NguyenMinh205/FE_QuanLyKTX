import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, InputNumber, Alert, App, Checkbox, Radio, Typography } from 'antd';
import { contractApi } from '../api/contract.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';

const { Text } = Typography;

/** Danh mục kiểm kê & khấu trừ hư hại tài sản chuẩn KTX HaUI (lọc thêm mục điều hòa/đệm cho phòng CLC) */
const BASE_DAMAGE_ITEMS = [
  { key: 'key', label: 'Mất chìa khóa phòng / thẻ từ', amount: 50000 },
  { key: 'bulb', label: 'Vỡ / hỏng bóng đèn chiếu sáng', amount: 60000 },
  { key: 'locker', label: 'Hỏng khóa tủ cá nhân', amount: 100000 },
  { key: 'mirror', label: 'Vỡ gương / phụ kiện vệ sinh', amount: 120000 },
  { key: 'faucet', label: 'Hỏng vòi nước / sen tắm', amount: 150000 },
  { key: 'fan', label: 'Hỏng quạt trần / công tắc điện', amount: 200000 },
];

const HQ_DAMAGE_ITEMS = [
  { key: 'ac_remote', label: 'Mất / hỏng điều khiển điều hòa (CLC)', amount: 150000 },
  { key: 'mattress', label: 'Làm rách / hư hỏng đệm nằm (CLC)', amount: 250000 },
];

/** Modal Quyết toán hoàn tiền cọc tài sản — có Danh mục khấu trừ tài sản chuẩn theo hạng phòng & sinh phiếu chi REF-... */
export default function RefundDepositModal({ contract, open, onCancel, onRefunded }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const depositAmount = contract?.depositAmount || 0;
  const isHighQuality = (contract?.room?.roomTier || contract?.preferredRoomTier) === 'high_quality';
  const catalog = useMemo(
    () => (isHighQuality ? [...BASE_DAMAGE_ITEMS, ...HQ_DAMAGE_ITEMS] : BASE_DAMAGE_ITEMS),
    [isHighQuality],
  );

  const watchedDeduction = Form.useWatch('deductionAmount', form) || 0;
  const netRefund = Math.max(0, depositAmount - Number(watchedDeduction || 0));

  useEffect(() => {
    if (open && contract) {
      form.setFieldsValue({ damages: [], deductionAmount: 0, method: 'cash', reason: '' });
    }
  }, [open, contract, form]);

  const handleDamageChange = (checkedKeys) => {
    const picked = catalog.filter((item) => checkedKeys.includes(item.key));
    const rawSum = picked.reduce((sum, item) => sum + item.amount, 0);
    const capped = Math.min(depositAmount, rawSum);
    const composedReason = picked.length
      ? `Khấu trừ hư hại tài sản: ${picked.map((i) => `${i.label} (${formatCurrency(i.amount)})`).join(', ')}`
      : '';
    form.setFieldsValue({ deductionAmount: capped, reason: composedReason });
  };

  const handleFinish = async (values) => {
    if (!contract?.id) return;
    setSaving(true);
    try {
      const res = await contractApi.refundDeposit(contract.id, {
        deductionAmount: Number(values.deductionAmount || 0),
        method: values.method || 'cash',
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
      width={560}
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
          description="Hệ thống lập phiếu chi hoàn cọc (REF-...) tách riêng khỏi báo cáo doanh thu và gửi thông báo tới sinh viên."
        />

        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 8, background: '#F8FAFC', border: '1px solid var(--line)' }}>
          <Text strong style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
            Kiểm kê hư hại tài sản nhanh (chọn để tự cộng khấu trừ)
          </Text>
          <Form.Item name="damages" noStyle>
            <Checkbox.Group
              onChange={handleDamageChange}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', width: '100%' }}
            >
              {catalog.map((item) => (
                <Checkbox key={item.key} value={item.key} style={{ marginInlineStart: 0, fontSize: 12.5 }}>
                  <span>{item.label}</span>{' '}
                  <Text type="secondary" className="mono" style={{ fontSize: 11.5 }}>({formatCurrency(item.amount)})</Text>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </div>

        <Form.Item
          name="deductionAmount"
          label="Tổng tiền khấu trừ hư hại tài sản (VNĐ — có thể điều chỉnh tay)"
          rules={[{ type: 'number', min: 0, max: depositAmount, message: 'Số tiền khấu trừ không vượt quá tiền cọc' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} max={depositAmount} step={10000} precision={0} suffix="đ" />
        </Form.Item>

        <Form.Item name="method" label="Hình thức chi trả hoàn cọc">
          <Radio.Group
            options={[
              { value: 'cash', label: 'Tiền mặt tại văn phòng KTX' },
              { value: 'vietqr', label: 'Chuyển khoản ngân hàng (VietQR)' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Ghi chú / Lý do khấu trừ"
          rules={watchedDeduction > 0 ? [{ required: true, whitespace: true, message: 'Nhập lý do khi có khấu trừ tiền cọc' }] : []}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea rows={2} maxLength={300} placeholder="Để trống nếu tài sản nguyên vẹn (hoàn đủ 100% cọc)..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
