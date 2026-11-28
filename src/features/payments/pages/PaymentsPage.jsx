import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, DatePicker, Typography, Tooltip, Row, Col, App,
} from 'antd';
import {
  CheckCircleOutlined, WalletOutlined, QrcodeOutlined, ReloadOutlined, EyeOutlined, RollbackOutlined, DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { paymentApi } from '../api/payment.api';
import { INVOICE_TYPE, INVOICE_TYPE_FILTER_OPTIONS, PAYMENT_METHOD, PAYMENT_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import StatusTag from '../../../components/StatusTag';
import PaymentDetailDrawer from '../components/PaymentDetailDrawer';
import { roomTextOf } from '../../fees/utils/invoiceView';
import { exportPaymentsExcel } from '../../fees/utils/financeExcel';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const EMPTY_FILTERS = {
  page: 1, limit: 20, search: '', paymentType: undefined, type: undefined, method: undefined, from: undefined, to: undefined,
};
const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD).map(([value, m]) => ({ value, label: m.label }));
const PAYMENT_TYPE_OPTIONS = Object.entries(PAYMENT_TYPE).map(([value, m]) => ({ value, label: m.label }));

/** Danh sách Phiếu thu & Phiếu chi hoàn cọc (v3.0 — tách riêng paymentType payment vs refund) */
export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  return <PaymentsView key={searchParams.toString()} searchParams={searchParams} />;
}

function PaymentsView({ searchParams }) {
  const { message } = App.useApp();
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, search: searchParams.get('search') || '' }));
  const [tableKey, setTableKey] = useState(0);
  const [openPayment, setOpenPayment] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data, meta, loading, error } = useApi(
    () => paymentApi.getList({ ...filters, search: filters.search || undefined }),
    [filters],
  );
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.paymentType || filters.type || filters.method || filters.from;

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await paymentApi.getList({ ...filters, page: 1, limit: 2000, search: filters.search || undefined });
      const items = res.data?.data?.items || [];
      if (!items.length) { message.warning('Không có chứng từ nào khớp bộ lọc để xuất Excel'); return; }
      await exportPaymentsExcel({ items, summary: res.data?.data?.summary });
      message.success(`Đã xuất ${items.length} chứng từ thu chi ra file Excel`);
    } catch (err) {
      message.error(`Không thể xuất Excel: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: 'Mã chứng từ', dataIndex: 'paymentCode', width: 175, fixed: 'left',
      render: (v, p) => (
        <>
          <Button type="link" size="small" onClick={() => setOpenPayment(p)} style={{ padding: 0, height: 'auto', fontFamily: 'ui-monospace, Consolas, monospace' }}>{v}</Button>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(p.paidAt)}</Text></div>
        </>
      ),
    },
    {
      title: 'Loại phiếu', dataIndex: 'paymentType', width: 125,
      render: (v) => <StatusTag type="paymentType" value={v || 'payment'} />,
    },
    {
      title: 'Hóa đơn / Hợp đồng', key: 'invoice', width: 205,
      render: (_, p) => (
        p.invoiceId ? (
          <>
            <Link to={`/admin/invoices/${p.invoiceId}`}>{p.invoiceCode}</Link>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></div>
          </>
        ) : (
          <>
            <Text strong>Chi hoàn tiền cọc</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{p.note || 'Quyết toán khi thanh lý'}</Text></div>
          </>
        )
      ),
    },
    {
      title: 'Sinh viên', key: 'payer', width: 195,
      render: (_, p) => (
        <>
          <div>{p.payer?.fullName ?? '—'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{p.payer?.studentCode}{p.room ? ` · ${roomTextOf(p.room)}` : ''}</Text>
        </>
      ),
    },
    {
      title: 'Số tiền', dataIndex: 'amount', width: 135, align: 'right',
      render: (v, p) => (p.paymentType === 'refund'
        ? <Text strong style={{ color: '#722ED1' }}>−{formatCurrency(v)}</Text>
        : <Text strong style={{ color: 'var(--success-text)' }}>+{formatCurrency(v)}</Text>),
    },
    {
      title: 'Hình thức', dataIndex: 'method', width: 185,
      render: (v, p) => (
        <>
          <div>{PAYMENT_METHOD[v]?.label ?? v}</div>
          {p.transactionCode && <Text code style={{ fontSize: 12 }}>{p.transactionCode}</Text>}
        </>
      ),
    },
    { title: 'Người xử lý', dataIndex: 'collectedByName', width: 155, render: (v) => v || <Text type="secondary">Webhook tự động</Text> },
    {
      title: '', key: 'actions', width: 75, fixed: 'right',
      render: (_, p) => <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setOpenPayment(p)}>Xem</Button>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Thu chi & Hoàn cọc']}
        title="Phiếu thu & Phiếu chi hoàn cọc"
        description="Theo dõi lịch sử thu tiền mặt, đối soát/Webhook VietQR tự động và các phiếu chi hoàn cọc sau thanh lý."
        extra={(
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExportExcel}>
            Xuất sổ thu chi (Excel)
          </Button>
        )}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} lg={6}>
          <StatCard
            label="Tổng đã thu" icon={<CheckCircleOutlined style={{ color: 'var(--success-text)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.totalAmount) : null} valueColor="var(--success-text)"
            footer={<Text type="secondary">Thu phòng, cọc &amp; điện nước</Text>}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            label="Tiền mặt" icon={<WalletOutlined style={{ color: 'var(--brand)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.cashAmount) : null}
            footer={<Text type="secondary">Thu trực tiếp tại văn phòng</Text>}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            label="Chuyển khoản VietQR" icon={<QrcodeOutlined style={{ color: 'var(--brand)' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.vietqrAmount) : null}
            footer={<Text type="secondary">Webhook tự động &amp; đối soát</Text>}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard
            label="Đã chi hoàn cọc" icon={<RollbackOutlined style={{ color: '#722ED1' }} />} loading={!summary && loading}
            value={summary ? formatCurrency(summary.refundAmount ?? 0) : null} valueColor="#722ED1"
            footer={<Text type="secondary">Tách riêng khỏi doanh thu</Text>}
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
          unit="chứng từ"
          scrollX={1240}
          onRow={(p) => ({ onDoubleClick: () => setOpenPayment(p) })}
          extraFilters={(
            <>
              <Select
                placeholder="Thu / Hoàn cọc" allowClear style={{ width: 150 }}
                value={filters.paymentType} onChange={(v) => setFilter({ paymentType: v })}
                options={PAYMENT_TYPE_OPTIONS}
              />
              <Select
                placeholder="Mọi loại hóa đơn" allowClear style={{ width: 195 }}
                value={filters.type} onChange={(v) => setFilter({ type: v })}
                options={INVOICE_TYPE_FILTER_OPTIONS}
              />
              <Select
                placeholder="Mọi hình thức" allowClear style={{ width: 175 }}
                value={filters.method} onChange={(v) => setFilter({ method: v })} options={METHOD_OPTIONS}
              />
              <RangePicker
                format="DD/MM/YYYY" allowClear style={{ width: 240 }}
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
      </Card>

      <PaymentDetailDrawer payment={openPayment} onClose={() => setOpenPayment(null)} />
    </>
  );
}
