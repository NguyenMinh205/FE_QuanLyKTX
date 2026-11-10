import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, Alert, Row, Col, App } from 'antd';
import { roomApi } from '../api/room.api';
import { GENDER_OPTIONS, ROOM_CAPACITY_OPTIONS } from '../../../constants/statuses';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'maintenance', label: 'Đang bảo trì' },
];

const DEFAULT_DEPOSIT = 500000;

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

const moneyInput = (label) => (
  <InputNumber aria-label={label} style={{ width: '100%' }} min={0} max={100000000} step={10000} precision={0} suffix="đ" formatter={moneyFormatter} parser={moneyParser} />
);

/**
 * Thêm / sửa phòng — SCR-23 (FR-24, FR-25). Giá, cọc, sức chứa nằm ngay trên phòng; giường tự sinh theo sức chứa.
 * room = null → thêm mới · room != null → sửa
 */
export default function RoomFormModal({ open, room, buildings, defaultBuildingId, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!room;
  // FR-25: phòng đang có người thì không đổi giới tính, sức chứa
  const occupiedLock = isEdit && room.occupied > 0;
  const capacity = Form.useWatch('capacity', form);

  useEffect(() => {
    if (!open) return;
    if (isEdit) form.setFieldsValue(room);
    else form.setFieldsValue({
      buildingId: defaultBuildingId, roomNumber: '', floor: 1, gender: undefined, capacity: 6,
      pricePerMonth: undefined, depositAmount: DEFAULT_DEPOSIT,
    });
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
              <Input placeholder="302" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Nhập tầng' }]}>
              <InputNumber min={1} max={50} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Giới tính phòng" rules={[{ required: true, message: 'Chọn giới tính phòng' }]} extra={lockHint}>
              <Radio.Group options={GENDER_OPTIONS} disabled={occupiedLock} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="capacity" label="Sức chứa" rules={[{ required: true, message: 'Chọn sức chứa' }]} extra={lockHint}>
              <Radio.Group options={ROOM_CAPACITY_OPTIONS} optionType="button" buttonStyle="solid" disabled={occupiedLock} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="pricePerMonth" label="Đơn giá thuê (người/tháng)" rules={[{ required: true, message: 'Nhập đơn giá thuê' }]}>
              {moneyInput('Đơn giá thuê')}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="depositAmount" label="Tiền cọc" rules={[{ required: true, message: 'Nhập tiền cọc' }]}>
              {moneyInput('Tiền cọc')}
            </Form.Item>
          </Col>
        </Row>

        {isEdit && (
          <Form.Item name="status" label="Trạng thái" extra="Phòng đang bảo trì không nhận đơn đăng ký mới">
            <Radio.Group options={STATUS_OPTIONS} />
          </Form.Item>
        )}

        {!isEdit && capacity && (
          <Alert type="info" showIcon title={`Hệ thống sẽ tự tạo ${capacity} giường cho phòng này`} />
        )}
        {isEdit && !occupiedLock && capacity && capacity !== room.capacity && (
          <Alert type="warning" showIcon title={`Đổi sức chứa sẽ tạo lại ${capacity} giường`} />
        )}
      </Form>
    </Modal>
  );
}
