import { useState } from 'react';
import {
  Modal, Form, Radio, Input, Select, Alert, Typography, Skeleton, Button, Space, App,
} from 'antd';
import {
  WalletOutlined, QrcodeOutlined, PrinterOutlined, FileTextOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { useAuth } from '../../../../context/AuthContext';
import { feeApi } from '../../api/fee.api';
import { paymentApi } from '../../../payments/api/payment.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../../lib/axiosClient';
import { formatCurrency, formatDate } from '../../../../utils/formatter';
import PaymentReceipt from '../../../payments/components/PaymentReceipt';
import { printReceipt } from '../../../payments/utils/printReceipt';
import { isPastDue, subjectOf, transferContentOf } from '../../utils/invoiceView';

const { Text } = Typography;

/**
 * Thu tiền một hóa đơn (tiền mặt / đối soát VietQR thủ công / Giả lập Webhook VietQR tự động).
 * Khi đóng đủ phí đầu kỳ của hợp đồng `pending_payment`, BE tự kích hoạt `active` & sinh mã QR Check-in.
 */
export default function CollectPaymentModal({ invoiceId, open, onClose }) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { modal, notification } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const { data: inv, error: loadError } = useApi(
    () => (open && invoiceId ? feeApi.getInvoiceById(invoiceId) : Promise.resolve({ data: { data: null } })),
    [open, invoiceId],
  );
  const ready = inv && inv.id === invoiceId;
  const method = Form.useWatch('method', form) ?? 'cash';

  const close = () => {
    const changed = !!receipt;
    setReceipt(null);
    setError(null);
    form.resetFields();
    onClose(changed);
  };

  const submit = async (values) => {
    setSaving(true);
    setError(null);
    const body = {
      invoiceId: inv.id,
      payerStudentId: inv.scope === 'room' ? values.payerStudentId : undefined,
      note: values.note?.trim() || undefined,
    };
    try {
      let res;
      if (values.method === 'simulate') {
        res = await paymentApi.simulateWebhook({ invoiceId: inv.id, payerStudentId: body.payerStudentId });
      } else if (values.method === 'vietqr') {
        res = await paymentApi.confirmVietqr({ ...body, transactionCode: values.transactionCode?.trim() || undefined });
      } else {
        res = await paymentApi.collectCash(body);
      }
      setReceipt(res.data.data);
      if (res.data.data?.contractActivated) {
        notification.success({
          title: 'Hợp đồng đã tự động kích hoạt!',
          description: `Mã QR Check-in: ${res.data.data.checkinCode || 'đã gửi về Cổng SV & Email'}.`,
          duration: 8,
        });
      }
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else if (code === 'INVOICE_ALREADY_PAID') {
        modal.warning({ title: 'Hóa đơn đã được thu', content: getErrorMessage(err), onOk: () => { setError(null); form.resetFields(); onClose(true); } });
      } else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const subject = ready ? subjectOf(inv) : null;

  return (
    <Modal
      open={open}
      title={receipt ? 'Đã ghi nhận thanh toán' : 'Thu tiền / Đối soát hóa đơn'}
      onCancel={close}
      mask={{ closable: false }}
      destroyOnHidden
      width={580}
      footer={receipt ? (
        <Space>
          <Button icon={<PrinterOutlined />} onClick={printReceipt}>In biên lai</Button>
          <Button type="primary" onClick={close}>Xong</Button>
        </Space>
      ) : (
        <Space>
          <Button onClick={close}>Hủy</Button>
          <Button type="primary" loading={saving} disabled={!ready || inv.status !== 'unpaid'} onClick={() => form.submit()}>
            {method === 'simulate'
              ? 'Giả lập Webhook báo có'
              : (ready ? `Xác nhận đã thu ${formatCurrency(inv.amount)}` : 'Xác nhận đã thu')}
          </Button>
        </Space>
      )}
    >
      {receipt && <PaymentReceipt payment={receipt.payment} invoice={receipt.invoice} />}

      {!receipt && loadError && <Alert type="error" showIcon title={loadError} />}
      {!receipt && !loadError && !ready && <Skeleton active paragraph={{ rows: 5 }} />}

      {!receipt && ready && (
        <>
          <div style={{ background: '#F5F7FA', borderRadius: 10, padding: '12px 16px', margin: '8px 0 16px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div><Text strong>{subject.name}</Text> {subject.sub && <Text type="secondary">({subject.sub})</Text>}</div>
              <Text type="secondary" style={{ fontSize: 13 }}><FileTextOutlined /> {inv.invoiceCode} · {inv.description}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text strong style={{ fontSize: 20, color: '#CF1322' }}>{formatCurrency(inv.amount)}</Text>
              <div><Text type={isPastDue(inv) ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>Hạn {formatDate(inv.dueDate)}</Text></div>
            </div>
          </div>

          {inv.status !== 'unpaid' && <Alert type="info" showIcon title="Hóa đơn này không còn ở trạng thái Chưa thanh toán" style={{ marginBottom: 16 }} />}
          {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

          <Form form={form} layout="vertical" onFinish={submit} initialValues={{ method: 'cash' }} disabled={inv.status !== 'unpaid'}>
            <Form.Item name="method" label="Hình thức ghi nhận" required>
              <Radio.Group
                style={{ display: 'grid', gap: 8 }}
                options={[
                  { value: 'cash', label: <span><WalletOutlined /> Tiền mặt tại văn phòng KTX</span> },
                  { value: 'vietqr', label: <span><QrcodeOutlined /> Đối soát VietQR thủ công (theo sao kê)</span> },
                  { value: 'simulate', label: <span><ThunderboltOutlined style={{ color: '#FAAD14' }} /> Giả lập Webhook VietQR tự động (Demo ngân hàng báo có)</span> },
                ]}
              />
            </Form.Item>

            {inv.scope === 'room' && (
              <Form.Item
                name="payerStudentId" label="Người nộp (đại diện cả phòng)"
                rules={[{ required: true, message: 'Chọn sinh viên đại diện nộp tiền' }]}
                extra="Một bạn nộp đủ cho cả phòng (BR-03)."
              >
                <Select
                  placeholder="Chọn sinh viên đang ở phòng"
                  options={(inv.members || []).map((m) => ({ value: m.id, label: `${m.fullName} (${m.studentCode})` }))}
                  notFoundContent="Phòng không còn ai ở"
                />
              </Form.Item>
            )}

            {method === 'vietqr' && (
              <>
                <Alert
                  type="info" showIcon style={{ marginBottom: 16 }}
                  title={<>Dò sao kê theo nội dung <Text code copyable>{transferContentOf(inv)}</Text></>}
                  description="Chỉ xác nhận khi tiền đã vào tài khoản KTX đúng số tiền này."
                />
                <Form.Item
                  name="transactionCode" label="Mã giao dịch ngân hàng"
                  extra="Không bắt buộc. Ghi mã để hệ thống chống xác nhận trùng."
                  normalize={(v) => (v || '').toUpperCase()}
                >
                  <Input placeholder="VD: FT26256891042" maxLength={50} style={{ fontFamily: 'ui-monospace, Consolas, monospace' }} />
                </Form.Item>
              </>
            )}

            {method === 'simulate' && (
              <Alert
                type="warning" showIcon style={{ marginBottom: 16 }}
                title="Giả lập ngân hàng gửi Webhook VietQR thành công"
                description="Hệ thống tự gạch nợ hóa đơn, sinh mã giao dịch FT..., và nếu là khoản đầu kỳ cuối cùng của hợp đồng Chờ đóng phí thì sẽ tự kích hoạt hợp đồng + cấp mã QR Check-in ngay lập tức!"
              />
            )}

            {method !== 'simulate' && (
              <Form.Item name="note" label="Ghi chú" style={{ marginBottom: 8 }}>
                <Input.TextArea rows={2} maxLength={300} placeholder="Không bắt buộc" />
              </Form.Item>
            )}
          </Form>
          <Text type="secondary" style={{ fontSize: 13 }}>Người thực hiện: <Text>{user?.fullName}</Text></Text>
        </>
      )}
    </Modal>
  );
}
