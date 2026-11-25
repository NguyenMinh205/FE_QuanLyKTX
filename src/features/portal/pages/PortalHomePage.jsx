import { useNavigate } from 'react-router-dom';
import { Card, Typography, Alert, Skeleton, Button, Space } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import NoResidenceHome from '../components/home/NoResidenceHome';
import ResidentHome from '../components/home/ResidentHome';

const { Title, Text } = Typography;

/** Trang chủ Cổng Sinh viên — gọn, sắc nét, ưu tiên thông tin cần hành động ngay */
export default function PortalHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useApi(() => portalApi.getProfile(), []);
  const { data: residence, loading, error, refetch } = useApi(() => portalApi.getMyResidence(), []);

  const hasResidence = residence?.hasResidence === true;
  const hasPendingPayment = residence?.hasPendingPayment === true;
  const pendingContract = hasPendingPayment ? residence.contract : null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Xin chào, {profile?.fullName ?? user?.fullName}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {profile?.studentCode && <span className="mono">{profile.studentCode}</span>}
            {profile?.faculty && <> · {profile.faculty}</>}
          </Text>
        </div>
        {residence && (
          <span
            className="haui-status"
            style={
              hasResidence
                ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
                : hasPendingPayment
                  ? { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }
                  : { background: '#F8FAFC', borderColor: 'var(--line)', color: 'var(--text-secondary)' }
            }
          >
            <span
              className="haui-status-dot"
              style={{ background: hasResidence ? '#16A34A' : hasPendingPayment ? '#2563EB' : '#64748B' }}
            />
            {hasResidence ? 'Đang nội trú' : hasPendingPayment ? 'Chờ đóng phí giữ chỗ' : 'Hết hạn / Chưa gia hạn'}
          </span>
        )}
      </div>

      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && !residence && <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>}

      {!error && hasPendingPayment && pendingContract && (
        <Card style={{ borderLeft: '4px solid var(--brand)' }} styles={{ body: { padding: '18px 20px' } }}>
          <Space orientation="vertical" size={10} style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0, fontSize: 17 }}>
              Đơn <span className="mono">{pendingContract.contractCode}</span> đã được duyệt giữ chỗ tại Phòng <span className="mono">{roomLabelOf(pendingContract.room)}</span>
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>
              Vui lòng hoàn tất thanh toán phí phòng &amp; tiền cọc (<Text strong className="mono">{formatCurrency(residence.debtSummary?.totalDebt ?? ((pendingContract.totalRoomFee || 0) + (pendingContract.depositAmount || 0)))}</Text>)
              trước hạn <Text strong className="mono">{formatDate(pendingContract.paymentDeadline)}</Text>.
              Ngay khi nhận chuyển khoản VietQR, hợp đồng tự kích hoạt và cấp mã QR Check-in nhận phòng.
            </Text>
            <Space wrap>
              <Button type="primary" size="large" icon={<QrcodeOutlined />} onClick={() => navigate('/portal/my-invoices')}>
                Mở mã VietQR thanh toán
              </Button>
              <Button onClick={() => navigate('/portal/my-residence')}>Xem chi tiết hợp đồng</Button>
            </Space>
          </Space>
        </Card>
      )}

      {!error && residence && hasResidence && <ResidentHome residence={residence} />}
      {!error && residence && !hasResidence && !hasPendingPayment && <NoResidenceHome profile={profile} onApplied={refetch} />}
    </div>
  );
}
