import { useState } from 'react';
import {
  Card, Input, Segmented, Skeleton, Alert, Typography, Pagination, Grid, Badge, Button, App,
} from 'antd';
import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { contractApi } from '../../contracts/api/contract.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import ApplicationListItem from '../components/ApplicationListItem';
import ApplicationDetail from '../components/ApplicationDetail';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const PAGE_SIZE = 20;

const TAB_LABEL = { pending: 'Chờ duyệt', rejected: 'Đã từ chối', cancelled: 'Đã hủy' };
const EMPTY_TEXT = {
  pending: 'Không có đơn nào đang chờ duyệt',
  rejected: 'Chưa có đơn nào bị từ chối',
  cancelled: 'Chưa có đơn nào bị hủy',
};

/** Duyệt đơn đăng ký + Tự động duyệt xếp phòng nhân văn theo lô */
export default function ApplicationsPage() {
  const { user } = useAuth();
  const { modal, notification, message } = App.useApp();
  const screens = useBreakpoint();
  const canReview = can(user, 'application:review');

  const [status, setStatus] = useState('pending');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const search = useDebounce(keyword.trim());

  const { data: items, meta, loading, error, refetch } = useApi(
    () => contractApi.getList({ status, search: search || undefined, page, limit: PAGE_SIZE }),
    [status, search, page],
  );

  const list = items || [];
  const summary = meta?.summary;
  const activeId = selectedId ?? list[0]?.id ?? null;

  const afterProcessed = () => {
    setSelectedId(null);
    if (list.length === 1 && page > 1) setPage((p) => p - 1);
    else refetch();
  };

  const confirmAutoApprove = () => modal.confirm({
    title: 'Duyệt hàng loạt theo thứ tự nộp (FIFO)?',
    icon: <ThunderboltOutlined style={{ color: 'var(--brand)' }} />,
    content: 'Hệ thống sẽ duyệt các đơn chờ theo đúng thứ tự thời gian nộp (nộp trước duyệt trước), tự động xếp lấp đầy lần lượt từ tầng thấp lên tầng cao đúng loại phòng và giới tính phòng (phòng trống tự nhận giới tính). Các đơn mà loại phòng đã hết chỗ sẽ được bỏ qua.',
    okText: 'Duyệt hàng loạt',
    cancelText: 'Hủy',
    onOk: async () => {
      setAutoRunning(true);
      try {
        const res = await contractApi.autoApprove({ limit: 50 });
        const d = res.data.data;
        notification.success({
          title: 'Hoàn tất duyệt hàng loạt',
          description: `Đã duyệt giữ chỗ ${d.approvedCount ?? 0} đơn · Bỏ qua ${d.skippedCount ?? 0} đơn (do hết chỗ loại phòng đã chọn).`,
        });
        setSelectedId(null);
        refetch();
      } catch (err) {
        message.error(getErrorMessage(err));
      } finally {
        setAutoRunning(false);
      }
    },
  });

  const columns = screens.xxl ? '380px minmax(0, 1fr)' : screens.lg ? '305px minmax(0, 1fr)' : 'minmax(0, 1fr)';

  const tabOption = (value) => ({
    value,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
        {TAB_LABEL[value]}
        {summary && (value === 'pending'
          ? <Badge count={summary.pending} showZero color={summary.pending ? '#FF4D4F' : '#D9D9D9'} />
          : <Text type="secondary" style={{ fontSize: 12 }}>{summary[value] ?? 0}</Text>)}
      </span>
    ),
  });

  return (
    <>
      <PageHeader
        breadcrumb={['Lưu trú & hợp đồng', 'Duyệt đơn đăng ký']}
        title="Duyệt đơn đăng ký"
        description="Kiểm tra hồ sơ, duyệt giữ chỗ cấp phòng (chuyển Chờ đóng phí 7 ngày), cấp tài khoản và hóa đơn đầu kỳ."
        extra={canReview && (summary?.pending > 0) && (
          <Button type="primary" icon={<ThunderboltOutlined />} loading={autoRunning} onClick={confirmAutoApprove}>
            Duyệt hàng loạt ({summary.pending})
          </Button>
        )}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Segmented
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); setSelectedId(null); }}
            options={['pending', 'rejected', 'cancelled'].map(tabOption)}
          />
        </div>
        <Input
          allowClear prefix={<SearchOutlined />}
          placeholder="Tìm mã đơn, MSSV, họ tên, số phòng..."
          style={{ width: screens.md ? 300 : '100%', marginLeft: screens.md ? 'auto' : 0 }}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); setSelectedId(null); }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 16, alignItems: 'start' }}>
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

        <div style={{ minWidth: 0 }}>
          {activeId ? (
            <ApplicationDetail key={activeId} contractId={activeId} canReview={canReview} onProcessed={afterProcessed} />
          ) : (
            !loading && !error && <Card><EmptyState description="Chọn một đơn trong danh sách để xem chi tiết" /></Card>
          )}
        </div>
      </div>
    </>
  );
}
