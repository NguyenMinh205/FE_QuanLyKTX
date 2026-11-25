import { Tag, Typography, Space } from 'antd';
import { CONTRACT_TERM, GENDER, ROOM_TIER } from '../../../constants/statuses';
import { formatDate, formatDateTime } from '../../../utils/formatter';
import { initialsOf, roomTextOf } from '../utils/applicationView';

const { Text } = Typography;

/** Một thẻ đơn trong danh sách bên trái (xếp thuần theo thứ tự nộp FIFO — không ưu tiên) */
export default function ApplicationListItem({ app, selected, onSelect }) {
  const { student } = app;
  const open = () => onSelect(app.id);

  const wishOrRoom = app.room
    ? roomTextOf(app.room)
    : app.preferredRoomTier
      ? `${ROOM_TIER[app.preferredRoomTier]?.label || app.preferredRoomTier}${app.preferredCapacity ? ` · ${app.preferredCapacity} chỗ` : ''}`
      : 'Chờ xếp tầng thấp → cao';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Đơn ${app.contractCode} của ${student?.fullName}`}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
      style={{
        cursor: 'pointer', background: selected ? '#F0F7FF' : '#fff', borderRadius: 8,
        border: `1px solid ${selected ? '#91CAFF' : 'var(--line)'}`, borderLeft: `4px solid ${selected ? 'var(--brand)' : 'transparent'}`,
        padding: '12px 14px', transition: 'background .15s, border-color .15s',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 600,
        }}>
          {initialsOf(student?.fullName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong ellipsis style={{ fontSize: 15, display: 'block' }}>{student?.fullName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {student?.studentCode} · {GENDER[student?.gender]?.label}
            {app.campus ? ` · ${app.campus.toUpperCase()}` : ''}
          </Text>
        </div>
      </div>

      <Space size={4} wrap style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500 }}>{wishOrRoom}</Text>
        <Tag style={{ margin: 0 }}>{CONTRACT_TERM[app.term]?.label || app.term}</Tag>
      </Space>

      <div style={{ marginTop: 6, textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {app.status === 'pending' ? `Nộp ${formatDateTime(app.createdAt)}` : `Cập nhật ${formatDate(app.reviewedAt || app.createdAt)}`}
        </Text>
      </div>
    </div>
  );
}
