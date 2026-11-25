import { useState } from 'react';
import { Badge, Button, Popover, Typography, Empty, Space, App } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { formatDateTime } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';

const { Text } = Typography;

/** Chuông Thông báo In-app v3.0 (thông báo cá nhân + bảng tin KTX từ GET /portal/notifications) */
export default function RoomInvoiceBell({ refreshKey }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);

  const { data, meta, refetch } = useApi(() => portalApi.getNotifications({ limit: 20 }), [refreshKey]);
  const list = data || [];
  const unreadCount = meta?.unreadCount ?? list.filter((n) => n.scope === 'personal' && !n.isRead).length;

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
    <div style={{ width: 350, maxWidth: '85vw', maxHeight: 420, overflowY: 'auto' }}>
      {list.length === 0
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào" />
        : list.map((n) => {
          const unread = n.scope === 'personal' && !n.isRead;
          return (
            <div
              key={n.id} role="button" tabIndex={0}
              onClick={() => handleClickItem(n)}
              onKeyDown={(e) => e.key === 'Enter' && handleClickItem(n)}
              style={{
                padding: '10px 8px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
                background: unread ? '#F0F7FF' : 'transparent', borderRadius: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Space size={4}>
                  <StatusTag type="notificationType" value={n.type} />
                  {unread && <Badge status="processing" />}
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>{formatDateTime(n.createdAt)}</Text>
              </div>
              <Text strong={unread} style={{ display: 'block', fontSize: 13 }}>{n.title}</Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>{n.content}</Text>
            </div>
          );
        })}
    </div>
  );

  return (
    <Popover
      content={content}
      title={(
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span>Thông báo ({unreadCount} chưa đọc)</span>
          {unreadCount > 0 && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleReadAll} style={{ padding: 0 }}>
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
