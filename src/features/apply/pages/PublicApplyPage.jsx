import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, AutoComplete, Button, Card, Checkbox, Col, DatePicker, Divider, Form, Input, Radio, Result, Row,
  Skeleton, Space, Steps, Typography, App,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { applyApi } from '../api/apply.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import {
  CONTRACT_TERM, GENDER, GENDER_OPTIONS, ROOM_TIER, CAMPUS,
} from '../../../constants/statuses';
import { FACULTY_OPTIONS } from '../../../constants/app';
import { formatCurrency, formatDate } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import EmptyState from '../../../components/EmptyState';
import StatusTag from '../../../components/StatusTag';
import PublicShell from '../components/PublicShell';

const { Title, Text } = Typography;
const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 100, roomTypes: [] } } });
const ROOM_ERRORS = ['ROOM_FULL', 'ROOM_NOT_AVAILABLE', 'GENDER_MISMATCH', 'CAMPUS_MISMATCH', 'NOT_FOUND'];

const SERVER_FIELD = {
  'emergencyContact.name': 'emergencyName',
  'emergencyContact.phone': 'emergencyPhone',
  'emergencyContact.relationship': 'emergencyRelationship',
};

function Line({ label, children, strong, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 14, padding: '6px 0' }}>
      <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</Text>
      <Text
        strong={strong}
        className={mono ? 'mono' : undefined}
        style={{ textAlign: 'right', ...(strong ? { fontSize: 16, color: 'var(--brand)' } : { fontSize: 13 }) }}
      >
        {children}
      </Text>
    </div>
  );
}

/**
 * Đăng ký KTX công khai — 2 bước tối giản, phẳng, sạch sẽ:
 *   1. Chọn Đợt & Loại phòng nguyện vọng (loại hết chỗ tự động KHÓA) + Gói kỳ hạn
 *   2. Điền Hồ sơ sinh viên & Gửi đơn
 */
