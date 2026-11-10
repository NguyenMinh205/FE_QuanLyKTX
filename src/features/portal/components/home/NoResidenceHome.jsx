import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Skeleton, Alert } from 'antd';
import {
  HomeOutlined, ClockCircleOutlined, CloseCircleOutlined, ArrowRightOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { CONTRACT_TERM } from '../../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/formatter';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';

const { Title, Text } = Typography;
const pad2 = (n) => String(n).padStart(2, '0');

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ textAlign: 'right' }}>{children}</Text>
    </div>
  );
}

function IconBox({ bg, children }) {
  return <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{children}</div>;
}

/**
 * Sinh viên chưa có chỗ ở (thường là hợp đồng cũ đã kết thúc): đơn mới đang chờ / bị từ chối / mời nộp đơn.
 * Nộp đơn ở cổng công khai `/apply` (FR-30) — trong cổng sinh viên không có form nộp đơn.
 */
export default function NoResidenceHome() {
  const navigate = useNavigate();
  const { data: contracts, loading, error } = useApi(() => portalApi.getMyContracts(), []);
  const latest = (contracts || [])[0];

  if (error) return <Alert type="error" showIcon title={error} />;
  if (loading && !contracts) return <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>;

  if (latest?.status === 'pending') {
    return (
      <Card style={{ borderColor: '#FFD591', background: '#FFFBF0' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <IconBox bg="#FFE7BA"><ClockCircleOutlined style={{ fontSize: 22, color: '#D46B08' }} /></IconBox>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Title level={4} style={{ margin: 0 }}>Đơn đăng ký đang chờ duyệt</Title>
              <Tag color="warning" style={{ margin: 0 }}>{latest.contractCode}</Tag>
            </div>
            <Text type="secondary">Kết quả được gửi qua email. Hóa đơn chỉ tạo sau khi đơn được duyệt.</Text>
            <div style={{ marginTop: 12, maxWidth: 520 }}>
              <InfoRow label="Phòng">{latest.room?.buildingName} · Phòng {roomLabelOf(latest.room)} · Giường {pad2(latest.bedNumber)}</InfoRow>
              <InfoRow label="Gói thuê">{CONTRACT_TERM[latest.term]?.label}</InfoRow>
              <InfoRow label="Nộp lúc">{formatDateTime(latest.createdAt)}</InfoRow>
              <InfoRow label="Cần thanh toán khi được duyệt">{formatCurrency(latest.depositAmount + latest.totalRoomFee)}</InfoRow>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (latest?.status === 'rejected') {
    return (
      <Card style={{ borderColor: '#FFA39E', background: '#FFF1F0' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <IconBox bg="#FFCCC7"><CloseCircleOutlined style={{ fontSize: 22, color: '#CF1322' }} /></IconBox>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Title level={4} style={{ margin: 0 }}>Đơn đăng ký {latest.contractCode} đã bị từ chối</Title>
            <Text type="secondary">Xử lý lúc {formatDateTime(latest.reviewedAt)}</Text>
            <div style={{ marginTop: 8 }}><Text strong>Lý do:</Text> <Text>{latest.rejectionReason || '—'}</Text></div>
          </div>
          <Button type="primary" onClick={() => navigate('/apply')}>Nộp đơn mới</Button>
        </div>
      </Card>
    );
  }

  const ended = latest?.status === 'terminated';
  return (
    <Card styles={{ body: { padding: 32 } }} style={{ background: 'linear-gradient(135deg, #1677FF 0%, #4096FF 100%)', border: 'none' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center' }}>
          <HomeOutlined style={{ fontSize: 30, color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Bạn chưa có chỗ ở tại ký túc xá</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {ended ? `Hợp đồng ${latest.contractCode} đã kết thúc ngày ${formatDate(latest.terminatedAt || latest.endDate)}. ` : ''}
            Muốn ở kỳ tiếp theo, bạn nộp đơn mới bằng mã sinh viên hiện tại.
          </Text>
          {ended && (
            <div style={{ marginTop: 8 }}>
              <Tag color={latest.isDepositRefunded ? 'success' : 'warning'} style={{ margin: 0 }}>
                {latest.isDepositRefunded
                  ? `Đã nhận lại cọc ngày ${formatDate(latest.depositRefundedAt)}`
                  : `Chưa nhận lại cọc ${formatCurrency(latest.depositAmount)} — đến văn phòng KTX để nhận`}
              </Tag>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <Button size="large" onClick={() => navigate('/apply')} style={{ fontWeight: 600 }}>
            Nộp đơn đăng ký <ArrowRightOutlined />
          </Button>
          <Button type="link" icon={<SearchOutlined />} onClick={() => navigate('/apply/status')} style={{ color: '#fff' }}>Tra cứu đơn</Button>
        </div>
      </div>
    </Card>
  );
}
