import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, Tag, Typography, Tooltip, Row, Col, App,
} from 'antd';
import {
  FileAddOutlined, FileDoneOutlined, WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  WarningOutlined, ReloadOutlined, StopOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { INVOICE_STATUS, INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatCard from '../../../components/StatCard';
import StatusTag from '../../../components/StatusTag';
import GenerateInvoicesModal from '../components/invoices/GenerateInvoicesModal';
import CreateInvoiceModal from '../components/invoices/CreateInvoiceModal';
import RecordPaymentModal from '../components/invoices/RecordPaymentModal';
import { periodOptions } from '../utils/readingSheet';
import { cancelBlockReason, invoiceRoomOf, isOpenInvoice, periodShort } from '../utils/invoiceView';

const { Text } = Typography;

const EMPTY_FILTERS = { page: 1, limit: 10, search: '', billingPeriod: undefined, type: undefined, status: undefined, buildingId: undefined };

/** SCR-52 Danh sách hóa đơn (FR-46, FR-49, FR-58) + mở SCR-53 lập hàng loạt. Viewer chỉ xem */
export default function InvoicesPage() {
  // Đổi query trên URL (VD bấm menu Hóa đơn khi đang ở ?status=overdue) → dựng lại bộ lọc từ đầu
  const [searchParams] = useSearchParams();
  return <InvoicesView key={searchParams.toString()} searchParams={searchParams} />;
}

function InvoicesView({ searchParams }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modal, message, notification } = App.useApp();
  const canCreate = can(user, 'invoice:create');
  const canCancel = can(user, 'invoice:cancel');
  const canRecord = can(user, 'payment:record');

  // Mở từ Dashboard kèm ?status=overdue, hoặc từ nơi khác kèm ?search=
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    search: searchParams.get('search') || '',
    status: INVOICE_STATUS[searchParams.get('status')] ? searchParams.get('status') : undefined,
    billingPeriod: searchParams.get('billingPeriod') || undefined,
  }));
  const [tableKey, setTableKey] = useState(0); // đổi key để ô tìm kiếm của DataTable về rỗng khi đặt lại
  const [generateOpen, setGenerateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null); // hóa đơn đang thu tiền (SCR-55)

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const { data, meta, loading, error, refetch } = useApi(
    () => feeApi.getInvoices({ ...filters, search: filters.search || undefined }),
    [filters],
  );
  const summary = meta?.summary;

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.billingPeriod || filters.type || filters.status || filters.buildingId;

  const cancelInvoice = (inv) => {
    modal.confirm({
      title: `Hủy hóa đơn ${inv.invoiceCode}?`,
      content: (
        <>
          <p style={{ marginBottom: 8 }}>{inv.studentName} · {INVOICE_TYPE[inv.type]?.label} · {formatCurrency(inv.totalAmount)}</p>
          <p style={{ margin: 0 }}>Sinh viên không còn phải trả hóa đơn này. Hóa đơn đã hủy không khôi phục được — lập sai thì tạo hóa đơn mới.</p>
          {inv.type === 'monthly' && <p style={{ margin: '8px 0 0' }}>Hủy hết hóa đơn tháng của một phòng thì chỉ số điện nước kỳ đó được mở khóa để sửa.</p>}
        </>
      ),
      okText: 'Hủy hóa đơn',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: async () => {
        try {
          const res = await feeApi.cancelInvoice(inv.id);
          message.success(res.data.message);
          refetch();
        } catch (err) {
          modal.warning({ title: 'Không hủy được hóa đơn', content: getErrorMessage(err) });
        }
      },
    });
  };

  const handleGenerated = (res) => {
    setGenerateOpen(false);
    const d = res.data;
    notification.success({
      title: res.message,
      description: `Tổng ${formatCurrency(d.totalAmount)}${d.skipped?.length ? ` · bỏ qua ${d.skipped.length} phòng` : ''}`,
      duration: 6,
    });
    refetch();
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
    refetch();
  };

  const handleCreated = (res) => {
    setCreateOpen(false);
    message.success(res.message);
    refetch();
  };

  const columns = [
    {
      title: 'Mã hóa đơn', dataIndex: 'invoiceCode', width: 165, fixed: 'left',
      render: (v, inv) => <Link to={`/admin/invoices/${inv.id}`} style={{ fontWeight: 500 }}>{v}</Link>,
    },
    {
      title: 'Sinh viên · Phòng', key: 'student', width: 210,
      render: (_, inv) => (
        <>
          <div>{inv.studentName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{inv.studentCode}</Text>
          {invoiceRoomOf(inv) !== '—' && <Tag style={{ margin: '0 0 0 6px', fontSize: 11, lineHeight: '16px', paddingInline: 4 }}>{invoiceRoomOf(inv)}</Tag>}
        </>
      ),
    },
    { title: 'Loại', dataIndex: 'type', width: 115, render: (v) => <StatusTag type="invoiceType" value={v} /> },
    { title: 'Kỳ', dataIndex: 'billingPeriod', width: 85, align: 'center', render: (v) => (v ? <span style={{ whiteSpace: 'nowrap' }}>{periodShort(v)}</span> : <Text type="secondary">—</Text>) },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', width: 115, align: 'right', render: (v) => formatCurrency(v) },
    {
      title: 'Đã trả', dataIndex: 'paidAmount', width: 115, align: 'right',
      render: (v, inv) => (inv.status === 'cancelled' ? <Text type="secondary">—</Text> : formatCurrency(v)),
    },
    {
      title: 'Còn lại', dataIndex: 'remainingAmount', width: 115, align: 'right',
      render: (v, inv) => {
        if (inv.status === 'cancelled') return <Text type="secondary">—</Text>;
        return v > 0 ? <Text type="danger" strong>{formatCurrency(v)}</Text> : <Text type="success">{formatCurrency(0)}</Text>;
      },
    },
    {
      title: 'Hạn TT', dataIndex: 'dueDate', width: 105,
      render: (v, inv) => (inv.status === 'overdue' ? <Text type="danger">{formatDate(v)}</Text> : formatDate(v)),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 150, render: (v) => <StatusTag type="invoice" value={v} /> },
    ...(canCancel || canRecord ? [{
      title: 'Thao tác', key: 'actions', width: 165, fixed: 'right',
      render: (_, inv) => {
        if (inv.status === 'cancelled') return null;
        const reason = cancelBlockReason(inv);
        return (
          <span style={{ display: 'inline-flex', gap: 2 }}>
            {canRecord && isOpenInvoice(inv) && (
              <Button size="small" type="link" icon={<DollarOutlined />} onClick={() => setPayInvoice(inv)}>Thu tiền</Button>
            )}
            {canCancel && (
              <Tooltip title={reason}>
                <Button size="small" type="link" danger icon={<StopOutlined />} disabled={!!reason} onClick={() => cancelInvoice(inv)}>Hủy</Button>
              </Tooltip>
            )}
          </span>
        );
      },
    }] : []),
  ];

  const total = summary?.totalAmount ?? null;
  const pctOf = (v) => (total ? formatPercent((v / total) * 100) : '—');

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Hóa đơn']}
        title="Quản lý hóa đơn"
        description="Theo dõi, phát hành và thu tiền các khoản phí ký túc xá"
        extra={canCreate && (
          <>
            <Button icon={<FileAddOutlined />} onClick={() => setCreateOpen(true)}>Tạo hóa đơn lẻ</Button>
            <Button type="primary" icon={<FileDoneOutlined />} onClick={() => setGenerateOpen(true)}>Lập hóa đơn hàng loạt</Button>
          </>
        )}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Phải thu" icon={<WalletOutlined style={{ color: '#1677FF' }} />} iconBg="#E6F4FF" loading={!summary && loading}
            value={total !== null ? formatCurrency(total) : null}
            footer={<Text type="secondary">Theo bộ lọc · không tính hóa đơn hủy</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Đã thu" icon={<CheckCircleOutlined style={{ color: '#389E0D' }} />} iconBg="#F6FFED" loading={!summary && loading}
            value={summary ? formatCurrency(summary.paidAmount) : null} valueColor="#389E0D"
            footer={<Text type="secondary">Tỷ lệ hoàn thành: <Text strong>{summary ? pctOf(summary.paidAmount) : '—'}</Text></Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Còn nợ" icon={<ExclamationCircleOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0" loading={!summary && loading}
            value={summary ? formatCurrency(summary.remainingAmount) : null} valueColor="#CF1322"
            footer={<Text type="secondary">Chiếm {summary ? pctOf(summary.remainingAmount) : '—'} số phải thu</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Quá hạn" icon={<WarningOutlined style={{ color: '#CF1322' }} />} iconBg="#FFF1F0" loading={!summary && loading}
            value={summary ? <>{summary.overdueCount} <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>hóa đơn</Text></> : null}
            valueColor="#CF1322"
            footer={summary?.overdueCount
              ? (filters.status === 'overdue'
                ? <Text type="danger">{formatCurrency(summary.overdueAmount)} chưa thu</Text>
                : <a onClick={() => setFilter({ status: 'overdue' })}>{formatCurrency(summary.overdueAmount)} chưa thu — xem ngay</a>)
              : <Text type="secondary">{summary ? 'Không có hóa đơn quá hạn' : 'Backend chưa trả số tổng hợp'}</Text>}
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
          searchPlaceholder="Tìm mã hóa đơn, MSSV, họ tên, mã giường…"
          unit="hóa đơn"
          scrollX={1325}
          onRow={(inv) => ({ style: inv.status === 'cancelled' ? { opacity: 0.6 } : undefined, onDoubleClick: () => navigate(`/admin/invoices/${inv.id}`) })}
          extraFilters={(
            <>
              <Select
                aria-label="Kỳ" placeholder="Tất cả kỳ" allowClear style={{ width: 150 }}
                value={filters.billingPeriod} onChange={(v) => setFilter({ billingPeriod: v })} options={periodOptions(12)}
              />
              <Select
                aria-label="Loại hóa đơn" placeholder="Tất cả loại" allowClear style={{ width: 150 }}
                value={filters.type} onChange={(v) => setFilter({ type: v })}
                options={Object.entries(INVOICE_TYPE).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Trạng thái" placeholder="Tất cả trạng thái" allowClear style={{ width: 190 }}
                value={filters.status} onChange={(v) => setFilter({ status: v })}
                options={Object.entries(INVOICE_STATUS).map(([value, t]) => ({ value, label: t.label }))}
              />
              <Select
                aria-label="Tòa" placeholder="Tất cả tòa" allowClear style={{ width: 150 }}
                value={filters.buildingId} onChange={(v) => setFilter({ buildingId: v })}
                options={(buildings || []).map((b) => ({ value: b.id, label: b.name }))}
              />
              <Tooltip title="Xóa bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
              </Tooltip>
            </>
          )}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>Bấm mã hóa đơn để xem chi tiết các khoản và lịch sử thanh toán.</Text>
      </Card>

      {canRecord && (
        <RecordPaymentModal key={payInvoice?.id ?? 'closed'} open={!!payInvoice} invoice={payInvoice} onCancel={() => setPayInvoice(null)} onRecorded={handleRecorded} />
      )}
      {canCreate && (
        <>
          <GenerateInvoicesModal open={generateOpen} buildings={buildings} onCancel={() => setGenerateOpen(false)} onDone={handleGenerated} />
          <CreateInvoiceModal open={createOpen} onCancel={() => setCreateOpen(false)} onCreated={handleCreated} />
        </>
      )}
    </>
  );
}
