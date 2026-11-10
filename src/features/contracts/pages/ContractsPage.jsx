import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card, Tabs, Select, Tag, Typography, Badge,
} from 'antd';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { contractApi } from '../api/contract.api';
import { roomApi } from '../../rooms/api/room.api';
import { CONTRACT_TERM } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusTag from '../../../components/StatusTag';
import ContractDetailDrawer from '../components/ContractDetailDrawer';
import {
  EXPIRING_DAYS, daysLeftOf, depositStateOf, placeTextOf,
} from '../utils/contractView';

const { Text } = Typography;

/**
 * Tab → tham số API (API.md §6). Đơn chờ duyệt và đơn bị từ chối nằm ở màn Duyệt đơn, không hiện ở đây.
 * `summaryKey` là khóa số đếm trong `meta.summary`; `badge` là tab cần xử lý nên hiện số nổi bật.
 */
const TABS = [
  { key: 'active',     label: 'Đang hiệu lực', params: { status: 'active' } },
  { key: 'expired',    label: 'Hết hạn',       params: { status: 'expired' }, badge: true },
  { key: 'refund',     label: 'Chờ hoàn cọc',  params: { status: 'terminated', isDepositRefunded: false }, summaryKey: 'awaitingDepositRefund', badge: true },
  { key: 'terminated', label: 'Đã chấm dứt',   params: { status: 'terminated' } },
  { key: 'all',        label: 'Tất cả',        params: { status: 'active,expired,terminated' } },
];

const TERM_OPTIONS = Object.entries(CONTRACT_TERM).map(([value, t]) => ({ value, label: t.label }));

/** SCR-32 Hợp đồng (FR-31, FR-34, FR-35) — danh sách theo tab + drawer chi tiết */
export default function ContractsPage() {
  const { user } = useAuth();
  const canTerminate = can(user, 'contract:terminate');
  const canRefund = can(user, 'contract:refundDeposit');

  // Mở từ nơi khác kèm ?search=HD-... hoặc ?tab=...
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState(TABS.some((t) => t.key === tabParam) ? tabParam : (initialSearch ? 'all' : 'active'));
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: initialSearch, buildingId: undefined, term: undefined });
  const [openId, setOpenId] = useState(null);

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

  const columns = [
    {
      title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 140, fixed: 'left',
      render: (v) => <a style={{ fontWeight: 500 }}>{v}</a>,
    },
    {
      title: 'Sinh viên', key: 'student', width: 190,
      render: (_, c) => <><div>{c.student?.fullName}</div><Text type="secondary" style={{ fontSize: 12 }}>{c.student?.studentCode}</Text></>,
    },
    { title: 'Chỗ ở', key: 'place', width: 160, render: (_, c) => placeTextOf(c) },
    { title: 'Gói thuê', key: 'term', width: 100, render: (_, c) => <Tag style={{ margin: 0 }}>{CONTRACT_TERM[c.term]?.label ?? '—'}</Tag> },
    {
      title: 'Thời hạn', key: 'period', width: 200,
      render: (_, c) => {
        const left = daysLeftOf(c.endDate);
        return (
          <>
            <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
            {c.status === 'active' && left >= 0 && left <= EXPIRING_DAYS && (
              <Text type="warning" style={{ fontSize: 12 }}>{left === 0 ? 'hết hạn hôm nay' : `còn ${left} ngày`}</Text>
            )}
            {c.status === 'expired' && <Text type="danger" style={{ fontSize: 12 }}>quá hạn {-left} ngày, chưa thanh lý</Text>}
            {c.status === 'terminated' && c.terminatedAt && (
              <Text type="secondary" style={{ fontSize: 12 }}>thanh lý {formatDate(c.terminatedAt)}</Text>
            )}
          </>
        );
      },
    },
    { title: 'Tiền phòng cả kỳ', dataIndex: 'totalRoomFee', width: 160, align: 'right', render: (v) => formatCurrency(v) },
    {
      title: 'Tiền cọc', key: 'deposit', width: 150,
      render: (_, c) => {
        const d = depositStateOf(c);
        return <><div>{formatCurrency(c.depositAmount)}</div><Tag color={d.color} style={{ margin: 0 }}>{d.text}</Tag></>;
      },
    },
    {
      title: 'Công nợ', dataIndex: 'totalDebt', width: 120, align: 'right',
      render: (v) => (v > 0 ? <Text type="danger">{formatCurrency(v)}</Text> : <Text type="secondary">0 đ</Text>),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (s) => <StatusTag type="contract" value={s} /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Lưu trú & hợp đồng', 'Hợp đồng']}
        title="Quản lý hợp đồng"
        description="Hợp đồng tạo khi duyệt đơn — theo dõi hạn, thanh lý khi sinh viên trả phòng và xác nhận hoàn cọc"
      />

      <Card styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          activeKey={tab}
          onChange={changeTab}
          items={TABS.map((t) => {
            // API.md §6 không trả khóa `all` — tự cộng ba trạng thái hợp đồng
            const count = t.key === 'all'
              ? (summary?.active ?? 0) + (summary?.expired ?? 0) + (summary?.terminated ?? 0)
              : summary?.[t.summaryKey ?? t.key];
            return {
              key: t.key,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {t.label}
                  {summary && (t.badge
                    ? <Badge count={count} showZero color={count ? '#FAAD14' : '#D9D9D9'} />
                    : <Text type="secondary" style={{ fontSize: 12 }}>{count}</Text>)}
                </span>
              ),
            };
          })}
        />

        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm mã hợp đồng, MSSV, họ tên, số phòng..."
          unit="hợp đồng"
          scrollX={1350}
          onRow={(c) => ({ onClick: () => setOpenId(c.id), style: { cursor: 'pointer' } })}
          rowClassName={(c) => (c.id === openId ? 'ant-table-row-selected' : '')}
          extraFilters={(
            <>
              <Select
                allowClear placeholder="Tất cả tòa nhà" style={{ width: 160 }}
                value={filters.buildingId}
                options={(buildings || []).map((b) => ({ value: b.id, label: b.name }))}
                onChange={(v) => setFilters((f) => ({ ...f, buildingId: v, page: 1 }))}
              />
              <Select
                allowClear placeholder="Mọi gói thuê" style={{ width: 150 }}
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
        onClose={() => setOpenId(null)}
        onChanged={refetch}
      />
    </>
  );
}
