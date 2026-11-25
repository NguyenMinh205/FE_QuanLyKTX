import { useMemo, useState } from 'react';
import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Select, Space, App, Collapse,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined, UserOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { contractApi } from '../../contracts/api/contract.api';
import { roomApi } from '../../rooms/api/room.api';
import { applyApi } from '../../apply/api/apply.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { CONTRACT_TERM, GENDER, ROOM_TIER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import RejectApplicationModal from './RejectApplicationModal';
import { initialsOf, roomTextOf } from '../utils/applicationView';

const { Text } = Typography;

const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100 } } });
const EMPTY_ITEM = Promise.resolve({ data: { data: null } });
const ROOM_ERRORS = ['ROOM_FULL', 'ROOM_NOT_AVAILABLE', 'GENDER_MISMATCH', 'CAMPUS_MISMATCH'];

function Field({ label, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{label}</Text>
      <Text style={{ fontSize: 13 }}>{children || '—'}</Text>
    </div>
  );
}

function MoneyRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0' }}>
      <Text strong={strong} style={strong ? { fontSize: 15 } : { fontSize: 13 }}>{label}</Text>
      <Text strong style={strong ? { fontSize: 18, color: 'var(--brand)' } : { fontSize: 13 }}>{formatCurrency(value)}</Text>
    </div>
  );
}

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '10px 16px' };

/**
 * Chi tiết đơn đăng ký tinh gọn:
 * - Gộp Hồ sơ SV + Thông tin đơn vào 1 thẻ tóm tắt cốt lõi (các trường phụ nằm trong Collapse)
 * - Tự động đề xuất phòng trống TẦNG THẤP -> TẦNG CAO đúng giới tính & nguyện vọng (cán bộ vẫn đổi tay được nếu cần).
 */
