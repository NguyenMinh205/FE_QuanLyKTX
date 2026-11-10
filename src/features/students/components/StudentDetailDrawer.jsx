import { Link } from 'react-router-dom';
import {
  Drawer, Typography, Tag, Space, Button, Skeleton, Alert, Empty, Tooltip,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, HistoryOutlined, FileTextOutlined, EditOutlined, KeyOutlined, StopOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { studentApi } from '../api/student.api';
import { CONTRACT_TERM, GENDER, INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatPhone } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import { placeTextOf } from '../../contracts/utils/contractView';
import { residenceTextOf } from '../utils/studentView';

const { Text } = Typography;

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
        <Text strong style={{ fontSize: 15 }}>{icon} {title}</Text>
      </div>
      {children}
    </div>
  );
}

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0' }}>
    <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
    <div style={{ textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children ?? <Text type="secondary">—</Text>}</div>
  </div>
);

/**
 * FR-11 Chi tiết sinh viên: hồ sơ, chỗ ở hiện tại, lịch sử hợp đồng, hóa đơn chưa trả.
 * `version` đổi khi trang cha vừa sửa / đặt lại mật khẩu để tải lại.
 */
export default function StudentDetailDrawer({
  studentId, version, onClose, canEdit, canReset, canDeactivate, onEdit, onReset, onDeactivate,
}) {
  const { data: s, error } = useApi(
    () => (studentId ? studentApi.getById(studentId) : Promise.resolve({ data: { data: null } })),
    [studentId, version],
  );
  const ready = s && s.id === studentId;
  const c = ready ? s.currentContract : null;
  // FR-14: khóa sẵn nút thay vì để bấm rồi mới báo lỗi — backend vẫn kiểm lại
  const deactivateBlock = !ready ? null
    : c ? 'Sinh viên còn hợp đồng ở ký túc xá — thanh lý trước'
      : s.contracts.some((x) => x.status === 'pending') ? 'Sinh viên còn đơn đăng ký chờ duyệt'
        : s.totalDebt > 0 ? 'Sinh viên còn hóa đơn chưa trả' : null;

  return (
    <Drawer
      open={!!studentId}
      onClose={onClose}
      size={560}
      destroyOnHidden
      title={ready ? (
        <Space size={8} wrap>
          <span>{s.fullName}</span>
          {s.status === 'inactive' && <Tag style={{ margin: 0 }}>Đã vô hiệu hóa</Tag>}
          <Tag color={s.hasAccount ? 'success' : 'default'} style={{ margin: 0 }}>{s.hasAccount ? 'Có tài khoản' : 'Chưa có tài khoản'}</Tag>
        </Space>
      ) : 'Chi tiết sinh viên'}
      footer={ready && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Space wrap>
            {canEdit && s.status === 'active' && <Button icon={<EditOutlined />} onClick={() => onEdit(s)}>Sửa</Button>}
            {canReset && s.hasAccount && <Button icon={<KeyOutlined />} onClick={() => onReset(s)}>Đặt lại mật khẩu</Button>}
            {canDeactivate && s.status === 'active' && (
              <Tooltip title={deactivateBlock}>
                <Button danger icon={<StopOutlined />} disabled={!!deactivateBlock} onClick={() => onDeactivate(s)}>Vô hiệu hóa</Button>
              </Tooltip>
            )}
          </Space>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && !ready && <Skeleton active paragraph={{ rows: 10 }} />}
      {!error && ready && (
        <>
          <Section icon={<IdcardOutlined style={{ color: 'var(--brand)' }} />} title="Hồ sơ">
            <Row label="Mã sinh viên"><Text strong>{s.studentCode}</Text></Row>
            <Row label="Giới tính">{GENDER[s.gender]?.label}</Row>
            <Row label="Ngày sinh">{s.dob ? formatDate(s.dob) : null}</Row>
            <Row label="Số điện thoại">{s.phone ? formatPhone(s.phone) : null}</Row>
            <Row label="Email">{s.email || null}</Row>
            <Row label="Lớp · Khoa">{[s.className, s.faculty].filter(Boolean).join(' · ') || null}</Row>
            <Row label="Liên hệ khẩn cấp">
              {s.emergencyContact?.name
                ? <>{s.emergencyContact.name} ({s.emergencyContact.relationship}) · {formatPhone(s.emergencyContact.phone)}</>
                : null}
            </Row>
          </Section>

          <Section icon={<HomeOutlined style={{ color: 'var(--brand)' }} />} title="Chỗ ở hiện tại">
            {c ? (
              <>
                <Row label="Chỗ ở"><Text strong>{c.room?.buildingName} · {residenceTextOf(s.residence) ?? placeTextOf(c)}</Text></Row>
                <Row label="Hợp đồng">
                  <Link to={`/admin/contracts?search=${encodeURIComponent(c.contractCode)}`}>{c.contractCode}</Link> <StatusTag type="contract" value={c.status} />
                </Row>
                <Row label="Gói thuê · thời hạn">{CONTRACT_TERM[c.term]?.label} · {formatDate(c.startDate)} → {formatDate(c.endDate)}</Row>
              </>
            ) : <Text type="secondary">Không ở ký túc xá</Text>}
          </Section>

          <Section icon={<FileTextOutlined style={{ color: 'var(--brand)' }} />} title={`Hóa đơn chưa trả · ${formatCurrency(s.totalDebt)}`}>
            {s.unpaidInvoices.length === 0 ? <Text type="secondary">Không còn hóa đơn cá nhân nào chưa trả</Text> : s.unpaidInvoices.map((i) => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ minWidth: 0 }}>
                  <Link to={`/admin/invoices/${i.id}`}>{i.invoiceCode}</Link>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[i.type]?.label} · hạn {formatDate(i.dueDate)}</Text></div>
                </div>
                <Text strong style={{ color: '#CF1322', whiteSpace: 'nowrap' }}>{formatCurrency(i.amount)}</Text>
              </div>
            ))}
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 6 }}>Hóa đơn điện nước thuộc cả phòng, xem ở màn Hóa đơn.</Text>
          </Section>

          <Section icon={<HistoryOutlined style={{ color: 'var(--brand)' }} />} title={`Lịch sử đơn và hợp đồng (${s.contracts.length})`}>
            {s.contracts.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa nộp đơn lần nào" /> : s.contracts.map((x) => (
              <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ minWidth: 0 }}>
                  <Text strong>{x.contractCode}</Text> <Text type="secondary">· {placeTextOf(x)}</Text>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>{x.startDate ? `${formatDate(x.startDate)} → ${formatDate(x.endDate)}` : `Nộp ${formatDate(x.createdAt)}`}</Text></div>
                </div>
                <StatusTag type="contract" value={x.status} />
              </div>
            ))}
          </Section>
        </>
      )}
    </Drawer>
  );
}
