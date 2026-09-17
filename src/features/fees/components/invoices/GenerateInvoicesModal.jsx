import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Modal, Form, Select, DatePicker, Alert, Checkbox, Row, Col, Typography, Skeleton, Tag, App,
} from 'antd';
import { FileDoneOutlined, EyeOutlined, InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { feeApi } from '../../api/fee.api';
import { getErrorMessage, getFieldErrors } from '../../../../lib/axiosClient';
import { formatCurrency } from '../../../../utils/formatter';
import { periodLabel } from '../../utils/readingSheet';
import { defaultDueDateOf } from '../../utils/invoiceView';
import { roomLabelOf } from '../../../rooms/utils/roomStatus';

const { Text } = Typography;

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const ALL = 'all';

const PreviewStat = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', height: '100%' }}>
    <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
    <div style={{ fontSize: 22, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
  </div>
);

/**
 * SCR-53 Lập hóa đơn hàng loạt (FR-47, UC-04). Đổi tháng/năm/tòa → gọi xem trước (GET generation-preview, không ghi).
 * Nút xác nhận khóa tới khi tích "đã kiểm tra chỉ số" và khóa trong lúc gọi API để tránh bấm đúp.
 */
export default function GenerateInvoicesModal({ open, buildings, onCancel, onDone }) {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const now = dayjs();
  const month = Form.useWatch('month', form) ?? now.month() + 1;
  const year = Form.useWatch('year', form) ?? now.year();
  const building = Form.useWatch('building', form) ?? ALL;
  const confirmed = Form.useWatch('confirmed', form);
  const period = `${year}-${String(month).padStart(2, '0')}`;
  const isFuture = period > now.format('YYYY-MM');
  const buildingIds = building === ALL ? [] : [building];

  const [preview, setPreview] = useState({ key: null, data: null, error: null });
  const [submitting, setSubmitting] = useState(false);
  const previewKey = `${period}|${building}`;
  const previewLoading = open && !isFuture && preview.key !== previewKey;

  useEffect(() => {
    if (!open || isFuture) return undefined;
    let cancelled = false;
    feeApi.previewInvoiceGeneration({ billingPeriod: period, buildingIds })
      .then((res) => { if (!cancelled) setPreview({ key: previewKey, data: res.data.data, error: null }); })
      .catch((err) => { if (!cancelled) setPreview({ key: previewKey, data: null, error: getErrorMessage(err) }); });
    return () => { cancelled = true; };
    // buildingIds suy ra từ building — previewKey đã đủ để gọi lại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, previewKey, isFuture]);

  const data = preview.key === previewKey ? preview.data : null;
  const skipped = data?.skipped ?? [];
  const missing = skipped.filter((s) => s.code === 'NO_READING');
  const invoiced = skipped.filter((s) => s.code === 'ALREADY_INVOICED');
  const noResident = skipped.filter((s) => s.code === 'NO_RESIDENT');
  const willWrite = (data?.created ?? 0) + (data?.updated ?? 0);
  const roomText = (list) => list.map(roomLabelOf).join(', ');
  const firstMissingBuilding = buildings?.find((b) => b.code === missing[0]?.buildingCode)?.id;

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await feeApi.generateInvoices({
        billingPeriod: period, buildingIds, dueDate: values.dueDate.format('YYYY-MM-DD'),
      });
      onDone(res.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.filter((e) => ['dueDate'].includes(e.field)).map((e) => ({ name: e.field, errors: [e.message] })));
      modal.error({ title: 'Không lập được hóa đơn', content: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const okText = willWrite ? `Lập ${data.created} hóa đơn${data.updated ? ` · bổ sung ${data.updated}` : ''}` : 'Lập hóa đơn';

  return (
    <Modal
      open={open}
      title={<span><FileDoneOutlined style={{ color: '#1677FF', marginRight: 8 }} />Lập hóa đơn hàng loạt</span>}
      okText={okText}
      cancelText="Hủy"
      onOk={() => form.submit()}
      onCancel={onCancel}
      okButtonProps={{ disabled: !confirmed || !willWrite || previewLoading || isFuture, icon: <FileDoneOutlined /> }}
      confirmLoading={submitting}
      mask={{ closable: false }}
      closable={!submitting}
      destroyOnHidden
      width={720}
    >
      <Form
        form={form} layout="vertical" onFinish={handleSubmit} requiredMark
        initialValues={{
          month: now.month() + 1, year: now.year(), building: ALL, confirmed: false,
          dueDate: defaultDueDateOf(now.format('YYYY-MM')),
        }}
        onValuesChange={(changed, all) => {
          // Đổi kỳ → hạn thanh toán về mặc định của kỳ mới; đổi phạm vi → phải kiểm tra lại
          if ('month' in changed || 'year' in changed) {
            form.setFieldsValue({ dueDate: defaultDueDateOf(`${all.year}-${String(all.month).padStart(2, '0')}`), confirmed: false });
          }
          if ('building' in changed) form.setFieldsValue({ confirmed: false });
        }}
      >
        <Row gutter={16}>
          <Col xs={12} md={8}>
            <Form.Item name="month" label="Tháng" required>
              <Select options={MONTHS} aria-label="Tháng" />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item name="year" label="Năm" required>
              <Select options={[now.year() - 1, now.year()].map((y) => ({ value: y, label: String(y) }))} aria-label="Năm" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="dueDate" label="Hạn thanh toán" rules={[{ required: true, message: 'Chọn hạn thanh toán' }]}>
              <DatePicker
                style={{ width: '100%' }} format="DD/MM/YYYY" allowClear={false}
                disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="building" label="Tòa nhà áp dụng" required extra="Hệ thống quét các phòng có sinh viên đang ở (hợp đồng còn hiệu lực).">
          <Select
            aria-label="Tòa nhà áp dụng"
            options={[
              { value: ALL, label: `Tất cả các tòa${buildings?.length ? ` (${buildings.map((b) => b.name).join(', ')})` : ''}` },
              ...(buildings || []).map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
        </Form.Item>

        {isFuture && <Alert type="error" showIcon style={{ marginBottom: 16 }} title={`${periodLabel(period)} chưa tới — không lập hóa đơn trước được`} />}
        {preview.error && preview.key === previewKey && (
          <Alert
            type="error" showIcon style={{ marginBottom: 16 }}
            title="Không xem trước được kết quả lập hóa đơn — chưa lập được từ màn này"
            description={preview.error}
          />
        )}

        {missing.length > 0 && (
          <Alert
            type="warning" showIcon style={{ marginBottom: 16 }}
            title={`Chưa nhập chỉ số điện nước cho ${missing.length} phòng: ${roomText(missing)}`}
            description={(
              <span>
                Các phòng này bị bỏ qua trong đợt lập hóa đơn này.{' '}
                <Link to={`/admin/utility-readings?period=${period}${firstMissingBuilding ? `&buildingId=${firstMissingBuilding}` : ''}`}>
                  Nhập ngay <ArrowRightOutlined />
                </Link>
              </span>
            )}
          />
        )}

        {!isFuture && (
          <div style={{ background: '#F5F7FA', borderRadius: 10, padding: 16, marginBottom: 16 }} aria-label="Xem trước kết quả lập hóa đơn">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
              <Text strong><EyeOutlined style={{ marginRight: 6 }} />Xem trước kết quả lập hóa đơn · {periodLabel(period)}</Text>
              <Tag style={{ margin: 0 }}>Dữ liệu tạm tính</Tag>
            </div>
            {previewLoading || !data ? <Skeleton active paragraph={{ rows: 2 }} title={false} /> : (
              <>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={8}><PreviewStat label="Sinh viên đủ điều kiện" value={data.eligibleStudents} /></Col>
                  <Col xs={24} sm={8}>
                    <PreviewStat
                      label="Hóa đơn sẽ tạo / bổ sung"
                      value={<>{data.created} HĐ{data.updated ? <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}> + bổ sung {data.updated}</Text> : null}</>}
                      color="#1677FF"
                    />
                  </Col>
                  <Col xs={24} sm={8}><PreviewStat label="Tổng tiền dự kiến" value={formatCurrency(data.totalAmount)} color="#389E0D" /></Col>
                </Row>
                <div style={{ marginTop: 12, fontSize: 13, display: 'grid', gap: 4 }}>
                  {data.updated > 0 && (
                    <Text type="secondary"><InfoCircleOutlined /> {data.updated} sinh viên đã có hóa đơn tháng này (tháng đầu ở) — chỉ bổ sung tiền điện nước vào hóa đơn đó (BR-48)</Text>
                  )}
                  {missing.length > 0 && <Text type="secondary"><InfoCircleOutlined /> Bỏ qua {missing.length} phòng thiếu chỉ số điện nước</Text>}
                  {invoiced.length > 0 && <Text type="secondary"><InfoCircleOutlined /> {invoiced.length} phòng đã lập hóa đơn kỳ này: {roomText(invoiced)}</Text>}
                  {noResident.length > 0 && <Text type="secondary"><InfoCircleOutlined /> {noResident.length} phòng trống không lập: {roomText(noResident)}</Text>}
                  {!willWrite && <Text type="warning"><InfoCircleOutlined /> Không có hóa đơn nào để lập cho phạm vi này</Text>}
                </div>
              </>
            )}
          </div>
        )}

        <Form.Item name="confirmed" valuePropName="checked" style={{ marginBottom: 0 }}>
          <Checkbox disabled={!willWrite || previewLoading}>
            <Text strong>Tôi đã kiểm tra chỉ số điện nước và xác nhận lập hóa đơn</Text>
            <div><Text type="secondary" style={{ fontSize: 13 }}>Hóa đơn hiện ngay trong cổng sinh viên sau khi lập. Chỉ số điện nước của các phòng đã lập sẽ bị khóa.</Text></div>
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
