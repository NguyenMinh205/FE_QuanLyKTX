import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Divider, Form, Input, Modal, Row, Skeleton, Typography, App,
} from 'antd';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { applyApi } from '../api/apply.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { CONTRACT_TERM, CAMPUS, ROOM_TIER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import StatusTag from '../../../components/StatusTag';
import PublicShell from '../components/PublicShell';

const { Title, Text } = Typography;
const NOTHING = Promise.resolve({ data: { data: null } });

function Line({ label, children, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
      <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
      <Text className={mono ? 'mono' : undefined} style={{ textAlign: 'right', fontSize: 13.5 }}>{children}</Text>
    </div>
  );
}

/** Tra cứu tiến độ đơn & Tự hủy đơn đang pending (công khai) */
export default function ApplicationStatusPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [params] = useSearchParams();
  const fromUrl = params.get('studentCode') && params.get('email')
    ? { studentCode: params.get('studentCode'), email: params.get('email') }
    : null;

  const [query, setQuery] = useState(fromUrl);
  const [round, setRound] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm] = Form.useForm();

  const { data: app, loading, error } = useApi(() => (query ? applyApi.getStatus(query) : NOTHING), [query, round]);
  const active = ['active', 'expired', 'terminated'].includes(app?.status);

  const handleCancelPending = async (values) => {
    setCancelling(true);
    try {
      const res = await applyApi.cancelApplication({
        studentCode: query.studentCode,
        email: query.email,
        citizenId: values.citizenId.trim(),
        reason: values.reason?.trim() || '',
      });
      message.success(res.data.message);
      setCancelOpen(false);
      cancelForm.resetFields();
      setRound((r) => r + 1);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PublicShell>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Tra cứu tiến độ đơn đăng ký
          </Title>
          <Text type="secondary" style={{ fontSize: 13.5 }}>Nhập đúng mã sinh viên (10 số) và email đã khai khi nộp đơn.</Text>
        </div>

        <Card styles={{ body: { padding: 20 } }}>
          <Form
            layout="vertical" initialValues={fromUrl || {}} autoComplete="off"
            onFinish={(v) => { setQuery({ studentCode: v.studentCode.trim(), email: v.email.trim() }); setRound((r) => r + 1); }}
          >
            <Row gutter={14}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="studentCode" label="Mã sinh viên"
                  rules={[{ required: true, whitespace: true, message: 'Nhập mã sinh viên' }, { pattern: /^\s*\d{10}\s*$/, message: 'Mã sinh viên gồm đúng 10 chữ số' }]}
                >
                  <Input placeholder="VD: 2026601234" maxLength={10} inputMode="numeric" className="mono" />
                </Form.Item>
              </Col>
              <Col xs={24} md={14}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}>
                  <Input placeholder="Email đã khai trong đơn" maxLength={100} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading && !!query}>Tra cứu</Button>
          </Form>
        </Card>

        {query && error && <Alert type="warning" showIcon title={error} description="Kiểm tra lại mã sinh viên và email, hoặc nộp đơn mới nếu chưa nộp." />}
        {query && !error && loading && !app && <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>}

        {query && !error && app && (
          <Card
            title={<span className="mono">Đơn {app.contractCode}</span>}
            extra={<StatusTag type="contract" value={app.status} />}
            styles={{ body: { padding: 20 } }}
          >
            <Line label="Nộp lúc" mono>{formatDateTime(app.submittedAt || app.createdAt)}</Line>
            <Line label="Cơ sở">{app.campusName || app.room?.campusName || CAMPUS[app.campus || app.room?.campus]?.label || '—'}</Line>
            <Line label={app.room ? 'Phòng đã xếp' : 'Xếp phòng'}>
              {app.room
                ? `${app.room.buildingName} · Phòng ${roomLabelOf(app.room)}`
                : (app.preferredRoomTier
                  ? `${ROOM_TIER[app.preferredRoomTier]?.label || app.preferredRoomTier}${app.preferredCapacity ? ` (${app.preferredCapacity} người)` : ''} — Chờ xếp tầng thấp → cao`
                  : 'Chờ xếp từ tầng thấp → cao')}
            </Line>
            <Line label="Gói thuê">{CONTRACT_TERM[app.term]?.label || app.term}</Line>
            <Line label="Phí phòng + Tiền cọc" mono>{formatCurrency((app.totalRoomFee || 0) + (app.depositAmount || 0))}</Line>
            {app.paymentDeadline && app.status === 'pending_payment' && (
              <Line label="Hạn đóng phí" mono>
                <Text strong type={app.isPaymentOverdue ? 'danger' : 'warning'}>{formatDate(app.paymentDeadline)}</Text>
              </Line>
            )}
            {active && <Line label="Thời hạn hợp đồng" mono>{formatDate(app.startDate)} → {formatDate(app.endDate)}</Line>}
            {app.checkinCode && <Line label="Mã QR Check-in" mono>{app.checkinCode}</Line>}

            <Divider style={{ margin: '14px 0' }} />

            {app.status === 'pending' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text type="secondary" style={{ fontSize: 13, flex: 1 }}>
                  Đơn đang chờ cán bộ xét duyệt. Tài khoản sẽ gửi qua email khi được duyệt giữ chỗ.
                </Text>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => setCancelOpen(true)}>Tự hủy đơn</Button>
              </div>
            )}

            {app.status === 'pending_payment' && (
              <Alert
                type={app.isPaymentOverdue ? 'error' : 'warning'}
                showIcon
                title={app.isPaymentOverdue ? 'Đơn đã quá hạn đóng phí giữ chỗ' : 'Đơn đã được duyệt — Chờ hoàn tất đóng phí'}
                description="Đăng nhập Cổng Sinh viên (TK = MK = MSSV) để quét mã VietQR. Hệ thống tự kích hoạt hợp đồng và sinh mã QR Check-in ngay khi nhận tiền."
                action={<Button type="primary" onClick={() => navigate('/login')}>Đăng nhập thanh toán</Button>}
              />
            )}

            {active && (
              <Alert
                type="success" showIcon title="Hợp đồng đã có hiệu lực"
                description="Đăng nhập Cổng Sinh viên để xem thông tin phòng, mã QR Check-in và hóa đơn điện nước."
                action={<Button type="primary" onClick={() => navigate('/login')}>Vào Cổng SV</Button>}
              />
            )}

            {app.status === 'rejected' && (
              <Alert
                type="error" showIcon title="Đơn bị từ chối"
                description={`Lý do: ${app.rejectionReason || '—'}`}
                action={<Button onClick={() => navigate('/apply')}>Nộp đơn mới</Button>}
              />
            )}

            {app.status === 'cancelled' && (
              <Alert
                type="warning" showIcon title="Đơn / Hợp đồng đã bị hủy"
                description={`Lý do: ${app.cancelReason || 'Đã hủy theo yêu cầu hoặc quá hạn đóng phí'}`}
                action={<Button onClick={() => navigate('/apply')}>Đăng ký lại</Button>}
              />
            )}
          </Card>
        )}
      </div>

      <Modal
        open={cancelOpen}
        title="Xác nhận tự hủy đơn đăng ký"
        okText="Xác nhận hủy đơn"
        okButtonProps={{ danger: true }}
        cancelText="Đóng"
        confirmLoading={cancelling}
        onOk={() => cancelForm.submit()}
        onCancel={() => setCancelOpen(false)}
        destroyOnHidden
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelPending} style={{ marginTop: 12 }}>
          <Form.Item
            name="citizenId" label="Nhập số CCCD (12 số) để xác thực"
            rules={[{ required: true, message: 'Nhập số CCCD' }, { pattern: /^\d{12}$/, message: 'Số CCCD gồm đúng 12 chữ số' }]}
          >
            <Input maxLength={12} inputMode="numeric" placeholder="Số CCCD bạn đã khai trong đơn" className="mono" />
          </Form.Item>
          <Form.Item name="reason" label="Lý do hủy (không bắt buộc)">
            <Input.TextArea rows={2} maxLength={200} placeholder="VD: Đổi nhu cầu chỗ ở" />
          </Form.Item>
        </Form>
      </Modal>
    </PublicShell>
  );
}
