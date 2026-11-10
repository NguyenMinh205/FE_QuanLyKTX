import { useState } from 'react';
import {
  Drawer, Button, Tag, Typography, Skeleton, Alert, Timeline, Table, Space, App,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, HistoryOutlined, FileTextOutlined, CloseCircleOutlined, CheckCircleOutlined,
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
      <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
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

/** Drawer chi tiết hợp đồng — SCR-32: thanh lý (FR-34) và xác nhận hoàn cọc (FR-35) */
export default function ContractDetailDrawer({ contractId, open, canTerminate, canRefund, onClose, onChanged }) {
  const { modal, message } = App.useApp();
  const [version, setVersion] = useState(0);
  const [terminateOpen, setTerminateOpen] = useState(false);

  const { data: c, error } = useApi(
    () => (contractId ? contractApi.getById(contractId) : Promise.resolve({ data: { data: null } })),
    [contractId, version],
  );

  const reload = () => { setVersion((v) => v + 1); onChanged(); };
  const ready = c && c.id === contractId;
  const daysLeft = ready && c.endDate ? daysLeftOf(c.endDate) : null;
  const expiring = ready && c.status === 'active' && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;
  const deposit = ready ? depositStateOf(c) : null;
  const canConfirmRefund = ready && canRefund && c.status === 'terminated' && !c.isDepositRefunded;

  // BR-08: một chiều, mỗi hợp đồng một lần, hoàn đủ số cọc — không nhập số tiền
  const confirmRefund = () => modal.confirm({
    title: `Xác nhận đã hoàn cọc cho ${c.student.fullName}?`,
    icon: <CheckCircleOutlined style={{ color: '#52C41A' }} />,
    content: `Đã trả ${formatCurrency(c.depositAmount)} tiền cọc tại văn phòng. Thao tác này không hoàn tác được.`,
    okText: 'Đã hoàn cọc',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const res = await contractApi.refundDeposit(c.id);
        message.success(res.data.message);
      } catch (err) {
        message.warning(getErrorMessage(err));
      }
      reload();
    },
  });

  const invoiceColumns = [
    { title: 'Hóa đơn', key: 'code', render: (_, i) => <><div>{i.invoiceCode}</div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[i.type]?.label ?? i.type}</Text></> },
    { title: 'Số tiền', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={INVOICE_STATUS[s]?.color} style={{ margin: 0 }}>{INVOICE_STATUS[s]?.label ?? s}</Tag> },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={560}
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
            {canTerminate && ['active', 'expired'].includes(c.status) && (
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setTerminateOpen(true)}>Thanh lý hợp đồng</Button>
            )}
            {canConfirmRefund && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={confirmRefund}>Xác nhận đã hoàn cọc</Button>
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
          {c.status === 'expired' && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 20 }}
              title={`Hợp đồng đã hết hạn ${-daysLeft} ngày, sinh viên vẫn giữ giường`}
              description="Khi sinh viên đến trả phòng, thu hết hóa đơn còn nợ rồi thanh lý để trả giường. Không có gia hạn: muốn ở kỳ sau, sinh viên nộp đơn mới sau khi thanh lý."
            />
          )}
          {expiring && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 20 }}
              title={daysLeft === 0 ? 'Hợp đồng hết hạn hôm nay' : `Hợp đồng còn ${daysLeft} ngày`}
              description="Không có gia hạn: muốn ở kỳ sau, sinh viên nộp đơn mới sau khi thanh lý hợp đồng này."
            />
          )}
          {canConfirmRefund && (
            <Alert
              type="info" showIcon style={{ marginBottom: 20 }}
              title={`Chưa hoàn cọc ${formatCurrency(c.depositAmount)}`}
              description="Trả tiền cọc cho sinh viên tại văn phòng, rồi bấm Xác nhận đã hoàn cọc."
            />
          )}

          <Section icon={<IdcardOutlined style={{ color: '#1677FF' }} />} title="Sinh viên">
            <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '4px 12px' }}>
              <Row label="Họ và tên"><Text strong>{c.student.fullName}</Text></Row>
              <Row label="Mã sinh viên">{c.student.studentCode}</Row>
              <Row label="Lớp">{c.student.className || '—'}</Row>
              <Row label="Số điện thoại">{formatPhone(c.student.phone)}</Row>
              <Row label="Email">{c.student.email || '—'}</Row>
            </div>
          </Section>

          <Section icon={<HomeOutlined style={{ color: '#1677FF' }} />} title="Chỗ ở và hợp đồng">
            <Row label="Chỗ ở"><Text strong>{c.room?.buildingName} · {placeTextOf(c)}</Text></Row>
            <Row label="Gói thuê">{CONTRACT_TERM[c.term]?.label} ({CONTRACT_TERM[c.term]?.hint})</Row>
            <Row label="Thời hạn">
              <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
              {c.status === 'active' && daysLeft >= 0 && (
                <Text type={expiring ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>còn {daysLeft} ngày</Text>
              )}
            </Row>
            <Row label="Đơn giá chốt">
              <div>{formatCurrency(c.pricePerMonth)}/tháng</div>
              <Text type="secondary" style={{ fontSize: 12 }}>chốt lúc duyệt đơn, không đổi khi phòng đổi giá</Text>
            </Row>
            <Row label="Tiền phòng cả kỳ">{formatCurrency(c.totalRoomFee)}</Row>
            <Row label="Tiền cọc">
              {formatCurrency(c.depositAmount)} <Tag color={deposit.color} style={{ margin: '0 0 0 6px' }}>{deposit.text}</Tag>
              {c.isDepositRefunded && (
                <div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(c.depositRefundedAt)}{c.depositRefundedByName ? ` · ${c.depositRefundedByName}` : ''}</Text></div>
              )}
            </Row>
            <Row label="Công nợ hiện tại">
              <Text strong type={c.totalDebt > 0 ? 'danger' : 'success'}>{formatCurrency(c.totalDebt)}</Text>
            </Row>
            {c.status === 'terminated' && <Row label="Thanh lý ngày">{formatDate(c.terminatedAt)}</Row>}
          </Section>

          <Section icon={<FileTextOutlined style={{ color: '#1677FF' }} />} title={`Hóa đơn của hợp đồng (${c.invoices?.length ?? 0})`}>
            <Table
              rowKey="id" size="small" pagination={false} columns={invoiceColumns} dataSource={c.invoices || []}
              locale={{ emptyText: 'Chưa có hóa đơn' }} scroll={{ x: 420 }}
            />
          </Section>

          <Section icon={<HistoryOutlined style={{ color: '#1677FF' }} />} title="Lịch sử">
            <Timeline
              items={(c.history || []).map((h) => ({
                color: h.type === 'terminated' ? 'red' : h.type === 'deposit_refunded' ? 'green' : 'blue',
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
    </Drawer>
  );
}
