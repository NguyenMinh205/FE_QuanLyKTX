import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tabs, Tag, Alert, Skeleton, Empty, Badge,
} from 'antd';
import { ClockCircleOutlined, WarningOutlined, ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import MyInvoiceDetail from '../components/invoices/MyInvoiceDetail';
import { OPEN_INVOICE_STATUSES, daysUntil } from '../utils/homeView';

const { Text, Title } = Typography;

const loadInvoices = () => portalApi.getMyInvoices({ limit: 100 }).then((res) => {
  const body = res.data?.data;
  const items = Array.isArray(body) ? body : body?.items || [];
  return { ...res, data: { ...res.data, data: { items, total: items.length, page: 1, limit: items.length } } };
});

/** Một dòng hóa đơn trong danh sách trái */
function InvoiceRow({ invoice, active, onSelect }) {
  const open = OPEN_INVOICE_STATUSES.includes(invoice.status);
  const daysLeft = daysUntil(invoice.dueDate);
  const overdue = invoice.status === 'overdue' || (open && daysLeft !== null && daysLeft < 0);
  const supplies = invoice.type === 'supplies';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Hóa đơn ${invoice.invoiceCode}`}
      onClick={() => onSelect(invoice.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(invoice.id); }}
      style={{
        border: `1px solid ${active ? '#1677FF' : '#F0F0F0'}`,
        background: active ? '#F5F9FF' : '#fff',
        borderRadius: 10, padding: 12, marginBottom: 10, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: supplies ? '#F6FFED' : '#E6F4FF', color: supplies ? '#389E0D' : '#1677FF',
        }}>{supplies ? <ShoppingOutlined /> : <FileTextOutlined />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Text strong>{INVOICE_TYPE[invoice.type]?.label ?? invoice.type}{invoice.billingPeriod ? ` tháng ${invoice.billingPeriod.split('-').reverse().join('/')}` : ''}</Text>
            <Text strong style={{ whiteSpace: 'nowrap' }}>{formatCurrency(invoice.totalAmount)}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{invoice.invoiceCode} · Hạn {formatDate(invoice.dueDate)}</Text>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <StatusTag type="invoice" value={invoice.status} />
            {overdue && <Text type="danger" style={{ fontSize: 12 }}><WarningOutlined /> Quá hạn thanh toán</Text>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** SCR-64 Hóa đơn của tôi — danh sách + chi tiết trên cùng một màn (FR-84, FR-52) */
export default function MyInvoicesPage() {
  const [searchParams] = useSearchParams();
  const paramInvoice = searchParams.get('invoice');
  const [userTab, setUserTab] = useState(null); // null = để hệ thống tự chọn tab theo hóa đơn mở từ nơi khác
  const [selectedId, setSelectedId] = useState(paramInvoice || null);

  const { data: invoices, loading, error, refetch } = useApi(loadInvoices, []);
  const all = useMemo(() => invoices || [], [invoices]);
  const open = useMemo(() => all.filter((i) => OPEN_INVOICE_STATUSES.includes(i.status)), [all]);
  const closed = useMemo(() => all.filter((i) => !OPEN_INVOICE_STATUSES.includes(i.status)), [all]);
  // Mở từ màn Kết quả thanh toán: hóa đơn vừa trả nằm ở tab Đã thanh toán → tự chuyển tab
  const tab = userTab ?? (paramInvoice && closed.some((i) => i.id === paramInvoice) ? 'closed' : 'open');
  const shown = tab === 'open' ? open : closed;
  // Hóa đơn đang mở: hóa đơn người dùng chọn, nếu không còn trong tab thì lấy hóa đơn đầu danh sách
  const activeId = (selectedId && shown.some((i) => i.id === selectedId) ? selectedId : shown[0]?.id) ?? null;

  const { data: detail, loading: detailLoading, refetch: refetchDetail } = useApi(
    () => (activeId
      ? portalApi.getMyInvoiceById(activeId)
      : Promise.resolve({ data: { data: null } })),
    [activeId],
  );

  const totalDebt = open.reduce((sum, i) => sum + (i.remainingAmount ?? i.totalAmount - i.paidAmount), 0);
  const nextDue = open.map((i) => i.dueDate).sort()[0];

  const header = <PageHeader breadcrumb={['Hóa đơn & thanh toán']} title="Hóa đơn & thanh toán" description="Các khoản tiền phòng, điện nước và dịch vụ của bạn" />;
  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được danh sách hóa đơn" description={error} /></>;
  if (loading && !invoices) return <>{header}<Card><Skeleton active paragraph={{ rows: 6 }} /></Card></>;

  return (
    <>
      {header}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div>
              <Text type="secondary">Tổng đang nợ</Text>
              {open.length > 0 && <Tag color="error" style={{ marginLeft: 8 }}>{open.length} khoản cần nộp</Tag>}
            </div>
            <Title level={2} style={{ margin: '4px 0 0', color: totalDebt > 0 ? '#CF1322' : '#389E0D' }}>{formatCurrency(totalDebt)}</Title>
          </div>
          {nextDue && (
            <Text type="secondary"><ClockCircleOutlined /> Kỳ hạn gần nhất: <Text strong>{formatDate(nextDue)}</Text></Text>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card styles={{ body: { paddingTop: 8 } }}>
            <Tabs
              activeKey={tab}
              onChange={(k) => { setUserTab(k); setSelectedId(null); }}
              items={[
                { key: 'open', label: <Badge count={open.length} offset={[8, 0]} size="small"><span style={{ paddingRight: open.length ? 14 : 0 }}>Chưa thanh toán</span></Badge> },
                { key: 'closed', label: `Đã thanh toán (${closed.length})` },
              ]}
            />
            {shown.length === 0
              ? <Empty description={tab === 'open' ? 'Bạn không còn hóa đơn nào cần nộp' : 'Chưa có hóa đơn đã thanh toán'} />
              : shown.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} active={inv.id === activeId} onSelect={setSelectedId} />
              ))}
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <MyInvoiceDetail
            invoice={detail}
            loading={detailLoading}
            onPaid={() => { refetch(); refetchDetail(); }}
          />
        </Col>
      </Row>
    </>
  );
}
