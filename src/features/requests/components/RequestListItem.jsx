import { Tag, Typography } from 'antd';
import { CalendarOutlined, SyncOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { REQUEST_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import { initialsOf } from '../../applications/utils/applicationView';
import { extraMonthsOf, roomOfBedCode } from '../utils/requestView';

const { Text } = Typography;

/** Một thẻ yêu cầu ở cột trái SCR-41 */
export default function RequestListItem({ request: r, selected, onSelect }) {
  const open = () => onSelect(r.id);
  const hasDebt = r.outstandingDebt > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${REQUEST_TYPE[r.type]?.label} của ${r.studentName}`}
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
      style={{
        cursor: 'pointer', borderRadius: 8, padding: '12px 14px',
        background: selected ? '#F0F7FF' : '#fff',
        border: `1px solid ${selected ? '#91CAFF' : '#F0F0F0'}`,
        borderLeft: `4px solid ${selected ? '#1677FF' : 'transparent'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag color={REQUEST_TYPE[r.type]?.color} style={{ margin: 0 }}>{REQUEST_TYPE[r.type]?.label}</Tag>
          {hasDebt && r.status === 'pending' && <Tag color="error" style={{ margin: 0 }}>Còn nợ</Tag>}
        </span>
        <Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> Gửi {formatDate(r.createdAt)}</Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Text strong ellipsis style={{ display: 'block', fontSize: 15 }}>{r.studentName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.studentCode} · Phòng {roomOfBedCode(r.bedCode)}</Text>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: '#E6F4FF', color: '#1677FF', fontWeight: 600, fontSize: 13,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          {initialsOf(r.studentName)}
        </div>
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: hasDebt && r.status === 'pending' ? '#FFF1F0' : '#FAFAFA', fontSize: 13 }}>
        {r.type === 'checkout' ? (
          <Text><CalendarOutlined style={{ color: '#D46B08' }} /> Dự kiến trả: <b>{formatDate(r.requestedEndDate)}</b></Text>
        ) : (
          <Text>
            <SyncOutlined style={{ color: '#1677FF' }} /> Gia hạn tới <b>{formatDate(r.requestedEndDate)}</b>
            {r.contractEndDate && ` (+${extraMonthsOf(r.contractEndDate, r.requestedEndDate)} tháng)`}
          </Text>
        )}
        {hasDebt && r.status === 'pending' && (
          <div><Text type="danger"><WarningOutlined /> Công nợ: {formatCurrency(r.outstandingDebt)}</Text></div>
        )}
      </div>
    </div>
  );
}
