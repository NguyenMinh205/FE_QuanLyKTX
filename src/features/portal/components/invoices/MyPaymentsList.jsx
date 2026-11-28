import { useState } from 'react';
import { Table, Typography, Modal, Alert, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useApi } from '../../../../hooks/useApi';
import { portalApi } from '../../api/portal.api';
import { INVOICE_TYPE, PAYMENT_METHOD } from '../../../../constants/statuses';
import { formatCurrency, formatDateTime } from '../../../../utils/formatter';
import StatusTag from '../../../../components/StatusTag';
import PaymentReceipt from '../../../payments/components/PaymentReceipt';
import { printReceipt } from '../../../payments/utils/printReceipt';

const { Text } = Typography;

/** Lịch sử nộp tiền & Hoàn cọc của sinh viên */
export default function MyPaymentsList() {
  const [open, setOpen] = useState(null);
  const { data, loading, error } = useApi(() => portalApi.getMyPayments({ limit: 100 }), []);

  const columns = [
    { title: 'Thời gian', dataIndex: 'paidAt', width: 150, render: (v) => formatDateTime(v) },
    { title: 'Loại', dataIndex: 'paymentType', width: 120, render: (v) => <StatusTag type="paymentType" value={v || 'payment'} /> },
    {
      title: 'Chứng từ / Hóa đơn', key: 'inv', width: 220,
      render: (_, p) => (p.invoiceCode
        ? <><div>{p.invoiceCode}</div><Text type="secondary" style={{ fontSize: 12 }}>{INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType}</Text></>
        : <><div>{p.paymentCode}</div><Text type="secondary" style={{ fontSize: 12 }}>Hoàn cọc khi thanh lý</Text></>),
    },
    {
      title: 'Số tiền', dataIndex: 'amount', width: 130, align: 'right',
      render: (v, p) => (p.paymentType === 'refund'
        ? <Text strong style={{ color: '#722ED1' }}>{formatCurrency(v)}</Text>
        : <Text strong style={{ color: 'var(--success-text)' }}>{formatCurrency(v)}</Text>),
    },
    { title: 'Hình thức', dataIndex: 'method', width: 165, render: (v) => PAYMENT_METHOD[v]?.label ?? v },
    { title: 'Người nộp', key: 'payer', width: 160, render: (_, p) => p.payer?.fullName ?? '—' },
  ];

  if (error) return <Alert type="error" showIcon title={error} />;
  return (
    <>
      <Table
        rowKey="id" size="middle" columns={columns} dataSource={data || []} loading={loading} pagination={false}
        scroll={{ x: 900 }} locale={{ emptyText: 'Chưa có lịch sử giao dịch nào' }}
        onRow={(p) => ({ onClick: () => setOpen(p), style: { cursor: 'pointer' } })}
      />
      <Modal
        open={!!open}
        onCancel={() => setOpen(null)}
        footer={(
          <Space>
            <Button onClick={() => setOpen(null)}>Đóng</Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={printReceipt}>In chứng từ</Button>
          </Space>
        )}
        title={open?.paymentType === 'refund' ? 'Chi tiết phiếu chi hoàn cọc' : 'Chi tiết biên lai'}
        width={500}
        destroyOnHidden
      >
        {open && <PaymentReceipt payment={open} />}
      </Modal>
    </>
  );
}
