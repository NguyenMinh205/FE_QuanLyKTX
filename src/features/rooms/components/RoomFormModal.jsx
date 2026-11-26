import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Radio, Switch, Row, Col, Button, App } from 'antd';
import { roomApi } from '../api/room.api';
import {
  GENDER_OPTIONS, ROOM_CAPACITY_OPTIONS, ROOM_TIER_OPTIONS, suggestedPriceOf,
} from '../../../constants/statuses';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';

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

/** Thêm / sửa phòng cấp Phòng (HaUI bảng giá 2026–2027 — không sinh giường lẻ) */
export default function RoomFormModal({ open, room, buildings, defaultBuildingId, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!room;
  const occupied = room?.occupied || 0;
  const genderLocked = isEdit && (occupied > 0 || (room?.pendingApplications || 0) > 0);

  const buildingId = Form.useWatch('buildingId', form);
  const roomTier = Form.useWatch('roomTier', form);
  const capacity = Form.useWatch('capacity', form);

  const building = buildings.find((b) => b.id === buildingId);
  const suggested = building && roomTier && capacity ? suggestedPriceOf(roomTier, capacity, building.campus) : null;

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      form.setFieldsValue({ ...room, gender: room.gender ?? '' });
    } else {
      const defB = buildings.find((b) => b.id === defaultBuildingId) || buildings[0];
      const defPrice = defB ? suggestedPriceOf('standard', 6, defB.campus) : 380000;
      form.setFieldsValue({
        buildingId: defB?.id,
        roomNumber: '',
        floor: 1,
        gender: '',
        roomTier: 'standard',
        capacity: 6,
        hasAirConditioner: false,
        hasWaterHeater: true,
        pricePerMonth: defPrice ?? 380000,
        depositAmount: DEFAULT_DEPOSIT,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, gender: values.gender || null };
      const res = isEdit
        ? await roomApi.updateRoom(room.id, payload)
        : await roomApi.createRoom(payload);
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

  return (
    <Modal
      open={open}
      title={isEdit ? `Sửa phòng ${room.buildingCode || ''}-${room.roomNumber}` : 'Thêm phòng mới'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm phòng'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={620}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="buildingId" label="Tòa nhà" rules={[{ required: true, message: 'Chọn tòa nhà' }]}>
              <Select
                options={buildings.map((b) => ({ value: b.id, label: `${b.code} · ${b.name}` }))}
                disabled={isEdit}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="roomNumber" label="Số phòng"
              rules={[
                { required: true, message: 'Nhập số phòng' },
                { max: 10, message: 'Tối đa 10 ký tự' },
                { pattern: /^[A-Za-z0-9-]+$/, message: 'Chỉ gồm chữ, số, dấu -' },
              ]}
            >
              <Input placeholder="101" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Nhập tầng' }]}>
              <InputNumber min={1} max={30} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="roomTier" label="Hạng phòng (Bảng giá 2026–2027)"
              rules={[{ required: true, message: 'Chọn hạng phòng' }]}
            >
              <Select
                options={ROOM_TIER_OPTIONS}
                onChange={(tier) => {
                  form.setFieldsValue({
                    hasAirConditioner: tier === 'high_quality',
                    hasWaterHeater: tier !== 'basic',
                  });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="capacity" label="Sức chứa phòng"
              rules={[{ required: true, message: 'Chọn sức chứa' }]}
              extra={occupied > 0 ? `Đang có ${occupied} người giữ chỗ — không hạ thấp hơn ${occupied}` : undefined}
            >
              <Radio.Group
                optionType="button" buttonStyle="solid"
                options={ROOM_CAPACITY_OPTIONS.map((o) => ({ ...o, disabled: o.value < occupied }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender" label="Giới tính phòng"
              extra={genderLocked ? 'Phòng đang có người ở hoặc giữ chỗ' : 'Mặc định Trống — tự nhận Nam/Nữ theo sinh viên đầu tiên vào ở'}
            >
              <Radio.Group options={[{ value: '', label: 'Trống (tự động)' }, ...GENDER_OPTIONS]} disabled={genderLocked} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="hasAirConditioner" label="Điều hòa" valuePropName="checked">
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="hasWaterHeater" label="Bình nóng lạnh" valuePropName="checked">
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="pricePerMonth" label="Đơn giá thuê (VNĐ/SV/tháng)"
              rules={[{ required: true, message: 'Nhập đơn giá thuê' }]}
              extra={suggested != null && (
                <span>
                  Giá chuẩn HaUI 2026–2027: <b>{formatCurrency(suggested)}</b>{' '}
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => form.setFieldValue('pricePerMonth', suggested)}>
                    Áp dụng
                  </Button>
                </span>
              )}
            >
              {moneyInput('Đơn giá thuê')}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="depositAmount" label="Tiền cọc tài sản" rules={[{ required: true, message: 'Nhập tiền cọc' }]}>
              {moneyInput('Tiền cọc')}
            </Form.Item>
          </Col>
        </Row>

        {isEdit && (
          <Form.Item name="status" label="Trạng thái" extra="Phòng đang bảo trì ngừng nhận đơn mới; người đang ở vẫn sinh hoạt và ghi điện nước bình thường.">
            <Radio.Group options={STATUS_OPTIONS} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
