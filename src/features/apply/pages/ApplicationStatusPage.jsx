import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Divider, Form, Input, Row, Skeleton, Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { applyApi } from '../api/apply.api';
import { CONTRACT_TERM } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import StatusTag from '../../../components/StatusTag';
import PublicShell from '../components/PublicShell';

const { Title, Text } = Typography;
const NOTHING = Promise.resolve({ data: { data: null } });
const pad2 = (n) => String(n).padStart(2, '0');

function Line({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text style={{ textAlign: 'right' }}>{children}</Text>
    </div>
  );
}

/** Tra cứu tiến độ đơn bằng mã sinh viên + email (FR-33) — công khai, không cần đăng nhập */
export default function ApplicationStatusPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromUrl = params.get('studentCode') && params.get('email')
    ? { studentCode: params.get('studentCode'), email: params.get('email') }
    : null;
  const [query, setQuery] = useState(fromUrl);
  const [round, setRound] = useState(0); // bấm Tra cứu lại với cùng thông tin vẫn hỏi lại (đơn vừa được duyệt, lỗi mạng)
  const { data: app, loading, error } = useApi(() => (query ? applyApi.getStatus(query) : NOTHING), [query, round]);

  const approved = ['active', 'expired', 'terminated'].includes(app?.status);

  return (
    <PublicShell>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tra cứu đơn đăng ký</Title>
          <Text type="secondary">Nhập đúng mã sinh viên và email đã khai trong đơn.</Text>
        </div>

        <Card>
          <Form
            layout="vertical" initialValues={fromUrl || {}} autoComplete="off"
            onFinish={(v) => { setQuery({ studentCode: v.studentCode.trim().toUpperCase(), email: v.email.trim() }); setRound((r) => r + 1); }}
          >
            <Row gutter={16}>
              <Col xs={24} md={10}>
                <Form.Item name="studentCode" label="Mã sinh viên" rules={[{ required: true, whitespace: true, message: 'Nhập mã sinh viên' }]}>
                  <Input placeholder="VD: 2021601234" maxLength={20} />
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
          <Card title={`Đơn ${app.contractCode}`} extra={<StatusTag type="contract" value={app.status} />}>
            <Line label="Nộp lúc">{formatDateTime(app.submittedAt)}</Line>
            <Line label="Phòng">{app.room?.buildingName} · Phòng {roomLabelOf(app.room)}</Line>
            <Line label="Giường">Giường {pad2(app.bedNumber)}</Line>
            <Line label="Gói thuê">{CONTRACT_TERM[app.term]?.label}</Line>
            {approved && <Line label="Thời hạn">{formatDate(app.startDate)} → {formatDate(app.endDate)}</Line>}
            <Divider style={{ margin: '8px 0' }} />

            {app.status === 'pending' && (
              <Alert
                type="info" showIcon title="Đơn đang chờ cán bộ duyệt"
                description={`Khi duyệt, bạn cần thanh toán ${formatCurrency(app.depositAmount + app.totalRoomFee)} (tiền cọc và tiền phòng cả kỳ). Kết quả được gửi qua email.`}
              />
            )}
            {approved && (
              <Alert
                type="success" showIcon title="Đơn đã được duyệt"
                description="Tài khoản đã gửi tới email của bạn: tên đăng nhập và mật khẩu ban đầu đều là mã sinh viên. Đổi mật khẩu ngay ở lần đăng nhập đầu."
                action={<Button type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>}
              />
            )}
            {app.status === 'rejected' && (
              <Alert
                type="error" showIcon title="Đơn bị từ chối"
                description={`Lý do: ${app.rejectionReason || '—'}`}
                action={<Button onClick={() => navigate('/apply')}>Nộp đơn mới</Button>}
              />
            )}
          </Card>
        )}
      </div>
    </PublicShell>
  );
}
