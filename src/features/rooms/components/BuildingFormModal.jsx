import { useState } from 'react';
import { Modal, Form, Input, Alert, App } from 'antd';
import { roomApi } from '../api/room.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

/** Mã trùng: docs trả DUPLICATE_ENTRY, backend hiện trả BUILDING_CODE_ALREADY_EXISTS — nhận cả hai */
const DUPLICATE_CODES = ['DUPLICATE_ENTRY', 'BUILDING_CODE_ALREADY_EXISTS'];

/**
 * Thêm / sửa tòa nhà — SCR-21 (FR-20). Mã tòa không đổi được sau khi tạo (backend không nhận `code` khi sửa).
 * building = null → thêm · building != null → sửa
 */
export default function BuildingFormModal({ open, building, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!building;

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    const body = {
      name: values.name.trim(),
      description: values.description?.trim() || '',
    };
    try {
      const res = isEdit
        ? await roomApi.updateBuilding(building.id, body)
        : await roomApi.createBuilding({ ...body, code: values.code.trim().toUpperCase() });
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

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa tòa nhà ${building.name}` : 'Thêm tòa nhà'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm tòa nhà'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={520}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {/* Cha đặt key theo tòa đang sửa nên initialValues luôn đúng mỗi lần mở */}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}
        initialValues={isEdit
          ? { code: building.code, name: building.name, description: building.description }
          : { code: '', name: '', description: '' }}
      >
        <Form.Item
          name="code" label="Mã tòa nhà"
          extra={isEdit ? 'Mã tòa không đổi được sau khi tạo' : 'Dùng làm tiền tố mã phòng, VD "K5" → K5-101'}
          normalize={(v) => (v || '').toUpperCase()}
          rules={isEdit ? [] : [
            { required: true, whitespace: true, message: 'Nhập mã tòa nhà' },
            { pattern: /^[A-Za-z0-9-]{1,10}$/, message: 'Mã gồm chữ, số, dấu -, tối đa 10 ký tự' },
          ]}
        >
          <Input placeholder="VD: K5" disabled={isEdit} maxLength={10} style={{ textTransform: 'uppercase' }} />
        </Form.Item>
        <Form.Item name="name" label="Tên tòa nhà" rules={[{ required: true, whitespace: true, message: 'Nhập tên tòa nhà' }]}>
          <Input placeholder="VD: Tòa K5" maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="Mô tả" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={3} maxLength={500} showCount placeholder="VD: KTX Cơ sở 1, 5 tầng, có thang máy" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
