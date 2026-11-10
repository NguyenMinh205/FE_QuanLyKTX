import { useState } from 'react';
import { Badge, Button, Popover, Typography, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import { periodLabel } from '../../fees/utils/readingSheet';

const { Text } = Typography;

/**
 * Chuông cổng SV (FR-41, D3): không có bảng thông báo — đếm hóa đơn điện nước CHƯA NỘP của phòng đang ở.
 * `refreshKey` đổi khi chuyển trang để số luôn mới. Chuông đứng yên, chỉ có số đếm (không rung, không nhấp nháy).
 */
export default function RoomInvoiceBell({ refreshKey }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data, meta } = useApi(() => portalApi.getMyInvoices({ scope: 'room', status: 'unpaid', limit: 20 }), [refreshKey]);
  const list = data || [];
  const count = meta?.total ?? list.length; // danh sách chỉ lấy 20, số đếm lấy tổng thật
  const openInvoice = (id) => { setOpen(false); navigate(`/portal/my-invoices?invoice=${id}`); };

  const content = (
    <div style={{ width: 300, maxWidth: '80vw' }}>
      {list.length === 0
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Phòng không còn hóa đơn chưa nộp" />
        : list.map((inv) => (
          <div
            key={inv.id} role="button" tabIndex={0}
            onClick={() => openInvoice(inv.id)}
            onKeyDown={(e) => e.key === 'Enter' && openInvoice(inv.id)}
            style={{ padding: '8px 4px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <Text strong>Điện nước {inv.monthYear ? periodLabel(inv.monthYear).toLowerCase() : ''}</Text>
              <Text strong style={{ color: '#CF1322', whiteSpace: 'nowrap' }}>{formatCurrency(inv.amount)}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>Hạn {formatDate(inv.dueDate)} · một bạn nộp cho cả phòng</Text>
          </div>
        ))}
    </div>
  );

  return (
    <Popover content={content} title="Hóa đơn phòng chưa nộp" trigger="click" placement="bottomRight" open={open} onOpenChange={setOpen}>
      <Badge count={count} size="small" offset={[-4, 4]}>
        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} aria-label={`Thông báo: ${count} hóa đơn phòng chưa nộp`} />
      </Badge>
    </Popover>
  );
}
