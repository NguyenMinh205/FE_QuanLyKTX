import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, AutoComplete, Button, Card, Checkbox, Col, DatePicker, Divider, Form, Input, Radio, Result, Row, Select,
  Skeleton, Steps, Tag, Typography, App,
} from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, FileDoneOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { applyApi } from '../api/apply.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { CONTRACT_TERM, GENDER, GENDER_OPTIONS } from '../../../constants/statuses';
import { FACULTY_OPTIONS } from '../../../constants/app';
import { formatCurrency } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import EmptyState from '../../../components/EmptyState';
import PublicShell from '../components/PublicShell';
import BedPicker from '../components/BedPicker';

const { Title, Text } = Typography;
const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100 } } });
/** Lỗi về phòng/giường → quay lại bước chọn giường, tải lại danh sách (UC-01 nhánh 6a) */
const BED_ERRORS = ['BED_ALREADY_REQUESTED', 'BED_ALREADY_OCCUPIED', 'GENDER_MISMATCH', 'NOT_FOUND'];
const pad2 = (n) => String(n).padStart(2, '0');

function Line({ label, children, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '6px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong={strong} style={{ textAlign: 'right', ...(strong ? { fontSize: 18, color: '#1677FF' } : {}) }}>{children}</Text>
    </div>
  );
}

