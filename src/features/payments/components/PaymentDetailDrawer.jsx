import { Link } from 'react-router-dom';
import { Drawer, Button, Space } from 'antd';
import { PrinterOutlined, ExportOutlined } from '@ant-design/icons';
import PaymentReceipt from './PaymentReceipt';
import { printReceipt } from '../utils/printReceipt';

/** Xem lại biên lai một phiếu thu (SCR-56) — in lại hoặc mở hóa đơn gốc */
export default function PaymentDetailDrawer({ payment, onClose }) {
  return (
    <Drawer
      open={!!payment}
      onClose={onClose}
      title={payment ? `Phiếu thu ${payment.paymentCode}` : ''}
      size="default"
      destroyOnHidden
      extra={payment && (
        <Space>
          <Link to={`/admin/invoices/${payment.invoiceId}`}><Button icon={<ExportOutlined />}>Hóa đơn</Button></Link>
          <Button type="primary" icon={<PrinterOutlined />} onClick={printReceipt}>In</Button>
        </Space>
      )}
    >
      {payment && <PaymentReceipt payment={payment} />}
    </Drawer>
  );
}
