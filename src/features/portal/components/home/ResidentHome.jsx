import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Typography, Tag, Row, Col, Table, Skeleton, Alert, Divider, Tooltip,
} from 'antd';
import {
  WarningFilled, CreditCardOutlined, HomeOutlined, FileTextOutlined, ShoppingOutlined, ShoppingCartOutlined,
  ArrowRightOutlined, ReloadOutlined, CalendarOutlined, InboxOutlined, TeamOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { formatCurrency, formatDate } from '../../../../utils/formatter';
import { INVOICE_TYPE, SUPPLY_CATEGORY } from '../../../../constants/statuses';
import StatusTag from '../../../../components/StatusTag';
import SupportCard from '../SupportCard';
import {
  EXPIRING_DAYS, OPEN_INVOICE_STATUSES, daysUntil, splitBedCode, invoicePeriodText, invoiceSummaryText,
} from '../../utils/homeView';
import { monthsBetween } from '../../utils/applyDates';
import dayjs from 'dayjs';

const { Text } = Typography;
const RECENT_COUNT = 3;

function CardTitle({ icon, title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: '#E6F4FF', display: 'grid', placeItems: 'center' }}>{icon}</span>
        <Text strong style={{ fontSize: 16 }}>{title}</Text>
      </span>
      {extra}
    </div>
  );
}

function Row2({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '8px 0' }}>
      <Text type="secondary">{label}</Text>
      <div style={{ textAlign: 'right' }}>{children}</div>
    </div>
  );
}

