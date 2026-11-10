import { useState } from 'react';
import {
  Card, Input, Segmented, Skeleton, Alert, Typography, Pagination, Grid, Badge,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { contractApi } from '../../contracts/api/contract.api';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import ApplicationListItem from '../components/ApplicationListItem';
import ApplicationDetail from '../components/ApplicationDetail';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const PAGE_SIZE = 20;

const TAB_LABEL = { pending: 'Chờ duyệt', rejected: 'Đã từ chối' };
const EMPTY_TEXT = {
  pending: 'Không có đơn nào đang chờ duyệt',
  rejected: 'Chưa có đơn nào bị từ chối',
};

/**
 * SCR-31 Duyệt đơn đăng ký (FR-31, FR-32, FR-33) — danh sách trái + chi tiết phải.
 * Đơn là hợp đồng trạng thái `pending`; đơn đã duyệt chuyển sang màn Hợp đồng.
 */
export default function ApplicationsPage() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const canReview = can(user, 'application:review');

  const [status, setStatus] = useState('pending');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const search = useDebounce(keyword.trim());

  const { data: items, meta, loading, error, refetch } = useApi(
    () => contractApi.getList({ status, search: search || undefined, page, limit: PAGE_SIZE }),
    [status, search, page],
  );

  const list = items || [];
  const summary = meta?.summary;
  // Chưa chọn đơn nào thì mở đơn đầu tiên (đơn chờ lâu nhất)
  const activeId = selectedId ?? list[0]?.id ?? null;

  const afterProcessed = () => {
    setSelectedId(null);
    // Xử lý đơn cuối của trang 2 trở đi: trang đó rỗng và ô phân trang biến mất → lùi một trang
    if (list.length === 1 && page > 1) setPage((p) => p - 1);
    else refetch();
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
        description="Đơn sinh viên nộp trực tuyến — kiểm tra hồ sơ, xác nhận giường, cấp tài khoản và hóa đơn"
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Segmented
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); setSelectedId(null); }}
          options={['pending', 'rejected'].map(tabOption)}
        />
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm mã đơn, MSSV, họ tên, số phòng..."
          style={{ width: 300, marginLeft: 'auto' }}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); setSelectedId(null); }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 16, alignItems: 'start' }}>
        {/* ---------- Danh sách ---------- */}
        <div style={{ minWidth: 0 }}>
          <Text strong type="secondary" style={{ display: 'block', fontSize: 12, letterSpacing: 0.5, marginBottom: 8 }}>
            {TAB_LABEL[status].toUpperCase()} ({meta?.total ?? 0})
          </Text>

          {error && <Alert type="error" showIcon title={error} />}
          {!error && loading && !items && <Card><Skeleton active avatar paragraph={{ rows: 4 }} /></Card>}
          {!error && items && list.length === 0 && (
            <Card><EmptyState description={search ? 'Không có đơn phù hợp từ khóa' : EMPTY_TEXT[status]} /></Card>
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
            <ApplicationDetail key={activeId} contractId={activeId} canReview={canReview} onProcessed={afterProcessed} />
          ) : (
            !loading && !error && <Card><EmptyState description="Chọn một đơn ở danh sách bên trái để xem chi tiết" /></Card>
          )}
        </div>
      </div>
    </>
  );
}
