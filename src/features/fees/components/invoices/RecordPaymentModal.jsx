import { useState } from 'react';
import {
  Modal, Form, InputNumber, Radio, DatePicker, Input, Alert, Typography, Space, App,
} from 'antd';
import {
  UserOutlined, FileTextOutlined, CheckCircleOutlined, LockOutlined, BankOutlined, WalletOutlined, IdcardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../../../context/AuthContext';
import { paymentApi } from '../../../payments/api/payment.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../../lib/axiosClient';
import { formatCurrency } from '../../../../utils/formatter';
import { invoiceRoomOf, periodShort } from '../../utils/invoiceView';

const { Text } = Typography;

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

const chipStyle = (active) => ({
  border: `1px solid ${active ? '#1677FF' : '#D9D9D9'}`, background: active ? '#E6F4FF' : '#fff', color: active ? '#1677FF' : undefined,
  borderRadius: 16, padding: '2px 12px', fontSize: 13, cursor: 'pointer',
});

/**
 * SCR-55 Ghi nhận thanh toán tại quầy (FR-50, FR-51). Mặc định thu đủ số còn lại.
 * Vượt số còn lại → lỗi ngay dưới ô + khóa nút (BR-44). Chuyển khoản bắt buộc mã giao dịch.
 * Cha đặt `key` theo hóa đơn để form luôn mở với số còn lại mới nhất.
 */
export default function RecordPaymentModal({ open, invoice, onCancel, onRecorded }) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { modal } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const remaining = invoice?.remainingAmount ?? 0;
  const amount = Form.useWatch('amount', form);
  const method = Form.useWatch('method', form) ?? 'cash';
  const isFull = amount === remaining;
  const exceeds = Number(amount) > remaining;
  const invalidAmount = !amount || amount <= 0 || exceeds;

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    try {
      const res = await paymentApi.recordOffline({
        invoiceId: invoice.id,
        amount: values.amount,
        method: values.method,
        paidAt: values.paidAt.format('YYYY-MM-DD'),
        bankReference: values.method === 'bank_transfer' ? values.bankReference.trim() : undefined,
        note: values.note?.trim() || undefined,
      });
      onRecorded(res.data);
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else if (code === 'PAYMENT_EXCEEDS_REMAINING') form.setFields([{ name: 'amount', errors: [getErrorMessage(err)] }]);
      else if (['INVOICE_ALREADY_PAID', 'INVOICE_CANCELLED'].includes(code)) {
        // Người khác vừa thu / hủy — đóng và tải lại để thấy trạng thái mới
        modal.warning({ title: 'Không thu được tiền', content: getErrorMessage(err), onOk: () => onRecorded(null) });
      } else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal
      open={open}
      title="Ghi nhận thanh toán"
      cancelText="Hủy"
      okText={amount > 0 ? `Xác nhận thu ${formatCurrency(amount)}` : 'Xác nhận thu'}
      okButtonProps={{ disabled: invalidAmount, icon: exceeds ? <LockOutlined /> : <CheckCircleOutlined /> }}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      width={600}
    >
      <div style={{ background: '#F5F7FA', borderRadius: 10, padding: '12px 16px', margin: '8px 0 16px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div><UserOutlined style={{ color: '#1677FF' }} /> <Text strong>{invoice.studentName}</Text> <Text type="secondary">({invoice.studentCode})</Text></div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <FileTextOutlined /> {invoice.invoiceCode}{invoice.billingPeriod ? ` · Tháng ${periodShort(invoice.billingPeriod)}` : ''}{invoiceRoomOf(invoice) !== '—' ? ` · ${invoiceRoomOf(invoice)}` : ''}
          </Text>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 1.7 }}>
          <div>Tổng tiền: <Text>{formatCurrency(invoice.totalAmount)}</Text></div>
          <div>Đã trả: <Text type="success">{formatCurrency(invoice.paidAmount)}</Text></div>
          <Text type="danger" strong style={{ fontSize: 15 }}>Còn lại {formatCurrency(remaining)}</Text>
        </div>
      </div>

      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <Form
        form={form} layout="vertical" onFinish={handleSubmit}
        initialValues={{ amount: remaining, method: 'cash', paidAt: dayjs() }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <label htmlFor="payment-amount"><Text type="danger">* </Text>Số tiền thu</label>
          <Space size={6}>
            <span role="button" tabIndex={0} style={chipStyle(isFull)} onClick={() => form.setFieldsValue({ amount: remaining })}>
              Thu đủ ({formatCurrency(remaining)})
            </span>
            <span
              role="button" tabIndex={0} style={chipStyle(!isFull)}
              onClick={() => { form.setFieldsValue({ amount: null }); document.getElementById('payment-amount')?.focus(); }}
            >Thu một phần</span>
          </Space>
        </div>
        <Form.Item
          name="amount" style={{ marginBottom: exceeds ? 4 : 24 }}
          rules={[{ required: true, message: 'Nhập số tiền thu' }, { type: 'number', min: 1, message: 'Số tiền thu phải lớn hơn 0' }]}
        >
          <InputNumber
            id="payment-amount" aria-label="Số tiền thu" size="large" style={{ width: '100%' }}
            min={0} max={1000000000} step={10000} suffix="đ" formatter={moneyFormatter} parser={moneyParser}
            status={exceeds ? 'error' : undefined}
          />
        </Form.Item>
        {exceeds && (
          <Text type="danger" style={{ display: 'block', marginBottom: 20 }} role="alert">
            Số tiền vượt quá số còn phải trả ({formatCurrency(remaining)})
          </Text>
        )}

        <Form.Item name="method" label="Hình thức thanh toán" required>
          <Radio.Group
            aria-label="Hình thức thanh toán"
            options={[
              { value: 'cash', label: <span><WalletOutlined /> Tiền mặt</span> },
              { value: 'bank_transfer', label: <span><BankOutlined /> Chuyển khoản</span> },
            ]}
          />
        </Form.Item>

        {method === 'bank_transfer' && (
          <Form.Item
            name="bankReference" label="Mã giao dịch ngân hàng"
            rules={[{ required: true, whitespace: true, message: 'Nhập mã giao dịch ngân hàng' }]}
            extra="Mã trên sao kê ngân hàng — dùng để đối soát, không ghi nhận trùng một giao dịch"
            normalize={(v) => (v || '').toUpperCase()}
          >
            <Input placeholder="VD: FT26256891042" maxLength={50} style={{ fontFamily: 'ui-monospace, Consolas, monospace' }} />
          </Form.Item>
        )}

        <Form.Item name="paidAt" label="Ngày thu" rules={[{ required: true, message: 'Chọn ngày thu' }]}>
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" allowClear={false} disabledDate={(d) => d.isAfter(dayjs(), 'day')} />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú" extra="Không bắt buộc" style={{ marginBottom: 8 }}>
          <Input.TextArea rows={2} maxLength={300} placeholder="VD: Sinh viên nộp đợt 2, tất toán tháng 10" />
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ fontSize: 13 }}><IdcardOutlined /> Người thu: <Text>{user?.fullName}</Text></Text>
    </Modal>
  );
}
