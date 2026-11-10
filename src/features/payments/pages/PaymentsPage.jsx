import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, DatePicker, Typography, Tooltip, Row, Col,
} from 'antd';
import {
  CheckCircleOutlined, WalletOutlined, QrcodeOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { paymentApi } from '../api/payment.api';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import PaymentDetailDrawer from '../components/PaymentDetailDrawer';
import { roomTextOf } from '../../fees/utils/invoiceView';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const EMPTY_FILTERS = { page: 1, limit: 20, search: '', type: undefined, method: undefined, from: undefined, to: undefined };
const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD).map(([value, m]) => ({ value, label: m.label }));

/** SCR-56 Phiếu thu — mỗi lần thu đủ một hóa đơn là một phiếu; tra cứu, đối chiếu, in lại biên lai */
export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  return <PaymentsView key={searchParams.toString()} searchParams={searchParams} />;
}

function PaymentsView({ searchParams }) {
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, search: searchParams.get('search') || '' }));
  const [tableKey, setTableKey] = useState(0);
  const [openPayment, setOpenPayment] = useState(null);

  const { data, meta, loading, error } = useApi(
    () => paymentApi.getList({ ...filters, search: filters.search || undefined }),
    [filters],
  );
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.type || filters.method || filters.from;

  const columns = [
    {
      title: 'Mã phiếu thu', dataIndex: 'paymentCode', width: 170, fixed: 'left',
      render: (v, p) => (
        <>
          <Button type="link" size="small" onClick={() => setOpenPayment(p)} style={{ padding: 0, height: 'auto', fontFamily: 'ui-monospace, Consolas, monospace' }}>{v}</Button>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(p.paidAt)}</Text></div>
        </>
      ),
    },
    {
      title: 'Hóa đơn', key: 'invoice', width: 210,
      render: (_, p) => (
        <>
          <Link to={`/admin/invoices/${p.invoiceId}`}>{p.invoiceCode}</Link>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></div>
        </>
      ),
    },
    {
      title: 'Người nộp', key: 'payer', width: 200,
      render: (_, p) => (
        <>
          <div>{p.payer?.fullName ?? '—'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{p.payer?.studentCode}{p.room ? ` · ${roomTextOf(p.room)}` : ''}</Text>
        </>
      ),
    },
    { title: 'Số tiền', dataIndex: 'amount', width: 130, align: 'right', render: (v) => <Text strong style={{ color: 'var(--success-text)' }}>+{formatCurrency(v)}</Text> },
    {
      title: 'Hình thức', dataIndex: 'method', width: 190,
      render: (v, p) => (
        <>
          <div>{PAYMENT_METHOD[v]?.label ?? v}</div>
          {p.transactionCode && <Text code style={{ fontSize: 12 }}>{p.transactionCode}</Text>}
        </>
      ),
    },
    { title: 'Người thu', dataIndex: 'collectedByName', width: 160, render: (v) => v || <Text type="secondary">Tự động</Text> },
    {
      title: '', key: 'actions', width: 80, fixed: 'right',
      render: (_, p) => <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setOpenPayment(p)}>Xem</Button>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Thanh toán']}
        title="Phiếu thu"
        description="Mỗi lần thu đủ một hóa đơn là một phiếu thu — tra cứu, đối chiếu sao kê và in lại biên lai"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            label="Đã thu" icon={<CheckCircleOutlined style={{ color: 'var(--success-text)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.totalAmount) : null} valueColor="var(--success-text)"
            footer={<Text type="secondary">{meta?.total ?? '—'} phiếu thu theo bộ lọc</Text>}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            label="Tiền mặt" icon={<WalletOutlined style={{ color: 'var(--brand)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.cashAmount) : null}
            footer={<Text type="secondary">Thu tại văn phòng</Text>}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            label="Chuyển khoản VietQR" icon={<QrcodeOutlined style={{ color: 'var(--brand)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.vietqrAmount) : null}
            footer={<Text type="secondary">Cán bộ đã đối chiếu sao kê</Text>}
          />
        </Col>
      </Row>

      <Card>
        <DataTable
          key={tableKey}
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm mã phiếu, mã hóa đơn, mã giao dịch, tên, MSSV…"
          unit="phiếu thu"
          scrollX={1160}
          onRow={(p) => ({ onDoubleClick: () => setOpenPayment(p) })}
          extraFilters={(
            <>
              <Select
                aria-label="Loại hóa đơn" placeholder="Mọi loại hóa đơn" allowClear style={{ width: 170 }}
                value={filters.type} onChange={(v) => setFilter({ type: v })}
                options={Object.entries(INVOICE_TYPE).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Hình thức" placeholder="Mọi hình thức" allowClear style={{ width: 190 }}
                value={filters.method} onChange={(v) => setFilter({ method: v })} options={METHOD_OPTIONS}
              />
              <RangePicker
                aria-label="Khoảng thời gian" format="DD/MM/YYYY" allowClear style={{ width: 250 }}
                value={filters.from ? [dayjs(filters.from), dayjs(filters.to)] : null}
                disabledDate={(d) => d.isAfter(dayjs(), 'day')}
                onChange={(range) => setFilter({
                  from: range?.[0]?.format('YYYY-MM-DD'),
                  to: range?.[1]?.format('YYYY-MM-DD'),
                })}
              />
              <Tooltip title="Xóa bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
              </Tooltip>
            </>
          )}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>Thu tiền ở màn Hóa đơn. Phiếu thu không sửa, không xoá.</Text>
      </Card>

      <PaymentDetailDrawer payment={openPayment} onClose={() => setOpenPayment(null)} />
    </>
  );
}
