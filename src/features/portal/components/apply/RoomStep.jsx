import {
  Card, Select, Table, Tag, Typography, Radio, Alert, Button, Skeleton,
} from 'antd';
import { EditOutlined, InfoCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../../utils/formatter';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';
import EmptyState from '../../../../components/EmptyState';

const { Text } = Typography;

const DOT = { occupied: '#D9D9D9', available: '#52C41A', maintenance: '#FFCCC7' };

/** Chấm giường chỉ để xem: xám = đã có người, xanh = trống, hồng = bảo trì. Không chọn được giường (BR-38) */
function BedDots({ room }) {
  const maintenance = Math.max(0, room.capacity - room.occupied - room.availableSlots);
  const dots = [
    ...Array(room.occupied).fill('occupied'),
    ...Array(maintenance).fill('maintenance'),
    ...Array(room.availableSlots).fill('available'),
  ];
  return (
    <div aria-label={`${room.availableSlots}/${room.capacity} giường trống`}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {dots.map((s, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: DOT[s] }} />)}
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>{room.availableSlots}/{room.capacity} trống</Text>
    </div>
  );
}

/** Bước 2 — chọn một phòng còn chỗ. Danh sách chỉ gồm phòng khớp giới tính, lọc ở backend */
export default function RoomStep({
  roomType, rooms, loading, error, buildingId, onBuildingChange, selectedRoomId, onSelect, alert, onCloseAlert, onChangeType,
}) {
  const list = rooms || [];
  const buildings = [...new Map(list.map((r) => [r.buildingId, r.buildingName])).entries()]
    .map(([value, label]) => ({ value, label }));
  const activeBuilding = buildings.some((b) => b.value === buildingId) ? buildingId : buildings[0]?.value;
  const shown = list
    .filter((r) => r.buildingId === activeBuilding)
    .sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber));

  const columns = [
    {
      title: 'Phòng', key: 'room',
      render: (_, r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Text strong>Phòng {roomLabelOf(r)}</Text>
          {r.id === selectedRoomId && <Tag color="blue" style={{ margin: 0 }}>Đang chọn</Tag>}
        </span>
      ),
    },
    { title: 'Tầng', dataIndex: 'floor', width: 80, render: (f) => `Tầng ${f}` },
    { title: 'Sơ đồ giường', key: 'beds', width: 170, render: (_, r) => <BedDots room={r} /> },
    {
      title: 'Còn trống', dataIndex: 'availableSlots', width: 110,
      render: (n) => <Tag color={n === 1 ? 'warning' : 'success'} style={{ margin: 0 }}>Còn {n} chỗ</Tag>,
    },
    {
      title: 'Chọn', key: 'pick', width: 70, align: 'center',
      render: (_, r) => <Radio checked={r.id === selectedRoomId} onChange={() => onSelect(r.id)} aria-label={`Chọn phòng ${roomLabelOf(r)}`} />,
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card styles={{ body: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' } }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: '#E6F4FF', display: 'grid', placeItems: 'center' }}>
          <HomeOutlined style={{ fontSize: 22, color: '#1677FF' }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Text strong style={{ fontSize: 16 }}>{roomType?.name}</Text> <Tag color="blue">Đã chọn</Tag>
          <div><Text type="secondary">{roomType?.amenities?.join(' · ')} · {formatCurrency(roomType?.pricePerMonth)}/người/tháng</Text></div>
        </div>
        <Button type="link" icon={<EditOutlined />} onClick={onChangeType}>Đổi loại phòng</Button>
      </Card>

      <Card>
        {alert && (
          <Alert type="error" showIcon closable style={{ marginBottom: 16 }} title={alert} onClose={onCloseAlert}
            description="Danh sách phòng đã được tải lại. Loại phòng và thời gian ở bạn đã chọn vẫn được giữ nguyên." />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Text>Tòa nhà:</Text>
            <Select
              aria-label="Tòa nhà"
              style={{ minWidth: 180 }}
              value={activeBuilding}
              options={buildings}
              onChange={onBuildingChange}
              disabled={buildings.length === 0}
              placeholder="Không có tòa phù hợp"
            />
          </span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <span style={{ color: DOT.available }}>●</span> Còn trống{'  '}
            <span style={{ color: DOT.occupied }}>●</span> Đã có người{'  '}
            <span style={{ color: DOT.maintenance }}>●</span> Bảo trì
          </Text>
        </div>

        {error && <Alert type="error" showIcon title={error} />}
        {!error && loading && !rooms && <Skeleton active paragraph={{ rows: 4 }} />}
        {!error && rooms && list.length === 0 && (
          <EmptyState description="Loại phòng này vừa hết chỗ. Vui lòng chọn loại phòng khác." actionText="Đổi loại phòng" onAction={onChangeType} />
        )}
        {!error && list.length > 0 && (
          <Table
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={shown}
            pagination={false}
            loading={loading}
            scroll={{ x: 560 }}
            onRow={(r) => ({ onClick: () => onSelect(r.id), style: { cursor: 'pointer' } })}
            rowClassName={(r) => (r.id === selectedRoomId ? 'ant-table-row-selected' : '')}
          />
        )}

        <div style={{ marginTop: 16, padding: '10px 12px', background: '#F0F7FF', borderRadius: 8 }}>
          <Text><InfoCircleOutlined style={{ color: '#1677FF' }} /> <b>Lưu ý:</b> bạn chỉ chọn phòng. Giường cụ thể do ban quản lý ký túc xá tự sắp xếp khi duyệt đơn.</Text>
        </div>
      </Card>
    </div>
  );
}
