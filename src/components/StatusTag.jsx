import {
  CONTRACT_STATUS,
  INVOICE_STATUS,
  INVOICE_TYPE,
  ROOM_STATUS,
  ROOM_TIER,
  CAMPUS,
  PERIOD_STATUS,
  PRIORITY_TYPE,
  PAYMENT_TYPE,
  REQUEST_STATUS,
  REQUEST_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  TARGET_COHORT,
} from '../constants/statuses';

const MAP = {
  contract: CONTRACT_STATUS,
  invoice: INVOICE_STATUS,
  invoiceType: INVOICE_TYPE,
  roomStatus: ROOM_STATUS,
  roomTier: ROOM_TIER,
  campus: CAMPUS,
  period: PERIOD_STATUS,
  priority: PRIORITY_TYPE,
  paymentType: PAYMENT_TYPE,
  request: REQUEST_STATUS,
  requestType: REQUEST_TYPE,
  notificationType: NOTIFICATION_TYPE,
  notificationPriority: NOTIFICATION_PRIORITY,
  cohort: TARGET_COHORT,
};

/** Nhóm trạng thái nghiệp vụ & phân loại thông báo: hiển thị pill màu rõ ràng dễ quét */
const STATUS_TYPES = new Set([
  'contract', 'invoice', 'roomStatus', 'period', 'request', 'notificationType', 'notificationPriority',
]);

const DOT_PALETTE = {
  success:    { dot: '#16A34A', text: '#14532D', bg: '#F0FDF4', border: '#BBF7D0' },
  green:      { dot: '#16A34A', text: '#14532D', bg: '#F0FDF4', border: '#BBF7D0' },
  processing: { dot: '#2563EB', text: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  blue:       { dot: '#2563EB', text: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  purple:     { dot: '#7C3AED', text: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE' },
  warning:    { dot: '#D97706', text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  gold:       { dot: '#D97706', text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  orange:     { dot: '#EA580C', text: '#9A3412', bg: '#FFF7ED', border: '#FED7AA' },
  error:      { dot: '#DC2626', text: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
  red:        { dot: '#DC2626', text: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
  default:    { dot: '#64748B', text: '#475467', bg: '#F8FAFC', border: '#E2E6EC' },
};

/**
 * Thẻ trạng thái & phân loại đồng bộ (Editorial Design System):
 * - Trạng thái vòng đời → pill có chấm màu nhỏ (dot) dễ quét, không lòe loẹt
 * - Nhãn phân loại (cơ sở, hạng phòng, đối tượng...) → chip trung tính sạch sẽ
 */
export default function StatusTag({ type, value, status }) {
  const key = value ?? status;
  const item = MAP[type]?.[key];
  if (!item) return <span className="haui-chip">{key || '—'}</span>;

  if (STATUS_TYPES.has(type)) {
    const tone = DOT_PALETTE[item.color] || DOT_PALETTE.default;
    return (
      <span
        className="haui-status"
        style={{ background: tone.bg, borderColor: tone.border, color: tone.text }}
      >
        <span className="haui-status-dot" style={{ background: tone.dot }} />
        {item.label}
      </span>
    );
  }

  // Nhãn phân loại (campus, roomTier, cohort, type...): giữ trung tính, chỉ nhấn nhẹ navy cho hạng CLC hoặc CS1
  const isAccentChip = (type === 'roomTier' && key === 'high_quality')
    || (type === 'paymentType' && key === 'payment')
    || (type === 'campus' && key === 'all');

  if (type === 'paymentType' && key === 'refund') {
    return (
      <span className="haui-chip" style={{ background: '#FFF7ED', color: '#9A3412', borderColor: '#FED7AA' }}>
        {item.label}
      </span>
    );
  }

  return (
    <span className={`haui-chip${isAccentChip ? ' haui-chip-navy' : ''}`}>
      {item.label}
    </span>
  );
}
