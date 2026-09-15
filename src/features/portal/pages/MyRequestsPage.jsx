import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Button, Table, Tabs, Tag, Typography, Alert, Row, Col, App, Tooltip, Breadcrumb,
} from 'antd';
import { PlusOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { REQUEST_STATUS, REQUEST_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import SupportCard from '../components/SupportCard';
import CreateRequestModal from '../components/requests/CreateRequestModal';
import { daysUntil } from '../utils/homeView';

const { Title, Text } = Typography;

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
  { key: 'cancelled', label: 'Đã hủy' },
];

/** Kết quả hiển thị ở cột cuối, theo loại và trạng thái */
function ResultCell({ r }) {
  if (r.status === 'rejected') return <Text type="danger">{r.reviewNote || 'Bị từ chối'}</Text>;
  if (r.status === 'cancelled') return <Text type="secondary">Bạn đã hủy</Text>;
  if (r.status === 'pending') return <Text type="secondary">Ban quản lý thường xử lý trong 1–2 ngày làm việc</Text>;
  if (r.type === 'renewal' && r.renewal) return <Text style={{ color: '#389E0D' }}>Hợp đồng đã gia hạn tới {formatDate(r.renewal.newEndDate)}</Text>;
  if (r.type === 'checkout' && r.settlement) {
    return r.settlement.studentStillOwes > 0
      ? <Text type="danger">Còn phải nộp {formatCurrency(r.settlement.studentStillOwes)} (hóa đơn quyết toán)</Text>
      : <Text style={{ color: '#389E0D' }}>Đã quyết toán, hoàn cọc {formatCurrency(r.settlement.refundAmount)}</Text>;
  }
  return <Text style={{ color: '#389E0D' }}>Đã duyệt</Text>;
}

/** SCR-66 Yêu cầu của tôi — cổng sinh viên (docs/08 mục 6.12) */
export default function MyRequestsPage() {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState('all');
  // Trang chủ mở thẳng modal gia hạn qua ?create=renewal
  const createParam = searchParams.get('create');
  const [createType, setCreateType] = useState(['renewal', 'checkout'].includes(createParam) ? createParam : null);

  const { data: requests, loading, error, refetch } = useApi(() => portalApi.getMyRequests(), []);
  const { data: residence } = useApi(() => portalApi.getMyResidence(), []);

  const all = requests || [];
  const count = (key) => (key === 'all' ? all.length : all.filter((r) => r.status === key).length);
  const shown = tab === 'all' ? all : all.filter((r) => r.status === tab);
  const pendingTypes = [...new Set(all.filter((r) => r.status === 'pending').map((r) => r.type))];
  const contract = residence?.hasResidence ? residence.contract : null;
  const daysLeft = contract ? daysUntil(contract.endDate) : null;

  const openCreate = (type = 'renewal') => setCreateType(type);
  const closeCreate = () => {
    setCreateType(null);
    if (createParam) setSearchParams({}, { replace: true });
  };

  const confirmCancel = (r) => modal.confirm({
    title: `Hủy yêu cầu ${REQUEST_TYPE[r.type]?.label.toLowerCase()}?`,
    content: `${r.requestCode ?? ''} — sau khi hủy, bạn có thể gửi lại yêu cầu mới cùng loại.`,
    okText: 'Hủy yêu cầu', okButtonProps: { danger: true }, cancelText: 'Giữ lại',
    onOk: async () => {
      try {
        const res = await portalApi.cancelRequest(r.id);
        message.success(res.data.message);
      } catch (err) {
        message.error(getErrorMessage(err));
      }
      refetch();
    },
  });

  const columns = [
    {
      title: 'Mã & loại', key: 'code', width: 170,
      render: (_, r) => (
        <>
          <Text strong style={{ display: 'block' }}>{r.requestCode ?? '—'}</Text>
          <Tag color={REQUEST_TYPE[r.type]?.color} style={{ margin: '4px 0' }}>{REQUEST_TYPE[r.type]?.label}</Tag>
          <div><Text type="secondary" style={{ fontSize: 12 }}>Gửi {formatDateTime(r.createdAt)}</Text></div>
        </>
      ),
    },
    {
      title: 'Nội dung yêu cầu', key: 'content',
      render: (_, r) => (
        <>
          <Text strong>{r.type === 'renewal' ? `Gia hạn đến ${formatDate(r.requestedEndDate)}` : `Trả phòng ngày ${formatDate(r.requestedEndDate)}`}</Text>
          {r.reason && <div><Text type="secondary" style={{ fontSize: 13 }}>Lý do: {r.reason}</Text></div>}
        </>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 110, render: (s) => <Tag color={REQUEST_STATUS[s]?.color} style={{ margin: 0 }}>{REQUEST_STATUS[s]?.label}</Tag> },
    { title: 'Kết quả / lý do', key: 'result', width: 190, render: (_, r) => <ResultCell r={r} /> },
    {
      title: '', key: 'action', width: 56, align: 'right',
      render: (_, r) => r.status === 'pending' && <a style={{ color: '#FF4D4F' }} onClick={() => confirmCancel(r)}>Hủy</a>,
    },
  ];

  const createButton = (
    <Tooltip title={contract ? null : 'Cần có hợp đồng đang hiệu lực để gửi yêu cầu'}>
      <Button type="primary" icon={<PlusOutlined />} disabled={!contract} onClick={() => openCreate('renewal')}>Tạo yêu cầu</Button>
    </Tooltip>
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb items={[{ title: <a onClick={() => navigate('/portal/home')}><HomeOutlined /> Trang chủ</a> }, { title: 'Yêu cầu của tôi' }]} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Yêu cầu của tôi {requests && <Tag style={{ verticalAlign: 'middle' }}>{all.length} yêu cầu</Tag>}</Title>
            <Text type="secondary">Gửi và theo dõi yêu cầu gia hạn hoặc trả phòng ký túc xá</Text>
          </div>
          {createButton}
        </div>
      </div>

      {residence && !residence.hasResidence && (
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          title="Bạn chưa có hợp đồng lưu trú đang hiệu lực"
          description="Yêu cầu gia hạn / trả phòng chỉ gửi được khi bạn đang ở ký túc xá."
          action={<Button size="small" onClick={() => navigate('/portal/home')}>Về trang chủ</Button>}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card styles={{ body: { paddingTop: 0 } }}>
            <Tabs
              activeKey={tab}
              onChange={setTab}
              items={TABS.map((t) => ({ key: t.key, label: `${t.label} (${count(t.key)})` }))}
            />
            {error && <Alert type="error" showIcon title={error} />}
            {!error && (
              <Table
                rowKey="id" size="middle" columns={columns} dataSource={shown} loading={loading && !requests}
                pagination={shown.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
                scroll={{ x: 700 }}
                locale={{ emptyText: tab === 'all' ? 'Bạn chưa gửi yêu cầu nào' : 'Không có yêu cầu ở trạng thái này' }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Card title={<span><FileTextOutlined style={{ color: '#1677FF' }} /> Tổng quan</span>}>
              {contract ? (
                <>
                  <div style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: 8, marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Hợp đồng {contract.contractCode}</Text>
                    <div><Text strong>{contract.buildingName} · Phòng {contract.bedCode?.split('-')[0]}</Text></div>
                    <Text type={daysLeft !== null && daysLeft <= 30 ? 'warning' : 'secondary'} style={{ fontSize: 13 }}>
                      Hết hạn {formatDate(contract.endDate)}{daysLeft !== null && daysLeft >= 0 ? ` · còn ${daysLeft} ngày` : ''}
                    </Text>
                  </div>
                </>
              ) : <Text type="secondary">Chưa có hợp đồng đang hiệu lực.</Text>}
              {[
                { key: 'pending', label: 'Đang chờ duyệt', color: '#FAAD14', bg: '#FFFBE6' },
                { key: 'approved', label: 'Đã duyệt', color: '#389E0D', bg: '#F6FFED' },
                { key: 'rejected', label: 'Bị từ chối', color: '#CF1322', bg: '#FFF1F0' },
              ].map((s) => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: s.bg, borderRadius: 8, marginTop: 8 }}>
                  <Text>{s.label}</Text>
                  <Text strong style={{ color: s.color }}>{count(s.key)} yêu cầu</Text>
                </div>
              ))}
              {contract && (
                <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                  <Button block onClick={() => openCreate('renewal')}>Gia hạn chỗ ở</Button>
                  <Button block onClick={() => openCreate('checkout')}>Trả phòng</Button>
                </div>
              )}
            </Card>
            <SupportCard title="Hỗ trợ & khiếu nại" />
          </div>
        </Col>
      </Row>

      {contract && (
        <CreateRequestModal
          key={createType ?? 'closed'}
          open={!!createType}
          initialType={createType ?? 'renewal'}
          residence={residence}
          pendingTypes={pendingTypes}
          onCancel={closeCreate}
          onCreated={() => { closeCreate(); setTab('pending'); refetch(); }}
        />
      )}
    </>
  );
}
