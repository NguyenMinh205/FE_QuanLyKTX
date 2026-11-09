import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, DatePicker, Typography, Tooltip, Row, Col, Space, App,
} from 'antd';
import {
  CheckCircleOutlined, RollbackOutlined, SyncOutlined, CloseCircleOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { paymentApi } from '../api/payment.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { INVOICE_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import StatusTag from '../../../components/StatusTag';
import PaymentDetailDrawer from '../components/PaymentDetailDrawer';
import { isReconcilable, normalizePayment, paymentTimeOf } from '../utils/paymentView';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const EMPTY_FILTERS = { page: 1, limit: 20, search: '', type: undefined, method: undefined, status: undefined, from: undefined, to: undefined };

const loadPayments = (filters) => paymentApi.getList({ ...filters, search: filters.search || undefined })
  .then((res) => {
    const body = res.data?.data;
    const items = Array.isArray(body) ? body : body?.items || [];
    const list = Array.isArray(body) ? { items, total: items.length, page: 1, limit: items.length } : body;
    return { ...res, data: { ...res.data, data: { ...list, items: items.map(normalizePayment) } } };
  });

/** SCR-56 Lịch sử thanh toán (FR-56) — tra cứu, đối soát giao dịch treo */
export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  return <PaymentsView key={searchParams.toString()} searchParams={searchParams} />;
}