/** Trang chủ khi đang lưu trú (docs/08 mục 6.9) */
export default function ResidentHome({ residence }) {
  const navigate = useNavigate();
  const { contract, roomType, includedInRoom = [], roommates = [], debtSummary = {} } = residence;
  const { room, bed } = splitBedCode(contract.bedCode);

  const { data: invoices, meta: invoiceMeta, loading: invLoading, error: invError, refetch: refetchInvoices } = useApi(
    () => portalApi.getMyInvoices({ limit: 100 }), [],
  );
  // supply-items trả { items, roomType, includedInRoom } — useApi coi là danh sách nên `data` chính là mảng items
  const { data: shopItems } = useApi(() => portalApi.getSupplyItems(), []);
  const { data: myOrders } = useApi(() => portalApi.getMyOrders({ limit: 100 }), []);

  // ---- công nợ: số liệu tổng lấy từ my-residence, hạn gần nhất lấy từ hóa đơn còn mở
  const openInvoices = (invoices || []).filter((i) => OPEN_INVOICE_STATUSES.includes(i.status));
  const nearestDue = openInvoices.map((i) => i.dueDate).sort()[0];
  const dueIn = daysUntil(nearestDue);
  const totalDebt = debtSummary.totalDebt ?? 0;

  // ---- hợp đồng sắp hết hạn (BR-29)
  const daysLeft = daysUntil(contract.endDate);
  const expiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;

  // ---- hóa đơn gần đây: mới phát hành lên đầu
  const recent = [...(invoices || [])]
    .filter((i) => i.status !== 'cancelled')
    .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''))
    .slice(0, RECENT_COUNT);

  // ---- nhu yếu phẩm: gợi ý 3 món chưa có (chưa cấp sẵn, chưa đặt), đơn đang chờ nhận
  const ownedIds = new Set((myOrders || []).filter((o) => o.status !== 'cancelled').flatMap((o) => o.items.map((it) => it.supplyItemId)));
  const suggestions = (shopItems || []).filter((it) => !ownedIds.has(it.id)).slice(0, 3);
  const readyOrders = (myOrders || []).filter((o) => o.status === 'ready');

  const invoiceColumns = [
    {
      title: 'Kỳ hóa đơn', key: 'period',
      render: (_, i) => <Text strong>{invoicePeriodText(i, INVOICE_TYPE[i.type]?.label)}</Text>,
    },
    { title: 'Khoản thu', key: 'desc', ellipsis: true, render: (_, i) => invoiceSummaryText(i) },
    { title: 'Số tiền', dataIndex: 'totalAmount', align: 'right', width: 130, render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', width: 170, render: (s) => <StatusTag type="invoice" value={s} /> },
    {
      title: '', key: 'action', width: 90, align: 'right',
      render: (_, i) => <a onClick={() => navigate(`/portal/my-invoices?id=${i.id}`)}>Chi tiết</a>,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <div style={{ display: 'grid', gap: 16 }}>
          {/* ---------- Công nợ ---------- */}
          {totalDebt > 0 && (
            <Card style={{ background: '#FFF1F0', borderColor: '#FFCCC7' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#FFCCC7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <WarningFilled style={{ fontSize: 24, color: '#CF1322' }} />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong>Công nợ cần thanh toán</Text>
                    {dueIn !== null && dueIn < 0 && <Tag color="error" style={{ margin: 0 }}>QUÁ HẠN</Tag>}
                  </div>
                  <div>
                    <Text type="secondary">Bạn đang nợ: </Text>
                    <Text strong style={{ fontSize: 28, color: '#CF1322' }}>{formatCurrency(totalDebt)}</Text>
                  </div>
                  <Text type="secondary">
                    {debtSummary.unpaidInvoiceCount ?? openInvoices.length} hóa đơn chưa thanh toán đủ
                    {nearestDue && (
                      <>
                        {' · '}<CalendarOutlined /> Hạn gần nhất: {formatDate(nearestDue)}{' '}
                        <Text type={dueIn < 0 ? 'danger' : dueIn <= 3 ? 'warning' : 'secondary'}>
                          ({dueIn < 0 ? `quá hạn ${-dueIn} ngày` : dueIn === 0 ? 'hôm nay' : `còn ${dueIn} ngày`})
                        </Text>
                      </>
                    )}
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button type="primary" size="large" icon={<CreditCardOutlined />} onClick={() => navigate('/portal/my-invoices?status=unpaid')}>
                    Thanh toán ngay
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ---------- Hợp đồng sắp hết hạn ---------- */}
          {expiring && (
            <Alert
              type="warning" showIcon
              title={`Hợp đồng còn ${daysLeft} ngày`}
              description={`Hợp đồng ${contract.contractCode} hết hạn ngày ${formatDate(contract.endDate)}. Gửi yêu cầu gia hạn sớm để giữ chỗ ở hiện tại.`}
              action={<Button type="primary" onClick={() => navigate('/portal/my-requests?create=renewal')}>Gia hạn</Button>}
            />
          )}

          {/* ---------- Chỗ ở + hợp đồng ---------- */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card style={{ height: '100%' }} title={<CardTitle icon={<HomeOutlined style={{ color: '#1677FF' }} />} title="Chỗ ở của tôi" />}>
                <Row2 label="Vị trí"><Text strong>{contract.buildingName} · Phòng {room}{bed ? ` · Giường ${bed}` : ''}</Text></Row2>
                <Row2 label="Loại phòng"><Text>{roomType?.name}</Text></Row2>
                <Row2 label="Đơn giá"><Text strong style={{ color: '#1677FF' }}>{formatCurrency(contract.monthlyPrice)}</Text><Text type="secondary">/tháng</Text></Row2>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, margin: '8px 0 6px' }}><InboxOutlined /> CÓ SẴN TRONG PHÒNG</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {includedInRoom.map((x) => <Tag key={x} style={{ margin: 0 }}>{x}</Tag>)}
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Tooltip title={roommates.length ? roommates.map((m) => `${m.fullName} (${m.studentCode})`).join(', ') : 'Chưa có bạn cùng phòng'}>
                    <Text type="secondary"><TeamOutlined /> Bạn cùng phòng: {roommates.length} người</Text>
                  </Tooltip>
                  <a onClick={() => navigate('/portal/my-residence')}>Xem chi tiết <ArrowRightOutlined /></a>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                style={{ height: '100%' }}
                title={<CardTitle icon={<FileTextOutlined style={{ color: '#1677FF' }} />} title="Hợp đồng của tôi" extra={<StatusTag type="contract" value={contract.status} />} />}
              >
                <Row2 label="Số hợp đồng"><Text strong style={{ fontFamily: 'monospace' }}>{contract.contractCode}</Text></Row2>
                <Row2 label="Thời hạn">
                  <Text strong>{monthsBetween(dayjs(contract.startDate), dayjs(contract.endDate))} tháng</Text>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</Text></div>
                </Row2>
                <Row2 label="Tiền cọc đã nộp"><Text strong>{formatCurrency(contract.depositAmount)}</Text></Row2>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Text type="secondary">{expiring ? <Text type="warning">Còn {daysLeft} ngày</Text> : `Hết hạn ${formatDate(contract.endDate)}`}</Text>
                  <a onClick={() => navigate('/portal/my-requests?create=renewal')}>Gia hạn hợp đồng <ReloadOutlined /></a>
                </div>
              </Card>
            </Col>
          </Row>

          {/* ---------- Hóa đơn gần đây ---------- */}
          <Card
            title={<CardTitle icon={<FileTextOutlined style={{ color: '#1677FF' }} />} title="Hóa đơn gần đây"
              extra={<Button type="text" icon={<ReloadOutlined />} onClick={refetchInvoices} aria-label="Tải lại hóa đơn" />} />}
            styles={{ body: { padding: 0 } }}
          >
            {invError && <Alert type="error" showIcon title={invError} style={{ margin: 16 }} />}
            {!invError && invLoading && !invoices && <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 3 }} /></div>}
            {!invError && invoices && (
              <Table
                rowKey="id" size="middle" columns={invoiceColumns} dataSource={recent} pagination={false}
                scroll={{ x: 600 }} locale={{ emptyText: 'Chưa có hóa đơn nào' }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #F0F0F0' }}>
              <Text type="secondary">Hiển thị {recent.length} hóa đơn gần nhất</Text>
              <a onClick={() => navigate('/portal/my-invoices')}>Xem tất cả hóa đơn{invoiceMeta?.total ? ` (${invoiceMeta.total})` : ''} <ArrowRightOutlined /></a>
            </div>
          </Card>
        </div>
      </Col>

      <Col xs={24} lg={8}>
        <div style={{ display: 'grid', gap: 16 }}>
          {readyOrders.map((o) => (
            <Alert
              key={o.id} type="success" showIcon icon={<CheckCircleFilled />}
              title={`Đơn ${o.orderCode} đang chờ bạn nhận`}
              description={`${o.items.map((it) => it.name).join(', ')} — nhận tại văn phòng quản lý tòa nhà.`}
              action={<Button size="small" onClick={() => navigate('/portal/my-orders')}>Xem</Button>}
            />
          ))}

          <Card
            title={<CardTitle icon={<ShoppingOutlined style={{ color: '#1677FF' }} />} title="Nhu yếu phẩm"
              extra={<a onClick={() => navigate('/portal/shop')}>Xem tất cả</a>} />}
          >
            {!shopItems && <Skeleton active paragraph={{ rows: 3 }} />}
            {shopItems && suggestions.length === 0 && <Text type="secondary">Bạn đã có đủ các món trong cửa hàng.</Text>}
            {suggestions.map((it, idx) => (
              <div key={it.id}>
                {idx > 0 && <Divider style={{ margin: '12px 0' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 8, background: '#F5F5F5', flexShrink: 0, overflow: 'hidden',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {it.imageUrl
                      ? <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <ShoppingOutlined style={{ fontSize: 20, color: '#BFBFBF' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text ellipsis style={{ display: 'block' }}>{it.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{SUPPLY_CATEGORY[it.category]?.label}</Text>
                    <div><Text strong style={{ color: '#1677FF' }}>{formatCurrency(it.price)}</Text></div>
                  </div>
                  <Button icon={<ShoppingCartOutlined />} onClick={() => navigate('/portal/shop')} aria-label={`Mua ${it.name}`} />
                </div>
              </div>
            ))}
            <Button block style={{ marginTop: 16 }} onClick={() => navigate('/portal/shop')}>Đến cửa hàng nhu yếu phẩm <ArrowRightOutlined /></Button>
          </Card>

          <SupportCard title="Hỗ trợ sinh viên" />
        </div>
      </Col>
    </Row>
  );
}
