import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Segmented, DatePicker, Typography, Tooltip, Row, Col, Tag, App,
} from 'antd';
import {
  ShoppingOutlined, ShopOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, StopOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { supplyApi } from '../api/supply.api';
import { feeApi } from '../../fees/api/fee.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import StatusTag from '../../../components/StatusTag';
import RecordPaymentModal from '../../fees/components/invoices/RecordPaymentModal';
import SupplyOrderDrawer from './SupplyOrderDrawer';
import CancelOrderModal from './CancelOrderModal';
import { cancelOrderBlockReason, itemsTextOf, normalizeOrder, orderRoomOf } from '../utils/supplyView';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const EMPTY_FILTERS = { page: 1, limit: 10, search: '', status: undefined, from: undefined, to: undefined };

const loadOrders = (filters) => supplyApi.getOrders({ ...filters, search: filters.search || undefined })
  .then((res) => {
    const body = res.data?.data;
    const items = Array.isArray(body) ? body : body?.items || [];
    const list = Array.isArray(body) ? { items, total: items.length, page: 1, limit: items.length } : body;
    return { ...res, data: { ...res.data, data: { ...list, items: items.map(normalizeOrder) } } };
  });

/** SCR-71 tab Đơn hàng (FR-104, FR-105, FR-107) */
export default function SupplyOrdersTab({ canManage, canRecordPayment, initialStatus }) {
  const { modal, message, notification } = App.useApp();
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, status: initialStatus });
  const [tableKey, setTableKey] = useState(0);
  const [openOrder, setOpenOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [payInvoice, setPayInvoice] = useState(null);
  const [working, setWorking] = useState(false);

  const { data, meta, loading, error, refetch } = useApi(() => loadOrders(filters), [filters]);
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.status || filters.from;

  const deliver = (order) => {
    modal.confirm({
      title: `Xác nhận đã giao ${order.orderCode}?`,
      content: `${order.studentName} nhận: ${itemsTextOf(order)}. Ghi nhận xong không hoàn tác được.`,
      okText: 'Đã giao cho sinh viên',
      cancelText: 'Chưa giao',
      onOk: async () => {
        setWorking(true);
        try {
          const res = await supplyApi.deliver(order.id);
          message.success(res.data.message);
          setOpenOrder(null);
          refetch();
        } catch (err) {
          modal.warning({ title: 'Không ghi nhận được', content: getErrorMessage(err) });
        } finally {
          setWorking(false);
        }
      },
    });
  };

  /** Thu tiền tại quầy cho đơn chưa thanh toán — mở đúng hóa đơn supplies của đơn (SCR-55) */
  const collect = async (order) => {
    setWorking(true);
    try {
      const res = await feeApi.getInvoiceById(order.invoiceId);
      setPayInvoice(res.data.data);
    } catch (err) {
      modal.warning({ title: 'Không mở được hóa đơn của đơn hàng', content: getErrorMessage(err) });
    } finally {
      setWorking(false);
    }
  };

  const handleRecorded = (res) => {
    setPayInvoice(null);
    if (res) {
      const order = res.data?.supplyOrder;
      notification.success({
        title: res.message,
        description: order?.status === 'ready' ? `Đơn hàng ${order.orderCode} chuyển sang Chờ nhận hàng` : undefined,
      });
    }
    setOpenOrder(null);
    refetch();
  };

  const handleCancelled = (res) => {
    setCancelOrder(null);
    setOpenOrder(null);
    message.success(res.message);
    refetch();
  };

  // Segmented cần value khác nhau cho mọi mục — 'all' là "không lọc"
  const statusOptions = [
    { value: 'all', label: `Tất cả${summary ? ` (${summary.all})` : ''}` },
    { value: 'pending_payment', label: `Chờ thanh toán${summary ? ` (${summary.pendingPayment})` : ''}` },
    { value: 'ready', label: `Chờ nhận hàng${summary ? ` (${summary.ready})` : ''}` },
    { value: 'delivered', label: `Đã giao${summary ? ` (${summary.delivered})` : ''}` },
    { value: 'cancelled', label: `Đã hủy${summary ? ` (${summary.cancelled})` : ''}` },
  ];

  const columns = [
    {
      title: 'Mã đơn', dataIndex: 'orderCode', width: 150, fixed: 'left',
      render: (v, o) => (
        <>
          <a onClick={() => setOpenOrder(o)} style={{ fontWeight: 500 }}>{v}</a>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(o.createdAt)}</Text></div>
        </>
      ),
    },
    {
      title: 'Sinh viên · Phòng', key: 'student', width: 210,
      render: (_, o) => (
        <>
          <div>{o.studentName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{o.studentCode}</Text>
          <Tag style={{ margin: '0 0 0 6px', fontSize: 11, lineHeight: '16px', paddingInline: 4 }}>{orderRoomOf(o)}</Tag>
        </>
      ),
    },
    {
      title: 'Sản phẩm', key: 'items',
      render: (_, o) => <Text style={{ fontSize: 13 }}>{itemsTextOf(o)}</Text>,
    },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', width: 130, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (v) => <StatusTag type="supplyOrder" value={v} /> },
    ...(canManage ? [{
      title: 'Thao tác', key: 'actions', width: 170, fixed: 'right',
      render: (_, o) => {
        const blocked = cancelOrderBlockReason(o);
        return (
          <span style={{ display: 'inline-flex', gap: 2 }}>
            {o.status === 'ready' && (
              <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => deliver(o)}>Đã giao</Button>
            )}
            {o.status === 'pending_payment' && canRecordPayment && (
              <Button size="small" type="link" icon={<DollarOutlined />} loading={working} onClick={() => collect(o)}>Thu tiền</Button>
            )}
            {!blocked && (
              <Button size="small" type="link" danger icon={<StopOutlined />} onClick={() => setCancelOrder(o)}>Hủy</Button>
            )}
            {o.status === 'delivered' || o.status === 'cancelled'
              ? <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setOpenOrder(o)}>Xem</Button>
              : null}
          </span>
        );
      },
    }] : []),
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Tổng đơn" icon={<ShoppingOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" loading={!summary && loading}
            value={summary ? <>{summary.all} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>đơn</Text></> : null}
            footer={<Text type="secondary">Toàn bộ đơn nhu yếu phẩm</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Chờ thanh toán" icon={<ClockCircleOutlined style={{ color: '#FAAD14' }} />} iconBg="#FFFBE6" loading={!summary && loading}
            value={summary ? <>{summary.pendingPayment} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>đơn</Text></> : null}
            footer={<Text type="secondary">Quá hạn sẽ tự hủy, không trừ tiền cọc</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Chờ nhận tại quầy" icon={<ShopOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" loading={!summary && loading}
            value={summary ? <>{summary.ready} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>đơn</Text></> : null}
            footer={summary?.ready
              ? (filters.status === 'ready' ? <Text type="secondary">Đã lọc theo mục này</Text> : <a onClick={() => setFilter({ status: 'ready' })}>Xem đơn cần giao</a>)
              : <Text type="secondary">{summary ? 'Không có đơn chờ nhận' : 'Backend chưa trả số tổng hợp'}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Đã giao hôm nay" icon={<CheckCircleOutlined style={{ color: '#389E0D' }} />} iconBg="#F6FFED" loading={!summary && loading}
            value={summary ? <>{summary.deliveredToday} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>đơn</Text></> : null}
            valueColor="#389E0D"
            footer={<Text type="secondary">Tổng đã giao: {summary ? summary.delivered : '—'}</Text>}
          />
        </Col>
      </Row>

      <Segmented
        style={{ marginBottom: 16 }}
        value={filters.status ?? 'all'}
        onChange={(v) => setFilter({ status: v === 'all' ? undefined : v })}
        options={statusOptions}
      />

      <DataTable
        key={tableKey}
        columns={columns}
        data={data}
        meta={meta}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Tìm mã đơn (DH-…), MSSV, tên sinh viên, phòng…"
        unit="đơn hàng"
        scrollX={1210}
        onRow={(o) => ({ onDoubleClick: () => setOpenOrder(o) })}
        extraFilters={(
          <>
            <RangePicker
              aria-label="Ngày đặt" format="DD/MM/YYYY" allowClear style={{ width: 250 }}
              value={filters.from ? [dayjs(filters.from), dayjs(filters.to)] : null}
              onChange={(range) => setFilter({ from: range?.[0]?.format('YYYY-MM-DD'), to: range?.[1]?.format('YYYY-MM-DD') })}
            />
            <Tooltip title="Xóa bộ lọc">
              <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
            </Tooltip>
          </>
        )}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        Thanh toán đủ hóa đơn thì đơn tự chuyển sang Chờ nhận hàng. Hóa đơn của đơn hàng nằm ở màn <Link to="/admin/invoices?type=supplies">Hóa đơn</Link>.
      </Text>

      <SupplyOrderDrawer
        order={openOrder}
        onClose={() => setOpenOrder(null)}
        onDeliver={deliver}
        onCancel={setCancelOrder}
        onCollect={collect}
        working={working}
        canManage={canManage}
      />
      {canManage && (
        <CancelOrderModal
          key={cancelOrder?.id ?? 'cancel-closed'}
          open={!!cancelOrder}
          order={cancelOrder}
          onCancel={() => setCancelOrder(null)}
          onCancelled={handleCancelled}
        />
      )}
      {canRecordPayment && (
        <RecordPaymentModal
          key={payInvoice?.id ?? 'pay-closed'}
          open={!!payInvoice}
          invoice={payInvoice}
          onCancel={() => setPayInvoice(null)}
          onRecorded={handleRecorded}
        />
      )}
    </>
  );
}
