import { Link } from 'react-router-dom';
import {
  Drawer, Typography, Button, Table, Alert, Space, Tooltip,
} from 'antd';
import { CheckCircleOutlined, StopOutlined, DollarOutlined, ExportOutlined } from '@ant-design/icons';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import { cancelOrderBlockReason, orderRoomOf } from '../utils/supplyView';

const { Text } = Typography;

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0 }}>{children}</div>
  </div>
);

const columns = [
  { title: 'Sản phẩm', dataIndex: 'name' },
  { title: 'SL', dataIndex: 'quantity', width: 60, align: 'right' },
  { title: 'Đơn giá', dataIndex: 'unitPrice', width: 110, align: 'right', render: (v) => formatCurrency(v) },
  { title: 'Thành tiền', dataIndex: 'amount', width: 120, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
];

/** Chi tiết đơn nhu yếu phẩm (SCR-71) — sản phẩm, hóa đơn đi kèm, thao tác giao / hủy / thu tiền */
export default function SupplyOrderDrawer({
  order, onClose, onDeliver, onCancel, onCollect, working, canManage,
}) {
  const o = order;
  const cancelReason = o ? cancelOrderBlockReason(o) : null;

  return (
    <Drawer
      open={!!o}
      onClose={onClose}
      title={o ? <span>Đơn hàng <Text code>{o.orderCode}</Text></span> : ''}
      size="default"
      destroyOnHidden
      extra={o && canManage && (
        <Space>
          {o.status === 'pending_payment' && <Button icon={<DollarOutlined />} onClick={() => onCollect(o)} loading={working}>Thu tiền</Button>}
          {o.status === 'ready' && <Button type="primary" icon={<CheckCircleOutlined />} loading={working} onClick={() => onDeliver(o)}>Xác nhận đã giao</Button>}
          {!cancelReason && <Button danger icon={<StopOutlined />} onClick={() => onCancel(o)}>Hủy đơn</Button>}
        </Space>
      )}
    >
      {o && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <StatusTag type="supplyOrder" value={o.status} />
            <Text strong style={{ fontSize: 22 }}>{formatCurrency(o.totalAmount)}</Text>
          </div>

          {o.status === 'pending_payment' && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 16 }}
              title="Chờ sinh viên thanh toán"
              description="Thanh toán đủ hóa đơn thì đơn tự chuyển sang Chờ nhận hàng. Đơn quá hạn thanh toán sẽ tự hủy, không trừ vào tiền cọc."
            />
          )}
          {o.status === 'ready' && <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Đã thanh toán — chờ sinh viên đến nhận hàng" />}
          {o.status === 'cancelled' && (
            <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Đơn đã hủy" description={o.cancelReason ? `Lý do: ${o.cancelReason}` : undefined} />
          )}

          <Row label="Sinh viên">{o.studentName} <Text type="secondary">({o.studentCode})</Text></Row>
          <Row label="Phòng">{orderRoomOf(o)}{o.buildingName ? <Text type="secondary"> · {o.buildingName}</Text> : null}</Row>
          <Row label="Ngày đặt">{formatDateTime(o.createdAt)}</Row>
          {o.deliveredAt && <Row label="Đã giao lúc">{formatDateTime(o.deliveredAt)}{o.deliveredByName ? <div><Text type="secondary" style={{ fontSize: 12 }}>Người giao: {o.deliveredByName}</Text></div> : null}</Row>}
          {o.cancelledAt && <Row label="Đã hủy lúc">{formatDateTime(o.cancelledAt)}</Row>}
          <Row label="Hóa đơn">
            {o.invoiceId
              ? <Link to={`/admin/invoices/${o.invoiceId}`}>{o.invoice?.invoiceCode || 'Xem hóa đơn'} <ExportOutlined /></Link>
              : <Text type="secondary">—</Text>}
            {o.invoice && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Còn lại {formatCurrency(o.invoice.remainingAmount)} · hạn {formatDateTime(o.invoice.dueDate).slice(0, 10)}
                </Text>
              </div>
            )}
          </Row>

          <div style={{ marginTop: 16 }}>
            <Text strong>Sản phẩm</Text>
            <Table
              style={{ marginTop: 8 }}
              rowKey={(it) => it.supplyItemId} columns={columns} dataSource={o.items} pagination={false} size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: '#1677FF' }}>{formatCurrency(o.totalAmount)}</Text></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>

          {canManage && cancelReason && o.status !== 'cancelled' && (
            <Tooltip title={cancelReason}>
              <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>Không hủy được đơn này: {cancelReason.toLowerCase()}.</Text>
            </Tooltip>
          )}
        </>
      )}
    </Drawer>
  );
}
