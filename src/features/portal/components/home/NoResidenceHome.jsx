import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Grid, Typography, Skeleton, Alert, Modal, Form, Select, Radio, App, Space,
} from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { applyApi } from '../../../apply/api/apply.api';
import { CONTRACT_TERM, ROOM_TIER } from '../../../../constants/statuses';
import { getErrorMessage } from '../../../../lib/axiosClient';
import { formatCurrency, formatDate } from '../../../../utils/formatter';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/**
 * Sinh viên chưa có chỗ ở hiện tại — đăng ký lại / gia hạn tự động xếp phòng ngay
 */
export default function NoResidenceHome({ profile, onApplied }) {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { message, notification } = App.useApp();
  const [applyOpen, setApplyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: contracts, loading, error, refetch } = useApi(() => portalApi.getMyContracts(), []);
  const { data: openPeriods } = useApi(
    () => (applyOpen && profile?.studentCode
      ? applyApi.getOpenPeriods({ studentCode: profile.studentCode, faculty: profile.faculty })
      : Promise.resolve({ data: { data: [] } })),
    [applyOpen, profile?.studentCode, profile?.faculty],
  );

  const selectedPeriodId = Form.useWatch('periodId', form);
  const eligiblePeriods = (Array.isArray(openPeriods) ? openPeriods : []).filter((p) => !p.eligibility || p.eligibility.eligible);
  const selectedPeriod = eligiblePeriods.find((p) => p.id === selectedPeriodId);

  const { meta: roomsMeta } = useApi(
    () => (applyOpen && selectedPeriodId && profile?.gender
      ? applyApi.getAvailableRooms({ periodId: selectedPeriodId, gender: profile.gender, limit: 100 })
      : Promise.resolve({ data: { data: { items: [], roomTypes: [] } } })),
    [applyOpen, selectedPeriodId, profile?.gender],
  );

  const roomTypeOptions = useMemo(() => {
    const types = Array.isArray(roomsMeta?.roomTypes) ? roomsMeta.roomTypes : [];
    return types.map((t) => {
      const locked = t.isFull || t.availableSlots <= 0;
      return {
        value: t.key,
        disabled: locked,
        label: locked
          ? `${ROOM_TIER[t.roomTier]?.label || t.roomTier} · ${t.capacity} người — ${formatCurrency(t.pricePerMonth)}/th (Hết chỗ · Đã khóa)`
          : `${ROOM_TIER[t.roomTier]?.label || t.roomTier} · ${t.capacity} người — ${formatCurrency(t.pricePerMonth)}/th (Còn ${t.availableSlots} chỗ)`,
      };
    });
  }, [roomsMeta]);

  const handlePortalApply = async (values) => {
    setSaving(true);
    try {
      const [tier, cap] = String(values.roomChoice || '').split('__');
      const res = await portalApi.applyFromPortal({
        periodId: values.periodId,
        term: values.term,
        preferredRoomTier: tier,
        preferredCapacity: Number(cap),
      });
      const created = res.data.data;
      notification.success({
        title: created?.room
          ? `Đã tự động xếp Phòng ${roomLabelOf(created.room)}`
          : 'Đăng ký KTX thành công',
        description: res.data.message || 'Phòng đã được giữ chỗ. Vui lòng thanh toán VietQR trước hạn để kích hoạt hợp đồng.',
      });
      setApplyOpen(false);
      form.resetFields();
      refetch();
      onApplied?.();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const latest = (contracts || [])[0];

  if (error) return <Alert type="error" showIcon title={error} />;
  if (loading && !contracts) return <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>;

  const internalApplyModal = (
    <Modal
      open={applyOpen}
      title="Đăng ký / Gia hạn KTX Cơ sở 1"
      okText="Đăng ký & Xếp phòng ngay"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={() => setApplyOpen(false)}
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={handlePortalApply} style={{ marginTop: 12 }}>
        {eligiblePeriods.length === 0 ? (
          <Alert type="info" showIcon title="Hiện chưa có đợt đăng ký nào mở phù hợp với khóa/ngành của bạn" />
        ) : (
          <>
            <Form.Item name="periodId" label="Chọn Đợt đăng ký đang mở" rules={[{ required: true, message: 'Chọn đợt đăng ký' }]}>
              <Select
                placeholder="Chọn đợt đăng ký"
                options={eligiblePeriods.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${formatDate(p.startDate)} → ${formatDate(p.endDate)})`,
                }))}
                onChange={() => form.setFieldsValue({ roomChoice: undefined, term: undefined })}
              />
            </Form.Item>

            <Form.Item
              name="roomChoice"
              label="Chọn loại phòng nguyện vọng"
              extra="Loại phòng hết chỗ tự động khóa. Hệ thống tự động duyệt & xếp phòng từ tầng thấp lên cao ngay khi nộp."
              rules={[{ required: true, message: 'Chọn loại phòng còn chỗ' }]}
            >
              <Select
                placeholder={selectedPeriodId ? 'Chọn loại phòng còn chỗ' : 'Chọn đợt đăng ký trước'}
                disabled={!selectedPeriodId}
                options={roomTypeOptions}
              />
            </Form.Item>

            <Form.Item name="term" label="Gói kỳ hạn" rules={[{ required: true, message: 'Chọn kỳ hạn' }]}>
              <Radio.Group
                disabled={!selectedPeriod}
                options={(selectedPeriod?.allowedTerms || []).map((t) => ({
                  value: t,
                  label: CONTRACT_TERM[t]?.label || t,
                }))}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );

  const ended = latest?.status === 'terminated' || latest?.status === 'expired';
  const cancelled = latest?.status === 'cancelled';
  return (
    <>
      <Card style={{ borderLeft: '4px solid var(--brand)' }} styles={{ body: { padding: '24px 26px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--brand-hover)', marginBottom: 6 }}>
              Đăng ký lại / Gia hạn nội trú
            </div>
            <Title level={4} style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 700 }}>
              {ended ? 'Hợp đồng KTX kỳ trước đã kết thúc' : 'Hiện bạn chưa có hợp đồng nội trú hiệu lực'}
            </Title>
            <Text type="secondary" style={{ fontSize: 13.5, display: 'block', maxWidth: 580 }}>
              {ended && `Hợp đồng ${latest.contractCode} đã kết thúc ngày ${formatDate(latest.terminatedAt || latest.endDate)}. `}
              {cancelled && `Đơn ${latest.contractCode} trước đó đã bị hủy. `}
              Bạn có thể đăng ký ở lại kỳ mới trực tiếp bằng hồ sơ sinh viên sẵn có mà không cần nhập lại thông tin.
            </Text>
            {ended && (
              <div style={{ marginTop: 10 }}>
                <span
                  className="haui-status"
                  style={latest.isDepositRefunded
                    ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
                    : { background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
                >
                  <span className="haui-status-dot" style={{ background: latest.isDepositRefunded ? '#16A34A' : '#D97706' }} />
                  {latest.isDepositRefunded
                    ? `Đã hoàn cọc ${formatCurrency(latest.depositRefundAmount)} ngày ${formatDate(latest.depositRefundedAt)}`
                    : `Chờ nhận lại cọc ${formatCurrency(latest.depositAmount)} — liên hệ văn phòng KTX`}
                </span>
              </div>
            )}
          </div>
          <Space orientation="vertical" size={8} style={{ width: screens.sm ? 210 : '100%' }}>
            <Button type="primary" size="large" block onClick={() => setApplyOpen(true)}>
              Đăng ký KTX nội bộ <ArrowRightOutlined />
            </Button>
            <Button block onClick={() => navigate('/')}>
              Xem bảng giá &amp; đợt mở
            </Button>
          </Space>
        </div>
      </Card>
      {internalApplyModal}
    </>
  );
}
