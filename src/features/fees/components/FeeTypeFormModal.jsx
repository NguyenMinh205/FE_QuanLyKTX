import { useState } from 'react';
import {
  Modal, Form, Input, InputNumber, Radio, AutoComplete, Alert, App,
} from 'antd';
import { feeApi } from '../api/fee.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import { PRICED_FEE_CODES, PRICE_SOURCE, UNIT_OPTIONS, isSystemFee } from '../utils/feeTypeView';

/** Mã trùng: docs trả DUPLICATE_ENTRY, backend hiện trả FEE_TYPE_CODE_ALREADY_EXISTS — nhận cả hai */
const DUPLICATE_CODES = ['DUPLICATE_ENTRY', 'FEE_TYPE_CODE_ALREADY_EXISTS'];

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

/**
 * Thêm / sửa loại phí — SCR-82 (FR-45). Mã không đổi được sau khi tạo.
 * feeType = null → thêm · feeType != null → sửa
 */
export default function FeeTypeFormModal({ open, feeType, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { modal, message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!feeType;
  const system = isEdit && isSystemFee(feeType);
  const priced = isEdit && PRICED_FEE_CODES.includes(feeType.code);
  const priceSource = isEdit ? PRICE_SOURCE[feeType.code] : null;
  const unit = Form.useWatch('unit', form);

  const save = async (values) => {
    setSaving(true);
    setError(null);
    const body = {
      name: values.name.trim(),
      unit: values.unit.trim(),
      defaultAmount: priceSource ? feeType.defaultAmount : values.defaultAmount,
      isRecurring: values.isRecurring,
    };
    try {
      const res = isEdit
        ? await feeApi.updateFeeType(feeType.id, body)
        : await feeApi.createFeeType({ ...body, code: values.code.trim().toLowerCase() });
      message.success(res.data.message);
      onSaved(res.data.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else if (DUPLICATE_CODES.includes(getErrorCode(err))) form.setFields([{ name: 'code', errors: [getErrorMessage(err)] }]);
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (values) => {
    // BR-52: đổi đơn giá điện nước chỉ áp dụng cho chỉ số nhập từ nay — hỏi lại cho chắc
    if (priced && values.defaultAmount !== feeType.defaultAmount) {
      modal.confirm({
        title: `Đổi đơn giá ${feeType.name.toLowerCase()}?`,
        content: `${formatCurrency(feeType.defaultAmount)} → ${formatCurrency(values.defaultAmount)} mỗi ${values.unit.trim()}. `
          + 'Giá mới áp dụng cho chỉ số điện nước nhập từ nay. Chỉ số đã nhập và hóa đơn đã lập giữ nguyên giá cũ.',
        okText: 'Đổi đơn giá',
        cancelText: 'Xem lại',
        onOk: () => save(values),
      });
      return;
    }
    save(values);
  };

  const amountExtra = priceSource
    ? `${feeType.name} lấy số tiền ${priceSource.toLowerCase()} — không dùng đơn giá ở đây`
    : priced
      ? 'Chốt vào chỉ số điện nước khi nhập; đổi giá không làm sai hóa đơn cũ (BR-52)'
      : 'Gợi ý đơn giá khi lập hóa đơn thủ công — để 0 nếu mỗi lần nhập một số tiền khác';

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa loại phí ${feeType.name}` : 'Thêm loại phí'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm loại phí'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {/* Cha đặt key theo loại phí đang sửa nên initialValues luôn đúng mỗi lần mở */}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}
        initialValues={isEdit
          ? { code: feeType.code, name: feeType.name, unit: feeType.unit, defaultAmount: feeType.defaultAmount, isRecurring: feeType.isRecurring }
          : { code: '', name: '', unit: '', defaultAmount: 0, isRecurring: false }}
      >
        <Form.Item
          name="code" label="Mã loại phí"
          extra={isEdit ? 'Mã không đổi được sau khi tạo — hóa đơn và báo cáo tham chiếu theo mã' : 'Chữ thường không dấu, VD "lost_key"'}
          normalize={(v) => (v || '').toLowerCase()}
          rules={isEdit ? [] : [
            { required: true, whitespace: true, message: 'Nhập mã loại phí' },
            { pattern: /^[a-z][a-z0-9_]{1,29}$/, message: 'Mã bắt đầu bằng chữ, gồm chữ thường, số, dấu _, 2–30 ký tự' },
          ]}
        >
          <Input placeholder="VD: lost_key" disabled={isEdit} maxLength={30} />
        </Form.Item>
        <Form.Item name="name" label="Tên loại phí" rules={[{ required: true, whitespace: true, message: 'Nhập tên loại phí' }]}>
          <Input placeholder="VD: Làm mất chìa khóa" maxLength={100} />
        </Form.Item>
        <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, whitespace: true, message: 'Nhập đơn vị tính' }]}>
          <AutoComplete options={UNIT_OPTIONS} placeholder="VD: chiếc" maxLength={20} filterOption={(input, o) => o.value.includes(input.toLowerCase())} />
        </Form.Item>
        <Form.Item
          name="defaultAmount" label="Đơn giá mặc định" extra={amountExtra}
          rules={priceSource ? [] : [
            { required: true, message: 'Nhập đơn giá' },
            priced
              ? { type: 'number', min: 1, message: 'Đơn giá điện, nước phải lớn hơn 0' }
              : { type: 'number', min: 0, message: 'Đơn giá không âm' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }} disabled={!!priceSource} min={0} max={100000000} step={priced ? 100 : 10000}
            formatter={moneyFormatter} parser={moneyParser} suffix={unit ? `đ/${unit}` : 'đ'}
          />
        </Form.Item>
        <Form.Item
          name="isRecurring" label="Kỳ thu" style={{ marginBottom: 0 }}
          extra={system ? 'Loại phí hệ thống — kỳ thu cố định' : 'Hằng tháng: có thể xuất hiện trên hóa đơn tháng · Một lần: thu khi phát sinh'}
        >
          <Radio.Group disabled={system} options={[{ value: true, label: 'Hằng tháng' }, { value: false, label: 'Một lần' }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
