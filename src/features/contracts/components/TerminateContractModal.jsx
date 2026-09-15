import { useState } from 'react';
import {
  Modal, Form, Input, DatePicker, Alert, Typography, Divider, App,
} from 'antd';
import dayjs from 'dayjs';
import { contractApi } from '../api/contract.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import { bedTextOf } from '../utils/contractView';

const { Text } = Typography;
const MIN_REASON = 10;

function Line({ label, value, strong, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <Text strong={strong}>{label}</Text>
      <Text strong style={{ color }}>{value}</Text>
    </div>
  );
}

/**
 * Chấm dứt hợp đồng trước hạn (FR-38) — hành động không hoàn tác, nêu rõ hậu quả (NFR-11).
 * Số tiền trong modal là tạm tính; con số chốt do backend trả về trong `settlement`.
 */
export default function TerminateContractModal({ contract, open, onCancel, onTerminated }) {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!contract) return null;
  const estimatedRefund = contract.depositAmount - (contract.totalDebt || 0);

  const handleSubmit = async ({ reason, terminationDate }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await contractApi.terminate(contract.id, {
        reason: reason.trim(),
        terminationDate: terminationDate.format('YYYY-MM-DD'),
      });
      const { settlement } = res.data.data;
      onTerminated();
      modal.success({
        title: `Đã chấm dứt hợp đồng ${contract.contractCode}`,
        content: (
          <div style={{ marginTop: 8 }}>
            <Line label="Tiền cọc" value={formatCurrency(settlement.depositAmount)} />
            <Line label="Trừ công nợ" value={`− ${formatCurrency(settlement.outstandingDebt)}`} />
            <Divider style={{ margin: '8px 0' }} />
            {settlement.studentStillOwes > 0
              ? <Line strong label="Sinh viên còn phải nộp thêm" value={formatCurrency(settlement.studentStillOwes)} color="#CF1322" />
              : <Line strong label="Hoàn trả cho sinh viên" value={formatCurrency(settlement.refundAmount)} color="#389E0D" />}
            {settlement.cancelledSupplyOrders > 0 && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                Đã tự hủy {settlement.cancelledSupplyOrders} đơn nhu yếu phẩm chưa thanh toán.
              </Text>
            )}
          </div>
        ),
        okText: 'Đóng',
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setError(getErrorCode(err) === 'CONTRACT_NOT_ACTIVE' ? `${getErrorMessage(err)}. Tải lại danh sách để xem trạng thái mới.` : getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Chấm dứt hợp đồng ${contract.contractCode}`}
      okText="Chấm dứt hợp đồng"
      okButtonProps={{ danger: true }}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
    >
      <Alert
        type="warning" showIcon style={{ marginBottom: 16 }}
        title="Không thể hoàn tác"
        description={(
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            <li>Giường {bedTextOf(contract.bedCode)} trả về trống, lưu trú của {contract.studentName} bị đóng.</li>
            <li>Đơn nhu yếu phẩm chưa thanh toán của sinh viên tự hủy{contract.unpaidSupplyOrders ? ` (${contract.unpaidSupplyOrders} đơn)` : ''}.</li>
            <li>Tiền phòng kỳ đang ở tính theo số ngày ở thực tế, rồi quyết toán với tiền cọc.</li>
          </ul>
        )}
      />
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>QUYẾT TOÁN TẠM TÍNH</Text>
        <Line label="Tiền cọc đã nộp" value={formatCurrency(contract.depositAmount)} />
        <Line label="Công nợ hiện tại" value={`− ${formatCurrency(contract.totalDebt || 0)}`} />
        <Divider style={{ margin: '6px 0' }} />
        {estimatedRefund >= 0
          ? <Line strong label="Dự kiến hoàn trả" value={formatCurrency(estimatedRefund)} color="#389E0D" />
          : <Line strong label="Dự kiến sinh viên nộp thêm" value={formatCurrency(-estimatedRefund)} color="#CF1322" />}
        <Text type="secondary" style={{ fontSize: 12 }}>Chưa gồm tiền phòng kỳ dở — số chính xác hiện sau khi xác nhận.</Text>
      </div>

      <Form
        form={form} layout="vertical" onFinish={handleSubmit}
        initialValues={{ terminationDate: dayjs().startOf('day') }}
      >
        <Form.Item
          name="terminationDate" label="Ngày chấm dứt" rules={[{ required: true, message: 'Chọn ngày chấm dứt' }]}
          extra={`Trong thời hạn hợp đồng: ${dayjs(contract.startDate).format('DD/MM/YYYY')} – ${dayjs(contract.endDate).format('DD/MM/YYYY')}`}
        >
          <DatePicker
            format="DD/MM/YYYY" style={{ width: '100%' }}
            disabledDate={(d) => d.isBefore(dayjs(contract.startDate), 'day') || d.isAfter(dayjs(contract.endDate), 'day')}
          />
        </Form.Item>
        <Form.Item
          name="reason" label="Lý do chấm dứt"
          rules={[
            { required: true, whitespace: true, message: 'Nhập lý do chấm dứt' },
            { validator: (_, v) => (!v || v.trim().length >= MIN_REASON ? Promise.resolve() : Promise.reject(new Error(`Lý do tối thiểu ${MIN_REASON} ký tự`))) },
          ]}
        >
          <Input.TextArea rows={3} maxLength={500} showCount placeholder="VD: Sinh viên vi phạm nội quy nhiều lần, đã lập biên bản" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