export default function PublicApplyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPeriodId = searchParams.get('periodId') || null;
  const { message } = App.useApp();

  const [step1Form] = Form.useForm();
  const [profileForm] = Form.useForm();

  const [step, setStep] = useState(0);
  const [step1Info, setStep1Info] = useState(null);
  const [periodId, setPeriodId] = useState(preselectedPeriodId);
  const [roomChoice, setRoomChoice] = useState(null);
  const [term, setTerm] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [roomAlert, setRoomAlert] = useState(null);
  const [existsAlert, setExistsAlert] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const watchedCode = Form.useWatch('studentCode', step1Form);
  const watchedFaculty = Form.useWatch('faculty', step1Form);
  const watchedGender = Form.useWatch('gender', step1Form);

  const validCode = /^\d{10}$/.test(String(watchedCode || '').trim()) ? String(watchedCode).trim() : undefined;
  const trimmedFaculty = String(watchedFaculty || '').trim() || undefined;
  const activeGender = watchedGender || step1Info?.gender;

  const { data: openPeriodsData, loading: periodsLoading, error: periodsError } = useApi(
    () => applyApi.getOpenPeriods({ studentCode: validCode, faculty: trimmedFaculty }),
    [validCode, trimmedFaculty],
  );
  const openPeriods = useMemo(() => (Array.isArray(openPeriodsData) ? openPeriodsData : []), [openPeriodsData]);

  const activePeriod = useMemo(() => {
    const picked = openPeriods.find((p) => p.id === periodId);
    if (picked && (!picked.eligibility || picked.eligibility.eligible)) return picked;
    return openPeriods.find((p) => !p.eligibility || p.eligibility.eligible) || null;
  }, [openPeriods, periodId]);

  const effectivePeriodId = activePeriod?.id || null;

  const { meta: roomsMeta, loading: roomsLoading } = useApi(
    () => (effectivePeriodId && activeGender
      ? applyApi.getAvailableRooms({ periodId: effectivePeriodId, gender: activeGender, limit: 100 })
      : EMPTY_LIST),
    [effectivePeriodId, activeGender, reloadKey],
  );

  const roomTypes = useMemo(() => (Array.isArray(roomsMeta?.roomTypes) ? roomsMeta.roomTypes : []), [roomsMeta]);
  const availableTypes = useMemo(() => roomTypes.filter((t) => !t.isFull && t.availableSlots > 0), [roomTypes]);

  const selectedType = useMemo(() => {
    const picked = availableTypes.find((t) => t.key === roomChoice);
    return picked || availableTypes[0] || null;
  }, [availableTypes, roomChoice]);

  const allowedTerms = activePeriod?.allowedTerms?.length ? activePeriod.allowedTerms : ['10_months', '5_months'];
  const effectiveTerm = allowedTerms.includes(term) ? term : allowedTerms[0];
  const months = CONTRACT_TERM[effectiveTerm]?.months ?? 10;

  const estPrice = selectedType?.pricePerMonth ?? 0;
  const estDeposit = selectedType?.depositAmount ?? 500000;
  const estRoomFee = Math.round(estPrice * months);

  const wishLabel = selectedType
    ? `${ROOM_TIER[selectedType.roomTier]?.label || selectedType.roomTier} · ${selectedType.capacity} người`
    : 'Chưa chọn loại phòng';

  const goTo = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextToProfile = async () => {
    let values;
    try {
      values = await step1Form.validateFields();
    } catch {
      return;
    }
    if (!effectivePeriodId) {
      message.warning('Hiện không có đợt đăng ký phù hợp với MSSV và Khoa/Ngành bạn vừa nhập');
      return;
    }
    if (!selectedType) {
      message.warning('Tất cả loại phòng trong đợt này hiện đã hết chỗ');
      return;
    }
    setStep1Info({
      studentCode: values.studentCode.trim(),
      faculty: values.faculty.trim(),
      gender: values.gender,
    });
    setPeriodId(effectivePeriodId);
    setRoomChoice(selectedType.key);
    setExistsAlert(false);
    setRoomAlert(null);
    goTo(1);
  };

  const handleSubmitAll = async () => {
    let v;
    try {
      v = await profileForm.validateFields();
    } catch {
      message.warning('Vui lòng kiểm tra lại các trường hồ sơ còn thiếu');
      return;
    }
    if (!effectivePeriodId || !step1Info || !selectedType) return;

    setSubmitting(true);
    try {
      const res = await applyApi.submit({
        periodId: effectivePeriodId,
        studentCode: step1Info.studentCode,
        faculty: step1Info.faculty,
        gender: step1Info.gender,
        fullName: v.fullName.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        dob: v.dob.format('YYYY-MM-DD'),
        citizenId: v.citizenId.trim(),
        address: v.address.trim(),
        className: v.className.trim(),
        emergencyContact: {
          name: v.emergencyName.trim(),
          phone: v.emergencyPhone.trim(),
          relationship: v.emergencyRelationship.trim(),
        },
        preferredRoomTier: selectedType.roomTier,
        preferredCapacity: selectedType.capacity,
        term: effectiveTerm,
      });
      setSubmitted({
        ...res.data.data,
        message: res.data.message,
        email: v.email.trim(),
        studentCode: step1Info.studentCode,
      });
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (ROOM_ERRORS.includes(code)) {
        setRoomAlert(getErrorMessage(err));
        setRoomChoice(null);
        setReloadKey((k) => k + 1);
        goTo(0);
      } else if (code === 'APPLICATION_OR_CONTRACT_EXISTS') {
        setExistsAlert(true);
        step1Form.setFields([{ name: 'studentCode', errors: [getErrorMessage(err)] }]);
        goTo(0);
      } else if (code === 'IDENTITY_MISMATCH') {
        profileForm.setFields([{ name: 'citizenId', errors: [getErrorMessage(err)] }]);
      } else if (fieldErrors) {
        const s1Names = new Set(['studentCode', 'faculty', 'gender']);
        const s1Errs = fieldErrors.filter((e) => s1Names.has(e.field));
        const pErrs = fieldErrors.filter((e) => !s1Names.has(e.field));
        if (pErrs.length) profileForm.setFields(pErrs.map((e) => ({ name: SERVER_FIELD[e.field] ?? e.field, errors: [e.message] })));
        if (s1Errs.length) {
          step1Form.setFields(s1Errs.map((e) => ({ name: e.field, errors: [e.message] })));
          goTo(0);
        }
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const statusUrl = `/apply/status?studentCode=${encodeURIComponent(submitted.studentCode)}&email=${encodeURIComponent(submitted.email)}`;
    const submittedWish = submitted.preferredRoomTier
      ? `${ROOM_TIER[submitted.preferredRoomTier]?.label || submitted.preferredRoomTier}${submitted.preferredCapacity ? ` · ${submitted.preferredCapacity} người` : ''}`
      : '—';
    const assignedRoomText = submitted.room
      ? `${submitted.room.buildingName} · Phòng ${roomLabelOf(submitted.room)} (Tầng ${submitted.room.floor})`
      : 'Đã khóa chỗ thành công';
    return (
      <PublicShell>
        <Card>
          <Result
            status="success"
            title="Đăng ký thành công — Hệ thống đã tự động xếp phòng!"
            subTitle={submitted.message || 'Phòng đã được giữ chỗ và hóa đơn đầu kỳ đã phát hành. Đăng nhập Cổng Sinh viên để thanh toán VietQR.'}
            extra={[
              <Button type="primary" size="large" key="login" onClick={() => navigate('/login')}>Đăng nhập thanh toán VietQR ngay</Button>,
              <Button key="status" onClick={() => navigate(statusUrl)}>Tra cứu / Tự hủy giữ chỗ</Button>,
              <Button key="home" onClick={() => navigate('/')}>Về trang chủ KTX</Button>,
            ]}
          >
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <div style={{
                marginBottom: 14,
                padding: '12px 16px',
                borderRadius: 8,
                background: 'var(--brand-soft)',
                border: '1px solid var(--brand-border)',
                textAlign: 'center',
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>PHÒNG ĐƯỢC XẾP TỰ ĐỘNG (TẦNG THẤP → CAO)</Text>
                <Text strong className="mono" style={{ fontSize: 18, color: 'var(--brand-deep)' }}>
                  {assignedRoomText}
                </Text>
              </div>
              <Line label="Mã hợp đồng" mono>{submitted.contractCode}</Line>
              <Line label="Trạng thái"><StatusTag type="contract" value={submitted.status} /></Line>
              <Line label="Cơ sở">{submitted.campusName || CAMPUS[submitted.campus]?.label || 'Cơ sở 1 (Cầu Diễn)'}</Line>
              <Line label="Loại phòng">{submittedWish}</Line>
              <Line label="Gói thuê">{CONTRACT_TERM[submitted.term]?.label || submitted.term}</Line>
              {submitted.paymentDeadline && (
                <Line label="Hạn đóng phí giữ chỗ" mono>
                  <Text strong type="warning">{formatDate(submitted.paymentDeadline)}</Text>
                </Line>
              )}
              <Divider style={{ margin: '10px 0' }} />
              <Line label="Tiền cọc tài sản" mono>{formatCurrency(submitted.depositAmount)}</Line>
              <Line label="Tiền phòng cả kỳ" mono>{formatCurrency(submitted.totalRoomFee)}</Line>
              <Line label="Tổng cần thanh toán" strong mono>{formatCurrency((submitted.depositAmount || 0) + (submitted.totalRoomFee || 0))}</Line>
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 12.5, color: '#14532D' }}>
                <div><b>Tài khoản Cổng Sinh viên đã sẵn sàng:</b></div>
                <div style={{ marginTop: 4 }}>
                  Tài khoản: <Text code className="mono">{submitted.studentCode}</Text> · Mật khẩu mặc định: <Text code className="mono">{submitted.studentCode}</Text>
                </div>
                <div style={{ marginTop: 4, opacity: 0.9 }}>
                  Thông tin chi tiết cũng đã gửi tới <b>{submitted.email}</b>. Sau khi thanh toán VietQR, hợp đồng tự động kích hoạt và sinh mã QR Check-in ngay lập tức.
                </div>
              </div>
            </div>
          </Result>
        </Card>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      {/* Tiêu đề + Thanh bước nằm gọn trực tiếp trên trang, không bọc thêm Card thừa */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Đăng ký ở Ký túc xá Cơ sở 1
          </Title>
          <Text type="secondary" style={{ fontSize: 13.5 }}>
            Chọn đợt, chọn loại phòng còn chỗ và điền hồ sơ — hệ thống tự động duyệt &amp; xếp phòng ngay từ tầng thấp lên cao.
          </Text>
        </div>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <Steps
            size="small"
            current={step}
            onChange={(n) => n < step && goTo(n)}
            items={[
              { title: 'Chọn Đợt & Loại phòng' },
              { title: 'Hồ sơ & Gửi đơn', disabled: step < 1 },
            ]}
          />
        </div>
      </div>

      {/* ---------- BƯỚC 1: KIỂM TRA ĐỢT + CHỌN LOẠI PHÒNG & KỲ HẠN ---------- */}
      <div style={{ display: step === 0 ? 'block' : 'none' }}>
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          {existsAlert && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 14 }}
              title="Mã sinh viên này đã có đơn đăng ký hoặc hợp đồng đang hiệu lực"
              description={<span>Kiểm tra hoặc tự hủy giữ chỗ chưa thanh toán tại <Link to="/apply/status">Tra cứu đơn</Link>.</span>}
            />
          )}
          {roomAlert && <Alert type="error" showIcon closable style={{ marginBottom: 14 }} title={roomAlert} onClose={() => setRoomAlert(null)} />}
          {periodsError && <Alert type="error" showIcon style={{ marginBottom: 14 }} title={periodsError} />}

          <Form form={step1Form} layout="vertical" autoComplete="off">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="studentCode" label="Mã sinh viên (10 chữ số)"
                  extra="4 số đầu tự phân loại Tân SV / Năm 2+"
                  rules={[
                    { required: true, whitespace: true, message: 'Nhập mã sinh viên' },
                    { pattern: /^\d{10}$/, message: 'Mã sinh viên gồm đúng 10 chữ số' },
                  ]}
                >
                  <Input placeholder="VD: 2026601234" maxLength={10} inputMode="numeric" className="mono" />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item
                  name="faculty" label="Khoa / Viện đào tạo"
                  extra="Khoa / Viện đang theo học tại HaUI"
                  rules={[{ required: true, whitespace: true, message: 'Chọn hoặc nhập khoa / viện' }]}
                >
                  <AutoComplete
                    options={FACULTY_OPTIONS}
                    placeholder="VD: Công nghệ thông tin"
                    filterOption={(input, o) => String(o?.value ?? '').toLowerCase().includes(String(input).toLowerCase())}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="gender" label="Giới tính" extra="Lọc chỗ trống theo giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}>
                  <Radio.Group options={GENDER_OPTIONS} onChange={() => setRoomChoice(null)} />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Divider style={{ margin: '6px 0 14px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Text strong style={{ fontSize: 14 }}>Đợt đăng ký đang mở ({openPeriods.length})</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Chọn 1 đợt đủ điều kiện</Text>
          </div>

          {periodsLoading && <Skeleton active paragraph={{ rows: 2 }} />}
          {!periodsLoading && openPeriods.length === 0 && (
            <EmptyState description="Hiện tại không có đợt đăng ký KTX nào đang mở tiếp nhận." />
          )}

          <Row gutter={[12, 12]}>
            {openPeriods.map((p) => {
              const eligible = !p.eligibility || p.eligibility.eligible;
              const selected = effectivePeriodId === p.id;
              return (
                <Col xs={24} md={openPeriods.length === 4 ? 12 : 8} key={p.id}>
                  <div
                    role="button"
                    tabIndex={eligible ? 0 : -1}
                    onClick={() => { if (eligible) { setPeriodId(p.id); setRoomChoice(null); } }}
                    onKeyDown={(e) => eligible && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setPeriodId(p.id), setRoomChoice(null))}
                    style={{
                      height: '100%',
                      padding: '14px 16px',
                      borderRadius: 6,
                      border: `1px solid ${selected ? 'var(--brand)' : 'var(--line)'}`,
                      boxShadow: selected ? '0 0 0 1px var(--brand)' : 'none',
                      background: selected ? 'var(--brand-soft)' : '#FFFFFF',
                      opacity: eligible ? 1 : 0.55,
                      cursor: eligible ? 'pointer' : 'not-allowed',
                      transition: 'border-color 0.14s ease, background-color 0.14s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <StatusTag type="campus" value={p.campus} />
                      {selected && <CheckCircleFilled style={{ color: 'var(--brand)', fontSize: 15 }} />}
                    </div>
                    <Text strong style={{ display: 'block', fontSize: 13.5, lineHeight: 1.4, marginBottom: 6 }}>{p.name}</Text>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: p.eligibility ? 6 : 0 }}>
                      <StatusTag type="cohort" value={p.targetCohort} /> <span className="mono" style={{ marginLeft: 4 }}>{formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                    </div>
                    {p.eligibility && (
                      <div style={{ fontSize: 12, fontWeight: 500, color: eligible ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        {eligible ? '✓ Đủ điều kiện nộp đợt này' : `✕ ${p.eligibility.reason}`}
                      </div>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>

        <Row gutter={[16, 16]} align="top">
          <Col xs={24} lg={14}>
            <Card styles={{ body: { padding: 20 } }}>
              <div style={{ marginBottom: 14 }}>
                <Text strong style={{ fontSize: 15, display: 'block' }}>Chọn loại phòng nguyện vọng</Text>
                <Text type="secondary" style={{ fontSize: 12.5 }}>
                  Loại phòng hết chỗ tự động khóa. Khi nộp đơn, hệ thống lập tức giữ chỗ từ tầng thấp lên cao đúng giới tính.
                </Text>
              </div>

              {!activeGender ? (
                <div style={{ padding: '20px 16px', background: 'var(--surface-subtle)', borderRadius: 6, border: '1px dashed var(--line-strong)', textAlign: 'center' }}>
                  <Text type="secondary">Chọn <b>Giới tính</b> ở phía trên để hiển thị các loại phòng còn chỗ.</Text>
                </div>
              ) : roomsLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : roomTypes.length === 0 ? (
                <EmptyState description="Chưa có dữ liệu phòng cho đợt đăng ký này." />
              ) : (
                <Row gutter={[10, 10]}>
                  {roomTypes.map((t) => {
                    const locked = t.isFull || t.availableSlots <= 0;
                    const selected = !locked && selectedType?.key === t.key;
                    return (
                      <Col xs={24} sm={12} key={t.key}>
                        <button
                          type="button"
                          disabled={locked}
                          aria-disabled={locked}
                          onClick={() => !locked && setRoomChoice(t.key)}
                          style={{
                            width: '100%',
                            height: '100%',
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: `1px solid ${selected ? 'var(--brand)' : 'var(--line)'}`,
                            boxShadow: selected ? '0 0 0 1px var(--brand)' : 'none',
                            background: locked ? '#F8FAFC' : (selected ? 'var(--brand-soft)' : '#FFFFFF'),
                            opacity: locked ? 0.62 : 1,
                            cursor: locked ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            color: 'inherit',
                            display: 'block',
                            transition: 'border-color 0.14s ease, background-color 0.14s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                            <StatusTag type="roomTier" value={t.roomTier} />
                            <Text strong className="mono" style={{ fontSize: 13.5, color: locked ? 'var(--text-tertiary)' : 'var(--brand-hover)' }}>
                              {formatCurrency(t.pricePerMonth)}/th
                            </Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                            <Text strong style={{ fontSize: 13.5 }}>Phòng {t.capacity} người</Text>
                            {selected && <CheckCircleFilled style={{ color: 'var(--brand)', fontSize: 14 }} />}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 8 }}>
                            {locked ? (
                              <span className="haui-status" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', padding: '1px 7px' }}>
                                <LockOutlined style={{ fontSize: 11 }} /> Hết chỗ · Đã khóa
                              </span>
                            ) : (
                              <Text strong style={{ color: 'var(--success-text)', fontSize: 12 }}>Còn {t.availableSlots} chỗ</Text>
                            )}
                            <Text type="secondary" className="mono" style={{ fontSize: 11.5 }}>Cọc {formatCurrency(t.depositAmount)}</Text>
                          </div>
                        </button>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card styles={{ body: { padding: 20 } }}>
              <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>Gói kỳ hạn &amp; Dự tính phí</Text>
              <Radio.Group value={effectiveTerm} onChange={(e) => setTerm(e.target.value)} style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {allowedTerms.map((val) => {
                  const t = CONTRACT_TERM[val];
                  if (!t) return null;
                  const active = effectiveTerm === val;
                  return (
                    <Radio
                      key={val} value={val}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 6,
                        border: `1px solid ${active ? 'var(--brand)' : 'var(--line)'}`,
                        background: active ? 'var(--brand-soft)' : '#FFFFFF',
                        marginInlineEnd: 0,
                      }}
                    >
                      <Text strong style={{ fontSize: 13.5 }}>{t.label}</Text>{' '}
                      <Text type="secondary" style={{ fontSize: 12 }}>({t.hint})</Text>
                    </Radio>
                  );
                })}
              </Radio.Group>

              <Divider style={{ margin: '12px 0' }} />

              <Line label="Loại phòng">{wishLabel}</Line>
              {selectedType ? (
                <>
                  <Line label="Đơn giá" mono>{formatCurrency(estPrice)}/tháng</Line>
                  <Line label={`Tiền phòng (${String(months).replace('.', ',')} tháng)`} mono>{formatCurrency(estRoomFee)}</Line>
                  <Line label="Tiền cọc tài sản" mono>{formatCurrency(estDeposit)}</Line>
                  <Line label="Tổng nộp giữ chỗ" strong mono>{formatCurrency(estRoomFee + estDeposit)}</Line>
                </>
              ) : (
                <Text type="secondary" style={{ display: 'block', padding: '8px 0', fontSize: 13 }}>
                  {activeGender && !roomsLoading
                    ? `Hiện tất cả loại phòng cho ${GENDER[activeGender]?.label} đã hết chỗ.`
                    : 'Chọn giới tính và loại phòng còn chỗ để xem dự tính phí.'}
                </Text>
              )}

              <Button
                type="primary" size="large" block style={{ marginTop: 14 }}
                disabled={!effectivePeriodId || (!!activeGender && !roomsLoading && !selectedType)}
                onClick={nextToProfile}
              >
                Tiếp tục điền hồ sơ <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ---------- BƯỚC 2: HỒ SƠ CÁ NHÂN & XÁC NHẬN ---------- */}
      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <Row gutter={[16, 16]} align="top">
          <Col xs={24} lg={15}>
            <Card title="Hồ sơ sinh viên đăng ký" styles={{ body: { padding: 20 } }}>
              <Form form={profileForm} layout="vertical" autoComplete="off">
                <Row gutter={14}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ và tên' }]}>
                      <Input placeholder="VD: Nguyễn Văn An" maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="className" label="Lớp sinh hoạt" rules={[{ required: true, whitespace: true, message: 'Nhập lớp' }]}>
                      <Input placeholder="VD: CNTT01-K21" maxLength={30} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}>
                      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabledDate={(d) => !d.isBefore(dayjs(), 'day')} placeholder="Chọn ngày sinh" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="citizenId" label="Số CCCD (12 chữ số)"
                      rules={[{ required: true, whitespace: true, message: 'Nhập số CCCD' }, { pattern: /^\d{12}$/, message: 'Số CCCD gồm đúng 12 chữ số' }]}
                    >
                      <Input placeholder="VD: 001208012345" maxLength={12} inputMode="numeric" className="mono" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone" label="Số điện thoại"
                      rules={[{ required: true, message: 'Nhập số điện thoại' }, { pattern: /^0\d{9}$/, message: '10 chữ số, bắt đầu bằng 0' }]}
                    >
                      <Input placeholder="VD: 0912345678" maxLength={10} className="mono" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email" label="Email nhận kết quả & tài khoản"
                      rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không đúng định dạng' }]}
                    >
                      <Input placeholder="VD: an.nguyen@gmail.com" maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, whitespace: true, message: 'Nhập địa chỉ thường trú' }]}>
                      <Input placeholder="Số nhà, xã/phường, tỉnh/thành phố" maxLength={200} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider titlePlacement="start" style={{ margin: '4px 0 12px', fontSize: 13 }}>Người liên hệ khẩn cấp</Divider>
                <Row gutter={14}>
                  <Col xs={24} sm={9}>
                    <Form.Item name="emergencyName" label="Họ tên người thân" rules={[{ required: true, whitespace: true, message: 'Nhập họ tên người thân' }]}>
                      <Input maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="emergencyPhone" label="SĐT người thân"
                      rules={[{ required: true, message: 'Nhập SĐT người thân' }, { pattern: /^0\d{9}$/, message: '10 chữ số, bắt đầu bằng 0' }]}
                    >
                      <Input maxLength={10} className="mono" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={7}>
                    <Form.Item name="emergencyRelationship" label="Quan hệ" rules={[{ required: true, whitespace: true, message: 'Nhập quan hệ' }]}>
                      <Input placeholder="Bố / Mẹ" maxLength={30} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card title="Xác nhận đơn đăng ký" style={{ position: 'sticky', top: 82 }} styles={{ body: { padding: 20 } }}>
              <Line label="MSSV" mono>{step1Info?.studentCode}</Line>
              <Line label="Khoa / Giới tính">{step1Info?.faculty} · {GENDER[step1Info?.gender]?.label}</Line>
              <Line label="Đợt đăng ký">{activePeriod?.name}</Line>
              <Line label="Loại phòng">{wishLabel}</Line>
              <Line label="Xếp phòng">Tự động ngay khi nộp đơn</Line>
              <Line label="Gói thuê">{CONTRACT_TERM[effectiveTerm]?.label}</Line>
              {selectedType && (
                <>
                  <Divider style={{ margin: '10px 0' }} />
                  <Line label={`Tiền phòng (${String(months).replace('.', ',')} tháng)`} mono>{formatCurrency(estRoomFee)}</Line>
                  <Line label="Tiền cọc" mono>{formatCurrency(estDeposit)}</Line>
                  <Line label="Tổng nộp giữ chỗ" strong mono>{formatCurrency(estRoomFee + estDeposit)}</Line>
                </>
              )}

              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 14, fontSize: 13 }}>
                Tôi xác nhận thông tin trên là chính xác và đồng ý với nội quy KTX HaUI.
              </Checkbox>

              <Space orientation="vertical" size={8} style={{ width: '100%', marginTop: 14 }}>
                <Button type="primary" size="large" block disabled={!agreed} loading={submitting} onClick={handleSubmitAll}>
                  Gửi đơn đăng ký
                </Button>
                <Button block icon={<ArrowLeftOutlined />} onClick={() => goTo(0)} disabled={submitting}>Quay lại bước 1</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </PublicShell>
  );
}
