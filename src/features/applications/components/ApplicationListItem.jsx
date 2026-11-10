import { Tag, Typography } from 'antd';
import { CONTRACT_TERM, GENDER } from '../../../constants/statuses';
import { formatDate, formatDateTime } from '../../../utils/formatter';
import { initialsOf, pad2, roomTextOf } from '../utils/applicationView';

const { Text } = Typography;

/** Một thẻ đơn trong danh sách bên trái của SCR-31. Đơn là hợp đồng `pending` hoặc `rejected` */
export default function ApplicationListItem({ app, selected, onSelect }) {
  const { student } = app;
  const open = () => onSelect(app.id);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Đơn ${app.contractCode} của ${student.fullName}`}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
      style={{
        cursor: 'pointer', background: selected ? '#F0F7FF' : '#fff', borderRadius: 8,
        border: `1px solid ${selected ? '#91CAFF' : '#F0F0F0'}`, borderLeft: `4px solid ${selected ? '#1677FF' : 'transparent'}`,
        padding: '12px 14px', transition: 'background .15s, border-color .15s',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          background: '#E6F4FF', color: '#1677FF', fontWeight: 600,
        }}>
          {initialsOf(student.fullName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong ellipsis style={{ fontSize: 15, display: 'block' }}>{student.fullName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{student.studentCode} · {GENDER[student.gender]?.label}</Text>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Text style={{ fontSize: 13, color: '#1677FF' }}>{roomTextOf(app.room)} · Giường {pad2(app.bedNumber)}</Text>
        <Tag style={{ margin: 0 }}>{CONTRACT_TERM[app.term]?.label}</Tag>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
          {app.status === 'pending' ? `Nộp ${formatDateTime(app.createdAt)}` : `Từ chối ${formatDate(app.reviewedAt)}`}
        </Text>
      </div>
    </div>
  );
}
