import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, Typography, Tooltip, Row, Col,
} from 'antd';
import {
  WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { roomApi } from '../../rooms/api/room.api';
import { INVOICE_SCOPE, INVOICE_STATUS, INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import StatusTag from '../../../components/StatusTag';
import CollectPaymentModal from '../components/invoices/CollectPaymentModal';
import { isPastDue, subjectOf } from '../utils/invoiceView';

const { Text } = Typography;

const EMPTY_FILTERS = { page: 1, limit: 10, search: '', scope: undefined, type: undefined, status: undefined, buildingId: undefined };

/** SCR-52 Hóa đơn (FR-50). Hóa đơn chỉ sinh từ duyệt đơn và chốt điện nước — không lập tay, không hủy (API.md §8) */
export default function InvoicesPage() {
  // Đổi query trên URL (VD bấm menu Hóa đơn khi đang ở ?status=unpaid) → dựng lại bộ lọc từ đầu
  const [searchParams] = useSearchParams();
  return <InvoicesView key={searchParams.toString()} searchParams={searchParams} />;
}

function InvoicesView({ searchParams }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCollect = can(user, 'payment:record');

  // Mở từ Dashboard kèm ?status=unpaid, hoặc từ nơi khác kèm ?search=
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    search: searchParams.get('search') || '',
    status: INVOICE_STATUS[searchParams.get('status')] ? searchParams.get('status') : undefined,
  }));
  const [tableKey, setTableKey] = useState(0); // đổi key để ô tìm kiếm của DataTable về rỗng khi đặt lại
  const [collectId, setCollectId] = useState(null);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const { data, meta, loading, error, refetch } = useApi(
    () => feeApi.getInvoices({ ...filters, search: filters.search || undefined }),
    [filters],
  );
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.scope || filters.type || filters.status || filters.buildingId;

  const columns = [
    {
      title: 'Mã hóa đơn', dataIndex: 'invoiceCode', width: 200, fixed: 'left',
      render: (v, inv) => <Link to={`/admin/invoices/${inv.id}`} style={{ fontWeight: 500 }}>{v}</Link>,
    },
    {
      title: 'Người phải trả', key: 'subject', width: 200,
      render: (_, inv) => {
        const s = subjectOf(inv);
        return <><div>{s.name}</div><Text type="secondary" style={{ fontSize: 12 }}>{s.sub}</Text></>;
      },
    },
    {
      title: 'Loại', dataIndex: 'type', width: 150,
      render: (v, inv) => <><StatusTag type="invoiceType" value={v} /><div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_SCOPE[inv.scope]?.label}</Text></div></>,
    },
    { title: 'Số tiền', dataIndex: 'amount', width: 125, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    {
      title: 'Hạn nộp', dataIndex: 'dueDate', width: 105,
      render: (v, inv) => <Text type={isPastDue(inv) ? 'danger' : undefined}>{formatDate(v)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 180,
      render: (v, inv) => (
        <>
          <StatusTag type="invoice" value={v} />
          {inv.payer && <div style={{ lineHeight: 1.4, marginTop: 2 }}><Text type="secondary" ellipsis style={{ display: 'block', fontSize: 12 }}>{inv.payer.fullName}</Text><Text type="secondary" style={{ fontSize: 12 }}>{formatDate(inv.paidAt)}</Text></div>}
        </>
      ),
    },
    ...(canCollect ? [{
      title: '', key: 'actions', width: 110, fixed: 'right',
      render: (_, inv) => inv.status === 'unpaid' && (
        <Button size="small" type="link" icon={<DollarOutlined />} onClick={() => setCollectId(inv.id)}>Thu tiền</Button>
      ),
    }] : []),
  ];

  const total = summary?.totalAmount ?? null;
  const pctOf = (v) => (total ? formatPercent((v / total) * 100) : '—');

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Hóa đơn']}
        title="Hóa đơn"
        description="Sinh khi duyệt đơn (cọc, tiền phòng cả kỳ) và khi chốt điện nước. Thu tiền mặt hoặc xác nhận chuyển khoản VietQR."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            label="Phải thu" icon={<WalletOutlined style={{ color: 'var(--brand)' }} />} iconBg="#E6F4FF" loading={!summary && loading}
            value={total !== null ? formatCurrency(total) : null}
            footer={<Text type="secondary">Theo bộ lọc đang chọn</Text>}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            label="Đã thu" icon={<CheckCircleOutlined style={{ color: 'var(--success-text)' }} />} iconBg="#F6FFED" loading={!summary && loading}
            value={summary ? formatCurrency(summary.paidAmount) : null} valueColor="#389E0D"
            footer={<Text type="secondary">Tỷ lệ đã thu: <Text strong>{summary ? pctOf(summary.paidAmount) : '—'}</Text></Text>}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            label="Chưa thu" icon={<ExclamationCircleOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0" loading={!summary && loading}
            value={summary ? formatCurrency(summary.unpaidAmount) : null} valueColor="#CF1322"
            footer={summary?.unpaidCount
              ? (filters.status === 'unpaid'
                ? <Text type="danger">{summary.unpaidCount} hóa đơn</Text>
                : <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => setFilter({ status: 'unpaid' })}>{summary.unpaidCount} hóa đơn — xem ngay</Button>)
              : <Text type="secondary">{summary ? 'Không còn hóa đơn chưa thu' : ''}</Text>}
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
          searchPlaceholder="Tìm mã hóa đơn, MSSV, họ tên, số phòng…"
          unit="hóa đơn"
          scrollX={1090}
          onRow={(inv) => ({ onDoubleClick: () => navigate(`/admin/invoices/${inv.id}`) })}
          extraFilters={(
            <>
              <Select
                aria-label="Đối tượng" placeholder="Cá nhân và phòng" allowClear style={{ width: 160 }}
                value={filters.scope} onChange={(v) => setFilter({ scope: v })}
                options={Object.entries(INVOICE_SCOPE).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Loại hóa đơn" placeholder="Tất cả loại" allowClear style={{ width: 170 }}
                value={filters.type} onChange={(v) => setFilter({ type: v })}
                options={Object.entries(INVOICE_TYPE).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Trạng thái" placeholder="Tất cả trạng thái" allowClear style={{ width: 170 }}
                value={filters.status} onChange={(v) => setFilter({ status: v })}
                options={Object.entries(INVOICE_STATUS).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Tòa" placeholder="Tất cả tòa" allowClear style={{ width: 140 }}
                value={filters.buildingId} onChange={(v) => setFilter({ buildingId: v })}
                options={(buildings || []).map((b) => ({ value: b.id, label: b.name }))}
              />
              <Tooltip title="Xóa bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
              </Tooltip>
            </>
          )}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>Hạn nộp tô đỏ là đã qua hạn mà chưa thu. Bấm mã hóa đơn để xem chi tiết và biên lai.</Text>
      </Card>

      {canCollect && (
        <CollectPaymentModal
          invoiceId={collectId}
          open={!!collectId}
          onClose={(changed) => { setCollectId(null); if (changed) refetch(); }}
        />
      )}
    </>
  );
}
