import { useEffect, useState } from 'react';
import {
  Drawer, Form, Radio, Select, InputNumber, Checkbox, Alert, Button, Space, Typography, Row, Col, Tooltip, App,
} from 'antd';
import { roomApi } from '../api/room.api';
import { ROOM_TIER, ROOM_TIER_OPTIONS, ROOM_CAPACITY_OPTIONS } from '../../../constants/statuses';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';

const { Text } = Typography;

/**
 * Đồ cố định đi theo phòng, KHÔNG bán. Đệm/chăn/gối… là nhu yếu phẩm cấp sẵn — chọn ở màn Nhu yếu phẩm,
 * không nhập ở đây để hai danh sách không lệch nhau (DATA-SCHEMA.md §3.13).
 */
const AMENITY_OPTIONS = [
  'Giường tầng', 'Tủ cá nhân', 'Quạt trần', 'Điều hòa', 'Bình nóng lạnh',
  'WC riêng', 'Bàn học chung', 'Bàn học riêng', 'Tủ lạnh mini',
];

const moneyFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const moneyParser = (v) => (v ? v.replace(/\D/g, '') : '');

/**
 * Drawer thêm/sửa loại phòng — SCR-22.
 * roomType = null → thêm mới · roomType != null → sửa
 */
export default function RoomTypeFormDrawer({ open, roomType, onClose, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const isEdit = !!roomType;
  // BR-09: loại phòng đã có phòng dùng thì không đổi được hạng / sức chứa
  const shapeLocked = isEdit && roomType.roomCount > 0;

  const tier = Form.useWatch('tier', form);
  const capacity = Form.useWatch('capacity', form);
  const price = Form.useWatch('pricePerMonth', form);
  const amenities = Form.useWatch('amenities', form) || [];

  useEffect(() => {
    if (!open) return;
    if (isEdit) form.setFieldsValue(roomType);
    else form.setFieldsValue({ tier: 'standard', capacity: 6, pricePerMonth: undefined, depositAmount: 500000, amenities: [], isActive: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomType]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (isEdit) await roomApi.updateRoomType(roomType.id, values);
      else await roomApi.createRoomType(values);
      message.success(isEdit ? 'Cập nhật loại phòng thành công' : 'Thêm loại phòng thành công');
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else if (getErrorCode(err) === 'ROOM_TYPE_IN_USE') {
        form.setFields([{ name: 'capacity', errors: [getErrorMessage(err)] }]);
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const lockHint = shapeLocked ? `Đang có ${roomType.roomCount} phòng dùng loại này — tạo loại mới nếu cần đổi` : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={520}
      destroyOnHidden
      title={(
        <div>
          <Space size={8}>
            <span>{isEdit ? 'Sửa loại phòng' : 'Thêm loại phòng'}</span>
            {tier && <StatusTag type="roomTier" value={tier} />}
          </Space>
          {tier && capacity && (
            <div><Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>{ROOM_TIER[tier]?.label} · {capacity} người</Text></div>
          )}
        </div>
      )}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm loại phòng'}
          </Button>
        </div>
      )}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tooltip title={lockHint}>
          <Form.Item name="tier" label="Hạng phòng" rules={[{ required: true, message: 'Chọn hạng phòng' }]}>
            <Radio.Group options={ROOM_TIER_OPTIONS} disabled={shapeLocked} />
          </Form.Item>
        </Tooltip>

        <Form.Item
          name="capacity"
          label="Sức chứa"
          rules={[{ required: true, message: 'Chọn sức chứa' }]}
          extra={lockHint}
        >
          <Select options={ROOM_CAPACITY_OPTIONS} disabled={shapeLocked} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="pricePerMonth"
              label="Giá mỗi người / tháng"
              rules={[
                { required: true, message: 'Nhập giá thuê' },
                { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' },
              ]}
              extra={price ? `Hiển thị: ${formatCurrency(price)} / người / tháng` : 'Giá của MỘT sinh viên, không phải cả phòng'}
            >
              <InputNumber style={{ width: '100%' }} suffix="đ" formatter={moneyFormatter} parser={moneyParser} step={10000} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="depositAmount"
              label="Tiền cọc"
              rules={[
                { required: true, message: 'Nhập tiền cọc' },
                { type: 'number', min: 0, message: 'Tiền cọc không âm' },
              ]}
            >
              <InputNumber style={{ width: '100%' }} suffix="đ" formatter={moneyFormatter} parser={moneyParser} step={50000} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong>Đồ dùng cấp sẵn</Text>
          <a onClick={() => form.setFieldValue('amenities', amenities.length === AMENITY_OPTIONS.length ? [] : AMENITY_OPTIONS)}>
            {amenities.length === AMENITY_OPTIONS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </a>
        </div>
        <Form.Item name="amenities" style={{ marginBottom: 8 }}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[16, 12]}>
              {AMENITY_OPTIONS.map((a) => <Col span={12} key={a}><Checkbox value={a}>{a}</Checkbox></Col>)}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 20 }}>
          Đệm, chăn, gối… cấp sẵn cho loại phòng được chọn ở màn <b>Nhu yếu phẩm</b>.
          {isEdit && roomType.includedSupplies?.length > 0 && <> Hiện đang cấp: {roomType.includedSupplies.join(', ')}.</>}
        </Text>

        {isEdit && (
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Đang sử dụng — bỏ chọn để ẩn khỏi đăng ký mới (phòng và hợp đồng hiện có không đổi)</Checkbox>
          </Form.Item>
        )}

        <Alert
          type="warning"
          showIcon
          title="Lưu ý quan trọng"
          description="Đổi giá hoặc tiền cọc không ảnh hưởng hợp đồng đã ký. Giá mới chỉ áp dụng cho các đơn đăng ký được duyệt sau thời điểm cập nhật."
        />
      </Form>
    </Drawer>
  );
}
