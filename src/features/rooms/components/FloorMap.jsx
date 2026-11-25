import { Card, Typography } from 'antd';
import RoomTile from './RoomTile';
import { occupancyRate } from '../utils/roomStatus';
import { formatPercent } from '../../../utils/formatter';

const { Text } = Typography;

/** Sơ đồ phòng chia theo tầng (kiến trúc sạch, không viền tag thừa) */
export default function FloorMap({ rooms, selectedId, onSelect }) {
  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => b - a);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {floors.map((floor) => {
        const list = rooms.filter((r) => r.floor === floor).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
        const total = list.reduce((s, r) => s + (r.capacity || 0), 0);
        const occupied = list.reduce((s, r) => s + (r.occupied || 0), 0);
        const maintenance = list.reduce((s, r) => s + (r.maintenanceSlots || 0), 0);

        return (
          <Card key={floor} styles={{ body: { padding: '16px 18px' } }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
              paddingBottom: 10, marginBottom: 14, borderBottom: '1px solid var(--line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <Text strong style={{ fontSize: 15, color: 'var(--ink)' }}>Tầng {floor}</Text>
                <Text type="secondary" style={{ fontSize: 12.5 }}>
                  {list.length} phòng · <span className="mono">{occupied}/{total}</span> chỗ đang giữ
                </Text>
              </div>
              <Text type="secondary" className="mono" style={{ fontSize: 12 }}>
                Lấp đầy {formatPercent(occupancyRate(occupied, total, maintenance) * 100)}
              </Text>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 1fr))', gap: 10 }}>
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
