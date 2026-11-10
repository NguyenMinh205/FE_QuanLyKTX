import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tabs, Alert, Skeleton, Empty, Badge,
} from 'antd';
import { WarningOutlined, FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import MyInvoiceDetail from '../components/invoices/MyInvoiceDetail';
import MyPaymentsList from '../components/invoices/MyPaymentsList';
import { periodLabel } from '../../fees/utils/readingSheet';
import { daysUntil } from '../utils/homeView';

const { Text, Title } = Typography;

const TAB_OF_SCOPE = { personal: 'personal', room: 'room' };

/** Tên ngắn của hóa đơn trong danh sách: "Điện nước tháng 10/2026", "Tiền cọc" */
const titleOf = (inv) => `${INVOICE_TYPE[inv.type]?.label ?? inv.type}${inv.monthYear ? ` ${periodLabel(inv.monthYear).toLowerCase()}` : ''}`;

function InvoiceRow({ invoice, active, onSelect }) {
  const daysLeft = daysUntil(invoice.dueDate);
  const pastDue = invoice.status === 'unpaid' && daysLeft !== null && daysLeft < 0;
  const room = invoice.scope === 'room';

  return (
    <div
      role="button" tabIndex={0} aria-label={`Hóa đơn ${invoice.invoiceCode}`}
      onClick={() => onSelect(invoice.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(invoice.id); }}
      style={{
        border: `1px solid ${active ? '#1677FF' : '#F0F0F0'}`, background: active ? '#F5F9FF' : '#fff',
        borderRadius: 10, padding: 12, marginBottom: 10, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: room ? '#E6FFFB' : '#E6F4FF', color: room ? '#08979C' : '#1677FF',
        }}>{room ? <ThunderboltOutlined /> : <FileTextOutlined />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Text strong>{titleOf(invoice)}</Text>
            <Text strong style={{ whiteSpace: 'nowrap' }}>{formatCurrency(invoice.amount)}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>{invoice.invoiceCode} · Hạn {formatDate(invoice.dueDate)}</Text>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusTag type="invoice" value={invoice.status} />
            {pastDue && <Text type="danger" style={{ fontSize: 12 }}><WarningOutlined /> Đã qua hạn nộp</Text>}
            {room && invoice.payer && <Text type="secondary" style={{ fontSize: 12 }}>Đại diện: {invoice.payer.fullName}</Text>}
          </div>
        </div>
      </div>
    </div>
  );
}

const sumUnpaid = (list) => list.filter((i) => i.status === 'unpaid').reduce((t, i) => t + i.amount, 0);
const countUnpaid = (list) => list.filter((i) => i.status === 'unpaid').length;

/** SCR-64 Hóa đơn & thanh toán (FR-62, FR-53, FR-63): hóa đơn của tôi, của phòng, lịch sử nộp tiền */
export default function MyInvoicesPage() {
  const [searchParams] = useSearchParams();
  const paramInvoice = searchParams.get('invoice');
  const [userTab, setUserTab] = useState(null); // null = tự chọn theo ?invoice= / ?tab=
  const [selectedId, setSelectedId] = useState(paramInvoice || null);

  const { data: invoices, loading, error } = useApi(() => portalApi.getMyInvoices({ limit: 100 }), []);
  const all = useMemo(() => invoices || [], [invoices]);
  const personal = useMemo(() => all.filter((i) => i.scope === 'personal'), [all]);
  const room = useMemo(() => all.filter((i) => i.scope === 'room'), [all]);

  // Mở từ chuông / trang chủ kèm ?invoice= → tự sang đúng nhóm của hóa đơn đó
  const linked = all.find((i) => i.id === paramInvoice);
  const tab = userTab ?? (linked ? TAB_OF_SCOPE[linked.scope] : (['personal', 'room', 'history'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'personal'));
  const shown = tab === 'room' ? room : personal;
  const activeId = tab === 'history' ? null : ((selectedId && shown.some((i) => i.id === selectedId) ? selectedId : shown[0]?.id) ?? null);

  const { data: detail, loading: detailLoading } = useApi(
    () => (activeId ? portalApi.getMyInvoiceById(activeId) : Promise.resolve({ data: { data: null } })),
    [activeId],
  );

  const header = <PageHeader breadcrumb={['Hóa đơn & thanh toán']} title="Hóa đơn & thanh toán" description="Tiền cọc, tiền phòng của bạn và tiền điện nước của phòng" />;
  if (error) return <>{header}<Alert type="error" showIcon title="Không tải được danh sách hóa đơn" description={error} /></>;
  if (loading && !invoices) return <>{header}<Card><Skeleton active paragraph={{ rows: 6 }} /></Card></>;

  const tabLabel = (text, n) => <Badge count={n} offset={[8, 0]} size="small"><span style={{ paddingRight: n ? 14 : 0 }}>{text}</span></Badge>;

  return (
    <>
      {header}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Text type="secondary">Bạn cần nộp</Text>
            <Title level={3} style={{ margin: '4px 0 0', color: sumUnpaid(personal) ? '#CF1322' : '#389E0D' }}>{formatCurrency(sumUnpaid(personal))}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{countUnpaid(personal) ? `${countUnpaid(personal)} hóa đơn cá nhân` : 'Không còn khoản nào'}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card styles={{ body: { padding: '16px 20px' } }}>
            <Text type="secondary">Phòng cần nộp (một bạn đại diện)</Text>
            <Title level={3} style={{ margin: '4px 0 0', color: sumUnpaid(room) ? '#CF1322' : '#389E0D' }}>{formatCurrency(sumUnpaid(room))}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{countUnpaid(room) ? `${countUnpaid(room)} hóa đơn điện nước` : 'Phòng không còn khoản nào'}</Text>
          </Card>
        </Col>
      </Row>

      <Card styles={{ body: { paddingTop: 8 } }}>
        <Tabs
          activeKey={tab}
          onChange={(k) => { setUserTab(k); setSelectedId(null); }}
          items={[
            { key: 'personal', label: tabLabel('Của tôi', countUnpaid(personal)) },
            { key: 'room', label: tabLabel('Của phòng', countUnpaid(room)) },
            { key: 'history', label: 'Lịch sử nộp tiền' },
          ]}
        />
        {tab === 'history' ? <MyPaymentsList /> : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={9}>
              {shown.length === 0
                ? <Empty description={tab === 'room' ? 'Phòng chưa có hóa đơn điện nước' : 'Bạn chưa có hóa đơn nào'} />
                : shown.map((inv) => <InvoiceRow key={inv.id} invoice={inv} active={inv.id === activeId} onSelect={setSelectedId} />)}
            </Col>
            <Col xs={24} lg={15}>
              <MyInvoiceDetail invoice={detail && detail.id === activeId ? detail : null} loading={detailLoading || (!!activeId && detail?.id !== activeId)} />
            </Col>
          </Row>
        )}
      </Card>
    </>
  );
}
