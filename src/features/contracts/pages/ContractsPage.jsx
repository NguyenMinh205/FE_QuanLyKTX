import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card, Tabs, Select, Tag, Typography, Badge, Button, Modal, Input, Space, Alert, App,
} from 'antd';
import { QrcodeOutlined, DeleteOutlined, CheckCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { contractApi } from '../api/contract.api';
import { roomApi } from '../../rooms/api/room.api';
import { CONTRACT_TERM } from '../../../constants/statuses';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusTag from '../../../components/StatusTag';
import ContractDetailDrawer from '../components/ContractDetailDrawer';
import RefundDepositModal from '../components/RefundDepositModal';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import { EXPIRING_DAYS, daysLeftOf, depositStateOf } from '../utils/contractView';

const { Text } = Typography;

/** 5 tab gọn gàng theo đúng vòng đời Hợp đồng */
const TABS = [
  { key: 'active',          label: 'Đang ở',         params: { status: 'active' } },
  { key: 'pending_payment', label: 'Chờ đóng phí',   params: { status: 'pending_payment' }, badge: true },
  { key: 'expired',         label: 'Hết hạn',        params: { status: 'expired' }, badge: true },
  { key: 'refund',          label: 'Chờ hoàn cọc',   params: { status: 'terminated', isDepositRefunded: false }, summaryKey: 'awaitingDepositRefund', badge: true },
  { key: 'ended',           label: 'Đã kết thúc',    params: { status: 'terminated,cancelled' } },
];

const TERM_OPTIONS = Object.entries(CONTRACT_TERM).map(([value, t]) => ({ value, label: t.label }));

function resolveInitialTab(tabParam) {
  if (TABS.some((t) => t.key === tabParam)) return tabParam;
  if (tabParam === 'terminated' || tabParam === 'cancelled') return 'ended';
  return 'active';
}

/** Quản lý hợp đồng, Chờ đóng phí, Hủy quá hạn, Quét QR Check-in & Hoàn cọc */
export default function ContractsPage() {
  const { user } = useAuth();
  const { modal, message, notification } = App.useApp();
  const canTerminate = can(user, 'contract:terminate');
  const canRefund = can(user, 'contract:refundDeposit');
  const canCheckin = can(user, 'contract:checkin');
  const canCancel = can(user, 'contract:cancel');

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [tab, setTab] = useState(() => resolveInitialTab(searchParams.get('tab')));
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: initialSearch, buildingId: undefined, term: undefined });
  const [openId, setOpenId] = useState(null);
  const [refundContract, setRefundContract] = useState(null);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const tabParams = TABS.find((t) => t.key === tab).params;
  const { data, meta, loading, error, refetch } = useApi(
    () => contractApi.getList({ ...filters, ...tabParams, search: filters.search || undefined }),
    [filters, tab],
  );
  const summary = meta?.summary;

  const changeTab = (key) => {
    setTab(key);
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const handleCheckinQr = async () => {
    const code = qrCode.trim();
    if (!code) { message.warning('Nhập hoặc quét mã QR Check-in'); return; }
    setQrLoading(true);
    try {
      const res = await contractApi.checkinQr({ checkinCode: code });
      const c = res.data.data;
      notification.success({
        title: `Check-in nhận phòng thành công — ${c.contractCode}`,
        description: `${c.student?.fullName} (${c.student?.studentCode}) đã nhận Phòng ${roomLabelOf(c.room)}.`,
      });
      setQrOpen(false);
      setQrCode('');
      refetch();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setQrLoading(false);
    }
  };

  const confirmCancelOverdue = () => modal.confirm({
    title: 'Hủy toàn bộ hợp đồng quá hạn đóng phí?',
    content: 'Các hợp đồng Chờ đóng phí đã quá hạn sẽ chuyển sang Đã hủy, hủy hóa đơn nháp và lập tức giải phóng chỗ phòng.',
    okText: 'Hủy hàng loạt quá hạn',
    okButtonProps: { danger: true },
    cancelText: 'Đóng',
    onOk: async () => {
      try {
        const res = await contractApi.cancelOverdue();
        message.success(res.data.message || `Đã hủy ${res.data.data?.cancelledCount ?? 0} hợp đồng quá hạn`);
        refetch();
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
  });

  const columns = [
    {
      title: 'Mã HĐ', dataIndex: 'contractCode', width: 130, fixed: 'left',
      render: (v) => <a style={{ fontWeight: 500 }}>{v}</a>,
    },
    {
      title: 'Sinh viên', key: 'student', width: 175,
      render: (_, c) => <><div>{c.student?.fullName}</div><Text type="secondary" style={{ fontSize: 12 }}>{c.student?.studentCode}</Text></>,
    },
    {
      title: 'Phòng / Tòa nhà', key: 'place', width: 165,
      render: (_, c) => (c.room
        ? (
          <>
            <div style={{ fontWeight: 500 }}>Phòng {roomLabelOf(c.room)}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{c.room.buildingName || c.buildingName || 'Cơ sở 1'}</Text>
          </>
        )
        : '—'),
    },
    {
      title: 'Thời hạn & Gói', key: 'period', width: 225,
      render: (_, c) => {
        const left = c.endDate ? daysLeftOf(c.endDate) : null;
        return (
          <>
            {c.status === 'pending_payment' ? (
              <div>
                Hạn phí:{' '}
                <Text strong type={c.isPaymentOverdue ? 'danger' : 'warning'}>{formatDate(c.paymentDeadline)}</Text>
                {c.isPaymentOverdue && <Tag color="error" style={{ marginLeft: 6 }}>Quá hạn</Tag>}
              </div>
            ) : (
              <div style={{ whiteSpace: 'nowrap' }}>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
              <Tag style={{ margin: 0 }}>{CONTRACT_TERM[c.term]?.label ?? '—'}</Tag>
              {c.status === 'active' && c.checkedInAt && <Tag color="green" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>Check-in</Tag>}
              {c.status === 'active' && left !== null && left >= 0 && left <= EXPIRING_DAYS && (
                <Text type="warning" style={{ fontSize: 12 }}>{left === 0 ? 'hết hạn hôm nay' : `còn ${left} ngày`}</Text>
              )}
              {c.status === 'expired' && left !== null && <Text type="danger" style={{ fontSize: 12 }}>quá hạn {-left} ngày</Text>}
            </div>
          </>
        );
      },
    },
    {
      title: 'Cọc & Công nợ', key: 'finance', width: 155, align: 'right',
      render: (_, c) => {
        const d = depositStateOf(c);
        return (
          <>
            <div>
              {c.totalDebt > 0
                ? <Text type="danger" strong>Nợ {formatCurrency(c.totalDebt)}</Text>
                : <Text type="secondary" style={{ fontSize: 12 }}>Không nợ</Text>}
            </div>
            <Tag color={d.color} style={{ margin: '2px 0 0' }}>{d.text}</Tag>
          </>
        );
      },
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (s) => <StatusTag type="contract" value={s} /> },
    ...(canRefund && tab === 'refund' ? [{
      title: 'Thao tác', key: 'refundAction', width: 130, fixed: 'right',
      render: (_, c) => (
        <Button
          type="primary"
          size="small"
          icon={<RollbackOutlined />}
          onClick={(e) => { e.stopPropagation(); setRefundContract(c); }}
        >
          Hoàn cọc
        </Button>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Tuyển sinh & Lưu trú', 'Hợp đồng & Check-in']}
        title="Hợp đồng & Check-in QR"
        description="Quản lý giữ chỗ chờ đóng phí, xác nhận QR Check-in nhận phòng, thanh lý và hoàn cọc."
        extra={(
          <Space wrap>
            {canCancel && (summary?.overduePayment > 0) && (
              <Button danger icon={<DeleteOutlined />} onClick={confirmCancelOverdue}>
                Hủy quá hạn phí ({summary.overduePayment})
              </Button>
            )}
            {canCheckin && (
              <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setQrOpen(true)}>
                Quét / Nhập QR Check-in
              </Button>
            )}
          </Space>
        )}
      />

      <Card styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          activeKey={tab}
          onChange={changeTab}
          items={TABS.map((t) => {
            const count = t.key === 'ended'
              ? (summary?.terminated ?? 0) + (summary?.cancelled ?? 0)
              : summary?.[t.summaryKey ?? t.key];
            return {
              key: t.key,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {t.label}
                  {summary && (t.badge
                    ? <Badge count={count} showZero color={count ? '#FAAD14' : '#D9D9D9'} />
                    : <Text type="secondary" style={{ fontSize: 12 }}>{count ?? 0}</Text>)}
                </span>
              ),
            };
          })}
        />

        {tab === 'refund' && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 14 }}
            title="Quyết toán hoàn tiền cọc tài sản sinh viên"
            description="Các hợp đồng dưới đây đã thanh lý sạch nợ điện nước & phòng. Nhấn nút Hoàn cọc ngay trên từng dòng để hoàn đủ 100% hoặc nhập khoản khấu trừ hư hại (hệ thống tự sinh phiếu chi REF-...)."
          />
        )}

        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm mã HĐ, MSSV, họ tên, số phòng..."
          unit="hợp đồng"
          scrollX={tab === 'refund' && canRefund ? 1070 : 940}
          onRow={(c) => ({ onClick: () => setOpenId(c.id), style: { cursor: 'pointer' } })}
          rowClassName={(c) => (c.id === openId ? 'ant-table-row-selected' : '')}
          extraFilters={(
            <>
              <Select
                allowClear placeholder="Tòa nhà (A14, A15)" style={{ width: 185 }}
                value={filters.buildingId}
                options={(buildings || []).map((b) => ({ value: b.id, label: `${b.code} · ${b.name}` }))}
                onChange={(v) => setFilters((f) => ({ ...f, buildingId: v, page: 1 }))}
              />
              <Select
                allowClear placeholder="Gói thuê" style={{ width: 140 }}
                value={filters.term}
                options={TERM_OPTIONS}
                onChange={(v) => setFilters((f) => ({ ...f, term: v, page: 1 }))}
              />
            </>
          )}
        />
      </Card>

      <ContractDetailDrawer
        contractId={openId}
        open={!!openId}
        canTerminate={canTerminate}
        canRefund={canRefund}
        canCheckin={canCheckin}
        canCancel={canCancel}
        onClose={() => setOpenId(null)}
        onChanged={refetch}
      />

      <RefundDepositModal
        contract={refundContract}
        open={!!refundContract}
        onCancel={() => setRefundContract(null)}
        onRefunded={() => { setRefundContract(null); refetch(); }}
      />

      <Modal
        open={qrOpen}
        title={<span><QrcodeOutlined style={{ color: 'var(--brand)', marginRight: 8 }} />Xác nhận Check-in bàn giao phòng</span>}
        okText="Xác nhận Check-in"
        cancelText="Đóng"
        confirmLoading={qrLoading}
        onOk={handleCheckinQr}
        onCancel={() => { setQrOpen(false); setQrCode(''); }}
        destroyOnHidden
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Quét hoặc nhập mã QR Check-in trên Cổng Sinh viên (VD: <code className="mono">QRC-HD-2026-...</code>). Chỉ hợp đồng đang hiệu lực mới check-in được.
        </Text>
        <Input
          size="large"
          className="mono"
          placeholder="Nhập mã Check-in (QRC-HD-...)"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          onPressEnter={handleCheckinQr}
          autoFocus
        />
      </Modal>
    </>
  );
}
