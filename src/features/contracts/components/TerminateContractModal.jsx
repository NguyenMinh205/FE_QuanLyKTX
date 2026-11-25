import { useState } from 'react';
import { Modal, Alert, Typography, App } from 'antd';
import { contractApi } from '../api/contract.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { INVOICE_TYPE } from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';
import { placeTextOf } from '../utils/contractView';

const { Text } = Typography;

/**
 * Thanh lý hợp đồng khi sinh viên trả phòng tại văn phòng (FR-34, UC-07). Không hoàn tác.
 * Backend chặn nếu sinh viên hoặc phòng còn hóa đơn chưa trả (BR-04) và trả về danh sách hóa đơn đó.
 */
export default function TerminateContractModal({ contract, open, onCancel, onTerminated }) {
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { text, invoices }

  if (!contract) return null;

  const close = () => { setError(null); onCancel(); };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await contractApi.terminate(contract.id);
      message.success(res.data.message);
      onTerminated();
    } catch (err) {
      setError({
        text: getErrorMessage(err),
        invoices: getErrorCode(err) === 'OUTSTANDING_INVOICES' ? err.response?.data?.data?.invoices || [] : null,
      });
    } finally {
      setSaving(false);
    }
  };

  const roomUnpaid = contract.roomUnpaidInvoices || [];
  const personalUnpaid = (contract.invoices || []).filter((i) => i.status === 'unpaid');
  const blockingInvoices = [...personalUnpaid, ...roomUnpaid];

  return (
    <Modal
      open={open}
      title={`Thanh lý hợp đồng ${contract.contractCode}`}
      okText="Thanh lý hợp đồng"
      okButtonProps={{ danger: true, disabled: blockingInvoices.length > 0 }}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={submit}
      onCancel={close}
      destroyOnHidden
      width={560}
    >
      {blockingInvoices.length > 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 14 }}
          title={`Chưa thể thanh lý — còn ${blockingInvoices.length} hóa đơn chưa thanh toán`}
          description={(
            <div style={{ marginTop: 4, display: 'grid', gap: 4 }}>
              {blockingInvoices.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text><span className="mono">{i.invoiceCode}</span> · {INVOICE_TYPE[i.type]?.label ?? i.type}</Text>
                  <Text strong className="mono">{formatCurrency(i.amount)}</Text>
                </div>
              ))}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thu đủ toàn bộ hóa đơn cá nhân và điện nước phòng trước khi thanh lý hợp đồng.
              </Text>
            </div>
          )}
        />
      )}
      <Alert
        type="warning" showIcon style={{ marginBottom: 16 }}
        title="Không thể hoàn tác"
        description={(
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            <li>Làm sau khi đã kiểm kê tài sản phòng và thu hồi chìa khóa của {contract.student?.fullName}.</li>
            <li>Giải phóng 1 chỗ tại {placeTextOf(contract)}, hợp đồng chuyển sang Đã thanh lý.</li>
            <li>Tiền cọc {formatCurrency(contract.depositAmount)} hoàn tại văn phòng; hoàn xong thì bấm <b>Quyết toán hoàn cọc</b>.</li>
          </ul>
        )}
      />
      {error && (
        <Alert
          type="error" showIcon title={error.text}
          description={error.invoices?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {error.invoices.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text>{i.invoiceCode} · {INVOICE_TYPE[i.type]?.label ?? i.type}</Text>
                  <Text strong>{formatCurrency(i.amount)}</Text>
                </div>
              ))}
              <Text type="secondary" style={{ fontSize: 12 }}>Thu đủ các hóa đơn này rồi thanh lý lại.</Text>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
