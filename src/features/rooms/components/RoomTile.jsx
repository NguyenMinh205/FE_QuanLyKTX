import { Tooltip, Typography } from 'antd';
import { FILL_LEVEL, fillLevelOf, slotTextOf, roomLabelOf } from '../utils/roomStatus';
import { GENDER, ROOM_TIER } from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';

const { Text } = Typography;
const TIER_SHORT = { high_quality: 'CLC', standard: 'TC', basic: 'CB' };

/** Ô phòng kiến trúc phẳng: nền trắng sắc nét + thanh trạng thái 3px cạnh trái + nhãn giới tính trầm */
export default function RoomTile({ room, selected, onSelect }) {
  const level = FILL_LEVEL[fillLevelOf(room)];
  const used = room.capacity > 0 ? (room.occupied || 0) / room.capacity : 0;
  const genderLabel = room.gender ? GENDER[room.gender]?.label : 'Trống';
  const genderStyle = room.gender === 'female'
    ? { background: '#FDF2F8', color: '#BE185D' }
    : room.gender === 'male'
      ? { background: '#EFF6FF', color: '#1D4ED8' }
      : { background: '#F1F5F9', color: '#475569' };

  const open = () => onSelect(room.id);

  return (
    <Tooltip
      title={`${room.gender ? `Phòng ${genderLabel}` : 'Phòng trống (chưa gán giới tính)'} · ${ROOM_TIER[room.roomTier]?.label || 'Tiêu chuẩn'} · ${formatCurrency(room.pricePerMonth)}/SV/tháng`}
      mouseEnterDelay={0.4}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Phòng ${roomLabelOf(room)}, ${genderLabel}, ${slotTextOf(room)}`}
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        className={`room-tile${selected ? ' room-tile-selected' : ''}`}
        style={{ borderLeft: `3px solid ${level.rail}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <Text strong className="mono" style={{ fontSize: 14, whiteSpace: 'nowrap', color: 'var(--ink)' }}>
            {roomLabelOf(room)}
          </Text>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ ...genderStyle, fontSize: 10.5, fontWeight: 600, padding: '1px 6px', borderRadius: 3, lineHeight: '16px' }}>
              {genderLabel}
            </span>
            <span style={{ background: '#F2F4F7', color: '#475467', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3, lineHeight: '16px' }}>
              {TIER_SHORT[room.roomTier] || 'TC'}
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 4 }}>
          <Text ellipsis style={{ fontSize: 12, color: level.text, fontWeight: 500, minWidth: 0 }}>
            {slotTextOf(room)}
          </Text>
          <Text strong className="mono" style={{ fontSize: 12, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            {room.occupied ?? 0}/{room.capacity}
          </Text>
        </div>

        <div style={{ display: 'flex', height: 3, borderRadius: 2, background: '#EEF1F5', overflow: 'hidden', marginTop: 7 }}>
          <div style={{ width: `${Math.min(100, used * 100)}%`, background: level.color }} />
        </div>
      </div>
    </Tooltip>
  );
}