/** Nộp đơn ở ký túc xá, không cần tài khoản (FR-30, UC-01): thông tin → phòng và giường → gói thuê */
export default function PublicApplyPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState(null);
  const [buildingId, setBuildingId] = useState('all');
  const [choice, setChoice] = useState(null); // { roomId, bedNumber }
  const [term, setTerm] = useState('12_months');
  const [agreed, setAgreed] = useState(false);
  const [roomAlert, setRoomAlert] = useState(null);
  const [existsAlert, setExistsAlert] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const gender = info?.gender;
  const { data: rooms, loading: roomsLoading, error: roomsError } = useApi(
    () => (step >= 1 && gender ? applyApi.getAvailableRooms({ gender, limit: 100 }) : EMPTY_LIST),
    [step >= 1, gender, reloadKey],
  );
  const list = rooms || [];
  const buildingOptions = [...new Map(list.map((r) => [r.buildingId, r.buildingName])).entries()]
    .map(([value, label]) => ({ value, label }));
  const shown = buildingId === 'all' ? list : list.filter((r) => r.buildingId === buildingId);
  // Đỉnh ngăn xếp: tầng thấp nhất, số phòng nhỏ nhất còn giường (BR-07) — chỉ gợi ý, không ép
  const suggestedId = list[0]?.id;
  const room = list.find((r) => r.id === choice?.roomId) || null;
  const months = CONTRACT_TERM[term].months;
  const roomFee = room ? room.pricePerMonth * months : 0;

  const goTo = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextFromInfo = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (info && info.gender !== values.gender) setChoice(null);
    setInfo(values);
    setExistsAlert(false);
    setReloadKey((k) => k + 1); // vào bước chọn giường là lấy số giường mới nhất
    goTo(1);
  };

  const backToBeds = (text) => {
    setRoomAlert(text);
    setChoice(null);
    setReloadKey((k) => k + 1);
    goTo(1);
  };

  const submit = async () => {
    setSubmitting(true);
    const v = info;
    try {
      const res = await applyApi.submit({
        studentCode: v.studentCode.trim().toUpperCase(),
        fullName: v.fullName.trim(),
        gender: v.gender,
        phone: v.phone.trim(),
        email: v.email.trim(),
        dob: v.dob ? v.dob.format('YYYY-MM-DD') : null,
        faculty: v.faculty?.trim() || '',
        className: v.className?.trim() || '',
        emergencyContact: v.emergencyName?.trim()
          ? { name: v.emergencyName.trim(), phone: v.emergencyPhone?.trim() || '', relationship: v.emergencyRelationship?.trim() || '' }
          : null,
        roomId: choice.roomId,
        bedNumber: choice.bedNumber,
        term,
      });
      setSubmitted({ ...res.data.data, message: res.data.message, email: v.email.trim(), fullName: v.fullName.trim() });
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (BED_ERRORS.includes(code)) {
        backToBeds(getErrorMessage(err));
      } else if (code === 'APPLICATION_OR_CONTRACT_EXISTS') {
        setExistsAlert(true);
        form.setFields([{ name: 'studentCode', errors: [getErrorMessage(err)] }]);
        goTo(0);
      } else if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
        goTo(0);
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Nộp xong ----------
  if (submitted) {
    const statusUrl = `/apply/status?studentCode=${encodeURIComponent(info.studentCode.trim().toUpperCase())}&email=${encodeURIComponent(submitted.email)}`;
    return (
      <PublicShell>
        <Card>
          <Result
            status="success"
            title="Đã gửi đơn đăng ký"
            subTitle={submitted.message}
            extra={[
              <Button type="primary" key="status" onClick={() => navigate(statusUrl)}>Tra cứu tiến độ đơn</Button>,
              <Button key="login" onClick={() => navigate('/login')}>Về trang đăng nhập</Button>,
            ]}
          >
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <Line label="Mã đơn">{submitted.contractCode}</Line>
              <Line label="Trạng thái"><Tag color="warning" style={{ margin: 0 }}>Chờ duyệt</Tag></Line>
              <Line label="Phòng">{submitted.room.buildingName} · Phòng {roomLabelOf(submitted.room)}</Line>
              <Line label="Giường">Giường {pad2(submitted.bedNumber)}</Line>
              <Line label="Gói thuê">{CONTRACT_TERM[submitted.term].label}</Line>
              <Divider style={{ margin: '8px 0' }} />
              <Line label="Tiền cọc">{formatCurrency(submitted.depositAmount)}</Line>
              <Line label="Tiền phòng cả kỳ">{formatCurrency(submitted.totalRoomFee)}</Line>
              <Line label="Cần thanh toán khi được duyệt" strong>{formatCurrency(submitted.depositAmount + submitted.totalRoomFee)}</Line>
              <Alert
                style={{ marginTop: 12 }} type="info" showIcon
                title={`Kết quả sẽ gửi tới ${submitted.email}`}
                description="Khi đơn được duyệt, bạn nhận tài khoản qua email: tên đăng nhập và mật khẩu ban đầu đều là mã sinh viên, phải đổi mật khẩu ở lần đăng nhập đầu."
              />
            </div>
          </Result>
        </Card>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Đăng ký ở ký túc xá</Title>
        <Text type="secondary">Không cần tài khoản. Tài khoản đăng nhập được gửi qua email khi đơn được duyệt.</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Steps
          current={step}
          onChange={(n) => n < step && goTo(n)}
          items={[
            { title: 'Thông tin sinh viên' },
            { title: 'Phòng và giường', disabled: step < 1 },
            { title: 'Gói thuê và xác nhận', disabled: step < 2 },
          ]}
        />
      </Card>

      {/* ---------- Bước 1 — luôn giữ trong cây để giá trị và lỗi trả về từ máy chủ không mất ---------- */}
      <Card style={{ display: step === 0 ? 'block' : 'none' }}>
        {existsAlert && (
          <Alert
            type="warning" showIcon style={{ marginBottom: 16 }}
            title="Mã sinh viên này đã có đơn đăng ký hoặc đang ở ký túc xá"
            description={<span>Xem tiến độ ở mục <a onClick={() => navigate('/apply/status')}>Tra cứu đơn</a>.</span>}
          />
        )}
        <Form form={form} layout="vertical" autoComplete="off" initialValues={{ gender: undefined }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="studentCode" label="Mã sinh viên"
                normalize={(v) => (v || '').toUpperCase()}
                rules={[
                  { required: true, whitespace: true, message: 'Nhập mã sinh viên' },
                  { pattern: /^[A-Za-z0-9]{6,20}$/, message: 'Mã sinh viên gồm 6–20 ký tự chữ và số' },
                ]}
              >
                <Input placeholder="VD: 2021601234" maxLength={20} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ và tên' }]}>
                <Input placeholder="VD: Nguyễn Văn An" maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}
                extra="Dùng để lọc phòng: phòng nam chỉ nhận nam, phòng nữ chỉ nhận nữ (BR-01)"
              >
                <Radio.Group options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dob" label="Ngày sinh">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabledDate={(d) => d.isAfter(dayjs())} placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone" label="Số điện thoại"
                rules={[
                  { required: true, message: 'Nhập số điện thoại' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại gồm 10 số, bắt đầu bằng 0' },
                ]}
              >
                <Input placeholder="VD: 0912345678" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email" label="Email cá nhân"
                extra="Nhận kết quả xét duyệt và tài khoản đăng nhập"
                rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}
              >
                <Input placeholder="VD: an.nguyen@gmail.com" maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="faculty" label="Khoa / Viện">
                <AutoComplete options={FACULTY_OPTIONS} placeholder="VD: Công nghệ thông tin" filterOption={(input, o) => o.value.toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="className" label="Lớp">
                <Input placeholder="VD: KTPM01-K16" maxLength={30} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" style={{ marginTop: 0 }}>Liên hệ khẩn cấp (không bắt buộc)</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="emergencyName" label="Họ tên người thân"><Input maxLength={100} /></Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="emergencyPhone" label="Số điện thoại" rules={[{ pattern: /^0\d{9}$/, message: 'Số điện thoại gồm 10 số, bắt đầu bằng 0' }]}>
                <Input maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="emergencyRelationship" label="Quan hệ"><Input placeholder="VD: Bố" maxLength={30} /></Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" size="large" onClick={nextFromInfo}>Tiếp tục chọn phòng <ArrowRightOutlined /></Button>
        </div>
      </Card>

      {/* ---------- Bước 2: phòng và giường ---------- */}
      {step === 1 && (
        <Card>
          {roomAlert && (
            <Alert
              type="error" showIcon closable style={{ marginBottom: 16 }} title={roomAlert}
              description="Danh sách giường đã được tải lại. Thông tin bạn đã nhập vẫn được giữ."
              onClose={() => setRoomAlert(null)}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <Text>Phòng dành cho sinh viên <b>{GENDER[gender]?.label.toLowerCase()}</b>, xếp theo tầng thấp trước, số phòng nhỏ trước.</Text>
            <Select
              aria-label="Tòa nhà" style={{ minWidth: 180 }} value={buildingId} onChange={setBuildingId}
              options={[{ value: 'all', label: 'Tất cả tòa nhà' }, ...buildingOptions]}
            />
          </div>

          {roomsError && <Alert type="error" showIcon title={roomsError} />}
          {!roomsError && roomsLoading && !rooms && <Skeleton active paragraph={{ rows: 6 }} />}
          {!roomsError && rooms && shown.length === 0 && <EmptyState description="Hiện không còn phòng trống phù hợp. Vui lòng quay lại sau." />}

          <div style={{ display: 'grid', gap: 12, opacity: roomsLoading ? 0.6 : 1 }}>
            {shown.map((r) => (
              <Card
                key={r.id} size="small" data-room={roomLabelOf(r)}
                style={{ borderColor: choice?.roomId === r.id ? '#1677FF' : undefined }}
                title={(
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>Phòng {roomLabelOf(r)}</span>
                    {r.id === suggestedId && <Tag color="blue" style={{ margin: 0 }}>Gợi ý</Tag>}
                    <Text type="secondary" style={{ fontWeight: 400 }}>{r.buildingName} · Tầng {r.floor} · {r.capacity} chỗ</Text>
                  </span>
                )}
                extra={<Text>{formatCurrency(r.pricePerMonth)}<Text type="secondary">/tháng</Text></Text>}
              >
                <BedPicker
                  beds={r.beds}
                  label={`Giường phòng ${roomLabelOf(r)}`}
                  selected={choice?.roomId === r.id ? choice.bedNumber : null}
                  onSelect={(bedNumber) => { setChoice({ roomId: r.id, bedNumber }); setRoomAlert(null); }}
                />
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
                  Còn {r.availableSlots} giường nhận đơn · Tiền cọc {formatCurrency(r.depositAmount)}
                </Text>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '10px 12px', background: '#F0F7FF', borderRadius: 8 }}>
            <Text>
              <InfoCircleOutlined style={{ color: '#1677FF' }} /> Phòng gắn nhãn <b>Gợi ý</b> là phòng được ưu tiên xếp trước; bạn vẫn chọn phòng khác được.
              Giường "Đã có người đăng ký" đang chờ duyệt cho người khác nên không chọn được.
            </Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => goTo(0)}>Sửa thông tin</Button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {room && <Text>Đã chọn: <b>Phòng {roomLabelOf(room)} · Giường {pad2(choice.bedNumber)}</b></Text>}
              <Button type="primary" size="large" disabled={!room} onClick={() => goTo(2)}>Tiếp tục <ArrowRightOutlined /></Button>
            </span>
          </div>
        </Card>
      )}

      {/* ---------- Bước 3: gói thuê và xác nhận ---------- */}
      {step === 2 && room && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="Gói thuê">
              <Radio.Group value={term} onChange={(e) => setTerm(e.target.value)} style={{ display: 'grid', gap: 12 }}>
                {Object.entries(CONTRACT_TERM).map(([value, t]) => (
                  <Radio key={value} value={value} style={{ padding: '12px 14px', border: `1px solid ${term === value ? '#1677FF' : '#F0F0F0'}`, borderRadius: 8 }}>
                    <Text strong>{t.label}</Text> <Text type="secondary">({t.hint})</Text>
                    <div><Text>Tiền phòng cả kỳ: <b>{formatCurrency(room.pricePerMonth * t.months)}</b></Text></div>
                  </Radio>
                ))}
              </Radio.Group>
              <Alert
                style={{ marginTop: 16 }} type="info" showIcon
                title="Nộp đơn chưa giữ chỗ"
                description="Cán bộ khóa giường bạn chọn khi duyệt đơn. Nếu lúc đó giường đã có người, cán bộ sẽ xếp bạn vào giường khác cùng giới tính. Tiền phòng thu trọn gói một lần sau khi duyệt (BR-02)."
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title={<span><FileDoneOutlined style={{ color: '#1677FF' }} /> Xác nhận đơn</span>}>
              <Line label="Họ và tên">{info.fullName}</Line>
              <Line label="Mã sinh viên">{info.studentCode}</Line>
              <Line label="Email">{info.email}</Line>
              <Line label="Phòng">{room.buildingName} · Phòng {roomLabelOf(room)}</Line>
              <Line label="Giường">Giường {pad2(choice.bedNumber)}</Line>
              <Line label="Gói thuê">{CONTRACT_TERM[term].label}</Line>
              <Divider style={{ margin: '8px 0' }} />
              <Line label="Đơn giá">{formatCurrency(room.pricePerMonth)}/tháng</Line>
              <Line label={`Tiền phòng ${months} tháng`}>{formatCurrency(roomFee)}</Line>
              <Line label="Tiền cọc">{formatCurrency(room.depositAmount)}</Line>
              <Line label="Tổng khi được duyệt" strong>{formatCurrency(roomFee + room.depositAmount)}</Line>
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 12 }}>
                Tôi xác nhận thông tin trên là đúng và đồng ý với nội quy ký túc xá.
              </Checkbox>
              <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                <Button type="primary" size="large" block icon={<FileDoneOutlined />} disabled={!agreed} loading={submitting} onClick={submit}>
                  Gửi đơn đăng ký
                </Button>
                <Button block icon={<ArrowLeftOutlined />} onClick={() => goTo(1)} disabled={submitting}>Chọn giường khác</Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </PublicShell>
  );
}
