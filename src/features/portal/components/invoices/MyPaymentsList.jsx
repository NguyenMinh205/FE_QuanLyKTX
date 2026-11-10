import { useState } from 'react';
import {
  Table, Typography, Modal, Alert,
} from 'antd';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../../utils/formatter';
import PaymentReceipt from '../../../payments/components/PaymentReceipt';

const { Text } = Typography;

/** Lịch sử nộp tiền (FR-63): phiếu thu hóa đơn của mình và của phòng mình. Bấm một dòng để xem lại biên lai */
export default function MyPaymentsList() {
  const [open, setOpen] = useState(null);
  const { data, loading, error } = useApi(() => portalApi.getMyPayments({ limit: 100 }), []);

  const columns = [
    { title: 'Ngày nộp', dataIndex: 'paidAt', width: 150, render: (v) => formatDateTime(v) },
    {
      title: 'Hóa đơn', key: 'inv', width: 220,
      render: (_, p) => <><div>{p.invoiceCode}</div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></>,
    },
    { title: 'Số tiền', dataIndex: 'amount', width: 130, align: 'right', render: (v) => <Text strong style={{ color: '#389E0D' }}>{formatCurrency(v)}</Text> },
    { title: 'Hình thức', dataIndex: 'method', width: 170, render: (v) => PAYMENT_METHOD[v]?.label ?? v },
    { title: 'Người nộp', key: 'payer', width: 170, render: (_, p) => p.payer?.fullName ?? '—' },
  ];

  if (error) return <Alert type="error" showIcon title={error} />;
  return (
    <>
      <Table
        rowKey="id" size="middle" columns={columns} dataSource={data || []} loading={loading} pagination={false}
        scroll={{ x: 840 }} locale={{ emptyText: 'Chưa có lần nộp tiền nào' }}
        onRow={(p) => ({ onClick: () => setOpen(p), style: { cursor: 'pointer' } })}
      />
      <Modal open={!!open} onCancel={() => setOpen(null)} footer={null} title="Biên lai" width={480} destroyOnHidden>
        {open && <PaymentReceipt payment={open} />}
      </Modal>
    </>
  );
}
