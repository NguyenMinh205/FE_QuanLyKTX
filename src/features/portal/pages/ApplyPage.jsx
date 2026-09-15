import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Card, Checkbox, Col, Divider, Form, Result, Row, Skeleton, Steps, Tag, Typography, App, Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, ClockCircleOutlined, FileDoneOutlined, InfoCircleOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { GENDER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import RoomTypeStep from '../components/apply/RoomTypeStep';
import RoomStep from '../components/apply/RoomStep';
import ConfirmStep from '../components/apply/ConfirmStep';
import SummaryRow from '../components/apply/SummaryRow';
import SupportCard from '../components/SupportCard';
import { defaultStayPeriod, monthsBetween } from '../utils/applyDates';

const { Title, Text } = Typography;
const API_DATE = 'YYYY-MM-DD';
const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100 } } });
/** Lỗi về phòng → quay lại bước 2 kèm banner đỏ (docs/08 mục 6.10) */
const ROOM_ERRORS = ['ROOM_FULL', 'GENDER_MISMATCH'];
/** Lỗi về tư cách nộp đơn → về trang chủ */
const HOME_ERRORS = ['DUPLICATE_PENDING_APPLICATION', 'STUDENT_HAS_ACTIVE_CONTRACT'];

/** SCR-62 Đăng ký chỗ ở — 3 bước: loại phòng → phòng → xác nhận */
export default function ApplyPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState(null);
  const [roomTypeId, setRoomTypeId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [buildingId, setBuildingId] = useState(null);
  const [stay, setStay] = useState(defaultStayPeriod);
  const [agreed, setAgreed] = useState(false);
  const [roomAlert, setRoomAlert] = useState(null);
  const [roomsReload, setRoomsReload] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [genderHintClosed, setGenderHintClosed] = useState(false);

  const { data: residence, loading: residenceLoading, error: residenceError } = useApi(() => portalApi.getMyResidence(), []);
  const { data: myApps, loading: appsLoading } = useApi(() => portalApi.getMyApplications(), []);
  const { data: profile } = useApi(() => portalApi.getProfile(), []);
  const { data: types, loading: typesLoading, error: typesError } = useApi(() => portalApi.getRoomTypes(), [roomsReload]);
  // Tải lại danh sách phòng mỗi lần vào bước 2 (docs/08 mục 6.10)
  const { data: rooms, loading: roomsLoading, error: roomsError } = useApi(
    () => (roomTypeId && step >= 1 ? portalApi.getAvailableRooms({ roomTypeId, limit: 100 }) : EMPTY_LIST),
    [roomTypeId, step >= 1, roomsReload],
  );

  const roomType = (types || []).find((t) => t.id === roomTypeId) || null;
  const room = (rooms || []).find((r) => r.id === roomId) || null;
  const pendingApp = (myApps || []).find((a) => a.status === 'pending');
  const lastApp = (myApps || [])[0];
  const activeTier = tier ?? (types || []).find((t) => t.availableSlots > 0)?.tier ?? 'standard';

  // Đã có chỗ ở thì không đăng ký nữa → về trang chủ
  useEffect(() => {
    if (residence?.hasResidence) {
      message.info('Bạn đang có chỗ ở tại ký túc xá, không cần đăng ký thêm');
      navigate('/portal/home', { replace: true });
    }
  }, [residence, message, navigate]);

  const goToStep = (next) => {
    if (next === 1) setRoomsReload((n) => n + 1); // luôn lấy số chỗ mới nhất khi vào bước chọn phòng
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseType = (id) => {
    if (id !== roomTypeId) { setRoomId(null); setBuildingId(null); }
    setRoomTypeId(id);
  };

  const chooseRoom = (id) => {
    setRoomId(id);
    setRoomAlert(null);
  };

  const backToRooms = (alertText) => {
    setRoomAlert(alertText);
    setRoomId(null);
    setRoomsReload((n) => n + 1);
    goToStep(1);
  };

  const submit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const label = `Phòng ${roomLabelOf(room)}`;
    try {
      // Kiểm tra lại ngay trước khi nộp — phòng có thể vừa hết chỗ trong lúc sinh viên điền form
      const fresh = await portalApi.getAvailableRooms({ roomTypeId, limit: 100 });
      const stillOpen = fresh.data.data.items.some((r) => r.id === roomId && r.availableSlots > 0);
      if (!stillOpen) {
        backToRooms(`${label} vừa hết chỗ, vui lòng chọn phòng khác`);
        return;
      }

      const res = await portalApi.createApplication({
        roomId,
        startDate: values.startDate.format(API_DATE),
        endDate: values.endDate.format(API_DATE),
        note: values.note?.trim() || '',
      });
      setSubmitted({ ...res.data.data, message: res.data.message, room, roomType, ...values });
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (ROOM_ERRORS.includes(code)) {
        backToRooms(getErrorMessage(err));
      } else if (HOME_ERRORS.includes(code)) {
        message.warning(getErrorMessage(err));
        navigate('/portal/home', { replace: true });
      } else if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <div style={{ marginBottom: 20 }}>
      <Breadcrumb items={[{ title: <a onClick={() => navigate('/portal/home')}><HomeOutlined /> Trang chủ</a> }, { title: 'Đăng ký chỗ ở' }]} />
      <Title level={3} style={{ margin: '8px 0 0' }}>Đăng ký chỗ ở ký túc xá</Title>
      <Text type="secondary">Chọn loại phòng, chọn phòng và nộp đơn — ban quản lý sẽ xếp giường khi duyệt.</Text>
    </div>
  );

  // ---------- Đang kiểm tra tư cách đăng ký ----------
  if (residenceLoading || appsLoading || residence?.hasResidence) {
    return <>{header}<Card><Skeleton active paragraph={{ rows: 6 }} /></Card></>;
  }
  if (residenceError) {
    return <>{header}<Alert type="error" showIcon title={residenceError} /></>;
  }

  // ---------- Nộp xong ----------
  if (submitted) {
    const est = submitted.estimatedInvoices || {};
    return (
      <>
        {header}
        <Card>
          <Result
            status="success"
            title="Nộp đơn đăng ký thành công"
            subTitle={submitted.message}
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/portal/home')}>Về trang chủ</Button>,
            ]}
          >
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <SummaryRow label="Mã đơn" strong>{submitted.applicationCode}</SummaryRow>
              <SummaryRow label="Trạng thái"><Tag color="warning" style={{ margin: 0 }}>Chờ duyệt</Tag></SummaryRow>
              <SummaryRow label="Phòng đăng ký">{submitted.room.buildingName} · Phòng {roomLabelOf(submitted.room)}</SummaryRow>
              <SummaryRow label="Loại phòng">{submitted.roomType.name}</SummaryRow>
              <SummaryRow label="Thời gian ở">{formatDate(submitted.startDate)} → {formatDate(submitted.endDate)}</SummaryRow>
              <Divider style={{ margin: '8px 0' }} />
              <SummaryRow label="Tiền cọc (khi được duyệt)">{formatCurrency(est.deposit)}</SummaryRow>
              <SummaryRow label="Tiền phòng tháng đầu">{formatCurrency(est.firstMonth)}</SummaryRow>
              <SummaryRow label="Tổng cần thanh toán sau khi duyệt" strong>{formatCurrency(est.total)}</SummaryRow>
              <Alert
                style={{ marginTop: 12 }} type="info" showIcon
                title="Nộp đơn chưa giữ chỗ"
                description="Khi duyệt, ban quản lý xếp giường cho bạn — nếu phòng này đã đầy, bạn có thể được xếp sang phòng khác cùng loại, cùng giá. Hóa đơn chỉ được tạo sau khi đơn được duyệt."
              />
            </div>
          </Result>
        </Card>
      </>
    );
  }

  // ---------- Đã có đơn chờ duyệt ----------
  if (pendingApp) {
    return (
      <>
        {header}
        <Card>
          <Result
            status="warning"
            title="Bạn đã có một đơn đăng ký đang chờ duyệt"
            subTitle="Mỗi sinh viên chỉ có một đơn chờ duyệt. Muốn đổi phòng, hãy hủy đơn hiện tại ở trang chủ rồi đăng ký lại."
            extra={<Button type="primary" onClick={() => navigate('/portal/home')}>Về trang chủ</Button>}
          >
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <SummaryRow label="Mã đơn" strong>{pendingApp.applicationCode}</SummaryRow>
              <SummaryRow label="Phòng">{pendingApp.requestedRoom?.buildingName} · Phòng {roomLabelOf(pendingApp.requestedRoom)}</SummaryRow>
              <SummaryRow label="Loại phòng">{pendingApp.roomType?.name}</SummaryRow>
              <SummaryRow label="Ngày nộp">{formatDateTime(pendingApp.createdAt)}</SummaryRow>
            </div>
          </Result>
        </Card>
      </>
    );
  }

  const months = monthsBetween(stay.startDate, stay.endDate);
  const genderLabel = profile?.gender ? GENDER[profile.gender]?.label.toLowerCase() : null;

  // ---------- Thẻ tóm tắt bên phải theo bước ----------
  const summary = (
    <Card title={<span><FileDoneOutlined style={{ color: '#1677FF' }} /> {step === 2 ? 'Chi phí ban đầu' : 'Tóm tắt lựa chọn'}</span>}>
      {!roomType && <Text type="secondary">Chọn một loại phòng để xem chi phí.</Text>}

      {roomType && step < 2 && (
        <>
          <SummaryRow label="Loại phòng" strong>{roomType.name}</SummaryRow>
          {step === 1 && <SummaryRow label="Tòa nhà">{room?.buildingName ?? '—'}</SummaryRow>}
          {step === 1 && (
            <SummaryRow label="Phòng đã chọn">
              {room ? <Text strong style={{ color: '#1677FF' }}>Phòng {roomLabelOf(room)} (Tầng {room.floor})</Text> : <Text type="secondary">Chưa chọn</Text>}
            </SummaryRow>
          )}
          {step === 1 && room && <SummaryRow label="Tình trạng"><Text style={{ color: '#389E0D' }}>● Còn {room.availableSlots} chỗ</Text></SummaryRow>}
          <SummaryRow label="Giá thuê">{formatCurrency(roomType.pricePerMonth)} / người / tháng</SummaryRow>
          <SummaryRow label="Tiền cọc" hint="Thu một lần khi đơn được duyệt, hoàn lại khi trả phòng">{formatCurrency(roomType.depositAmount)}</SummaryRow>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text strong>Dự kiến hằng tháng</Text>
            <Text strong style={{ fontSize: 22, color: '#1677FF' }}>{formatCurrency(roomType.pricePerMonth)}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>* Chưa gồm tiền điện nước chia theo chỉ số hằng tháng.</Text>
        </>
      )}

      {roomType && step === 2 && (
        <>
          <SummaryRow label="Tiền cọc" hint="Hoàn lại khi trả phòng, sau khi trừ công nợ">{formatCurrency(roomType.depositAmount)}</SummaryRow>
          <SummaryRow label="Tiền phòng tháng đầu" hint="Thu đủ 1 tháng, kể cả khi vào ở giữa tháng">{formatCurrency(roomType.pricePerMonth)}</SummaryRow>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text strong style={{ fontSize: 16 }}>Tổng cộng</Text>
            <Text strong style={{ fontSize: 24, color: '#1677FF' }}>{formatCurrency(roomType.depositAmount + roomType.pricePerMonth)}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Thanh toán sau khi đơn được duyệt{months ? ` · thời hạn ${months} tháng` : ''}.
          </Text>
          <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 16 }}>
            Tôi đã đọc và đồng ý với nội quy ký túc xá và các điều khoản cư trú của nhà trường.
          </Checkbox>
        </>
      )}

      <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
        {step === 0 && (
          <Button type="primary" size="large" block disabled={!roomType || !(roomType.availableSlots > 0)} onClick={() => goToStep(1)}>
            Tiếp tục chọn phòng <ArrowRightOutlined />
          </Button>
        )}
        {step === 1 && (
          <>
            <Button type="primary" size="large" block disabled={!room} onClick={() => goToStep(2)}>
              Tiếp tục sang bước 3 <ArrowRightOutlined />
            </Button>
            <Button type="text" block icon={<ArrowLeftOutlined />} onClick={() => goToStep(0)}>Quay lại chọn loại phòng</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button type="primary" size="large" block icon={<FileDoneOutlined />} disabled={!agreed} loading={submitting} onClick={submit}>
              Nộp đơn đăng ký
            </Button>
            <Button block icon={<ArrowLeftOutlined />} onClick={() => goToStep(1)} disabled={submitting}>Quay lại chọn phòng khác</Button>
          </>
        )}
      </div>

      {step > 0 && (
        <div style={{ marginTop: 16, padding: '10px 12px', background: '#FAFAFA', borderRadius: 8, display: 'flex', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#8C8C8C', marginTop: 3 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Nộp đơn <b>chưa giữ chỗ</b>. Ban quản lý duyệt trong 1–2 ngày làm việc; nếu phòng đầy trước đó, bạn có thể được xếp sang phòng khác cùng loại.
          </Text>
        </div>
      )}
    </Card>
  );

  return (
    <>
      {header}

      <Card style={{ marginBottom: 16 }}>
        <Steps
          current={step}
          onChange={(next) => next < step && goToStep(next)}
          items={[
            { title: 'Loại phòng', content: step > 0 && roomType ? `Đã chọn: ${roomType.name}` : 'Chọn tiêu chuẩn & sức chứa' },
            { title: 'Chọn phòng', content: step > 1 && room ? `Đã chọn: Phòng ${roomLabelOf(room)}` : 'Chọn tòa nhà & số phòng', disabled: step < 1 },
            { title: 'Xác nhận', content: 'Kiểm tra thông tin & nộp đơn', disabled: step < 2 },
          ]}
        />
      </Card>

      {lastApp?.status === 'rejected' && step === 0 && (
        <Alert
          type="error" showIcon style={{ marginBottom: 16 }}
          title={`Đơn ${lastApp.applicationCode} trước đây đã bị từ chối`}
          description={`Lý do: ${lastApp.reviewNote || '—'}. Bạn có thể đăng ký lại.`}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {genderLabel && !genderHintClosed && (
            <Alert
              type="info" showIcon closable style={{ marginBottom: 16 }}
              icon={<InfoCircleOutlined />}
              title={`Hiển thị phòng dành cho sinh viên ${genderLabel}`}
              description="Hệ thống tự lọc theo giới tính trong hồ sơ của bạn."
              onClose={() => setGenderHintClosed(true)}
            />
          )}

          {step === 0 && (
            <RoomTypeStep
              types={types} loading={typesLoading} error={typesError}
              tier={activeTier} onTierChange={setTier}
              selectedId={roomTypeId} onSelect={chooseType}
            />
          )}
          {step === 1 && (
            <RoomStep
              roomType={roomType} rooms={rooms} loading={roomsLoading} error={roomsError}
              buildingId={buildingId} onBuildingChange={setBuildingId}
              selectedRoomId={roomId} onSelect={chooseRoom}
              alert={roomAlert} onCloseAlert={() => setRoomAlert(null)}
              onChangeType={() => goToStep(0)}
            />
          )}
          {step === 2 && room && (
            <ConfirmStep
              form={form} room={room} roomType={roomType}
              initialValues={stay}
              onValuesChange={(all) => setStay((prev) => ({ ...prev, ...all }))}
            />
          )}
        </Col>
        <Col xs={24} lg={8}>
          <div style={{ display: 'grid', gap: 16, position: 'sticky', top: 88 }}>
            {summary}
            <SupportCard />
          </div>
        </Col>
      </Row>
    </>
  );
}
