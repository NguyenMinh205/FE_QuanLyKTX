import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Space, Empty,
} from 'antd';
import { CloseOutlined, EditOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { roomApi } from '../api/room.api';
import { formatCurrency } from '../../../utils/formatter';
import { GENDER } from '../../../constants/statuses';
import StatusTag from '../../../components/StatusTag';
import { roomLabelOf } from '../utils/roomStatus';

const { Text } = Typography;

function PriceRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ color: 'var(--brand)', fontSize: 15 }}>{children}</Text>
    </div>
  );
}

/** Khung chi tiết phòng cấp Phòng (danh sách sinh viên đang cư trú / giữ chỗ — không hiển thị giường lẻ) */
export default function RoomDetailPanel({ roomId, version, canEditRoom, onClose, onEdit, bordered = true }) {
  const { data: room, loading, error } = useApi(() => roomApi.getRoomById(roomId), [roomId, version]);
  const occupants = room?.occupants || [];

  return (
    <Card
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ position: 'sticky', top: 96 }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 16 }}>
            {room ? `Phòng ${roomLabelOf(room)} · Tầng ${room.floor}` : 'Chi tiết phòng'}
          </Text>
          {room && (
            <>
              <div><Text type="secondary" style={{ fontSize: 12 }}>{room.buildingName} · {room.campusName}</Text></div>
              <Space size={6} wrap style={{ marginTop: 8, display: 'flex' }}>
                <StatusTag type="roomTier" value={room.roomTier} />
                <Tag style={{ margin: 0 }}>{room.capacity} người</Tag>
                {room.gender ? (
                  <Tag color={room.gender === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>Phòng {GENDER[room.gender]?.label}</Tag>
                ) : (
                  <Tag style={{ margin: 0 }}>Trống (tự nhận giới tính)</Tag>
                )}
                {room.status === 'maintenance' && <StatusTag type="roomStatus" value="maintenance" />}
              </Space>
            </>
          )}
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} aria-label="Đóng chi tiết phòng" />
      </div>

      <Divider style={{ margin: 0 }} />

      <div style={{ padding: 20 }}>
        {error && <Alert type="error" showIcon title={error} />}
        {!error && (loading || !room) && <Skeleton active paragraph={{ rows: 8 }} />}

        {!error && !loading && room && (
          <>
            <PriceRow label="Đơn giá thuê">{formatCurrency(room.pricePerMonth)}/SV/tháng</PriceRow>
            <PriceRow label="Tiền đặt cọc">{formatCurrency(room.depositAmount)}</PriceRow>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
              <Text type="secondary">Sức chứa / Đang giữ chỗ</Text>
              <Text strong>
                {room.occupied ?? 0}/{room.capacity} chỗ · Còn {room.availableSlots ?? 0} trống
              </Text>
            </div>
            {room.pendingApplications > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                <Text type="secondary">Đơn chờ duyệt vào phòng</Text>
                <Tag color="warning" style={{ margin: 0 }}>{room.pendingApplications} đơn</Tag>
              </div>
            )}

            {room.amenities?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Tiện ích phòng:</Text>
                <Space size={4} wrap>
                  {room.amenities.map((a) => <Tag key={a} style={{ margin: 0, fontSize: 11 }}>{a}</Tag>)}
                </Space>
              </div>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 10 }}>
              <Text strong>Sinh viên trong phòng ({occupants.length}/{room.capacity})</Text>
            </div>
            {occupants.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Phòng hiện chưa có sinh viên ở hoặc giữ chỗ" />
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {occupants.map((occ) => (
                  <div
                    key={occ.contractId}
                    style={{
                      padding: '10px 12px', borderRadius: 8,
                      background: '#FAFAFA', border: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <Text strong ellipsis>{occ.fullName}</Text>
                      <StatusTag type="contract" value={occ.contractStatus} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {occ.studentCode}{occ.className ? ` · ${occ.className}` : ''} · {occ.contractCode}
                    </div>
                    {occ.contractStatus === 'active' && (
                      <div style={{ fontSize: 11, marginTop: 4, color: occ.checkedInAt ? 'var(--success-text)' : 'var(--warning-text)' }}>
                        {occ.checkedInAt
                          ? <><CheckCircleOutlined /> Đã quét QR Check-in</>
                          : <><ClockCircleOutlined /> Chưa Check-in nhận phòng</>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {canEditRoom && room && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '12px 20px' }}>
            <Button type="link" icon={<EditOutlined />} style={{ paddingInline: 0 }} onClick={() => onEdit(room)}>
              Chỉnh sửa cấu hình phòng
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
