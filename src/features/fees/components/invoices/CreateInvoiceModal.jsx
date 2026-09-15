import { useMemo, useState } from 'react';
import {
  Modal, Form, Select, DatePicker, Input, InputNumber, Button, Alert, Typography, Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../../hooks/useApi';
import { feeApi } from '../../api/fee.api';
import { contractApi } from '../../../contracts/api/contract.api';
import { getErrorMessage, getFieldErrors } from '../../../../lib/axiosClient';
import { formatCurrency } from '../../../../utils/formatter';

const { Text } = Typography;

/** Hóa đơn lẻ không dùng loại phí có nguồn tiền riêng: tiền phòng, tiền cọc (hợp đồng), nhu yếu phẩm (đơn hàng) */
const BLOCKED_FEE_CODES = ['rent', 'deposit', 'supplies'];

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

/** "lineItems.0.unitPrice" → ['lineItems', 0, 'unitPrice'] để gắn lỗi backend đúng ô */
const fieldPath = (field) => String(field).split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p));

/**
 * Tạo hóa đơn lẻ (FR-46) — loại `other`, không gắn kỳ, cho sinh viên đang có hợp đồng hiệu lực.
 * Thành tiền và tổng do backend tính lại (BR-41, BR-42); ở đây chỉ hiển thị tạm.
 */
