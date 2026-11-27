import { useState } from 'react';
import { Badge, Button, Popover, Typography, Empty, Segmented, App } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * Biểu tượng & màu sắc dịu nhẹ kiểu toast mảnh (nền trắng, vạch trái mảnh 3px, icon tròn 26px):
 * - Liên quan đến tiền (`payment`, `utility`, `application` chờ đóng phí) -> `$`
 * - Cảnh báo khẩn / quan trọng (`urgent`, `important`) -> `!`
 * - Yêu cầu xử lý (`request`) -> `✓`
 * - Thông tin / Bảng tin chung -> `i`
 */
function visualOf(n) {
  const isMoney = n.type === 'payment'
    || n.type === 'utility'
    || (n.type === 'application' && /thanh toán|đóng phí|vietqr|giữ chỗ|cọc/i.test(`${n.title} ${n.content}`));

  if (n.priority === 'urgent') {
    return {
      glyph: isMoney ? '$' : '!',
      bar: '#F87171',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
      label: isMoney ? 'Cần nộp' : 'Khẩn',
    };
  }
  if (n.type === 'payment') {
    return {
      glyph: '$',
      bar: '#4ADE80',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      label: 'Thanh toán',
    };
  }
  if (isMoney) {
    return {
      glyph: '$',
      bar: '#FBBF24',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      label: n.type === 'utility' ? 'Điện nước' : 'Học phí / Cọc',
    };
  }
  if (n.priority === 'important') {
    return {
      glyph: '!',
      bar: '#FBBF24',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      label: 'Quan trọng',
    };
  }
  if (n.type === 'request') {
    return {
      glyph: '✓',
      bar: '#4ADE80',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      label: 'Yêu cầu',
    };
  }
  return {
    glyph: 'i',
    bar: '#60A5FA',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    label: 'Thông tin',
  };
}

const shortTime = (iso) => (iso ? dayjs(iso).format('DD/MM HH:mm') : '');

/** Chuông Thông báo In-app — thẻ trắng gọn mảnh, viền trái 3px màu nhẹ, icon tròn (i / $ / ! / ✓) */
export default function RoomInvoiceBell({ refreshKey }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data, meta, refetch } = useApi(() => portalApi.getNotifications({ limit: 30 }), [refreshKey]);
  const list = data || [];
  const unreadCount = meta?.unreadCount ?? list.filter((n) => n.scope === 'personal' && !n.isRead).length;
  const importantCount = list.filter((n) => n.priority === 'urgent' || n.priority === 'important').length;

  const shown = list.filter((n) => {
    if (filter === 'important') return n.priority === 'urgent' || n.priority === 'important';
    if (filter === 'personal') return n.scope === 'personal';
    return true;
  });

  const handleClickItem = async (item) => {
    if (item.scope === 'personal' && !item.isRead) {
      try {
        await portalApi.markNotificationRead(item.id);
        refetch();
      } catch {
        // Không chặn điều hướng nếu đánh dấu lỗi mạng
      }
    }
    setOpen(false);
    if (item.refType === 'invoice' || item.type === 'utility' || item.type === 'payment') {
      navigate('/portal/my-invoices');
    } else if (item.refType === 'request' || item.type === 'request') {
      navigate('/portal/requests');
    } else if (item.refType === 'contract' || item.type === 'application') {
      navigate('/portal/my-residence');
    }
  };

  const handleReadAll = async () => {
    try {
      await portalApi.markAllNotificationsRead();
      refetch();
    } catch {
      message.error('Không đánh dấu đã đọc được');
    }
  };

  const content = (
    <div style={{ width: 370, maxWidth: '88vw' }}>
      <Segmented
        block
        size="small"
        value={filter}
        onChange={setFilter}
        style={{ marginBottom: 8 }}
        options={[
          { value: 'all', label: `Tất cả (${list.length})` },
          { value: 'important', label: `Quan trọng (${importantCount})` },
          { value: 'personal', label: 'Của tôi' },
        ]}
      />
      <div style={{ maxHeight: 390, overflowY: 'auto', display: 'grid', gap: 6, paddingRight: 2 }}>
        {shown.length === 0
          ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo trong mục này" />
          : shown.map((n) => {
            const unread = n.scope === 'personal' && !n.isRead;
            const v = visualOf(n);
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                title={v.label}
                onClick={() => handleClickItem(n)}
                onKeyDown={(e) => e.key === 'Enter' && handleClickItem(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '9px 11px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: unread ? '#FAFCFF' : '#FFFFFF',
                  border: '1px solid #EEF2F6',
                  borderLeft: `3px solid ${v.bar}`,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginTop: 1,
                    display: 'grid',
                    placeItems: 'center',
                    background: v.iconBg,
                    color: v.iconColor,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {v.glyph}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.35,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {n.title}
                    </Text>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <Text type="secondary" className="mono" style={{ fontSize: 10.5 }}>
                        {shortTime(n.createdAt)}
                      </Text>
                      {unread && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB' }} />
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      marginTop: 2,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {n.content}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={(
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13.5 }}>Thông báo ({unreadCount} chưa đọc)</span>
          {unreadCount > 0 && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleReadAll} style={{ padding: 0, fontSize: 12 }}>
              Đọc hết
            </Button>
          )}
        </div>
      )}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]} styles={{ indicator: { pointerEvents: 'none' } }}>
        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} aria-label={`Thông báo: ${unreadCount} chưa đọc`} />
      </Badge>
    </Popover>
  );
}
