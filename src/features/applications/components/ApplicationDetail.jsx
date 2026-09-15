import { useState } from 'react';
import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Select, Space, App,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { applicationApi } from '../api/application.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { GENDER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import BedPreview from './BedPreview';
import RejectApplicationModal from './RejectApplicationModal';
import { initialsOf, roomTextOf, bedNumberOfCode } from '../utils/applicationView';

const { Text } = Typography;

const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100 } } });
const EMPTY_ITEM = Promise.resolve({ data: { data: null } });
/** Lỗi liên quan tới phòng — hiện ngay trên thẻ phòng, không dùng toast tự tắt (docs/08 mục 6.4) */
const ROOM_ERRORS = ['ROOM_FULL', 'ROOM_TYPE_MISMATCH', 'GENDER_MISMATCH'];

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
      <Text style={{ fontSize: 14 }}>{children}</Text>
    </div>
  );
}

function MoneyRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <Text strong={strong} style={strong ? { fontSize: 16 } : undefined}>{label}</Text>
      <Text strong style={strong ? { fontSize: 20, color: '#1677FF' } : undefined}>{formatCurrency(value)}</Text>
    </div>
  );
}

/**
 * Khung chi tiết đơn bên phải SCR-31.
 * Cha truyền `key={applicationId}` để mọi lựa chọn phòng / cảnh báo tự xóa khi đổi đơn.
 */
