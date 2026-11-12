import { useState } from 'react';
import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Select, Space, App,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { contractApi } from '../../contracts/api/contract.api';
import { roomApi } from '../../rooms/api/room.api';
import { applyApi } from '../../apply/api/apply.api';
import BedPicker from '../../apply/components/BedPicker';
import { bedStateOf } from '../../apply/utils/bedState';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { CONTRACT_TERM, GENDER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import RejectApplicationModal from './RejectApplicationModal';
import { initialsOf, pad2, roomTextOf } from '../utils/applicationView';

const { Text } = Typography;

const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100 } } });
const EMPTY_ITEM = Promise.resolve({ data: { data: null } });
/** Lỗi về giường — hiện ngay trên thẻ chọn giường, không dùng toast tự tắt (UC-02 nhánh 4a) */
const BED_ERRORS = ['BED_ALREADY_OCCUPIED', 'BED_ALREADY_REQUESTED', 'GENDER_MISMATCH'];

function SectionTitle({ icon, children, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Text strong style={{ fontSize: 16 }}>{icon} {children}</Text>
      {extra}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{label}</Text>
      <Text style={{ fontSize: 14 }}>{children || '—'}</Text>
    </div>
  );
}

function MoneyRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <Text strong={strong} style={strong ? { fontSize: 16 } : undefined}>{label}</Text>
      <Text strong style={strong ? { fontSize: 20, color: 'var(--brand)' } : undefined}>{formatCurrency(value)}</Text>
    </div>
  );
}

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px 16px' };

/**
 * Khung chi tiết đơn bên phải SCR-31 (FR-32, FR-33).
 * Cha truyền `key={contractId}` để lựa chọn giường và cảnh báo tự xóa khi đổi đơn.
 */
