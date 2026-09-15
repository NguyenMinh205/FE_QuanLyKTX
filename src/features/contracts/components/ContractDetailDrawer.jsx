import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Button, Tag, Typography, Skeleton, Alert, Timeline, Table, Input, Space, App, Divider,
} from 'antd';
import {
  IdcardOutlined, HomeOutlined, HistoryOutlined, FileTextOutlined, EditOutlined, CloseCircleOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { contractApi } from '../api/contract.api';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import { INVOICE_TYPE, INVOICE_STATUS } from '../../../constants/statuses';
import StatusTag from '../../../components/StatusTag';
import TerminateContractModal from './TerminateContractModal';
import { EXPIRING_DAYS, bedTextOf, contractMonths, daysLeftOf } from '../utils/contractView';

const { Text } = Typography;

function Section({ icon, title, extra, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
        <Text strong style={{ fontSize: 15 }}>{icon} {title}</Text>
        {extra}
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

/** Drawer chi tiết hợp đồng — SCR-32 */
export default function ContractDetailDrawer({ contractId, open, canUpdate, canTerminate, onClose, onChanged }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [version, setVersion] = useState(0);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [editingTerms, setEditingTerms] = useState(null); // null = không sửa · string = nội dung đang sửa
  const [termsError, setTermsError] = useState(null);
  const [savingTerms, setSavingTerms] = useState(false);

  const { data: c, error } = useApi(
    () => (contractId ? contractApi.getById(contractId) : Promise.resolve({ data: { data: null } })),
    [contractId, version],
  );

  const reload = () => { setVersion((v) => v + 1); onChanged(); };

  const saveTerms = async () => {
    setSavingTerms(true);
    setTermsError(null);
    try {
      const res = await contractApi.update(c.id, { terms: editingTerms });
      message.success(res.data.message);
      setEditingTerms(null);
      reload();
    } catch (err) {
      setTermsError(getFieldErrors(err)?.[0]?.message || getErrorMessage(err));
    } finally {
      setSavingTerms(false);
    }
  };

  const ready = c && c.id === contractId;
  const daysLeft = ready ? daysLeftOf(c.endDate) : null;
  const expiring = ready && c.status === 'active' && daysLeft >= 0 && daysLeft <= EXPIRING_DAYS;

  const invoiceColumns = [
    { title: 'Hóa đơn', key: 'code', render: (_, i) => <><div>{i.invoiceCode}</div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[i.type]?.label}{i.billingPeriod ? ` · ${i.billingPeriod.split('-').reverse().join('/')}` : ''}</Text></> },
    { title: 'Số tiền', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Còn nợ', dataIndex: 'remainingAmount', align: 'right', render: (v, i) => (i.status === 'cancelled' ? '—' : <Text type={v > 0 ? 'danger' : undefined}>{formatCurrency(v)}</Text>) },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={INVOICE_STATUS[s]?.color} style={{ margin: 0 }}>{INVOICE_STATUS[s]?.label}</Tag> },
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
          {expiring && <Tag color="warning" style={{ margin: 0 }}>Sắp hết hạn</Tag>}
        </Space>
      ) : 'Chi tiết hợp đồng'}
      footer={ready && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {canTerminate && c.status === 'active'
            ? <Button danger icon={<CloseCircleOutlined />} onClick={() => setTerminateOpen(true)}>Chấm dứt hợp đồng</Button>
            : <span />}
          <Button onClick={onClose}>Đóng</Button>
        </div>
      )}
    >
      {error && <Alert type="error" showIcon title={error} />}
      {!error && !ready && <Skeleton active paragraph={{ rows: 12 }} />}

      {!error && ready && (
        <>
          {c.status === 'active' && c.pendingRequests?.length > 0 && (
            <Alert
              type="info" showIcon style={{ marginBottom: 20 }}
              title={c.pendingRequests.map((r) => `${r.type === 'renewal' ? 'Yêu cầu gia hạn' : 'Yêu cầu trả phòng'} gửi ngày ${formatDate(r.createdAt)}`).join(' · ')}
              description="Đang chờ xử lý — duyệt hoặc từ chối ở màn Yêu cầu gia hạn / trả phòng."
              action={<Button size="small" onClick={() => navigate('/admin/requests')}>Mở Yêu cầu</Button>}
            />
          )}
          {expiring && !c.pendingRequests?.some((r) => r.type === 'renewal') && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 20 }}
              title={daysLeft === 0 ? 'Hợp đồng hết hạn hôm nay' : `Hợp đồng còn ${daysLeft} ngày`}
              description="Sinh viên chưa gửi yêu cầu gia hạn. Gia hạn được thực hiện qua yêu cầu của sinh viên ở cổng sinh viên."
            />
          )}

          <Section icon={<IdcardOutlined style={{ color: '#1677FF' }} />} title="Thông tin sinh viên">
            <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '4px 12px' }}>
              <Row label="Họ và tên"><Text strong>{c.student?.fullName ?? c.studentName}</Text></Row>
              <Row label="Mã sinh viên">{c.student?.studentCode ?? c.studentCode}</Row>
              <Row label="Lớp">{c.student?.className || '—'}</Row>
              <Row label="Số điện thoại">{formatPhone(c.student?.phone)}</Row>
            </div>
          </Section>

          <Section icon={<HomeOutlined style={{ color: '#1677FF' }} />} title="Thông tin lưu trú & hợp đồng">
            <Row label="Vị trí chỗ ở"><Text strong>{c.buildingName} · Phòng {bedTextOf(c.bedCode)}</Text></Row>
            <Row label="Loại phòng">{c.roomTypeName}</Row>
            <Row label="Thời hạn">
              <div>{formatDate(c.startDate)} → {formatDate(c.endDate)}</div>
              <Text type={expiring ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>
                {contractMonths(c.startDate, c.endDate)} tháng{c.status === 'active' ? (daysLeft >= 0 ? ` · còn ${daysLeft} ngày` : '') : ''}
              </Text>
            </Row>
            <Row label="Giá thuê hằng tháng">
              <div>{formatCurrency(c.monthlyPrice)}/tháng</div>
              <Text type="secondary" style={{ fontSize: 12 }}>giá chốt lúc duyệt đơn — không đổi khi loại phòng tăng giá</Text>
            </Row>
            <Row label="Tiền cọc">
              {formatCurrency(c.depositAmount)}{' '}
              {c.depositStatus === 'paid'
                ? <Text style={{ color: '#389E0D' }}><CheckCircleFilled /> đã thu</Text>
                : <Text type="warning">chưa thu đủ</Text>}
            </Row>
            {c.status !== 'active' && (
              <Row label="Đã hoàn cọc">{formatCurrency(c.depositRefunded)}</Row>
            )}
            <Row label="Công nợ hiện tại">
              <Text strong type={c.totalDebt > 0 ? 'danger' : 'success'}>{formatCurrency(c.totalDebt)}</Text>
            </Row>
            {c.status === 'terminated' && (
              <Alert
                type="error" style={{ marginTop: 8 }}
                title={`Chấm dứt ngày ${formatDate(c.terminatedAt)}`}
                description={`Lý do: ${c.terminationReason || '—'}`}
              />
            )}
          </Section>

          <Section
            icon={<FileTextOutlined style={{ color: '#1677FF' }} />}
            title="Điều khoản"
            extra={canUpdate && c.status === 'active' && editingTerms === null && (
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingTerms(c.terms || ''); setTermsError(null); }}>Sửa</Button>
            )}
          >
            {editingTerms === null ? (
              <Text style={{ whiteSpace: 'pre-wrap' }}>{c.terms || '—'}</Text>
            ) : (
              <>
                <Input.TextArea
                  rows={4} maxLength={2000} showCount value={editingTerms}
                  status={termsError ? 'error' : undefined}
                  onChange={(e) => setEditingTerms(e.target.value)}
                  aria-label="Điều khoản hợp đồng"
                />
                {termsError && <Text type="danger" style={{ display: 'block', marginTop: 4 }}>{termsError}</Text>}
                <Space style={{ marginTop: 8 }}>
                  <Button type="primary" size="small" loading={savingTerms} onClick={saveTerms}>Lưu điều khoản</Button>
                  <Button size="small" onClick={() => setEditingTerms(null)} disabled={savingTerms}>Hủy</Button>
                </Space>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 6 }}>
                  Chỉ sửa được điều khoản. Ngày ở thay đổi qua yêu cầu gia hạn / trả phòng.
                </Text>
              </>
            )}
          </Section>

          <Section icon={<FileTextOutlined style={{ color: '#1677FF' }} />} title={`Hóa đơn của hợp đồng (${c.invoices?.length ?? 0})`}>
            <Table
              rowKey="id" size="small" pagination={false} columns={invoiceColumns} dataSource={c.invoices || []}
              locale={{ emptyText: 'Chưa có hóa đơn' }} scroll={{ x: 460 }}
            />
          </Section>

          <Section icon={<HistoryOutlined style={{ color: '#1677FF' }} />} title="Lịch sử hợp đồng">
            {c.history?.length ? (
              <Timeline
                items={c.history.map((h) => ({
                  color: h.type === 'terminated' ? 'red' : h.type === 'expired' ? 'gray' : 'blue',
                  content: (
                    <div>
                      <Text strong>{h.title}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{h.at?.length > 10 ? formatDateTime(h.at) : formatDate(h.at)}</Text>
                      {h.description && <div><Text type="secondary">{h.description}</Text></div>}
                    </div>
                  ),
                }))}
              />
            ) : <Text type="secondary">Chưa có lịch sử</Text>}
          </Section>
          <Divider style={{ margin: 0 }} />
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
