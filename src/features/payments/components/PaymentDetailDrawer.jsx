import { Link } from 'react-router-dom';
import { Drawer, Button, Space } from 'antd';
import { PrinterOutlined, ExportOutlined } from '@ant-design/icons';
import PaymentReceipt from './PaymentReceipt';
import { printReceipt } from '../utils/printReceipt';

/** Xem lại & in Phiếu thu (PAY-...) hoặc Phiếu chi hoàn cọc (REF-...) */
export default function PaymentDetailDrawer({ payment, onClose }) {
  const isRefund = payment?.paymentType === 'refund';
  return (
    <Drawer
      open={!!payment}
      onClose={onClose}
      title={payment ? `${isRefund ? 'Phiếu chi hoàn cọc' : 'Phiếu thu'} ${payment.paymentCode}` : ''}
      size={500}
      destroyOnHidden
      extra={payment && (
        <Space>
          {payment.invoiceId && (
            <Link to={`/admin/invoices/${payment.invoiceId}`}><Button icon={<ExportOutlined />}>Hóa đơn</Button></Link>
          )}
          {!payment.invoiceId && payment.contractId && (
            <Link to={`/admin/contracts?contractId=${payment.contractId}`}><Button icon={<ExportOutlined />}>Hợp đồng</Button></Link>
          )}
          <Button type="primary" icon={<PrinterOutlined />} onClick={printReceipt}>In chứng từ</Button>
        </Space>
      )}
    >
      {payment && <PaymentReceipt payment={payment} />}
    </Drawer>
  );
}