function PaymentsView({ searchParams }) {
  const { user } = useAuth();
  const { modal, notification } = App.useApp();
  const canReconcile = can(user, 'payment:record');

  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    search: searchParams.get('search') || '',
    status: PAYMENT_STATUS[searchParams.get('status')] ? searchParams.get('status') : undefined,
    studentId: searchParams.get('studentId') || undefined,
  }));
  const [tableKey, setTableKey] = useState(0);
  const [openPayment, setOpenPayment] = useState(null);
  const [reconciling, setReconciling] = useState(false);

  const { data, meta, loading, error, refetch } = useApi(() => loadPayments(filters), [filters]);
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.type || filters.method || filters.status || filters.from;

  const reconcile = async (p) => {
    setReconciling(true);
    try {
      const res = await paymentApi.reconcile(p.id);
      const updated = normalizePayment(res.data.data?.payment ?? {});
      notification[updated.status === 'success' ? 'success' : 'info']({ title: res.data.message, duration: 6 });
      setOpenPayment(updated.id ? updated : null);
      refetch();
    } catch (err) {
      modal.warning({ title: 'Không đối soát được', content: getErrorMessage(err) });
    } finally {
      setReconciling(false);
    }
  };

  const columns = [
    {
      title: 'Mã giao dịch', dataIndex: 'transactionRef', width: 190, fixed: 'left',
      render: (v, p) => (
        <>
          {/* Backend hiện tại không sinh mã tham chiếu cho giao dịch tại quầy */}
          <a onClick={() => setOpenPayment(p)} style={{ fontFamily: 'ui-monospace, Consolas, monospace' }}>{v || 'Xem giao dịch'}</a>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(paymentTimeOf(p))}</Text></div>
        </>
      ),
    },
    {
      title: 'Sinh viên', key: 'student', width: 190,
      render: (_, p) => <><div>{p.studentName || '—'}</div>{p.studentCode && <Text type="secondary" style={{ fontSize: 12 }}>{p.studentCode}</Text>}</>,
    },
    {
      title: 'Hóa đơn', key: 'invoice', width: 185,
      render: (_, p) => (p.invoiceId
        ? <><Link to={`/admin/invoices/${p.invoiceId}`}>{p.invoiceCode}</Link>{p.invoiceType && <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></div>}</>
        : <Text type="secondary">—</Text>),
    },
    {
      title: 'Số tiền', dataIndex: 'amount', width: 140, align: 'right',
      render: (v, p) => (p.type === 'refund'
        ? <Text strong style={{ color: '#1677FF' }}>−{formatCurrency(v)}</Text>
        : <Text strong style={{ color: p.status === 'success' ? '#389E0D' : undefined }}>+{formatCurrency(v)}</Text>),
    },
    { title: 'Hình thức', dataIndex: 'method', width: 130, render: (v) => PAYMENT_METHOD[v]?.label ?? v },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (v) => <StatusTag type="payment" value={v} /> },
    {
      title: 'Thao tác', key: 'actions', width: 145, fixed: 'right',
      render: (_, p) => (
        <span style={{ display: 'inline-flex', gap: 2 }}>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setOpenPayment(p)}>Xem</Button>
          {canReconcile && isReconcilable(p) && (
            <Tooltip title="Hỏi lại cổng thanh toán về giao dịch đang treo">
              <Button size="small" type="link" icon={<SyncOutlined />} loading={reconciling} onClick={() => reconcile(p)}>Đối soát</Button>
            </Tooltip>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Thanh toán']}
        title="Lịch sử thanh toán"
        description="Toàn bộ giao dịch thu tiền và hoàn tiền — dùng để tra cứu và đối soát với cổng thanh toán"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Đã thu" icon={<CheckCircleOutlined style={{ color: '#389E0D' }} />} iconBg="#F6FFED" loading={!summary && loading}
            value={summary ? formatCurrency(summary.collectedAmount) : null} valueColor="#389E0D"
            footer={<Text type="secondary">{summary ? `${summary.successCount} giao dịch thành công` : 'Backend chưa trả số tổng hợp'}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Đã hoàn trả" icon={<RollbackOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" loading={!summary && loading}
            value={summary ? formatCurrency(summary.refundedAmount) : null} valueColor="#1677FF"
            footer={<Text type="secondary">{summary ? 'Hoàn tiền cọc khi trả phòng' : 'Backend chưa trả số tổng hợp'}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Đang xử lý" icon={<SyncOutlined style={{ color: '#FAAD14' }} />} iconBg="#FFFBE6" loading={!summary && loading}
            value={summary ? <>{summary.pendingCount} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>giao dịch</Text></> : null}
            footer={summary?.pendingCount
              ? (filters.status === 'pending'
                ? <Text type="warning">Chờ cổng thanh toán phản hồi</Text>
                : <a onClick={() => setFilter({ status: 'pending' })}>Xem và đối soát</a>)
              : <Text type="secondary">{summary ? 'Không có giao dịch treo' : 'Backend chưa trả số tổng hợp'}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Thất bại / hết hạn" icon={<CloseCircleOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0" loading={!summary && loading}
            value={summary ? <>{summary.failedCount} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>giao dịch</Text></> : null}
            footer={<Text type="secondary">{summary ? 'Sinh viên không bị trừ tiền' : 'Backend chưa trả số tổng hợp'}</Text>}
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
          searchPlaceholder="Tìm mã giao dịch, mã hóa đơn, tên, MSSV…"
          unit="giao dịch"
          scrollX={1180}
          onRow={(p) => ({ onDoubleClick: () => setOpenPayment(p) })}
          extraFilters={(
            <>
              <Select
                aria-label="Loại giao dịch" placeholder="Thu và hoàn" allowClear style={{ width: 150 }}
                value={filters.type} onChange={(v) => setFilter({ type: v })}
                options={[{ value: 'payment', label: 'Thu tiền' }, { value: 'refund', label: 'Hoàn tiền' }]}
              />
              <Select
                aria-label="Hình thức" placeholder="Mọi hình thức" allowClear style={{ width: 160 }}
                value={filters.method} onChange={(v) => setFilter({ method: v })}
                options={Object.entries(PAYMENT_METHOD).map(([value, m]) => ({ value, label: m.label }))}
              />
              <Select
                aria-label="Trạng thái" placeholder="Mọi trạng thái" allowClear style={{ width: 160 }}
                value={filters.status} onChange={(v) => setFilter({ status: v })}
                options={Object.entries(PAYMENT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
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
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Giao dịch đang xử lý chưa cộng vào hóa đơn. Ghi nhận thu tiền tại quầy ở màn Hóa đơn.
          </Text>
        </Space>
      </Card>

      <PaymentDetailDrawer
        payment={openPayment}
        onClose={() => setOpenPayment(null)}
        onReconcile={reconcile}
        reconciling={reconciling}
        canReconcile={canReconcile}
      />
    </>
  );
}
