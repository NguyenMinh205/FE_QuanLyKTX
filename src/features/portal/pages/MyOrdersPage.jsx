import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Table, Button, Tag, Alert, Empty, App,
} from 'antd';
import {
  ShopOutlined, ShoppingOutlined, DollarOutlined, StopOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { getErrorMessage } from '../../../lib/axiosClient';

import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';

const { Text } = Typography;

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'ready', label: 'Chờ nhận hàng' },
  { key: 'delivered', label: 'Đã nhận' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const itemsText = (order) => (order.items || []).map((it) => `${it.name} ×${it.quantity}`).join(', ');

/** SCR-68 Đơn hàng của tôi (FR-105, FR-107) */
export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [tab, setTab] = useState('all');

  const { data: orders, loading, error, refetch } = useApi(() => portalApi.getMyOrders({ limit: 100 }), []);
  const all = orders || [];
  const count = (key) => (key === 'all' ? all.length : all.filter((o) => o.status === key).length);
  const shown = tab === 'all' ? all : all.filter((o) => o.status === tab);

  const pendingPayment = all.filter((o) => o.status === 'pending_payment');
  const ready = all.filter((o) => o.status === 'ready');
  const spent = all.filter((o) => ['ready', 'delivered'].includes(o.status)).reduce((s, o) => s + o.totalAmount, 0);

  const cancel = (order) => {
    modal.confirm({
      title: `Hủy đơn ${order.orderCode}?`,
      content: `${itemsText(order)} — ${formatCurrency(order.totalAmount)}. Hóa đơn đi kèm cũng bị hủy, bạn không phải thanh toán.`,
      okText: 'Hủy đơn hàng',
      okButtonProps: { danger: true },
      cancelText: 'Giữ lại',
      onOk: async () => {
        try {
          const res = await portalApi.cancelOrder(order.id);
          message.success(res.data.message);
          refetch();
        } catch (err) {
          modal.warning({ title: 'Không hủy được đơn', content: getErrorMessage(err) });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã đơn', dataIndex: 'orderCode', width: 160,
      render: (v, o) => <><Text strong>{v}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(o.createdAt)}</Text></div></>,
    },
    {
      title: 'Sản phẩm', key: 'items',
      render: (_, o) => (
        <>
          <Text>{itemsText(o)}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{(o.items || []).length} món</Text></div>
        </>
      ),
    },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', width: 130, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 200,
      render: (v, o) => (
        <>
          <StatusTag type="supplyOrder" value={v} />
          {v === 'ready' && <div><Text type="secondary" style={{ fontSize: 12 }}>Mang thẻ sinh viên đến văn phòng nhận</Text></div>}
          {v === 'cancelled' && o.cancelReason && <div><Text type="secondary" style={{ fontSize: 12 }}>{o.cancelReason}</Text></div>}
        </>
      ),
    },
    {
      title: 'Thao tác', key: 'actions', width: 190,
      render: (_, o) => (o.status === 'pending_payment' ? (
        <span style={{ display: 'inline-flex', gap: 2 }}>
          <Button size="small" type="link" icon={<DollarOutlined />} onClick={() => navigate(`/portal/my-invoices?invoice=${o.invoiceId}`)}>Thanh toán</Button>
          <Button size="small" type="link" danger icon={<StopOutlined />} onClick={() => cancel(o)}>Hủy</Button>
        </span>
      ) : null),
    },
  ];

  const header = (
    <PageHeader
      breadcrumb={['Mua sắm', 'Đơn hàng của tôi']}
      title="Đơn hàng của tôi"
      description="Theo dõi đơn nhu yếu phẩm đã đặt và tình trạng nhận hàng"
      extra={<Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/portal/shop')}>Mua sắm thêm</Button>}
    />
  );

  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được đơn hàng" description={error} /></>;

  return (
    <>
      {header}

      {ready.length > 0 && (
        <Alert
          type="success" showIcon icon={<ShopOutlined />} style={{ marginBottom: 16 }}
          title={`${ready.length} đơn đã sẵn sàng tại văn phòng ban quản lý`}
          description={`Mang thẻ sinh viên đến nhận: ${ready.map((o) => o.orderCode).join(', ')}.`}
        />
      )}
      {pendingPayment.length > 0 && (
        <Alert
          type="warning" showIcon icon={<ClockCircleOutlined />} style={{ marginBottom: 16 }}
          title={`${pendingPayment.length} đơn chờ bạn thanh toán`}
          description="Đơn quá hạn thanh toán sẽ tự hủy, bạn không bị trừ vào tiền cọc."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card styles={{ body: { paddingTop: 12 } }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {TABS.map((x) => (
                <Tag.CheckableTag key={x.key} checked={tab === x.key} onChange={() => setTab(x.key)}>
                  {x.label} ({count(x.key)})
                </Tag.CheckableTag>
              ))}
            </div>
            {shown.length === 0 && !loading ? (
              <Empty description={tab === 'all' ? 'Bạn chưa đặt đơn nhu yếu phẩm nào' : 'Không có đơn nào ở mục này'}>
                {tab === 'all' && <Button type="primary" onClick={() => navigate('/portal/shop')}>Mua sắm ngay</Button>}
              </Empty>
            ) : (
              <Table
                rowKey="id" columns={columns} dataSource={shown} loading={loading}
                pagination={shown.length > 10 ? { pageSize: 10 } : false} scroll={{ x: 820 }} size="middle"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="Tổng quan đơn hàng" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <Text type="secondary">Chờ thanh toán</Text>
              <Text strong>{pendingPayment.length} đơn</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <Text type="secondary">Chờ nhận hàng</Text>
              <Text strong>{ready.length} đơn</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F0F0F0' }}>
              <Text type="secondary">Đã chi cho nhu yếu phẩm</Text>
              <Text strong>{formatCurrency(spent)}</Text>
            </div>
          </Card>

          <Card title={<span><ShopOutlined style={{ color: '#1677FF' }} /> Nhận hàng</span>}>
            <Text strong>Văn phòng ban quản lý ký túc xá</Text>
            <div><Text type="secondary">Giờ làm việc 8:00 – 17:00 các ngày trong tuần</Text></div>
            <div style={{ marginTop: 8 }}><Text type="secondary" style={{ fontSize: 13 }}>Mang theo thẻ sinh viên khi đến nhận hàng. Ký túc xá không giao hàng tận phòng.</Text></div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
