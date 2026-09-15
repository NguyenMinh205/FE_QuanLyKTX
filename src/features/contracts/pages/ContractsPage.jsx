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
import { ROOM_TIER } from '../../../constants/statuses';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusTag from '../../../components/StatusTag';
import ContractDetailDrawer from '../components/ContractDetailDrawer';
import { EXPIRING_DAYS, bedTextOf, daysLeftOf } from '../utils/contractView';

const { Text } = Typography;

/** Tab → tham số API. "Sắp hết hạn" dùng expiringInDays (BR-29) */
const TABS = [
  { key: 'all',        label: 'Tất cả',        params: {} },
  { key: 'active',     label: 'Đang hiệu lực', params: { status: 'active' } },
  { key: 'expiring',   label: 'Sắp hết hạn',   params: { expiringInDays: EXPIRING_DAYS }, badge: 'warning' },
  { key: 'expired',    label: 'Hết hạn',       params: { status: 'expired' } },
  { key: 'terminated', label: 'Đã chấm dứt',   params: { status: 'terminated' } },
];

/** SCR-32 Hợp đồng — danh sách theo tab + drawer chi tiết */
export default function ContractsPage() {
  const { user } = useAuth();
  const canUpdate = can(user, 'contract:update');
  const canTerminate = can(user, 'contract:terminate');

  // Mở từ nơi khác kèm ?search=HD-... (màn Yêu cầu) hoặc ?tab=expiring (Dashboard)
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState(TABS.some((t) => t.key === tabParam) ? tabParam : (initialSearch ? 'all' : 'active'));
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: initialSearch, buildingId: undefined, roomTypeId: undefined });
  const [openId, setOpenId] = useState(null);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const { data: roomTypes } = useApi(() => roomApi.getRoomTypes(), []);
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
      title: 'Mã hợp đồng', dataIndex: 'contractCode', width: 150, fixed: 'left',
      render: (v) => <a style={{ fontWeight: 500 }}>{v}</a>,
    },
    {
      title: 'Sinh viên', key: 'student', width: 200,
      render: (_, c) => <><div>{c.studentName}</div><Text type="secondary" style={{ fontSize: 12 }}>{c.studentCode}</Text></>,
    },
    { title: 'Chỗ ở', key: 'bed', width: 150, render: (_, c) => bedTextOf(c.bedCode) },
    {
      title: 'Loại phòng', key: 'type', width: 170,
      render: (_, c) => <Tag color={ROOM_TIER[c.tier]?.color === 'default' ? undefined : ROOM_TIER[c.tier]?.color} style={{ margin: 0 }}>{c.roomTypeName}</Tag>,
    },
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
            {c.status === 'terminated' && c.terminatedAt && (
              <Text type="danger" style={{ fontSize: 12 }}>chấm dứt {formatDate(c.terminatedAt)}</Text>
            )}
          </>
        );
      },
    },
    { title: 'Giá thuê', dataIndex: 'monthlyPrice', width: 130, align: 'right', render: (v) => `${formatCurrency(v)}` },
    {
      title: 'Công nợ', dataIndex: 'totalDebt', width: 120, align: 'right',
      render: (v) => (v > 0 ? <Text type="danger">{formatCurrency(v)}</Text> : <Text type="secondary">0 đ</Text>),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (s) => <StatusTag type="contract" value={s} /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Lưu trú & hợp đồng', 'Hợp đồng']}
        title="Quản lý hợp đồng"
        description="Hợp đồng được tạo tự động khi duyệt đơn đăng ký — theo dõi hạn, công nợ và chấm dứt trước hạn"
      />

      <Card styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          activeKey={tab}
          onChange={changeTab}
          items={TABS.map((t) => ({
            key: t.key,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                {summary && (t.badge
                  ? <Badge count={summary[t.key]} showZero color={summary[t.key] ? '#FAAD14' : '#D9D9D9'} />
                  : <Text type="secondary" style={{ fontSize: 12 }}>{summary[t.key]}</Text>)}
              </span>
            ),
          }))}
        />

        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm mã hợp đồng, MSSV, họ tên, mã giường..."
          unit="hợp đồng"
          scrollX={1260}
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
                allowClear placeholder="Tất cả loại phòng" style={{ width: 200 }}
                value={filters.roomTypeId}
                options={(roomTypes || []).map((t) => ({ value: t.id, label: t.name }))}
                onChange={(v) => setFilters((f) => ({ ...f, roomTypeId: v, page: 1 }))}
              />
            </>
          )}
        />
      </Card>

      <ContractDetailDrawer
        contractId={openId}
        open={!!openId}
        canUpdate={canUpdate}
        canTerminate={canTerminate}
        onClose={() => setOpenId(null)}
        onChanged={refetch}
      />
    </>
  );
}
