import { useState } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, Switch, Alert, Typography, App,
} from 'antd';
import { useApi } from '../../../hooks/useApi';
import { supplyApi } from '../api/supply.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { CATEGORY_OPTIONS } from '../utils/supplyView';

const { Text } = Typography;

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

/**
 * Thêm / sửa sản phẩm nhu yếu phẩm — SCR-71 tab Danh mục (FR-100).
 * Loại phòng được cấp sẵn: sản phẩm tự ẩn khỏi cửa hàng của sinh viên ở loại phòng đó (FR-101).
 * item = null → thêm · item != null → sửa
 */
export default function SupplyItemFormModal({ open, item, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!item;

  const { data: roomTypes } = useApi(() => roomApi.getRoomTypes(), []);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    const body = {
      name: values.name.trim(),
      category: values.category,
      unit: values.unit.trim(),
      price: values.price,
      description: values.description?.trim() || '',
      imageUrl: values.imageUrl?.trim() || null,
      includedInRoomTypes: values.includedInRoomTypes || [],
      isActive: values.isActive,
    };
    try {
      const res = isEdit ? await supplyApi.updateItem(item.id, body) : await supplyApi.createItem(body);
      message.success(res.data.message);
      onSaved(res.data.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa sản phẩm ${item.name}` : 'Thêm sản phẩm'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={620}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {/* Cha đặt key theo sản phẩm đang sửa nên initialValues luôn đúng mỗi lần mở */}
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}
        initialValues={isEdit
          ? { ...item, includedInRoomTypes: item.includedInRoomTypes || [] }
          : { category: 'bedding', unit: 'cái', price: undefined, includedInRoomTypes: [], isActive: true }}
      >
        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, whitespace: true, message: 'Nhập tên sản phẩm' }]}>
          <Input placeholder="VD: Đệm mút 90x190cm" maxLength={120} />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1.2fr)', gap: 12 }}>
          <Form.Item name="category" label="Nhóm" rules={[{ required: true, message: 'Chọn nhóm' }]}>
            <Select options={CATEGORY_OPTIONS} aria-label="Nhóm" />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, whitespace: true, message: 'Nhập đơn vị' }]}>
            <Input placeholder="cái" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="price" label="Giá bán"
            rules={[{ required: true, message: 'Nhập giá bán' }, { type: 'number', min: 1000, message: 'Giá từ 1.000 đ' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100000000} step={10000} suffix="đ" formatter={moneyFormatter} parser={moneyParser} />
          </Form.Item>
        </div>
        <Form.Item
          name="includedInRoomTypes" label="Loại phòng được cấp sẵn"
          extra="Sinh viên ở các loại phòng này đã có sẵn đồ nên sẽ không thấy sản phẩm trong cửa hàng (FR-101)"
        >
          <Select
            mode="multiple" allowClear placeholder="Không cấp sẵn cho loại phòng nào" aria-label="Loại phòng được cấp sẵn"
            options={(roomTypes || []).map((t) => ({ value: t.id, label: t.name }))}
          />
        </Form.Item>
        <Form.Item name="imageUrl" label="Đường dẫn ảnh" extra="Để trống thì hiện ô ảnh mặc định">
          <Input placeholder="https://…" maxLength={300} />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} maxLength={300} placeholder="VD: Đệm mút ép, dày 5cm" />
        </Form.Item>
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" style={{ marginBottom: 0 }}>
          <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12 }}>Ngừng bán chỉ ẩn sản phẩm khỏi cửa hàng; đơn hàng cũ vẫn giữ nguyên.</Text>
      </Form>
    </Modal>
  );
}
