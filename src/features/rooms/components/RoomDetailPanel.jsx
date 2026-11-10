import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Space,
} from 'antd';
import { CloseOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { roomApi } from '../api/room.api';
import { formatCurrency } from '../../../utils/formatter';
import { GENDER } from '../../../constants/statuses';
import StatusTag from '../../../components/StatusTag';
import { bedLabelOf, roomLabelOf } from '../utils/roomStatus';

const { Text } = Typography;

const BED_STYLE = {
  occupied:    { bg: '#FAFAFA', border: '#F0F0F0', badgeBg: '#F0F0F0', badgeColor: '#595959' },
  available:   { bg: '#F6FFED', border: '#B7EB8F', badgeBg: '#52C41A', badgeColor: '#fff' },
  maintenance: { bg: '#FFF1F0', border: '#FFA39E', badgeBg: '#FF4D4F', badgeColor: '#fff' },
};

/** Một hàng giường, chỉ để xem: sinh viên chọn giường khi nộp đơn, cán bộ xác nhận lúc duyệt (FR-30, FR-32) */
function BedRow({ bed }) {
  const s = BED_STYLE[bed.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: s.badgeBg, color: s.badgeColor, fontWeight: 600, fontSize: 13,
      }}>
        {bedLabelOf(bed)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {bed.status === 'occupied' && (
          <>
            <Text strong ellipsis style={{ display: 'block' }}>{bed.occupant?.fullName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {bed.occupant?.studentCode}{bed.occupant?.className ? ` · ${bed.occupant.className}` : ''}
            </Text>
          </>
        )}
        {bed.status === 'available' && <Text strong style={{ color: '#389E0D' }}>Trống</Text>}
        {bed.status === 'maintenance' && <Text strong style={{ color: '#CF1322' }}><ToolOutlined /> Bảo trì</Text>}
      </div>
    </div>
  );
}

function PriceRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ color: '#1677FF', fontSize: 16 }}>{children}</Text>
    </div>
  );
}

/**
 * Khung chi tiết phòng bên phải sơ đồ — SCR-23.
 * @param version tăng lên để buộc tải lại (VD sau khi sửa phòng ở modal)
 */
export default function RoomDetailPanel({ roomId, version, canEditRoom, onClose, onEdit, bordered = true }) {
  const { data: room, loading, error } = useApi(() => roomApi.getRoomById(roomId), [roomId, version]);
  const counts = room?.beds?.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {}) || {};

  return (
    <Card
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ position: 'sticky', top: 96 }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 16 }}>
            {room ? `Phòng ${roomLabelOf(room)} · Tầng ${room.floor} · ${room.buildingName}` : 'Chi tiết phòng'}
          </Text>
          {room && (
            <Space size={6} wrap style={{ marginTop: 8, display: 'flex' }}>
              <Tag style={{ margin: 0 }}>{room.capacity} chỗ</Tag>
              <Tag color={room.gender === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>{GENDER[room.gender]?.label}</Tag>
              {room.status === 'maintenance' && <StatusTag type="roomStatus" value="maintenance" />}
            </Space>
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
            <PriceRow label="Đơn giá thuê">{formatCurrency(room.pricePerMonth)}/người/tháng</PriceRow>
            <PriceRow label="Tiền cọc">{formatCurrency(room.depositAmount)}</PriceRow>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 12 }}>
              <Text strong>Giường</Text>{' '}
              <Text type="secondary">
                ({counts.occupied || 0}/{room.capacity} đang ở · {counts.available || 0} trống · {counts.maintenance || 0} bảo trì)
              </Text>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {room.beds.map((bed) => <BedRow key={bed.bedNumber} bed={bed} />)}
            </div>
          </>
        )}
      </div>

      {canEditRoom && room && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '12px 20px' }}>
            <Button type="link" icon={<EditOutlined />} style={{ paddingInline: 0 }} onClick={() => onEdit(room)}>Sửa phòng</Button>
          </div>
        </>
      )}
    </Card>
  );
}
