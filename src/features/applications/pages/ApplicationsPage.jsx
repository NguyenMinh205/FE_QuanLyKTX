import { useState } from 'react';
import {
  Button, Card, Input, Select, Segmented, Skeleton, Alert, Typography, Pagination, Grid, Badge,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { applicationApi } from '../api/application.api';
import { roomApi } from '../../rooms/api/room.api';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import ApplicationListItem from '../components/ApplicationListItem';
import ApplicationDetail from '../components/ApplicationDetail';
import CreateApplicationModal from '../components/CreateApplicationModal';
import { isBlocked } from '../utils/applicationView';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const PAGE_SIZE = 20;

const TAB_LABEL = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã từ chối' };
const EMPTY_TEXT = {
  pending: 'Không có đơn nào đang chờ duyệt',
  approved: 'Chưa có đơn nào được duyệt',
  rejected: 'Chưa có đơn nào bị từ chối',
};

/** SCR-31 Duyệt đơn đăng ký — danh sách trái + chi tiết phải (docs/08 mục 6.4) */
export default function ApplicationsPage() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const canReview = can(user, 'application:review');
  const canCreate = can(user, 'application:create');

  const [status, setStatus] = useState('pending');
  const [keyword, setKeyword] = useState('');
  const [roomTypeId, setRoomTypeId] = useState();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebounce(keyword.trim());

  const { data: roomTypes } = useApi(() => roomApi.getRoomTypes(), []);
  const { data: items, meta, loading, error, refetch } = useApi(
    () => applicationApi.getList({ status, search: search || undefined, roomTypeId, page, limit: PAGE_SIZE }),
    [status, search, roomTypeId, page],
  );

  const list = items || [];
  const summary = meta?.summary;
  // Chưa chọn đơn nào thì mở đơn đầu tiên (đơn chờ lâu nhất)
  const activeId = selectedId ?? list[0]?.id ?? null;
  const blockedCount = status === 'pending' ? list.filter(isBlocked).length : 0;

  const resetSelection = (fn) => (value) => { fn(value); setPage(1); setSelectedId(null); };

  const afterProcessed = () => {
    setSelectedId(null);
    refetch();
  };

  const afterCreated = (created) => {
    setCreateOpen(false);
    setStatus('pending');
    setKeyword('');
    setRoomTypeId(undefined);
    setPage(1);
    setSelectedId(created.id);
    refetch();
  };

  const columns = screens.xl ? '400px minmax(0, 1fr)' : screens.lg ? '320px minmax(0, 1fr)' : 'minmax(0, 1fr)';

  const tabOption = (value) => ({
    value,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
        {TAB_LABEL[value]}
        {summary && (value === 'pending'
          ? <Badge count={summary.pending} showZero color={summary.pending ? '#FF4D4F' : '#D9D9D9'} />
          : <Text type="secondary" style={{ fontSize: 12 }}>{summary[value]}</Text>)}
      </span>
    ),
  });

  return (
    <>
      <PageHeader
        breadcrumb={['Lưu trú & hợp đồng', 'Duyệt đơn đăng ký']}
        title="Duyệt đơn đăng ký"
        description="Xếp phòng cho sinh viên — giường được hệ thống gán tự động"
        extra={canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Lập đơn cho sinh viên</Button>}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Segmented
          value={status}
          onChange={resetSelection(setStatus)}
          options={['pending', 'approved', 'rejected'].map(tabOption)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 'auto' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm mã đơn, MSSV, họ tên, phòng..."
            style={{ width: 280 }}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); setSelectedId(null); }}
          />
          <Select
            allowClear
            placeholder="Tất cả loại phòng"
            style={{ width: 200 }}
            value={roomTypeId}
            options={(roomTypes || []).map((t) => ({ value: t.id, label: t.name }))}
            onChange={resetSelection(setRoomTypeId)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 16, alignItems: 'start' }}>
        {/* ---------- Danh sách ---------- */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Text strong type="secondary" style={{ fontSize: 12, letterSpacing: 0.5 }}>
              {TAB_LABEL[status].toUpperCase()} ({meta?.total ?? 0})
            </Text>
            {blockedCount > 0 && <Text type="danger" style={{ fontSize: 12 }}>● {blockedCount} đơn hết chỗ</Text>}
          </div>

          {error && <Alert type="error" showIcon title={error} />}
          {!error && loading && !items && <Card><Skeleton active avatar paragraph={{ rows: 4 }} /></Card>}
          {!error && items && list.length === 0 && (
            <Card><EmptyState description={search || roomTypeId ? 'Không có đơn phù hợp bộ lọc' : EMPTY_TEXT[status]} /></Card>
          )}
          {!error && list.length > 0 && (
            <div style={{ display: 'grid', gap: 8, opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
              {list.map((app) => (
                <ApplicationListItem key={app.id} app={app} selected={app.id === activeId} onSelect={setSelectedId} />
              ))}
              {meta?.total > PAGE_SIZE && (
                <Pagination
                  size="small" align="center" style={{ marginTop: 8 }}
                  current={page} pageSize={PAGE_SIZE} total={meta.total} showSizeChanger={false}
                  onChange={(p) => { setPage(p); setSelectedId(null); }}
                />
              )}
            </div>
          )}
        </div>

        {/* ---------- Chi tiết ---------- */}
        <div style={{ minWidth: 0 }}>
          {activeId ? (
            <ApplicationDetail
              key={activeId}
              applicationId={activeId}
              canReview={canReview}
              onProcessed={afterProcessed}
              onListStale={refetch}
            />
          ) : (
            !loading && !error && <Card><EmptyState description="Chọn một đơn ở danh sách bên trái để xem chi tiết" /></Card>
          )}
        </div>
      </div>

      <CreateApplicationModal
        open={createOpen}
        roomTypes={roomTypes}
        onCancel={() => setCreateOpen(false)}
        onCreated={afterCreated}
      />
    </>
  );
}
