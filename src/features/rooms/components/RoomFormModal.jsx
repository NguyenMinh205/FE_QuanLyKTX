import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, Alert, Row, Col, App } from 'antd';
import { roomApi } from '../api/room.api';
import { GENDER_OPTIONS } from '../../../constants/statuses';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

/**
 * Thêm / sửa phòng — SCR-23.
 * Không có ô giá và ô sức chứa: cả hai lấy từ loại phòng (FR-21). Giường tự sinh khi tạo (FR-22).
 * room = null → thêm mới · room != null → sửa
 */
export default function RoomFormModal({ open, room, buildings, roomTypes, defaultBuildingId, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!room;
  // BR-09: phòng đang có người thì không đổi loại phòng / giới tính
  const occupiedLock = isEdit && room.occupied > 0;

  const roomTypeId = Form.useWatch('roomTypeId', form);
  const chosenType = roomTypes.find((t) => t.id === roomTypeId);

  useEffect(() => {
    if (!open) return;
    if (isEdit) form.setFieldsValue(room);
    else form.setFieldsValue({ buildingId: defaultBuildingId, roomNumber: '', floor: 1, roomTypeId: undefined, gender: undefined, status: 'active' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const res = isEdit
        ? await roomApi.updateRoom(room.id, values)
        : await roomApi.createRoom(values);
      message.success(res.data.message);
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = roomTypes
    .filter((t) => t.isActive || t.id === room?.roomTypeId)
    .map((t) => ({ value: t.id, label: `${t.name} · ${formatCurrency(t.pricePerMonth)}/người` }));

  const lockHint = occupiedLock ? `Phòng đang có ${room.occupied} người ở — không đổi được` : undefined;

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa phòng' : 'Thêm phòng'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm phòng'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="buildingId" label="Tòa nhà" rules={[{ required: true, message: 'Chọn tòa nhà' }]}>
              <Select options={buildings.map((b) => ({ value: b.id, label: b.name }))} disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="roomNumber"
              label="Số phòng"
              rules={[
                { required: true, message: 'Nhập số phòng' },
                { max: 10, message: 'Tối đa 10 ký tự' },
                { pattern: /^[A-Za-z0-9-]+$/, message: 'Chỉ gồm chữ, số, dấu -' },
              ]}
            >
              <Input placeholder="203" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Nhập tầng' }]}>
              <InputNumber min={1} max={50} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="roomTypeId"
          label="Loại phòng"
          rules={[{ required: true, message: 'Chọn loại phòng' }]}
          extra={lockHint ?? (chosenType && `Sức chứa ${chosenType.capacity} người — giá và đồ cấp sẵn theo loại phòng`)}
        >
          <Select options={typeOptions} disabled={occupiedLock} placeholder="Chọn loại phòng" />
        </Form.Item>

        <Form.Item name="gender" label="Giới tính phòng" rules={[{ required: true, message: 'Chọn giới tính phòng' }]} extra={lockHint}>
          <Radio.Group options={GENDER_OPTIONS} disabled={occupiedLock} />
        </Form.Item>

        {isEdit && (
          <Form.Item name="status" label="Trạng thái">
            <Radio.Group options={STATUS_OPTIONS} />
          </Form.Item>
        )}

        {!isEdit && chosenType && (
          <Alert type="info" showIcon title={`Hệ thống sẽ tự tạo ${chosenType.capacity} giường cho phòng này`} />
        )}
        {isEdit && !occupiedLock && roomTypeId && roomTypeId !== room.roomTypeId && (
          <Alert type="warning" showIcon title={`Đổi loại phòng sẽ tạo lại ${chosenType?.capacity} giường, ghi chú bảo trì cũ bị xóa`} />
        )}
      </Form>
    </Modal>
  );
}
