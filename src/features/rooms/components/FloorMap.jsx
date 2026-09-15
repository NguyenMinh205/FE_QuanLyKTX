import { Card, Tag, Typography } from 'antd';
import RoomTile from './RoomTile';
import { occupancyRate } from '../utils/roomStatus';
import { formatPercent } from '../../../utils/formatter';

const { Text } = Typography;

/** Sơ đồ phòng chia theo tầng, tầng cao ở trên — SCR-23 */
export default function FloorMap({ rooms, selectedId, onSelect }) {
  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => b - a);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {floors.map((floor) => {
        const list = rooms.filter((r) => r.floor === floor).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
        const total = list.reduce((s, r) => s + r.capacity, 0);
        const occupied = list.reduce((s, r) => s + r.occupied, 0);
        const maintenance = list.reduce((s, r) => s + r.maintenanceBeds, 0);

        return (
          <Card key={floor} styles={{ body: { padding: 20 } }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid #F0F0F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 4, height: 20, borderRadius: 2, background: '#1677FF' }} />
                <Text strong style={{ fontSize: 16 }}>Tầng {floor}</Text>
                <Text type="secondary">· {list.length} phòng ({occupied}/{total} giường đang sử dụng)</Text>
              </div>
              <Tag style={{ margin: 0 }}>Tỷ lệ: {formatPercent(occupancyRate(occupied, total, maintenance) * 100)}</Tag>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12 }}>
              {list.map((room) => (
                <RoomTile key={room.id} room={room} selected={room.id === selectedId} onSelect={onSelect} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
