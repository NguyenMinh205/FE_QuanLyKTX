import {
  Card, Form, DatePicker, Input, Tag, Typography, Row, Col,
} from 'antd';
import { BankOutlined, InboxOutlined, ShoppingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';
import { monthsBetween } from '../../utils/applyDates';

const { Text } = Typography;

function SectionTitle({ icon, children, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <Text strong style={{ fontSize: 16 }}>{icon} {children}</Text>
      {extra}
    </div>
  );
}

/** Bước 3 — kiểm tra thông tin, chọn thời gian ở, ghi chú */
export default function ConfirmStep({ form, room, roomType, initialValues, onValuesChange }) {
  const start = Form.useWatch('startDate', form);
  const end = Form.useWatch('endDate', form);
  const months = monthsBetween(start, end);
  const included = [...(roomType?.amenities || []), ...(roomType?.includedSupplies || [])];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <SectionTitle icon={<BankOutlined style={{ color: '#1677FF' }} />} extra={<Tag color="blue" style={{ margin: 0 }}>{roomType?.name}</Tag>}>
          Thông tin chỗ ở
        </SectionTitle>
        <div style={{ padding: '14px 16px', background: '#FAFAFA', borderRadius: 10, marginBottom: 16 }}>
          <Text strong style={{ fontSize: 20, color: '#1677FF' }}>{room?.buildingName} · Phòng {room && roomLabelOf(room)}</Text>
          <div><Text type="secondary">Tầng {room?.floor} · Còn {room?.availableSlots} chỗ lúc bạn chọn · Giường do ban quản lý xếp khi duyệt</Text></div>
        </div>

        <Form form={form} layout="vertical" initialValues={initialValues} onValuesChange={(_, all) => onValuesChange(all)}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="startDate" label="Từ ngày"
                rules={[
                  { required: true, message: 'Chọn ngày bắt đầu' },
                  { validator: (_, v) => (!v || !v.isBefore(dayjs(), 'day') ? Promise.resolve() : Promise.reject(new Error('Ngày bắt đầu không được trước hôm nay'))) },
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"
                  disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="endDate" label="Đến ngày" dependencies={['startDate']}
                extra={months > 0 ? <Text style={{ color: '#1677FF' }}>Thời hạn: {months} tháng</Text> : undefined}
                rules={[
                  { required: true, message: 'Chọn ngày kết thúc' },
                  ({ getFieldValue }) => ({
                    validator: (_, v) => {
                      const s = getFieldValue('startDate');
                      // BR-22: kết thúc sau bắt đầu, tối thiểu 1 tháng
                      if (!v || !s || !v.isBefore(s.add(1, 'month'), 'day')) return Promise.resolve();
                      return Promise.reject(new Error('Thời gian ở tối thiểu 1 tháng'));
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"
                  disabledDate={(d) => (start ? !d.isAfter(start, 'day') : d.isBefore(dayjs(), 'day'))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Ghi chú cho ban quản lý" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={3} maxLength={300} showCount placeholder="VD: Em muốn ở cùng phòng với bạn cùng lớp" />
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <SectionTitle icon={<InboxOutlined style={{ color: '#1677FF' }} />} extra={<Text type="secondary">{included.length} hạng mục</Text>}>
          Phòng đã có sẵn
        </SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(roomType?.amenities || []).map((a) => <Tag key={a} variant="outlined" style={{ margin: 0, padding: '4px 10px' }}>{a}</Tag>)}
          {(roomType?.includedSupplies || []).map((s) => <Tag key={s} color="blue" variant="outlined" style={{ margin: 0, padding: '4px 10px' }}>{s}</Tag>)}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, padding: '12px 14px', background: '#FFF7E6', border: '1px solid #FFE7BA', borderRadius: 10 }}>
          <ShoppingOutlined style={{ color: '#D46B08', fontSize: 18, marginTop: 2 }} />
          <div>
            <Text strong style={{ color: '#AD4E00' }}>Lưu ý về đồ dùng cá nhân</Text>
            <div>
              <Text style={{ color: '#AD4E00' }}>
                Đồ không nằm trong danh sách trên (chăn, gối, đệm…) sinh viên tự chuẩn bị, hoặc mua ở mục <b>Mua sắm</b> sau khi vào ở.
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
