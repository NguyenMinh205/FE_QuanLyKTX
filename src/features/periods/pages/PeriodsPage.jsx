import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Card, Select, Space, Tag, Typography, App, Drawer, Divider, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, PlayCircleOutlined, StopOutlined, EyeOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { periodApi } from '../api/period.api';
import { CONTRACT_TERM, PERIOD_STATUS_OPTIONS } from '../../../constants/statuses';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatDate } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusTag from '../../../components/StatusTag';
import PeriodFormModal from '../components/PeriodFormModal';

const { Text } = Typography;

function DetailLine({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
      <div style={{ textAlign: 'right', minWidth: 0 }}>{children || '—'}</div>
    </div>
  );
}

/** Quản lý Đợt đăng ký KTX — Bảng 6 cột gọn + Drawer chi tiết đầy đủ khoa/ngành & thống kê 6 trạng thái */
export default function PeriodsPage() {
  const { user } = useAuth();
  const { message, modal } = App.useApp();
  const canManage = can(user, 'period:manage');

  const [filters, setFilters] = useState({ page: 1, limit: 20, status: undefined });
  const [formPeriod, setFormPeriod] = useState(null);
  const [detailPeriod, setDetailPeriod] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => periodApi.getList({
      page: filters.page, limit: filters.limit, status: filters.status,
    }),
    [filters],
  );

  const changeStatus = (p, nextStatus) => {
    const label = nextStatus === 'open' ? 'Mở cổng nhận đơn' : 'Đóng đợt đăng ký';
    modal.confirm({
      title: `${label} — ${p.code}?`,
      content: nextStatus === 'open'
        ? 'Sinh viên đúng khóa/ngành trong khung ngày mở đợt sẽ nhìn thấy và nộp đơn được ngay.'
        : 'Cổng nộp đơn công khai và nội bộ của đợt này sẽ ngừng tiếp nhận đơn mới.',
      okText: label,
      okButtonProps: nextStatus === 'closed' ? { danger: true } : undefined,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await periodApi.setStatus(p.id, { status: nextStatus });
          message.success(res.data.message);
          setDetailPeriod(null);
          refetch();
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      },
    });
  };

  const columns = [
    {
      title: 'Đợt đăng ký', key: 'name', width: 270,
      render: (_, p) => (
        <>
          <Text strong>{p.name}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{p.code} · Năm học {p.academicYearStart}–{p.academicYearStart + 1}</Text></div>
        </>
      ),
    },
    {
      title: 'Phạm vi & Đối tượng', key: 'scope', width: 195,
      render: (_, p) => (
        <Space orientation="vertical" size={4}>
          <StatusTag type="campus" value={p.campus} />
          <StatusTag type="cohort" value={p.targetCohort} />
        </Space>
      ),
    },
    {
      title: 'Khung thời gian', key: 'dates', width: 185,
      render: (_, p) => (
        <>
          <div>{formatDate(p.startDate)} → {formatDate(p.endDate)}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>Hạn đóng phí: {p.paymentDeadlineDays} ngày</Text>
        </>
      ),
    },
    {
      title: 'Tiếp nhận', key: 'stats', width: 145, align: 'right',
      render: (_, p) => (
        <>
          <div><Text strong>{p.stats?.total ?? 0}</Text> <Text type="secondary" style={{ fontSize: 12 }}>đăng ký</Text></div>
          <Text type={p.stats?.pending_payment ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>
            {p.stats?.pending_payment ?? 0} chờ đóng phí
          </Text>
        </>
      ),
    },
    {
      title: 'Trạng thái', key: 'status', width: 125,
      render: (_, p) => (
        <Space orientation="vertical" size={2}>
          <StatusTag type="period" value={p.status} />
          {p.isAcceptingNow && <Text type="success" style={{ fontSize: 11 }}>Đang nhận đơn</Text>}
        </Space>
      ),
    },
    {
      title: 'Thao tác', key: 'actions', width: canManage ? 190 : 90, fixed: 'right',
      render: (_, p) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setDetailPeriod(p)}>Xem</Button>
          {canManage && (
            <>
              <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormPeriod(p)}>Sửa</Button>
              {p.status !== 'open' ? (
                <Button size="small" type="link" icon={<PlayCircleOutlined />} onClick={() => changeStatus(p, 'open')}>Mở</Button>
              ) : (
                <Button size="small" type="link" danger icon={<StopOutlined />} onClick={() => changeStatus(p, 'closed')}>Đóng</Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const statsItems = detailPeriod ? [
    { label: 'Tổng đăng ký', value: detailPeriod.stats?.total ?? 0 },
    { label: 'Chờ đóng phí', value: detailPeriod.stats?.pending_payment ?? 0, color: 'var(--brand)' },
    { label: 'Đang ở', value: detailPeriod.stats?.active ?? 0, color: 'var(--success-text)' },
    { label: 'Đã thanh lý', value: detailPeriod.stats?.terminated ?? 0 },
    { label: 'Đã hủy', value: detailPeriod.stats?.cancelled ?? 0 },
  ] : [];

  return (
    <>
      <PageHeader
        breadcrumb={['Tuyển sinh & Lưu trú', 'Đợt đăng ký']}
        title="Đợt đăng ký KTX Cơ sở 1"
        description="Điều phối lịch mở cổng tiếp nhận đăng ký (tự động duyệt & xếp phòng ngay khi sinh viên nộp đơn)."
        extra={canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormPeriod({})}>Tạo đợt đăng ký</Button>}
      />

      <Card>
        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          showSearch={false}
          unit="đợt đăng ký"
          scrollX={980}
          onRow={(p) => ({ onClick: () => setDetailPeriod(p), style: { cursor: 'pointer' } })}
          rowClassName={(p) => (p.id === detailPeriod?.id ? 'ant-table-row-selected' : '')}
          extraFilters={(
            <Select
              allowClear placeholder="Tất cả trạng thái" style={{ width: 165 }}
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))}
              options={PERIOD_STATUS_OPTIONS}
            />
          )}
        />
      </Card>

      <Drawer
        open={!!detailPeriod}
        onClose={() => setDetailPeriod(null)}
        title={detailPeriod ? `${detailPeriod.code} — Chi tiết đợt đăng ký` : ''}
        size={480}
        extra={detailPeriod && canManage && (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => { setFormPeriod(detailPeriod); setDetailPeriod(null); }}>Sửa</Button>
            {detailPeriod.status !== 'open' ? (
              <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => changeStatus(detailPeriod, 'open')}>Mở đợt</Button>
            ) : (
              <Button size="small" danger icon={<StopOutlined />} onClick={() => changeStatus(detailPeriod, 'closed')}>Đóng đợt</Button>
            )}
          </Space>
        )}
      >
        {detailPeriod && (
          <>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>{detailPeriod.name}</Text>

            <DetailLine label="Trạng thái">
              <Space size={6}>
                <StatusTag type="period" value={detailPeriod.status} />
                {detailPeriod.isAcceptingNow && <Tag color="success" style={{ margin: 0 }}>Đang mở nhận đơn</Tag>}
              </Space>
            </DetailLine>
            <DetailLine label="Năm học">{detailPeriod.academicYearStart}–{detailPeriod.academicYearStart + 1}</DetailLine>
            <DetailLine label="Cơ sở áp dụng"><StatusTag type="campus" value={detailPeriod.campus} /></DetailLine>
            <DetailLine label="Đối tượng"><StatusTag type="cohort" value={detailPeriod.targetCohort} /></DetailLine>
            <DetailLine label="Khung ngày">{formatDate(detailPeriod.startDate)} → {formatDate(detailPeriod.endDate)}</DetailLine>
            <DetailLine label="Hạn đóng phí">{detailPeriod.paymentDeadlineDays} ngày sau khi duyệt</DetailLine>
            <DetailLine label="Gói kỳ hạn">
              <Space size={4} wrap style={{ justifyContent: 'flex-end' }}>
                {(detailPeriod.allowedTerms || []).map((t) => <Tag key={t} style={{ margin: 0 }}>{CONTRACT_TERM[t]?.label || t}</Tag>)}
              </Space>
            </DetailLine>

            <Divider titlePlacement="start" style={{ margin: '16px 0 10px' }}>Phân luồng Khoa / Ngành</Divider>
            <div style={{ marginBottom: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Chỉ tiếp nhận:</Text>
              {detailPeriod.allowedFaculties?.length ? (
                <Space size={4} wrap>{detailPeriod.allowedFaculties.map((f) => <Tag key={f} color="blue" style={{ margin: 0 }}>{f}</Tag>)}</Space>
              ) : <Text style={{ fontSize: 13 }}>Tất cả các khoa / viện</Text>}
            </div>
            {detailPeriod.excludedFaculties?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Loại trừ:</Text>
                <Space size={4} wrap>{detailPeriod.excludedFaculties.map((f) => <Tag key={f} color="red" style={{ margin: 0 }}>{f}</Tag>)}</Space>
              </div>
            )}

            {detailPeriod.description && (
              <>
                <Divider titlePlacement="start" style={{ margin: '16px 0 8px' }}>Mô tả hiển thị công khai</Divider>
                <Text style={{ fontSize: 13 }}>{detailPeriod.description}</Text>
              </>
            )}

            <Divider titlePlacement="start" style={{ margin: '16px 0 10px' }}>Thống kê tiếp nhận</Divider>
            <Row gutter={[8, 8]}>
              {statsItems.map((it) => (
                <Col span={8} key={it.label}>
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-subtle)', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: it.color || 'var(--text)' }}>{it.value}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{it.label}</Text>
                  </div>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 16 }}>
              <Link to="/admin/contracts?tab=pending_payment">
                <Button block>Xem hợp đồng chờ đóng phí <ArrowRightOutlined /></Button>
              </Link>
            </div>
          </>
        )}
      </Drawer>

      <PeriodFormModal
        key={formPeriod?.id ?? (formPeriod ? 'new' : 'closed')}
        open={formPeriod !== null}
        period={formPeriod?.id ? formPeriod : null}
        onCancel={() => setFormPeriod(null)}
        onSaved={() => { setFormPeriod(null); refetch(); }}
      />
    </>
  );
}
