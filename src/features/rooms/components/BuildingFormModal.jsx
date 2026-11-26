import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Alert, App } from 'antd';
import { roomApi } from '../api/room.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

const DUPLICATE_CODES = ['DUPLICATE_ENTRY', 'BUILDING_CODE_ALREADY_EXISTS'];

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
      campus: 'cs1',
      name: values.name.trim(),
      totalFloors: Number(values.totalFloors || 5),
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
      title={isEdit ? `Sửa tòa nhà ${building.name}` : 'Thêm tòa nhà mới'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm tòa nhà'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}
        initialValues={isEdit
          ? { code: building.code, name: building.name, totalFloors: building.totalFloors || 5, description: building.description }
          : { code: '', name: '', totalFloors: 5, description: '' }}
      >
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="code" label="Mã tòa nhà"
              extra={isEdit ? 'Mã tòa không đổi sau khi tạo' : 'VD: A16, A17 (KTX Cơ sở 1)'}
              normalize={(v) => (v || '').toUpperCase()}
              rules={isEdit ? [] : [
                { required: true, whitespace: true, message: 'Nhập mã tòa nhà' },
                { pattern: /^[A-Za-z0-9-]{1,10}$/, message: 'Mã gồm chữ, số, dấu -, tối đa 10 ký tự' },
              ]}
            >
              <Input placeholder="VD: A16" disabled={isEdit} maxLength={10} style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="totalFloors" label="Tổng số tầng" rules={[{ required: true, message: 'Nhập số tầng' }]}>
              <InputNumber min={1} max={30} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="name" label="Tên tòa nhà" rules={[{ required: true, whitespace: true, message: 'Nhập tên tòa nhà' }]}>
          <Input placeholder="VD: Nhà A16 (KTX Cơ sở 1)" maxLength={100} />
        </Form.Item>

        <Form.Item name="description" label="Mô tả" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={3} maxLength={500} showCount placeholder="Mô tả quy mô phòng, văn phòng trực tầng 1..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
