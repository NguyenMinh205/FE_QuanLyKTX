import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer, Button, Tag, Typography, Skeleton, Alert, Timeline, Table, Space, Modal, Form, Input, InputNumber, App,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, HistoryOutlined, FileTextOutlined, CloseCircleOutlined, CheckCircleOutlined, QrcodeOutlined, StopOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { contractApi } from '../api/contract.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import { CONTRACT_TERM, INVOICE_TYPE, INVOICE_STATUS } from '../../../constants/statuses';
import StatusTag from '../../../components/StatusTag';
import TerminateContractModal from './TerminateContractModal';
import { EXPIRING_DAYS, daysLeftOf, depositStateOf, placeTextOf } from '../utils/contractView';

const { Text } = Typography;

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
        <Text strong style={{ fontSize: 15 }}>{icon} {title}</Text>
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '7px 0' }}>
      <Text type="secondary" style={{ flexShrink: 0 }}>{label}</Text>
      <div style={{ textAlign: 'right' }}>{children}</div>
    </div>
  );
}

/** Drawer chi tiết hợp đồng v3.0: Check-in QR, Hủy chờ đóng phí, Thanh lý & Quyết toán hoàn cọc có khấu trừ */
export default function ContractDetailDrawer({
  contractId, open, canTerminate, canRefund, canCheckin, canCancel, onClose, onChanged,
}) {
  const { message } = App.useApp();
  const [version, setVersion] = useState(0);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [refundForm] = Form.useForm();
  const [cancelForm] = Form.useForm();

  const { data: c, error } = useApi(
    () => (contractId ? contractApi.getById(contractId) : Promise.resolve({ data: { data: null } })),
    [contractId, version],
  );

  const reload = () => { setVersion((v) => v + 1); onChanged(); };
  const ready = c && c.id === contractId;
  const daysLeft = ready && c.endDate ? daysLeftOf(c.endDate) : null;
  const expiring = ready && c.status === 'active' && daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;
  const deposit = ready ? depositStateOf(c) : null;
  const canConfirmRefund = ready && canRefund && c.status === 'terminated' && !c.isDepositRefunded;

  const watchedDeduction = Form.useWatch('deductionAmount', refundForm) || 0;

  const handleCheckin = async () => {
    if (!c?.checkinCode) return;
    setCheckingIn(true);
    try {
      const res = await contractApi.checkinQr({ checkinCode: c.checkinCode });
      message.success(res.data.message);
      reload();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRefund = async (values) => {
    setRefunding(true);
    try {
      const res = await contractApi.refundDeposit(c.id, {
        deductionAmount: Number(values.deductionAmount || 0),
        reason: values.reason?.trim() || '',
      });
      message.success(res.data.message);
      setRefundOpen(false);
      refundForm.resetFields();
      reload();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setRefunding(false);
    }
  };

  const handleCancelPendingPayment = async (values) => {
    setCancelling(true);
    try {
      const res = await contractApi.cancel(c.id, { reason: values.reason?.trim() || '' });
      message.success(res.data.message);
      setCancelOpen(false);
      cancelForm.resetFields();
      reload();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const invoiceColumns = [
    {
      title: 'Hóa đơn', key: 'code',
      render: (_, i) => (
        <>
          <Link to={`/admin/invoices/${i.id}`}>{i.invoiceCode}</Link>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[i.type]?.label ?? i.type}</Text></div>
        </>
      ),
    },
    { title: 'Số tiền', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={INVOICE_STATUS[s]?.color} style={{ margin: 0 }}>{INVOICE_STATUS[s]?.label ?? s}</Tag> },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={580}
      destroyOnHidden
      title={ready ? (
        <Space size={8} wrap>
          <span>Hợp đồng {c.contractCode}</span>
          <StatusTag type="contract" value={c.status} />
          {c.status === 'terminated' && <Tag color={deposit.color} style={{ margin: 0 }}>{deposit.text}</Tag>}
        </Space>
      ) : 'Chi tiết hợp đồng'}
      footer={ready && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Space wrap>
            {canCancel && c.status === 'pending_payment' && (
              <Button danger icon={<StopOutlined />} onClick={() => setCancelOpen(true)}>Hủy giữ chỗ</Button>
            )}
            {canCheckin && c.status === 'active' && !c.checkedInAt && c.checkinCode && (
              <Button type="primary" icon={<QrcodeOutlined />} loading={checkingIn} onClick={handleCheckin}>Xác nhận Check-in</Button>
            )}
            {canTerminate && ['active', 'expired'].includes(c.status) && (
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setTerminateOpen(true)}>Thanh lý hợp đồng</Button>
            )}
            {canConfirmRefund && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { refundForm.setFieldsValue({ deductionAmount: 0, reason: '' }); setRefundOpen(true); }}>
                Quyết toán hoàn cọc
              </Button>
            )}
          </Space>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && !ready && <Skeleton active paragraph={{ rows: 12 }} />}

      {!error && ready && (
        <>
          {c.status === 'pending_payment' && (
            <Alert
              type={c.isPaymentOverdue ? 'error' : 'info'}
              showIcon style={{ marginBottom: 16 }}
              title={c.isPaymentOverdue ? `Đã quá hạn đóng phí (${formatDate(c.paymentDeadline)})` : `Đang giữ chỗ — Chờ đóng phí trước ${formatDate(c.paymentDeadline)}`}
              description="Khi thanh toán xong hóa đơn đầu kỳ (VietQR hoặc tiền mặt), hợp đồng tự động kích hoạt và sinh mã QR Check-in. Nếu sinh viên bỏ cọc, bấm Hủy giữ chỗ để nhả chỗ phòng."
            />
          )}
          {c.status === 'expired' && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 16 }}
              title={`Hợp đồng đã hết hạn ${-daysLeft} ngày, sinh viên vẫn đang giữ chỗ trong phòng`}
              description="Thu hết hóa đơn còn nợ (cả cá nhân & điện nước phòng) rồi bấm Thanh lý để giải phóng chỗ."
            />
          )}
          {expiring && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 16 }}
              title={daysLeft === 0 ? 'Hợp đồng hết hạn hôm nay' : `Hợp đồng còn ${daysLeft} ngày`}
              description="Sinh viên có thể đăng ký đợt tiếp theo ngay trên Cổng Sinh viên."
            />
          )}
          {['active', 'expired'].includes(c.status) && c.roomUtilityDebt > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              title={`Phòng đang còn ${c.roomUnpaidInvoices?.length || 1} hóa đơn điện nước chưa thanh toán (${formatCurrency(c.roomUtilityDebt)})`}
              description={(
                <div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
                  {(c.roomUnpaidInvoices || []).map((inv) => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <Link to={`/admin/invoices/${inv.id}`} className="mono">{inv.invoiceCode}</Link>
                      <Text strong className="mono">{formatCurrency(inv.amount)}</Text>
                    </div>
                  ))}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Phải thanh toán sạch hóa đơn điện nước phòng mới có thể thanh lý hợp đồng.
                  </Text>
                </div>
              )}
            />
          )}

          <Section icon={<IdcardOutlined style={{ color: 'var(--brand)' }} />} title="Sinh viên">
            <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '4px 12px' }}>
              <Row label="Họ và tên"><Text strong>{c.student?.fullName}</Text></Row>
              <Row label="Mã sinh viên">{c.student?.studentCode}</Row>
              <Row label="Khoa / Lớp">{[c.student?.faculty, c.student?.className].filter(Boolean).join(' · ') || '—'}</Row>
              <Row label="Số điện thoại">{formatPhone(c.student?.phone)}</Row>
              <Row label="Email">{c.student?.email || '—'}</Row>
            </div>
          </Section>

          <Section icon={<HomeOutlined style={{ color: 'var(--brand)' }} />} title="Phòng ở & Hợp đồng">
            <Row label="Cơ sở">{c.campusName || c.campus?.toUpperCase() || '—'}</Row>
            <Row label="Phòng"><Text strong>{c.room?.buildingName} · {placeTextOf(c)}</Text></Row>
            <Row label="Gói thuê">{CONTRACT_TERM[c.term]?.label} ({CONTRACT_TERM[c.term]?.hint})</Row>
            {c.startDate && (
              <Row label="Thời hạn">
                <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
              </Row>
            )}
            {c.checkinCode && (
              <Row label="Mã QR Check-in">
                <Tag icon={<QrcodeOutlined />} color="blue" style={{ margin: 0 }}>{c.checkinCode}</Tag>
                {c.checkedInAt ? (
                  <div><Text type="success" style={{ fontSize: 12 }}>Đã nhận phòng {formatDateTime(c.checkedInAt)}{c.checkedInByName ? ` · ${c.checkedInByName}` : ''}</Text></div>
                ) : (
                  <div><Text type="warning" style={{ fontSize: 12 }}>Chưa bàn giao nhận phòng</Text></div>
                )}
              </Row>
            )}
            <Row label="Đơn giá chốt">{formatCurrency(c.pricePerMonth)}/tháng</Row>
            <Row label="Tiền phòng cả kỳ">{formatCurrency(c.totalRoomFee)}</Row>
            <Row label="Tiền cọc">
              {formatCurrency(c.depositAmount)} <Tag color={deposit.color} style={{ margin: '0 0 0 6px' }}>{deposit.text}</Tag>
              {c.isDepositRefunded && (
                <div style={{ fontSize: 12 }}>
                  <Text type="secondary">
                    Hoàn thực tế: <b>{formatCurrency(c.depositRefundAmount)}</b>
                    {c.depositDeductionAmount > 0 && ` (khấu trừ ${formatCurrency(c.depositDeductionAmount)}: ${c.depositRefundReason || 'hư hại tài sản'})`}
                  </Text>
                  <div><Text type="secondary">{formatDateTime(c.depositRefundedAt)}{c.depositRefundedByName ? ` · ${c.depositRefundedByName}` : ''}</Text></div>
                </div>
              )}
            </Row>
            <Row label="Công nợ cá nhân">
              <Text strong className="mono" type={c.totalDebt > 0 ? 'danger' : 'success'}>{formatCurrency(c.totalDebt)}</Text>
            </Row>
            {['active', 'expired'].includes(c.status) && (
              <Row label="Công nợ điện nước phòng">
                <Text strong className="mono" type={c.roomUtilityDebt > 0 ? 'danger' : 'success'}>
                  {formatCurrency(c.roomUtilityDebt || 0)}
                </Text>
              </Row>
            )}
            {c.status === 'terminated' && <Row label="Thanh lý ngày">{formatDate(c.terminatedAt)}</Row>}
            {c.status === 'cancelled' && c.cancelReason && <Row label="Lý do hủy">{c.cancelReason}</Row>}
          </Section>

          <Section icon={<FileTextOutlined style={{ color: 'var(--brand)' }} />} title={`Hóa đơn của hợp đồng (${c.invoices?.length ?? 0})`}>
            <Table
              rowKey="id" size="small" pagination={false} columns={invoiceColumns} dataSource={c.invoices || []}
              locale={{ emptyText: 'Chưa có hóa đơn' }} scroll={{ x: 420 }}
            />
          </Section>

          <Section icon={<HistoryOutlined style={{ color: 'var(--brand)' }} />} title="Dòng thời gian">
            <Timeline
              items={(c.history || []).map((h, idx) => ({
                key: idx,
                color: h.type === 'terminated' || h.type === 'cancelled' ? 'red' : h.type === 'deposit_refunded' || h.type === 'checked_in' ? 'green' : 'blue',
                content: (
                  <div>
                    <Text strong>{h.title}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{h.at?.length > 10 ? formatDateTime(h.at) : formatDate(h.at)}</Text>
                    {h.description && <div><Text type="secondary">{h.description}</Text></div>}
                  </div>
                ),
              }))}
            />
          </Section>
        </>
      )}

      <TerminateContractModal
        contract={ready ? c : null}
        open={terminateOpen}
        onCancel={() => setTerminateOpen(false)}
        onTerminated={() => { setTerminateOpen(false); reload(); }}
      />

      {/* Modal Quyết toán hoàn cọc có khấu trừ hỏng đồ */}
      <Modal
        open={refundOpen}
        title={`Quyết toán hoàn cọc — ${c?.contractCode || ''}`}
        okText="Xác nhận hoàn cọc"
        cancelText="Hủy"
        confirmLoading={refunding}
        onOk={() => refundForm.submit()}
        onCancel={() => setRefundOpen(false)}
        destroyOnHidden
      >
        <Form form={refundForm} layout="vertical" onFinish={handleRefund} style={{ marginTop: 12 }}>
          <Alert
            type="info" showIcon style={{ marginBottom: 14 }}
            title={`Tiền cọc gốc: ${formatCurrency(c?.depositAmount || 0)} → Hoàn trả thực tế: ${formatCurrency(Math.max(0, (c?.depositAmount || 0) - Number(watchedDeduction || 0)))}`}
            description="Hệ thống sẽ lập phiếu chi hoàn cọc (REF-...) tách riêng khỏi báo cáo doanh thu."
          />
          <Form.Item
            name="deductionAmount" label="Tiền khấu trừ hư hại tài sản (VNĐ — để 0 nếu hoàn đủ)"
            rules={[{ type: 'number', min: 0, max: c?.depositAmount || 0, message: 'Số tiền khấu trừ không vượt quá tiền cọc' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={c?.depositAmount || 0} step={10000} precision={0} suffix="đ" />
          </Form.Item>
          <Form.Item
            name="reason" label="Ghi chú / Lý do khấu trừ"
            rules={watchedDeduction > 0 ? [{ required: true, whitespace: true, message: 'Nhập lý do khi có khấu trừ tiền cọc' }] : []}
          >
            <Input.TextArea rows={2} maxLength={300} placeholder="VD: Bàn giao đủ tài sản / Làm vỡ kính cửa sổ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Hủy giữ chỗ pending_payment */}
      <Modal
        open={cancelOpen}
        title={`Hủy giữ chỗ hợp đồng ${c?.contractCode || ''}?`}
        okText="Xác nhận hủy"
        okButtonProps={{ danger: true }}
        cancelText="Đóng"
        confirmLoading={cancelling}
        onOk={() => cancelForm.submit()}
        onCancel={() => setCancelOpen(false)}
        destroyOnHidden
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelPendingPayment} style={{ marginTop: 12 }}>
          <Alert
            type="warning" showIcon style={{ marginBottom: 12 }}
            title="Giải phóng 1 chỗ phòng ngay lập tức"
            description="Các hóa đơn đầu kỳ chưa thanh toán của hợp đồng này sẽ chuyển sang Đã hủy."
          />
          <Form.Item name="reason" label="Lý do hủy giữ chỗ">
            <Input.TextArea rows={2} maxLength={200} placeholder="VD: Quá hạn đóng phí giữ chỗ / SV xin rút" />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
