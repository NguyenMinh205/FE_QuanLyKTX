import { Tag, Typography } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { GENDER } from '../../../constants/statuses';
import { formatDate, formatDateTime } from '../../../utils/formatter';
import { initialsOf, isBlocked, roomTextOf, bedNumberOfCode } from '../utils/applicationView';

const { Text } = Typography;

/** Một thẻ đơn trong danh sách bên trái của SCR-31 */
export default function ApplicationListItem({ app, selected, onSelect }) {
  const blocked = isBlocked(app);
  const { student } = app;

  const accent = selected ? '#1677FF' : 'transparent';
  const open = () => onSelect(app.id);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Đơn ${app.applicationCode} của ${student.fullName}`}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
      style={{
        cursor: 'pointer', background: selected ? '#F0F7FF' : '#fff', borderRadius: 8,
        border: `1px solid ${selected ? '#91CAFF' : '#F0F0F0'}`, borderLeft: `4px solid ${blocked ? '#FF4D4F' : accent}`,
        padding: '12px 14px', transition: 'background .15s, border-color .15s',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          position: 'relative', width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
          background: blocked ? '#FFF1F0' : '#E6F4FF', color: blocked ? '#CF1322' : '#1677FF', fontWeight: 600,
        }}>
          {initialsOf(student.fullName)}
          {blocked && <ExclamationCircleFilled style={{ position: 'absolute', right: -2, bottom: -2, color: '#FF4D4F', background: '#fff', borderRadius: '50%' }} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Text strong ellipsis style={{ fontSize: 15 }}>{student.fullName}</Text>
            {blocked && <Tag color="error" style={{ margin: 0 }}>Hết chỗ</Tag>}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {student.studentCode} · {GENDER[student.gender]?.label}{student.className ? ` · ${student.className}` : ''}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <Tag style={{ margin: 0 }}>{app.roomType.name}</Tag>
        {app.status === 'approved' && app.assigned ? (
          <Text style={{ fontSize: 13, color: '#389E0D' }}>
            {roomTextOf(app.assigned)}{app.assigned.bedCode ? ` · Giường ${bedNumberOfCode(app.assigned.bedCode)}` : ''}
          </Text>
        ) : (
          <Text delete={blocked} style={{ fontSize: 13, color: blocked ? '#CF1322' : '#1677FF' }}>{roomTextOf(app.requestedRoom)}</Text>
        )}
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
          {app.status === 'pending' && `Nộp ${formatDateTime(app.createdAt)}`}
          {app.status === 'approved' && `Duyệt ${formatDate(app.reviewedAt)}`}
          {app.status === 'rejected' && `Từ chối ${formatDate(app.reviewedAt)}`}
        </Text>
      </div>
    </div>
  );
}
