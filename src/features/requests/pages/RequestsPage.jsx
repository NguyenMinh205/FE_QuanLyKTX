import { useState } from 'react';
import {
  Card, Input, Segmented, Skeleton, Alert, Typography, Pagination, Grid, Badge, Tabs,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { requestApi } from '../api/request.api';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import RequestListItem from '../components/RequestListItem';
import RequestDetail from '../components/RequestDetail';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const PAGE_SIZE = 20;

const STATUS_TABS = [
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];
const TYPE_LABEL = { all: 'Tất cả', renewal: 'Gia hạn', checkout: 'Trả phòng' };

/** SCR-41 Yêu cầu gia hạn / trả phòng — danh sách trái + chi tiết phải (docs/08 mục 6.5) */
export default function RequestsPage() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const canReview = can(user, 'request:approve');

  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const search = useDebounce(keyword.trim());

  const { data: items, meta, loading, error, refetch } = useApi(
    () => requestApi.getList({ status, type: type === 'all' ? undefined : type, search: search || undefined, page, limit: PAGE_SIZE }),
    [status, type, search, page],
  );
  const list = items || [];
  const summary = meta?.summary;
  const active = list.find((r) => r.id === selectedId) || (selectedId ? null : list[0]) || null;

  const reset = () => { setPage(1); setSelectedId(null); };
  const afterProcessed = () => { setSelectedId(null); refetch(); };

  const columns = screens.xl ? '400px minmax(0, 1fr)' : screens.lg ? '340px minmax(0, 1fr)' : 'minmax(0, 1fr)';

  return (
    <>
      <PageHeader
        breadcrumb={['Lưu trú & hợp đồng', 'Yêu cầu gia hạn / trả phòng']}
        title="Yêu cầu gia hạn / trả phòng"
        description="Duyệt gia hạn hợp đồng, bàn giao phòng và quyết toán tiền cọc cho sinh viên"
      />

      <Card styles={{ body: { padding: '0 16px 16px' } }} style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={status}
          onChange={(k) => { setStatus(k); setType('all'); reset(); }}
          items={STATUS_TABS.map((t) => ({
            key: t.key,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                {summary && (t.key === 'pending'
                  ? <Badge count={summary.pending} showZero color={summary.pending ? '#FF4D4F' : '#D9D9D9'} />
                  : <Text type="secondary" style={{ fontSize: 12 }}>{summary[t.key]}</Text>)}
              </span>
            ),
          }))}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
          <Segmented
            value={type}
            onChange={(v) => { setType(v); reset(); }}
            options={Object.keys(TYPE_LABEL).map((k) => ({
              value: k,
              label: `${TYPE_LABEL[k]}${summary?.byType ? ` (${summary.byType[k]})` : ''}`,
            }))}
          />
          <Input
            allowClear prefix={<SearchOutlined />} style={{ width: 300, maxWidth: '100%' }}
            placeholder="Tìm tên, MSSV, mã hợp đồng, giường..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); reset(); }}
          />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 16, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <Text strong type="secondary" style={{ display: 'block', fontSize: 12, letterSpacing: 0.5, marginBottom: 8 }}>
            {STATUS_TABS.find((t) => t.key === status).label.toUpperCase()} ({meta?.total ?? 0}) · MỚI NHẤT TRƯỚC
          </Text>
          {error && <Alert type="error" showIcon title={error} />}
          {!error && loading && !items && <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>}
          {!error && items && list.length === 0 && (
            <Card><EmptyState description={search || type !== 'all' ? 'Không có yêu cầu phù hợp bộ lọc' : 'Không có yêu cầu nào'} /></Card>
          )}
          {!error && list.length > 0 && (
            <div style={{ display: 'grid', gap: 8, opacity: loading ? 0.6 : 1 }}>
              {list.map((r) => (
                <RequestListItem key={r.id} request={r} selected={r.id === active?.id} onSelect={setSelectedId} />
              ))}
              {meta?.total > PAGE_SIZE && (
                <Pagination size="small" align="center" current={page} pageSize={PAGE_SIZE} total={meta.total}
                  showSizeChanger={false} onChange={(p) => { setPage(p); setSelectedId(null); }} />
              )}
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          {active
            ? <RequestDetail key={active.id} request={active} canReview={canReview} onProcessed={afterProcessed} />
            : !loading && !error && <Card><EmptyState description="Chọn một yêu cầu ở danh sách bên trái để xem chi tiết" /></Card>}
        </div>
      </div>
    </>
  );
}
