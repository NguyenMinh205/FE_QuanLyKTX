import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Typography, Tag, Skeleton, Alert, App, Row, Col,
} from 'antd';
import {
  HomeOutlined, ClockCircleOutlined, CloseCircleOutlined, ArrowRightOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { getErrorMessage } from '../../../../lib/axiosClient';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/formatter';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';
import { ROOM_TIER } from '../../../../constants/statuses';

const { Title, Text } = Typography;

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ textAlign: 'right' }}>{children}</Text>
    </div>
  );
}

/** Đơn đang chờ duyệt — thẻ cam, có nút hủy đơn (BR-37) */
function PendingApplicationCard({ app, onCancelled }) {
  const { modal, message } = App.useApp();

  const confirmCancel = () => modal.confirm({
    title: `Hủy đơn ${app.applicationCode}?`,
    content: 'Đơn sẽ bị rút khỏi hàng chờ duyệt. Bạn có thể đăng ký lại ngay sau đó.',
    okText: 'Hủy đơn', okButtonProps: { danger: true }, cancelText: 'Giữ đơn',
    onOk: async () => {
      try {
        const res = await portalApi.cancelApplication(app.id);
        message.success(res.data.message);
        onCancelled();
      } catch (err) {
        message.error(getErrorMessage(err));
        onCancelled();
      }
    },
  });

  return (
    <Card style={{ borderColor: '#FFD591', background: '#FFFBF0' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFE7BA', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <ClockCircleOutlined style={{ fontSize: 22, color: '#D46B08' }} />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Title level={4} style={{ margin: 0 }}>Đơn đăng ký đang chờ duyệt</Title>
            <Tag color="warning" style={{ margin: 0 }}>{app.applicationCode}</Tag>
          </div>
          <Text type="secondary">Ban quản lý thường duyệt trong 1–2 ngày làm việc. Hóa đơn chỉ được tạo sau khi đơn được duyệt.</Text>

          <div style={{ marginTop: 12, maxWidth: 520 }}>
            <InfoRow label="Phòng đăng ký">{app.requestedRoom?.buildingName} · Phòng {roomLabelOf(app.requestedRoom)}</InfoRow>
            <InfoRow label="Loại phòng">{app.roomType?.name}</InfoRow>
            <InfoRow label="Thời gian ở">{formatDate(app.startDate)} → {formatDate(app.endDate)}</InfoRow>
            <InfoRow label="Nộp lúc">{formatDateTime(app.createdAt)}</InfoRow>
            {app.estimatedInvoices && (
              <InfoRow label="Cần thanh toán khi được duyệt">{formatCurrency(app.estimatedInvoices.total)}</InfoRow>
            )}
          </div>
          {app.requestedRoom?.availableSlots === 0 ? (
            <Alert
              type="warning" showIcon style={{ marginTop: 12 }}
              title={`Phòng ${roomLabelOf(app.requestedRoom)} hiện đã hết chỗ`}
              description="Ban quản lý có thể xếp bạn sang phòng khác cùng loại, cùng giá. Nếu muốn tự chọn phòng khác, hãy hủy đơn này và đăng ký lại."
            />
          ) : (
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
              Nộp đơn chưa giữ chỗ — nếu phòng này đầy trước khi duyệt, bạn có thể được xếp sang phòng khác cùng loại, cùng giá.
            </Text>
          )}
        </div>
        <div>
          <Button danger icon={<CloseCircleOutlined />} onClick={confirmCancel}>Hủy đơn</Button>
        </div>
      </div>
    </Card>
  );
}

/** Không có chỗ ở: chào mừng / đơn chờ duyệt / đơn bị từ chối + loại phòng còn chỗ (docs/08 mục 6.9) */
export default function NoResidenceHome() {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const { data: apps, loading, error } = useApi(() => portalApi.getMyApplications(), [reloadKey]);

  const latest = (apps || [])[0];
  const pending = (apps || []).find((a) => a.status === 'pending');
  const rejected = !pending && latest?.status === 'rejected' ? latest : null;

  const { data: types } = useApi(
    () => (apps && !pending ? portalApi.getRoomTypes() : Promise.resolve({ data: { data: { items: [] } } })),
    [!!apps, !!pending],
  );
  const openTypes = (types || []).filter((t) => t.availableSlots > 0)
    .sort((a, b) => a.pricePerMonth - b.pricePerMonth)
    .slice(0, 3);

  if (error) return <Alert type="error" showIcon title={error} />;
  if (loading && !apps) return <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>;

  if (pending) return <PendingApplicationCard app={pending} onCancelled={() => setReloadKey((k) => k + 1)} />;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {rejected ? (
        <Card style={{ borderColor: '#FFA39E', background: '#FFF1F0' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFCCC7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CloseCircleOutlined style={{ fontSize: 22, color: '#CF1322' }} />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Title level={4} style={{ margin: 0 }}>Đơn đăng ký {rejected.applicationCode} đã bị từ chối</Title>
              <Text type="secondary">
                Phòng {roomLabelOf(rejected.requestedRoom)} · {rejected.roomType?.name} · xử lý lúc {formatDateTime(rejected.reviewedAt)}
              </Text>
              <div style={{ marginTop: 8 }}><Text strong>Lý do:</Text> <Text>{rejected.reviewNote || '—'}</Text></div>
            </div>
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => navigate('/portal/apply')}>Đăng ký lại</Button>
          </div>
        </Card>
      ) : (
        <Card styles={{ body: { padding: 32 } }} style={{ background: 'linear-gradient(135deg, #1677FF 0%, #4096FF 100%)', border: 'none' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center' }}>
              <HomeOutlined style={{ fontSize: 30, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>Bạn chưa có chỗ ở tại ký túc xá</Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                Chọn loại phòng, chọn phòng và nộp đơn trực tuyến — ban quản lý duyệt trong 1–2 ngày làm việc.
              </Text>
            </div>
            <Button size="large" onClick={() => navigate('/portal/apply')} style={{ fontWeight: 600 }}>
              Đăng ký chỗ ở <ArrowRightOutlined />
            </Button>
          </div>
        </Card>
      )}

      {openTypes.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0 }}>Loại phòng còn chỗ</Title>
            <a onClick={() => navigate('/portal/apply')}>Xem tất cả <ArrowRightOutlined /></a>
          </div>
          <Row gutter={[16, 16]}>
            {openTypes.map((t) => (
              <Col xs={24} md={8} key={t.id}>
                <Card hoverable onClick={() => navigate('/portal/apply')} style={{ height: '100%' }}>
                  <Tag color={ROOM_TIER[t.tier]?.color === 'default' ? undefined : ROOM_TIER[t.tier]?.color}>{ROOM_TIER[t.tier]?.label}</Tag>
                  <Title level={5} style={{ margin: '8px 0 4px' }}>{t.name}</Title>
                  <Text strong style={{ fontSize: 18, color: '#1677FF' }}>{formatCurrency(t.pricePerMonth)}</Text>
                  <Text type="secondary"> / người / tháng</Text>
                  <div style={{ marginTop: 8 }}><Text type="secondary" style={{ fontSize: 13 }}>{t.amenities.slice(0, 4).join(' · ')}</Text></div>
                  <div style={{ marginTop: 8 }}><Text style={{ color: '#389E0D' }}>● Còn {t.availableSlots} chỗ</Text></div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