export default function ApplicationDetail({ applicationId, canReview, onProcessed, onListStale }) {
  const { modal, notification, message } = App.useApp();
  const [reloadKey, setReloadKey] = useState(0);
  const [chosenRoomId, setChosenRoomId] = useState(null);
  const [roomAlert, setRoomAlert] = useState(null);   // { title, description }
  const [actionError, setActionError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: app, loading, error } = useApi(() => applicationApi.getById(applicationId), [applicationId, reloadKey]);
  const isPending = app?.status === 'pending';

  // Phòng thay thế: cùng loại, cùng giới tính, còn chỗ (BR-35)
  const { data: availableRooms, loading: roomsLoading } = useApi(
    () => (isPending
      ? roomApi.getAvailableRooms({ roomTypeId: app.roomType.id, gender: app.student.gender, limit: 100 })
      : EMPTY_LIST),
    [isPending, app?.roomType?.id, app?.student?.gender, reloadKey],
  );
  const candidates = (availableRooms || []).filter((r) => r.gender === app?.student?.gender && r.roomTypeId === app?.roomType?.id);

  const requested = app?.requestedRoom;
  const requestedHasSlot = requested?.availableSlots > 0;
  const chosenStillValid = chosenRoomId && (roomsLoading || candidates.some((r) => r.id === chosenRoomId));
  const targetRoomId = chosenStillValid ? chosenRoomId : (requestedHasSlot ? requested.id : null);
  const targetRoom = candidates.find((r) => r.id === targetRoomId) || (targetRoomId === requested?.id ? requested : null);

  const { data: roomDetail, loading: bedsLoading } = useApi(
    () => (isPending && targetRoomId ? roomApi.getRoomById(targetRoomId) : EMPTY_ITEM),
    [isPending, targetRoomId, reloadKey],
  );
  const nextBed = roomDetail?.beds?.find((b) => b.status === 'available');

  const reload = () => setReloadKey((k) => k + 1);

  const chooseRoom = (roomId) => {
    setChosenRoomId(roomId);
    setRoomAlert(null);
    setActionError(null);
  };

  const doApprove = async () => {
    setApproving(true);
    setActionError(null);
    try {
      // Bỏ roomId khi giữ nguyên phòng sinh viên chọn (API.md mục 5.1)
      const body = targetRoomId !== requested.id ? { roomId: targetRoomId } : {};
      const res = await applicationApi.approve(app.id, body);
      const { assigned, contract, invoices = [] } = res.data.data;
      notification.success({
        title: `Đã xếp ${app.student.fullName} vào ${roomTextOf(assigned).replace('Phòng ', '')} · Giường ${bedNumberOfCode(assigned.bedCode)}`,
        description: `Hợp đồng ${contract.contractCode} · ${invoices.length} hóa đơn: ${invoices.map((i) => formatCurrency(i.totalAmount)).join(' + ')}`,
        duration: 8,
      });
      onProcessed();
    } catch (err) {
      const code = getErrorCode(err);
      if (ROOM_ERRORS.includes(code)) {
        setRoomAlert({
          title: getErrorMessage(err),
          description: code === 'ROOM_FULL'
            ? 'Danh sách phòng đã được tải lại. Chọn một phòng khác cùng loại rồi bấm duyệt lại.'
            : 'Chọn lại phòng cùng loại, cùng giới tính với sinh viên.',
        });
        setChosenRoomId(null);
        reload();
        onListStale(); // đơn khác có thể vừa được duyệt
      } else if (code === 'APPLICATION_NOT_PENDING') {
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
    title: `Duyệt đơn ${app.applicationCode}?`,
    icon: <CheckCircleOutlined style={{ color: '#1677FF' }} />,
    content: (
      <div>
        Xếp <b>{app.student.fullName}</b> vào <b>{roomTextOf(targetRoom)}</b>.
        <div style={{ marginTop: 6, color: '#8C8C8C' }}>
          Hệ thống tự gán giường trống số nhỏ nhất, tạo hợp đồng và 2 hóa đơn (tiền cọc + tiền phòng tháng đầu).
        </div>
      </div>
    ),
    okText: 'Duyệt và xếp phòng',
    cancelText: 'Hủy',
    onOk: doApprove,
  });

  if (error) return <Card><Alert type="error" showIcon title={error} /></Card>;
  if (loading && !app) return <Card><Skeleton active avatar paragraph={{ rows: 8 }} /></Card>;
  if (!app) return null;

  const { student } = app;
  const roomOptions = candidates.map((r) => ({
    value: r.id,
    label: `${roomTextOf(r)} — ${r.buildingName}, tầng ${r.floor} — còn ${r.availableSlots} chỗ${r.id === requested.id ? ' · nguyện vọng' : ''}`,
  }));
  if (!requestedHasSlot) {
    roomOptions.unshift({ value: requested.id, label: `${roomTextOf(requested)} — đã đầy · nguyện vọng`, disabled: true });
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* ---------- Sinh viên ---------- */}
      <Card>
        <SectionTitle
          icon={<IdcardOutlined style={{ color: '#1677FF' }} />}
          extra={student.totalDebt > 0
            ? <Tag color="warning" style={{ margin: 0 }}>Còn nợ {formatCurrency(student.totalDebt)}</Tag>
            : <Tag color="success" style={{ margin: 0 }}><CheckCircleOutlined /> Không có công nợ</Tag>}
        >
          Thông tin sinh viên
        </SectionTitle>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, background: '#E6F4FF', color: '#1677FF',
            display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0,
          }}>
            {initialsOf(student.fullName)}
          </div>
          <div style={{ flex: 1, minWidth: 240, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px 16px' }}>
            <Field label="Họ và tên"><Text strong>{student.fullName}</Text></Field>
            <Field label="Mã số sinh viên"><Text strong style={{ color: '#1677FF' }}>{student.studentCode}</Text></Field>
            <Field label="Giới tính">{GENDER[student.gender]?.label}</Field>
            <Field label="Lớp">{student.className || '—'}</Field>
            <Field label="Số điện thoại">{formatPhone(student.phone)}</Field>
            <Field label="Mã đơn">{app.applicationCode}</Field>
            <Field label="Ngày nộp">{formatDateTime(app.createdAt)}</Field>
            <Field label="Thời gian ở">{formatDate(app.startDate)} → {formatDate(app.endDate)}</Field>
          </div>
        </div>
        {app.note && (
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#FAFAFA', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú của sinh viên</Text>
            <div>{app.note}</div>
          </div>
        )}
      </Card>

      {/* ---------- Đơn đã xử lý: chỉ xem kết quả ---------- */}
      {!isPending && (
        <Card>
          <SectionTitle icon={<FileTextOutlined style={{ color: '#1677FF' }} />} extra={<StatusTag type="application" value={app.status} />}>
            Kết quả xử lý
          </SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 16px', marginTop: 16 }}>
            <Field label="Loại phòng đăng ký">{app.roomType.name}</Field>
            <Field label="Phòng nguyện vọng">{roomTextOf(requested)} · {requested.buildingName}</Field>
            {app.status === 'approved' && (
              <>
                <Field label="Phòng được xếp"><Text strong style={{ color: '#389E0D' }}>{roomTextOf(app.assigned)}</Text></Field>
                <Field label="Giường">{app.assigned?.bedCode ? `Giường ${bedNumberOfCode(app.assigned.bedCode)}` : '—'}</Field>
                <Field label="Hợp đồng">{app.contractCode || '—'}</Field>
              </>
            )}
            <Field label="Thời điểm xử lý">{formatDateTime(app.reviewedAt)}</Field>
          </div>
          {app.status === 'rejected' && (
            <Alert style={{ marginTop: 16 }} type="error" showIcon title="Lý do từ chối" description={app.reviewNote || '—'} />
          )}
          {app.status === 'cancelled' && (
            <Alert style={{ marginTop: 16 }} type="info" showIcon title="Sinh viên đã tự hủy đơn" />
          )}
        </Card>
      )}

      {/* ---------- Đơn chờ duyệt: chọn phòng ---------- */}
      {isPending && (
        <Card>
          <SectionTitle icon={<HomeOutlined style={{ color: '#1677FF' }} />}>Phòng xếp cho sinh viên</SectionTitle>

          {roomAlert && (
            <Alert
              style={{ marginTop: 16 }} type="error" showIcon closable
              title={roomAlert.title} description={roomAlert.description}
              onClose={() => setRoomAlert(null)}
            />
          )}
          {!roomAlert && !requestedHasSlot && (
            <Alert
              style={{ marginTop: 16 }} type="warning" showIcon
              title={`${roomTextOf(requested)} sinh viên chọn đã hết chỗ`}
              description={candidates.length > 0
                ? `Còn ${candidates.length} phòng cùng loại, cùng giới tính có chỗ trống — chọn một phòng bên dưới.`
                : 'Không còn phòng nào cùng loại có chỗ trống. Có thể từ chối đơn và đề nghị sinh viên chọn loại phòng khác.'}
            />
          )}

          <div style={{
            marginTop: 16, padding: '12px 14px', background: '#FAFAFA', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <Text strong>Loại phòng đăng ký: {app.roomType.name}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>Nguyện vọng: {roomTextOf(requested)} · {requested.buildingName}{requested.floor ? `, tầng ${requested.floor}` : ''}</Text></div>
            </div>
            <Text strong style={{ color: '#1677FF', fontSize: 16 }}>{formatCurrency(app.roomType.pricePerMonth)}<Text type="secondary" style={{ fontSize: 12 }}>/người/tháng</Text></Text>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text style={{ display: 'block', marginBottom: 6 }}>Chọn phòng bố trí <span style={{ color: '#FF4D4F' }}>*</span></Text>
            <Select
              aria-label="Chọn phòng bố trí"
              style={{ width: '100%' }}
              value={targetRoomId ?? requested.id}
              status={targetRoomId ? undefined : 'error'}
              loading={roomsLoading}
              disabled={!canReview}
              options={roomOptions}
              onChange={chooseRoom}
              notFoundContent="Không có phòng cùng loại còn chỗ"
            />
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
              Chỉ liệt kê phòng cùng loại và cùng giới tính còn giường trống — đổi sang loại khác sẽ làm thay đổi giá sinh viên đã chọn.
            </Text>
          </div>

          {targetRoomId && (
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Sơ đồ giường {roomTextOf(targetRoom)}</Text>
              {bedsLoading && !roomDetail ? <Skeleton active paragraph={{ rows: 2 }} /> : <BedPreview beds={roomDetail?.beds} />}
            </div>
          )}
        </Card>
      )}

      {/* ---------- Hóa đơn sẽ tạo ---------- */}
      {isPending && (
        <Card>
          <SectionTitle icon={<FileTextOutlined style={{ color: '#1677FF' }} />}>Hóa đơn sẽ tạo khi duyệt</SectionTitle>
          <div style={{ marginTop: 12 }}>
            <MoneyRow label="Tiền cọc (hoàn trả khi thanh lý hợp đồng)" value={app.estimatedInvoices.deposit} />
            <MoneyRow label="Tiền phòng tháng đầu (thu đủ 1 tháng)" value={app.estimatedInvoices.firstMonth} />
            <Divider style={{ margin: '8px 0' }} />
            <MoneyRow label="Tổng cộng" value={app.estimatedInvoices.total} strong />
            <Text type="secondary" style={{ fontSize: 12 }}>Tạo thành 2 hóa đơn riêng: hóa đơn cọc và hóa đơn tháng đầu.</Text>
          </div>
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
            {targetRoomId ? (
              <Text style={{ flex: 1, minWidth: 220 }}>
                <InfoCircleOutlined style={{ color: '#1677FF' }} /> Sẽ xếp vào <b>{roomTextOf(targetRoom)}</b>
                {nextBed ? ` — dự kiến giường ${String(nextBed.bedNumber).padStart(2, '0')}` : ''}
              </Text>
            ) : (
              <Text type="danger" style={{ flex: 1, minWidth: 220 }}>
                <WarningOutlined /> Chưa có phòng còn chỗ. Chọn phòng để bật nút duyệt.
              </Text>
            )}
            <Space wrap>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setRejectOpen(true)} disabled={approving}>Từ chối</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={confirmApprove} loading={approving} disabled={!targetRoomId}>
                Duyệt và xếp phòng
              </Button>
            </Space>
          </div>
        </Card>
      )}

      <RejectApplicationModal
        app={app}
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onRejected={() => { setRejectOpen(false); onProcessed(); }}
      />
    </div>
  );
}
