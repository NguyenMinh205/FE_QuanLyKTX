import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Result, Button, Typography, Spin, Space, Descriptions,
} from 'antd';
import {
  CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined, ReloadOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { portalApi } from '../api/portal.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { PAYMENT_METHOD } from '../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';

const { Text } = Typography;

const MAX_TRIES = 5;      // hỏi lại tối đa 5 lần…
const RETRY_DELAY = 2000; // …cách nhau 2 giây (webhook có thể về chậm)

/**
 * SCR-65 Kết quả thanh toán (FR-52 → FR-56).
 * Quan trọng: khi chưa chắc chắn thì KHÔNG báo thất bại — chỉ báo "đang xử lý" kèm nút kiểm tra lại.
 */
export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref');
  const transactionRef = refFromUrl || (() => {
    try { return sessionStorage.getItem('lastPaymentRef'); } catch { return null; }
  })();

  const [state, setState] = useState(() => ({
    status: transactionRef ? 'checking' : 'missing', payment: null, error: null, tries: 0,
  }));
  const [round, setRound] = useState(0); // bấm "Kiểm tra lại" → chạy lại vòng hỏi
  const timer = useRef(null);

  useEffect(() => {
    if (!transactionRef) return undefined;
    let cancelled = false;
    const wait = (ms) => new Promise((resolve) => { timer.current = setTimeout(resolve, ms); });

    (async () => {
      for (let attempt = 1; attempt <= MAX_TRIES && !cancelled; attempt += 1) {
        try {
          const res = await portalApi.getMyPayments({ transactionRef });
          const body = res.data?.data;
          const list = Array.isArray(body) ? body : body?.items || [];
          const payment = list.find((p) => p.transactionRef === transactionRef) || null;
          const status = payment?.status === 'completed' ? 'success' : payment?.status;
          if (cancelled) return;

          if (['success', 'failed', 'expired'].includes(status)) {
            setState({ status, payment, error: null, tries: attempt });
            return;
          }
          setState({ status: 'checking', payment, error: null, tries: attempt });
        } catch (err) {
          if (!cancelled) setState({ status: 'error', payment: null, error: getErrorMessage(err), tries: attempt });
          return;
        }
        if (attempt < MAX_TRIES) await wait(RETRY_DELAY);
      }
      // Hỏi đủ số lần mà cổng vẫn chưa trả lời: KHÔNG kết luận thất bại
      if (!cancelled) setState((s) => ({ ...s, status: 'processing' }));
    })();

    return () => { cancelled = true; clearTimeout(timer.current); };
  }, [transactionRef, round]);

  const retry = () => { setState({ status: 'checking', payment: null, error: null, tries: 0 }); setRound((r) => r + 1); };
  const goInvoices = (invoiceId) => navigate(invoiceId ? `/portal/my-invoices?invoice=${invoiceId}` : '/portal/my-invoices');

  const { status, payment, error, tries } = state;

  const details = payment && (
    <Descriptions column={1} size="small" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
      <Descriptions.Item label="Số tiền">{formatCurrency(payment.amount)}</Descriptions.Item>
      <Descriptions.Item label="Mã giao dịch"><Text code>{payment.transactionRef}</Text></Descriptions.Item>
      {payment.gatewayTransactionId && <Descriptions.Item label="Mã cổng thanh toán"><Text code>{payment.gatewayTransactionId}</Text></Descriptions.Item>}
      <Descriptions.Item label="Hình thức">{PAYMENT_METHOD[payment.method]?.label ?? payment.method}</Descriptions.Item>
      {payment.paidAt && <Descriptions.Item label="Thời gian">{formatDateTime(payment.paidAt)}</Descriptions.Item>}
      {payment.invoiceCode && <Descriptions.Item label="Hóa đơn"><Text code>{payment.invoiceCode}</Text></Descriptions.Item>}
    </Descriptions>
  );

  if (status === 'missing') {
    return (
      <Card>
        <Result
          status="warning"
          title="Không có giao dịch để kiểm tra"
          subTitle="Đường dẫn thiếu mã giao dịch. Bạn xem lại hóa đơn để biết tình trạng thanh toán."
          extra={<Button type="primary" onClick={() => goInvoices()}>Về trang Hóa đơn</Button>}
        />
      </Card>
    );
  }

  if (status === 'checking') {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}><Text strong style={{ fontSize: 16 }}>Đang kiểm tra giao dịch…</Text></div>
          <Text type="secondary">Cổng thanh toán có thể mất vài giây để báo kết quả (lần {tries}/{MAX_TRIES})</Text>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <Result
          status="warning"
          title="Chưa kiểm tra được giao dịch"
          subTitle={error}
          extra={<Space><Button icon={<ReloadOutlined />} onClick={retry}>Thử lại</Button><Button type="primary" onClick={() => goInvoices()}>Về trang Hóa đơn</Button></Space>}
        />
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card>
        <Result
          icon={<CheckCircleFilled style={{ color: '#52C41A' }} />}
          title="Thanh toán thành công"
          subTitle={`Ký túc xá đã nhận ${formatCurrency(payment.amount)} của bạn.`}
          extra={(
            <Space wrap>
              <Button type="primary" icon={<FileTextOutlined />} onClick={() => goInvoices(payment.invoiceId)}>Xem hóa đơn</Button>
              <Button onClick={() => navigate('/portal/home')}>Về trang chủ</Button>
            </Space>
          )}
        >
          {details}
        </Result>
      </Card>
    );
  }

  if (status === 'processing') {
    return (
      <Card>
        <Result
          icon={<ClockCircleOutlined style={{ color: '#FAAD14' }} />}
          title="Giao dịch đang được xử lý"
          subTitle="Cổng thanh toán chưa báo kết quả. Vui lòng kiểm tra lại sau ít phút — nếu tiền đã bị trừ, hóa đơn sẽ tự cập nhật."
          extra={(
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={retry}>Kiểm tra lại</Button>
              <Button type="primary" onClick={() => goInvoices(payment?.invoiceId)}>Về trang Hóa đơn</Button>
            </Space>
          )}
        >
          {details}
        </Result>
      </Card>
    );
  }

  // failed | expired
  return (
    <Card>
      <Result
        icon={<CloseCircleFilled style={{ color: '#FF4D4F' }} />}
        title={status === 'expired' ? 'Giao dịch đã hết hạn' : 'Thanh toán không thành công'}
        subTitle="Bạn chưa bị trừ tiền. Hãy thử thanh toán lại hoặc nộp tiền mặt tại văn phòng ban quản lý."
        extra={(
          <Space wrap>
            <Button type="primary" onClick={() => goInvoices(payment?.invoiceId)}>Thử lại</Button>
            <Button onClick={() => navigate('/portal/home')}>Về trang chủ</Button>
          </Space>
        )}
      >
        {details}
      </Result>
    </Card>
  );
}