export default function ApplicationDetail({ contractId, canReview, onProcessed }) {
  const { modal, notification, message } = App.useApp();
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null); // { roomId, bedNumber } cán bộ chọn lại · null = theo đơn
  const [bedAlert, setBedAlert] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: c, loading, error } = useApi(() => contractApi.getById(contractId), [contractId, reloadKey]);
  const isPending = c?.status === 'pending';
  const requestedRoomId = c?.room?.id;
  const roomId = target?.roomId ?? requestedRoomId;

  // Giường của phòng đang xét lấy ở GET /rooms/:id (có cờ đơn khác đang giữ); phòng thay thế lấy ở danh sách phòng trống
  const { data: room } = useApi(
    () => (isPending && roomId ? roomApi.getRoomById(roomId) : EMPTY_ITEM),
    [isPending, roomId, reloadKey],
  );
  const { data: others, loading: othersLoading } = useApi(
    () => (isPending ? applyApi.getAvailableRooms({ gender: c.student.gender, limit: 100 }) : EMPTY_LIST),
    [isPending, c?.student?.gender, reloadKey],
  );

  const roomReady = !!room && room.id === roomId;
  const ownBed = roomId === requestedRoomId ? c?.bedNumber : null;
  const requestedBed = roomReady && roomId === requestedRoomId ? room.beds.find((b) => b.bedNumber === c.bedNumber) : null;
  const requestedFree = !!requestedBed && bedStateOf(requestedBed, c.bedNumber) === 'selectable';
  // Giường sẽ khóa khi duyệt: cán bộ đã chọn, không thì giường sinh viên chọn nếu còn trống
  const bedNumber = target?.bedNumber ?? (roomId === requestedRoomId && requestedFree ? c.bedNumber : null);
  const changed = !!c && (roomId !== requestedRoomId || bedNumber !== c.bedNumber);
  const months = c ? CONTRACT_TERM[c.term]?.months : 0;
  const price = roomReady ? room.pricePerMonth : c?.pricePerMonth;
  const deposit = roomReady ? room.depositAmount : c?.depositAmount;

  const reload = () => setReloadKey((k) => k + 1);
  const clearMessages = () => { setBedAlert(null); setActionError(null); };
  const chooseRoom = (id) => { setTarget({ roomId: id, bedNumber: null }); clearMessages(); };
  const chooseBed = (n) => { setTarget({ roomId, bedNumber: n }); clearMessages(); };

  const doApprove = async () => {
    setApproving(true);
    setActionError(null);
    try {
      // Giữ nguyên lựa chọn của sinh viên thì gửi body rỗng (API.md §6)
      const res = await contractApi.approve(c.id, changed ? { roomId, bedNumber } : {});
      const { contract, account, emailSent, invoices = [] } = res.data.data;
      notification.success({
        title: `Đã duyệt đơn ${contract.contractCode}`,
        description: [
          `${c.student.fullName} vào ${roomTextOf(contract.room)} · Giường ${pad2(contract.bedNumber)}.`,
          account.isNew ? `Tài khoản ${account.studentCode}, mật khẩu ban đầu là mã sinh viên.` : 'Sinh viên dùng lại tài khoản cũ.',
          emailSent ? `Đã gửi email tới ${account.email}.` : '',
          `Hóa đơn: ${invoices.map((i) => formatCurrency(i.amount)).join(' + ')}.`,
        ].filter(Boolean).join(' '),
        duration: 10,
      });
      if (!emailSent) {
        notification.warning({
          title: 'Chưa gửi được email cho sinh viên',
          description: `Báo trực tiếp: đăng nhập bằng mã ${account.studentCode}, mật khẩu ban đầu là mã sinh viên.`,
          duration: 0,
        });
      }
      onProcessed();
    } catch (err) {
      const code = getErrorCode(err);
      if (BED_ERRORS.includes(code)) {
        setBedAlert(getErrorMessage(err));
        setTarget((t) => (t ? { roomId: t.roomId, bedNumber: null } : null));
        reload();
      } else if (code === 'CONTRACT_NOT_PENDING') {
        message.warning(getErrorMessage(err));
        onProcessed();
      } else {
        setActionError(getErrorMessage(err));
      }
    } finally {
      setApproving(false);
    }
  };

  const confirmApprove = () => modal.confirm({
    title: `Duyệt đơn ${c.contractCode}?`,
    icon: <CheckCircleOutlined style={{ color: 'var(--brand)' }} />,
    content: (
      <div>
        Xếp <b>{c.student.fullName}</b> vào <b>{roomTextOf(room)} · Giường {pad2(bedNumber)}</b>.
        <div style={{ marginTop: 6, color: 'var(--text-tertiary)' }}>
          Hệ thống khóa giường, cấp tài khoản gửi qua email và tạo 2 hóa đơn: tiền cọc và tiền phòng {months} tháng.
        </div>
      </div>
    ),
    okText: 'Duyệt đơn',
    cancelText: 'Hủy',
    onOk: doApprove,
  });

  if (error) return <Card><Alert type="error" showIcon title={error} /></Card>;
  if (loading && !c) return <Card><Skeleton active avatar paragraph={{ rows: 8 }} /></Card>;
  if (!c) return null;

  const { student } = c;
  const roomOptions = [
    { value: c.room.id, label: `${roomTextOf(c.room)} · ${c.room.buildingName} — sinh viên chọn` },
    ...(others || []).filter((r) => r.id !== c.room.id).map((r) => ({
      value: r.id,
      label: `${roomTextOf(r)} · tầng ${r.floor} · ${r.capacity} chỗ · ${formatCurrency(r.pricePerMonth)} — còn ${r.availableSlots} giường`,
    })),
  ];
  const emergency = student.emergencyContact;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* ---------- Sinh viên ---------- */}
      <Card>
        <SectionTitle icon={<IdcardOutlined style={{ color: 'var(--brand)' }} />} extra={<StatusTag type="contract" value={c.status} />}>
          Thông tin sinh viên
        </SectionTitle>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, background: 'var(--brand-soft)', color: 'var(--brand)',
            display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0,
          }}>
            {initialsOf(student.fullName)}
          </div>
          <div style={{ flex: 1, minWidth: 240, ...GRID }}>
            <Field label="Họ và tên"><Text strong>{student.fullName}</Text></Field>
            <Field label="Mã sinh viên"><Text strong style={{ color: 'var(--brand)' }}>{student.studentCode}</Text></Field>
            <Field label="Giới tính">{GENDER[student.gender]?.label}</Field>
            <Field label="Ngày sinh">{student.dob ? formatDate(student.dob) : null}</Field>
            <Field label="Số CCCD">{student.citizenId}</Field>
            <Field label="Địa chỉ thường trú">{student.address}</Field>
            <Field label="Khoa / Viện">{student.faculty}</Field>
            <Field label="Lớp">{student.className}</Field>
            <Field label="Số điện thoại">{formatPhone(student.phone)}</Field>
            <Field label="Email">{student.email}</Field>
            <Field label="Liên hệ khẩn cấp">
              {emergency?.name ? `${emergency.name}${emergency.relationship ? ` (${emergency.relationship})` : ''} · ${formatPhone(emergency.phone)}` : null}
            </Field>
          </div>
        </div>
      </Card>

      {/* ---------- Đơn ---------- */}
      <Card>
        <SectionTitle icon={<FileTextOutlined style={{ color: 'var(--brand)' }} />}>Đơn đăng ký</SectionTitle>
        <div style={{ ...GRID, marginTop: 16 }}>
          <Field label="Mã đơn">{c.contractCode}</Field>
          <Field label="Nộp lúc">{formatDateTime(c.createdAt)}</Field>
          <Field label="Gói thuê">{CONTRACT_TERM[c.term]?.label} ({CONTRACT_TERM[c.term]?.hint})</Field>
          <Field label="Sinh viên chọn">{roomTextOf(c.room)} · Giường {pad2(c.bedNumber)}</Field>
        </div>
        {c.status === 'rejected' && (
          <Alert
            style={{ marginTop: 16 }} type="error" showIcon title="Lý do từ chối"
            description={`${c.rejectionReason || '—'} · ${formatDateTime(c.reviewedAt)}${c.approvedByName ? ` · ${c.approvedByName}` : ''}`}
          />
        )}
      </Card>

      {/* ---------- Xếp giường ---------- */}
      {isPending && (
        <Card>
          <SectionTitle icon={<HomeOutlined style={{ color: 'var(--brand)' }} />}>Giường sẽ khóa khi duyệt</SectionTitle>

          {bedAlert && (
            <Alert
              style={{ marginTop: 16 }} type="error" showIcon closable title={bedAlert}
              description="Sơ đồ giường đã được tải lại. Chọn giường khác rồi bấm duyệt lại."
              onClose={() => setBedAlert(null)}
            />
          )}
          {!bedAlert && roomReady && roomId === requestedRoomId && !requestedFree && !target?.bedNumber && (
            <Alert
              style={{ marginTop: 16 }} type="warning" showIcon
              title={`Giường ${pad2(c.bedNumber)} sinh viên chọn đã có người nhận`}
              description="Chọn giường khác trong phòng này hoặc đổi sang phòng khác cùng giới tính."
            />
          )}

          <div style={{ marginTop: 16 }}>
            <Text style={{ display: 'block', marginBottom: 6 }}>Phòng</Text>
            <Select
              aria-label="Phòng xếp cho sinh viên"
              style={{ width: '100%' }}
              value={roomId}
              loading={othersLoading}
              disabled={!canReview}
              options={roomOptions}
              onChange={chooseRoom}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>Giường</Text>
            {roomReady && !room.beds.some((b) => bedStateOf(b, ownBed) === 'selectable') && (
              <Alert style={{ marginBottom: 8 }} type="info" showIcon title="Phòng này không còn giường nhận đơn — chọn phòng khác ở ô Phòng" />
            )}
            {!roomReady ? <Skeleton active paragraph={{ rows: 2 }} /> : (
              <BedPicker
                beds={room.beds}
                label="Giường xếp cho sinh viên"
                selected={bedNumber}
                onSelect={chooseBed}
                ownBed={ownBed}
                markedBed={roomId === requestedRoomId ? c.bedNumber : null}
              />
            )}
          </div>

          {roomReady && price !== c.pricePerMonth && (
            <Alert
              style={{ marginTop: 16 }} type="info" showIcon
              title={`Đơn giá phòng này ${formatCurrency(price)}/tháng, khác ${formatCurrency(c.pricePerMonth)} sinh viên đã thấy khi nộp`}
              description="Hợp đồng chốt theo giá của phòng được xếp. Nên báo cho sinh viên trước khi duyệt."
            />
          )}

          <Divider style={{ margin: '16px 0 8px' }} />
          <Text strong>Hóa đơn tạo khi duyệt</Text>
          <MoneyRow label="Tiền cọc (hoàn khi trả phòng)" value={deposit} />
          <MoneyRow label={`Tiền phòng ${months} tháng (${formatCurrency(price)} × ${months})`} value={price * months} />
          <MoneyRow label="Tổng cộng" value={deposit + price * months} strong />
        </Card>
      )}

      {/* ---------- Thanh hành động ---------- */}
      {isPending && canReview && (
        <Card
          style={{ position: 'sticky', bottom: 0, zIndex: 2, boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '12px 16px' } }}
        >
          {actionError && <Alert type="error" showIcon title={actionError} closable onClose={() => setActionError(null)} style={{ marginBottom: 12 }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {bedNumber ? (
              <Text style={{ flex: 1, minWidth: 220 }}>
                <InfoCircleOutlined style={{ color: 'var(--brand)' }} /> Sẽ khóa <b>{roomTextOf(room)} · Giường {pad2(bedNumber)}</b>
                {changed && <Tag color="orange" style={{ marginLeft: 8 }}>Khác lựa chọn của sinh viên</Tag>}
              </Text>
            ) : (
              <Text type="danger" style={{ flex: 1, minWidth: 220 }}>
                <WarningOutlined /> Chưa có giường. Chọn giường để bật nút duyệt.
              </Text>
            )}
            <Space wrap>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setRejectOpen(true)} disabled={approving}>Từ chối</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={confirmApprove} loading={approving} disabled={!bedNumber || !roomReady}>
                Duyệt đơn
              </Button>
            </Space>
          </div>
        </Card>
      )}

      <RejectApplicationModal
        app={c}
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onRejected={() => { setRejectOpen(false); onProcessed(); }}
      />
    </div>
  );
}