export default function CreateInvoiceModal({ open, onCancel, onCreated }) {
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { data: contracts, loading: searching } = useApi(
    () => (open ? contractApi.getList({ status: 'active', search: keyword || undefined, limit: 20 }) : Promise.resolve({ data: { data: { items: [] } } })),
    [open, keyword],
  );
  const { data: feeTypes } = useApi(() => feeApi.getFeeTypes(), []);
  const usableFeeTypes = useMemo(() => (feeTypes || []).filter((t) => t.isActive && !BLOCKED_FEE_CODES.includes(t.code)), [feeTypes]);

  const lines = Form.useWatch('lineItems', form) || [];
  const total = lines.reduce((t, l) => t + Math.round((Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0)), 0);

  const pickFeeType = (index, feeTypeId) => {
    const ft = usableFeeTypes.find((t) => t.id === feeTypeId);
    if (!ft) return;
    const current = form.getFieldValue(['lineItems', index]) || {};
    form.setFieldValue(['lineItems', index], {
      ...current,
      feeTypeId,
      description: current.description || ft.name,
      unitPrice: current.unitPrice || (ft.defaultAmount > 0 ? ft.defaultAmount : undefined),
    });
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    const contract = (contracts || []).find((c) => c.id === values.contractId);
    try {
      const res = await feeApi.createInvoice({
        contractId: values.contractId,
        studentId: contract?.studentId,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        note: values.note?.trim() || undefined,
        lineItems: values.lineItems.map((l) => ({
          feeTypeId: l.feeTypeId, description: l.description.trim(), quantity: l.quantity, unitPrice: l.unitPrice,
        })),
      });
      onCreated(res.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: fieldPath(e.field), errors: [e.message] })));
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Tạo hóa đơn lẻ"
      okText={total ? `Tạo hóa đơn ${formatCurrency(total)}` : 'Tạo hóa đơn'}
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={saving}
      mask={{ closable: false }}
      destroyOnHidden
      width={820}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit}
        initialValues={{ dueDate: dayjs().add(7, 'day'), lineItems: [{ quantity: 1 }] }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
          <Form.Item
            name="contractId" label="Sinh viên" rules={[{ required: true, message: 'Chọn sinh viên' }]}
            extra="Chỉ sinh viên đang có hợp đồng hiệu lực"
          >
            <Select
              aria-label="Sinh viên"
              placeholder="Gõ tên, MSSV hoặc mã giường…"
              showSearch={{ filterOption: false, onSearch: setKeyword }}
              loading={searching}
              notFoundContent={searching ? 'Đang tìm…' : 'Không tìm thấy sinh viên đang ở'}
              options={(contracts || []).map((c) => ({
                value: c.id,
                label: `${c.studentName} · ${c.studentCode} · ${c.bedCode}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="dueDate" label="Hạn thanh toán" rules={[{ required: true, message: 'Chọn hạn thanh toán' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" allowClear={false} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
          </Form.Item>
        </div>

        <Text strong>Các khoản phí</Text>
        <Form.List
          name="lineItems"
          rules={[{ validator: (_, v) => (v?.length ? Promise.resolve() : Promise.reject(new Error('Thêm ít nhất một khoản phí'))) }]}
        >
          {(fields, { add, remove }, { errors }) => (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '170px minmax(0,1fr) 80px 130px 110px 32px', gap: 8, fontSize: 13, color: '#8C8C8C', marginBottom: 4 }}>
                <span>Loại phí</span><span>Nội dung</span><span>Số lượng</span><span>Đơn giá</span><span style={{ textAlign: 'right' }}>Thành tiền</span><span />
              </div>
              {fields.map(({ key, name }) => {
                const line = lines[name] || {};
                const amount = Math.round((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0));
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '170px minmax(0,1fr) 80px 130px 110px 32px', gap: 8, alignItems: 'start' }}>
                    <Form.Item name={[name, 'feeTypeId']} rules={[{ required: true, message: 'Chọn loại phí' }]} style={{ marginBottom: 8 }}>
                      <Select
                        aria-label={`Loại phí dòng ${name + 1}`} placeholder="Chọn"
                        options={usableFeeTypes.map((t) => ({ value: t.id, label: t.name }))}
                        onChange={(v) => pickFeeType(name, v)}
                      />
                    </Form.Item>
                    <Form.Item name={[name, 'description']} rules={[{ required: true, whitespace: true, message: 'Nhập nội dung' }]} style={{ marginBottom: 8 }}>
                      <Input aria-label={`Nội dung dòng ${name + 1}`} placeholder="VD: Làm mất chìa khóa phòng" maxLength={200} />
                    </Form.Item>
                    <Form.Item name={[name, 'quantity']} rules={[{ required: true, message: 'Nhập' }, { type: 'number', min: 1, message: '≥ 1' }]} style={{ marginBottom: 8 }}>
                      <InputNumber aria-label={`Số lượng dòng ${name + 1}`} min={1} max={1000} precision={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name={[name, 'unitPrice']} rules={[{ required: true, message: 'Nhập đơn giá' }, { type: 'number', min: 1, message: 'Phải > 0' }]} style={{ marginBottom: 8 }}>
                      <InputNumber
                        aria-label={`Đơn giá dòng ${name + 1}`} min={0} max={100000000} step={10000} style={{ width: '100%' }}
                        formatter={moneyFormatter} parser={moneyParser} suffix="đ"
                      />
                    </Form.Item>
                    <Text strong style={{ textAlign: 'right', lineHeight: '32px', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(amount)}</Text>
                    <Button
                      type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa dòng ${name + 1}`}
                      disabled={fields.length === 1} onClick={() => remove(name)}
                    />
                  </div>
                );
              })}
              <Form.ErrorList errors={errors} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ quantity: 1 })} disabled={fields.length >= 10}>Thêm khoản phí</Button>
                <Space><Text type="secondary">Tổng cộng</Text><Text strong style={{ fontSize: 18 }}>{formatCurrency(total)}</Text></Space>
              </div>
            </div>
          )}
        </Form.List>

        <Form.Item name="note" label="Ghi chú" style={{ marginTop: 16, marginBottom: 0 }}>
          <Input.TextArea rows={2} maxLength={500} showCount placeholder="VD: Biên bản ngày 12/09 — hỏng khóa tủ" />
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Loại hóa đơn: Khác · không gắn kỳ. Tiền phòng, tiền cọc lấy từ hợp đồng và nhu yếu phẩm lấy từ đơn hàng nên không chọn ở đây.
        </Text>
      </Form>
    </Modal>
  );
}