export default function ApplicationDetail({ contractId, canReview, onProcessed }) {
  const { modal, notification, message } = App.useApp();
  const [reloadKey, setReloadKey] = useState(0);
  const [targetRoomId, setTargetRoomId] = useState(null);
  const [roomAlert, setRoomAlert] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: c, loading, error } = useApi(() => contractApi.getById(contractId), [contractId, reloadKey]);
  const isPending = c?.status === 'pending';

  // Danh sách phòng còn chỗ cùng cơ sở & giới tính (BE đã sắp chuẩn tầng thấp -> tầng cao)
  const { data: othersData, loading: othersLoading } = useApi(
    () => (isPending && c?.student?.gender
      ? applyApi.getAvailableRooms({ gender: c.student.gender, campus: c.campus || undefined, limit: 100 })
      : EMPTY_LIST),
    [isPending, c?.student?.gender, c?.campus, reloadKey],
  );

  const others = useMemo(() => (Array.isArray(othersData) ? othersData : []), [othersData]);

  const wishTier = c?.preferredRoomTier;
  const wishCap = c?.preferredCapacity;

  // Đề xuất phòng tầng thấp nhất khớp nguyện vọng loại phòng (hoặc phòng tầng thấp nhất bất kỳ đúng giới tính)
  const autoSuggestedRoom = useMemo(() => {
    if (!others.length) return null;
    if (wishTier || wishCap) {
      const exact = others.find(
        (r) => (!wishTier || r.roomTier === wishTier)
          && (!wishCap || r.capacity === wishCap),
      );
      if (exact) return exact;
    }
    return others[0];
  }, [others, wishTier, wishCap]);

  const requestedRoomId = c?.room?.id || null;
  const roomId = targetRoomId ?? requestedRoomId ?? autoSuggestedRoom?.id ?? null;

  const { data: room } = useApi(
    () => (isPending && roomId ? roomApi.getRoomById(roomId) : EMPTY_ITEM),
    [isPending, roomId, reloadKey],
  );

  const roomReady = !!room && room.id === roomId;
  const canLockSelectedRoom = roomReady && room.status === 'active' && (room.availableSlots ?? 0) > 0;
  const isManualOverride = !!targetRoomId && targetRoomId !== (requestedRoomId ?? autoSuggestedRoom?.id);
  const months = c ? (CONTRACT_TERM[c.term]?.months ?? 10) : 0;
  const price = roomReady ? room.pricePerMonth : (c?.pricePerMonth ?? 0);
  const deposit = roomReady ? room.depositAmount : (c?.depositAmount ?? 0);
  const roomFee = Math.round(price * months);

  const reload = () => setReloadKey((k) => k + 1);
  const chooseRoom = (id) => { setTargetRoomId(id); setRoomAlert(null); setActionError(null); };

  const doApprove = async () => {
    setApproving(true);
    setActionError(null);
    try {
      const res = await contractApi.approve(c.id, roomId ? { roomId } : {});
      const { contract, account, emailSent, invoices = [] } = res.data.data;
      notification.success({
        title: `Đã duyệt giữ chỗ — ${contract.contractCode}`,
        description: [
          `${c.student.fullName} vào ${roomTextOf(contract.room)} (Chờ đóng phí đến ${formatDate(contract.paymentDeadline)}).`,
          account?.isNew ? `Tài khoản ${account.studentCode}, MK ban đầu = MSSV.` : 'SV dùng lại tài khoản cũ.',
          emailSent ? `Đã gửi email tới ${account?.email}.` : '',
          `Hóa đơn đầu kỳ: ${invoices.map((i) => formatCurrency(i.amount)).join(' + ')}.`,
        ].filter(Boolean).join(' '),
        duration: 10,
      });
      if (account && !emailSent) {
        notification.warning({
          title: 'Chưa gửi được email cho sinh viên',
          description: `Báo trực tiếp: đăng nhập bằng MSSV ${account.studentCode}, mật khẩu ban đầu là MSSV.`,
          duration: 0,
        });
      }
      onProcessed();
    } catch (err) {
      const code = getErrorCode(err);
      if (ROOM_ERRORS.includes(code)) {
        setRoomAlert(getErrorMessage(err));
        setTargetRoomId(null);
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
    title: `Duyệt & xếp phòng cho đơn ${c.contractCode}?`,
    icon: <CheckCircleOutlined style={{ color: 'var(--brand)' }} />,
    content: (
      <div>
        Xếp 1 chỗ cho <b>{c.student.fullName}</b> vào <b>{roomTextOf(room)} ({room.buildingName}, Tầng {room.floor})</b>.
        <div style={{ marginTop: 6, color: 'var(--text-tertiary)' }}>
          Hợp đồng chuyển sang <b>Chờ đóng phí</b> (hạn 7 ngày), cấp tài khoản qua email và phát hành hóa đơn đầu kỳ. Khi SV đóng đủ tiền, hợp đồng tự kích hoạt và sinh mã QR Check-in.
        </div>
      </div>
    ),
    okText: 'Duyệt & Xếp phòng',
    cancelText: 'Hủy',
    onOk: doApprove,
  });

  if (error) return <Card><Alert type="error" showIcon title={error} /></Card>;
  if (loading && !c) return <Card><Skeleton active avatar paragraph={{ rows: 6 }} /></Card>;
  if (!c) return null;

  const { student } = c;
  const roomOptions = [
    ...(c.room && !others.some((r) => r.id === c.room.id) ? [{
      value: c.room.id,
      label: `${roomTextOf(c.room)} · ${c.room.buildingName} (Tầng ${c.room.floor}) — phòng gắn sẵn`,
    }] : []),
    ...others.map((r) => ({
      value: r.id,
      label: `${roomTextOf(r)} · Tầng ${r.floor} · ${r.gender ? GENDER[r.gender]?.label : 'Phòng trống'} · ${ROOM_TIER[r.roomTier]?.label || ''} ${r.capacity} chỗ · ${formatCurrency(r.pricePerMonth)} — còn ${r.availableSlots} chỗ${r.id === autoSuggestedRoom?.id ? ' ★ Đề xuất' : ''}`,
    })),
  ];
  const emergency = student.emergencyContact;
  const wishText = c.preferredRoomTier
    ? `${ROOM_TIER[c.preferredRoomTier]?.label || c.preferredRoomTier}${c.preferredCapacity ? ` · ${c.preferredCapacity} người` : ''}`
    : 'Chờ xếp tầng thấp → cao';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14, minWidth: 0 }}>
      {/* 1. THẺ TÓM TẮT ĐƠN & SINH VIÊN */}
      <Card styles={{ body: { padding: '16px 20px' } }} style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand)',
              display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 600, flexShrink: 0,
            }}>
              {initialsOf(student.fullName)}
            </div>
            <div>
              <Space size={8} wrap>
                <Text strong style={{ fontSize: 16 }}>{student.fullName}</Text>
                <Text strong style={{ color: 'var(--brand)' }}>{student.studentCode}</Text>
                <StatusTag type="contract" value={c.status} />
              </Space>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Mã đơn <b>{c.contractCode}</b> · Nộp lúc {formatDateTime(c.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={GRID}>
          <Field label="Giới tính">{GENDER[student.gender]?.label}</Field>
          <Field label="Khoa / Lớp">{student.faculty}{student.className ? ` · ${student.className}` : ''}</Field>
          <Field label="Cơ sở">{c.campusName || c.campus?.toUpperCase()}</Field>
          <Field label={c.room ? 'Phòng' : 'Loại phòng đăng ký'}>
            {c.room ? <><Text strong>{roomTextOf(c.room)}</Text> · Tầng {c.room.floor}</> : wishText}
          </Field>
          <Field label="Gói thuê">{CONTRACT_TERM[c.term]?.label} ({CONTRACT_TERM[c.term]?.hint})</Field>
          <Field label="Liên hệ nhanh">{formatPhone(student.phone)}</Field>
        </div>

        {c.status === 'rejected' && (
          <Alert
            style={{ marginTop: 12 }} type="error" showIcon title="Lý do từ chối"
            description={`${c.rejectionReason || '—'} · ${formatDateTime(c.reviewedAt)}${c.approvedByName ? ` · ${c.approvedByName}` : ''}`}
          />
        )}
        {c.status === 'cancelled' && (
          <Alert style={{ marginTop: 12 }} type="warning" showIcon title="Đơn đã hủy" description={c.cancelReason || 'Sinh viên tự hủy hoặc quá hạn đóng phí'} />
        )}

        <Collapse
          ghost
          size="small"
          style={{ marginTop: 8 }}
          items={[{
            key: 'full-profile',
            label: <Text type="secondary" style={{ fontSize: 13 }}><UserOutlined style={{ marginRight: 6 }} />Xem đầy đủ hồ sơ cá nhân (CCCD, ngày sinh, email, địa chỉ, người thân)</Text>,
            children: (
              <div style={{ ...GRID, paddingTop: 4 }}>
                <Field label="Ngày sinh">{student.dob ? formatDate(student.dob) : null}</Field>
                <Field label="Số CCCD">{student.citizenId}</Field>
                <Field label="Email">{student.email}</Field>
                <Field label="Địa chỉ thường trú">{student.address}</Field>
                <Field label="Liên hệ khẩn cấp">
                  {emergency?.name ? `${emergency.name}${emergency.relationship ? ` (${emergency.relationship})` : ''} · ${formatPhone(emergency.phone)}` : null}
                </Field>
              </div>
            ),
          }]}
        />
      </Card>

      {/* 2. XẾP PHÒNG TỰ ĐỘNG (TẦNG THẤP -> CAO) & HÓA ĐƠN ĐẦU KỲ */}
      {isPending && (
        <Card
          title="Xếp phòng & Hóa đơn đầu kỳ"
          extra={!isManualOverride && autoSuggestedRoom && <span className="haui-chip haui-chip-navy">Đề xuất: tầng thấp → cao</span>}
          styles={{ body: { padding: '16px 20px' } }}
        >
          {roomAlert && (
            <Alert style={{ marginBottom: 12 }} type="error" showIcon closable title={roomAlert} onClose={() => setRoomAlert(null)} />
          )}
          {!roomAlert && !othersLoading && !roomId && (
            <Alert
              style={{ marginBottom: 12 }} type="warning" showIcon
              title="Hiện không còn phòng trống phù hợp cùng cơ sở và giới tính"
              description="Vui lòng kiểm tra lại quỹ phòng hoặc từ chối đơn nếu đã hết chỗ."
            />
          )}
          {!roomAlert && roomReady && !canLockSelectedRoom && (
            <Alert
              style={{ marginBottom: 12 }} type="warning" showIcon
              title={`Phòng ${roomTextOf(room)} hiện đã hết chỗ hoặc đang bảo trì`}
              description="Chọn phòng khác còn chỗ trống cùng cơ sở và giới tính ở danh sách dưới."
            />
          )}

          <Select
            aria-label="Phòng xếp cho sinh viên"
            style={{ width: '100%' }}
            placeholder="Đang tìm phòng tầng thấp nhất còn chỗ..."
            value={roomId}
            loading={othersLoading}
            disabled={!canReview}
            options={roomOptions}
            onChange={chooseRoom}
          />

          {roomReady && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--surface-subtle)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Space size={6} wrap>
                {room.gender ? (
                  <Tag color={room.gender === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>Phòng {GENDER[room.gender]?.label}</Tag>
                ) : (
                  <Tag style={{ margin: 0 }}>Phòng trống (sẽ gán {GENDER[student.gender]?.label})</Tag>
                )}
                <StatusTag type="roomTier" value={room.roomTier} />
                <Tag style={{ margin: 0 }}>Tầng {room.floor}</Tag>
                <Tag style={{ margin: 0 }}>{room.occupied ?? 0}/{room.capacity} đang giữ chỗ</Tag>
              </Space>
              <Text strong style={{ color: room.availableSlots > 0 ? 'var(--success-text)' : '#CF1322', fontSize: 13 }}>
                {room.status === 'maintenance' ? 'Đang bảo trì' : `Còn ${room.availableSlots} chỗ trống`}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '12px 0 8px' }} />
          <MoneyRow label="Tiền cọc tài sản (hoàn khi thanh lý)" value={deposit} />
          <MoneyRow label={`Tiền phòng (${months} tháng × ${formatCurrency(price)})`} value={roomFee} />
          <MoneyRow label="Tổng đầu kỳ (hạn đóng phí 7 ngày)" value={deposit + roomFee} strong />
        </Card>
      )}

      {/* 3. THANH HÀNH ĐỘNG STICKY */}
      {isPending && canReview && (
        <Card
          style={{ position: 'sticky', bottom: 0, zIndex: 2, boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
          styles={{ body: { padding: '12px 16px' } }}
        >
          {actionError && <Alert type="error" showIcon title={actionError} closable onClose={() => setActionError(null)} style={{ marginBottom: 10 }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {canLockSelectedRoom ? (
              <Text style={{ flex: '1 1 180px', minWidth: 0, fontSize: 13 }}>
                <InfoCircleOutlined style={{ color: 'var(--brand)' }} /> Xếp vào <b>{roomTextOf(room)}</b> (Tầng {room.floor})
                {isManualOverride && <Tag color="orange" style={{ marginLeft: 8 }}>Đổi tay</Tag>}
              </Text>
            ) : (
              <Text type="danger" style={{ flex: '1 1 180px', minWidth: 0, fontSize: 13 }}>
                <WarningOutlined /> Chưa có phòng trống phù hợp để duyệt.
              </Text>
            )}
            <Space wrap>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setRejectOpen(true)} disabled={approving}>Từ chối</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={confirmApprove} loading={approving} disabled={!canLockSelectedRoom}>
                Duyệt &amp; Xếp phòng
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
