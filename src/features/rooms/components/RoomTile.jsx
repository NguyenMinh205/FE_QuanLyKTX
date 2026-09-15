import { Tooltip, Typography } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { FILL_LEVEL, fillLevelOf, slotTextOf, roomLabelOf, tierShortOf } from '../utils/roomStatus';
import { formatCurrency } from '../../../utils/formatter';

const { Text } = Typography;

/** Một ô phòng trên sơ đồ tầng — bấm để mở chi tiết (SCR-23) */
export default function RoomTile({ room, selected, onSelect }) {
  const level = FILL_LEVEL[fillLevelOf(room)];
  const used = room.occupied / room.capacity;
  const broken = room.maintenanceBeds / room.capacity;
  const showMaintenance = room.maintenanceBeds > 0 && room.status !== 'inactive';

  const open = () => onSelect(room.id);

  return (
    <Tooltip title={`${room.roomTypeName} · ${formatCurrency(room.pricePerMonth)}/người/tháng`} mouseEnterDelay={0.5}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Phòng ${roomLabelOf(room)}, ${slotTextOf(room)}`}
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        style={{
          cursor: 'pointer', borderRadius: 8, padding: '10px 12px', background: level.bg,
          border: `${selected ? 2 : 1}px solid ${selected ? '#1677FF' : level.border}`,
          boxShadow: selected ? '0 0 0 3px rgba(22,119,255,0.15)' : 'none',
          margin: selected ? 0 : 1, transition: 'box-shadow .15s, border-color .15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
          <Text strong style={{ fontSize: 16 }}>{roomLabelOf(room)}</Text>
          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{tierShortOf(room)}</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 4 }}>
          <Text ellipsis style={{ fontSize: 12, color: level.color, fontWeight: 500, minWidth: 0 }}>
            {showMaintenance ? (room.availableSlots > 0 ? `Còn ${room.availableSlots} chỗ` : 'Hết chỗ') : slotTextOf(room)}
          </Text>
          <Text strong style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{room.occupied}/{room.capacity}</Text>
        </div>
        {showMaintenance && (
          <Text style={{ display: 'block', fontSize: 11, color: level.color, marginTop: 2, whiteSpace: 'nowrap' }}>
            <ToolOutlined style={{ marginRight: 4 }} />{room.maintenanceBeds} bảo trì
          </Text>
        )}

        <div style={{ display: 'flex', height: 4, borderRadius: 2, background: '#F0F0F0', overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: `${used * 100}%`, background: level === FILL_LEVEL.maintenance ? '#1677FF' : level.color }} />
          {broken > 0 && <div style={{ width: `${broken * 100}%`, background: '#FF4D4F' }} />}
        </div>
      </div>
    </Tooltip>
  );
}
