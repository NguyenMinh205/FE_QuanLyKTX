import { useState } from 'react';
import {
  Modal, Form, Radio, Input, Select, Alert, Typography, Skeleton, Button, Space, App,
} from 'antd';
import {
  WalletOutlined, QrcodeOutlined, PrinterOutlined, FileTextOutlined,
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
 * Thu tiền một hóa đơn (FR-52 tiền mặt, FR-54 xác nhận VietQR). Luôn thu đủ, không có thu một phần.
 * Hóa đơn điện nước: chọn bạn đại diện nộp cho cả phòng (D5). Thu xong hiện biên lai ngay trong modal (UC-06).
 * Tự tải lại chi tiết hóa đơn khi mở: cần danh sách thành viên phòng và trạng thái mới nhất.
 */
export default function CollectPaymentModal({ invoiceId, open, onClose }) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { modal } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null); // { payment, invoice } sau khi thu

  const { data: inv, error: loadError } = useApi(
    () => (open && invoiceId ? feeApi.getInvoiceById(invoiceId) : Promise.resolve({ data: { data: null } })),
    [open, invoiceId],
  );
  const ready = inv && inv.id === invoiceId;
  const method = Form.useWatch('method', form) ?? 'cash';

  // ⚠️ Modal luôn được gắn sẵn ở trang cha: đóng mà không xoá thì lần mở hóa đơn khác vẫn hiện biên lai cũ
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
      const res = values.method === 'vietqr'
        ? await paymentApi.confirmVietqr({ ...body, transactionCode: values.transactionCode?.trim() || undefined })
        : await paymentApi.collectCash(body);
      setReceipt(res.data.data);
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else if (code === 'INVOICE_ALREADY_PAID') {
        // Người khác vừa thu — đóng và tải lại để thấy trạng thái mới
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
      title={receipt ? 'Đã thu tiền' : 'Thu tiền hóa đơn'}
      onCancel={close}
      mask={{ closable: false }}
      destroyOnHidden
      width={560}
      footer={receipt ? (
        <Space>
          <Button icon={<PrinterOutlined />} onClick={printReceipt}>In biên lai</Button>
          <Button type="primary" onClick={close}>Xong</Button>
        </Space>
      ) : (
        <Space>
          <Button onClick={close}>Hủy</Button>
          <Button type="primary" loading={saving} disabled={!ready || inv.status !== 'unpaid'} onClick={() => form.submit()}>
            {ready ? `Xác nhận đã thu ${formatCurrency(inv.amount)}` : 'Xác nhận đã thu'}
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

          {inv.status !== 'unpaid' && <Alert type="info" showIcon title="Hóa đơn này đã được thanh toán" style={{ marginBottom: 16 }} />}
          {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

          <Form form={form} layout="vertical" onFinish={submit} initialValues={{ method: 'cash' }} disabled={inv.status !== 'unpaid'}>
            <Form.Item name="method" label="Hình thức" required>
              <Radio.Group
                aria-label="Hình thức thanh toán"
                options={[
                  { value: 'cash', label: <span><WalletOutlined /> Tiền mặt tại văn phòng</span> },
                  { value: 'vietqr', label: <span><QrcodeOutlined /> Đã nhận chuyển khoản VietQR</span> },
                ]}
              />
            </Form.Item>

            {inv.scope === 'room' && (
              <Form.Item
                name="payerStudentId" label="Người nộp (đại diện cả phòng)"
                rules={[{ required: true, message: 'Chọn bạn đã nộp tiền' }]}
                extra="Một bạn nộp đủ cho cả phòng. Tên này hiện cho các bạn cùng phòng ở Cổng sinh viên."
              >
                <Select
                  aria-label="Người nộp" placeholder="Chọn sinh viên đang ở phòng"
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
                  description="Chỉ xác nhận khi tiền đã vào tài khoản ký túc xá đúng số tiền này."
                />
                <Form.Item
                  name="transactionCode" label="Mã giao dịch ngân hàng"
                  extra="Không bắt buộc. Ghi vào thì hệ thống chặn xác nhận trùng một giao dịch."
                  normalize={(v) => (v || '').toUpperCase()}
                >
                  <Input placeholder="VD: FT26256891042" maxLength={50} style={{ fontFamily: 'ui-monospace, Consolas, monospace' }} />
                </Form.Item>
              </>
            )}

            <Form.Item name="note" label="Ghi chú" style={{ marginBottom: 8 }}>
              <Input.TextArea rows={2} maxLength={300} placeholder="Không bắt buộc" />
            </Form.Item>
          </Form>
          <Text type="secondary" style={{ fontSize: 13 }}>Người thu: <Text>{user?.fullName}</Text></Text>
        </>
      )}
    </Modal>
  );
}
