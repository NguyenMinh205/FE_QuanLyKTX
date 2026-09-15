import { useState } from 'react';
import {
  Modal, Form, DatePicker, Input, Alert, Typography, Radio, App,
} from 'antd';
import { SyncOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { portalApi } from '../../api/portal.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../../lib/axiosClient';
import { formatCurrency, formatDate } from '../../../../utils/formatter';
import { extraMonthsOf } from '../../../requests/utils/requestView';

const { Text } = Typography;
const API_DATE = 'YYYY-MM-DD';

const TYPES = [
  {
    value: 'renewal', icon: <SyncOutlined style={{ color: '#1677FF' }} />, title: 'Gia hạn chỗ ở',
    desc: (room) => `Kéo dài thời gian ở tại ${room} sang kỳ tiếp theo`,
  },
  {
    value: 'checkout', icon: <LogoutOutlined style={{ color: '#722ED1' }} />, title: 'Trả phòng',
    desc: () => 'Thanh lý hợp đồng, bàn giao phòng và quyết toán tiền cọc',
  },
];

/**
 * Tạo yêu cầu gia hạn / trả phòng — SCR-66 (docs/08 mục 6.12).
 * @param residence  dữ liệu GET /portal/my-residence (có contract + debtSummary)
 * @param pendingTypes  loại đang có yêu cầu chờ xử lý — chặn gửi trùng ngay trên giao diện (BR-71)
 */
export default function CreateRequestModal({ open, initialType = 'renewal', residence, pendingTypes, onCancel, onCreated }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null); // { code, message }

  const type = Form.useWatch('type', form) ?? initialType;
  const endDate = Form.useWatch('requestedEndDate', form);
  const contract = residence?.contract;
  const room = contract?.bedCode ? `phòng ${contract.bedCode.split('-')[0]}` : 'phòng hiện tại';
  const duplicated = pendingTypes.includes(type) || serverError?.code === 'DUPLICATE_PENDING_REQUEST';
  const debt = residence?.debtSummary?.totalDebt ?? 0;

  const handleSubmit = async ({ requestedEndDate, reason }) => {
    setSaving(true);
    setServerError(null);
    try {
      const res = await portalApi.createRequest({
        type, requestedEndDate: requestedEndDate.format(API_DATE), reason: reason?.trim() || '',
      });
      message.success(res.data.message);
      form.resetFields();
      onCreated(res.data.data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setServerError({ code: getErrorCode(err), message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const changeType = () => {
    setServerError(null);
    form.setFields([{ name: 'requestedEndDate', value: undefined, errors: [] }, { name: 'reason', errors: [] }]);
  };

  return (
    <Modal
      open={open}
      title="Tạo yêu cầu mới"
      width={560}
      okText={type === 'renewal' ? 'Gửi yêu cầu gia hạn' : 'Gửi yêu cầu trả phòng'}
      cancelText="Hủy bỏ"
      okButtonProps={{ disabled: duplicated || !contract }}
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={() => { form.resetFields(); setServerError(null); onCancel(); }}
      destroyOnHidden
    >
      {duplicated && (
        <Alert
          type="error" showIcon style={{ marginBottom: 16 }}
          title={`Bạn đang có một yêu cầu ${type === 'renewal' ? 'gia hạn' : 'trả phòng'} chờ xử lý`}
          description="Mỗi loại chỉ gửi được một yêu cầu tại một thời điểm. Hủy yêu cầu cũ nếu muốn gửi lại."
        />
      )}
      {serverError && !duplicated && <Alert type="error" showIcon title={serverError.message} style={{ marginBottom: 16 }} />}

      <Form
        form={form} layout="vertical" onFinish={handleSubmit}
        initialValues={{ type: initialType }}
        onValuesChange={(changed) => 'type' in changed && changeType()}
      >
        <Form.Item name="type" label="Chọn loại yêu cầu" rules={[{ required: true }]}>
          <Radio.Group style={{ display: 'grid', gap: 8, width: '100%' }}>
            {TYPES.map((t) => (
              <Radio.Button
                key={t.value} value={t.value}
                style={{ height: 'auto', padding: '10px 14px', borderRadius: 8, borderInlineStartWidth: 1, lineHeight: 1.4 }}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <div>
                    <Text strong>{t.title}</Text>
                    <div><Text type="secondary" style={{ fontSize: 13 }}>{t.desc(room)}</Text></div>
                  </div>
                </div>
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        {type === 'renewal' ? (
          <Form.Item
            name="requestedEndDate"
            label="Ngày kết thúc mới"
            rules={[{ required: true, message: 'Chọn ngày kết thúc mới' }]}
            extra={(
              <>
                Hợp đồng hiện kết thúc ngày {formatDate(contract?.endDate)}.
                {endDate && contract && <Text strong style={{ color: '#1677FF' }}> Thêm {extraMonthsOf(contract.endDate, endDate.format(API_DATE))} tháng.</Text>}
              </>
            )}
          >
            <DatePicker
              format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày kết thúc mới"
              disabledDate={(d) => !contract || !d.isAfter(dayjs(contract.endDate), 'day')}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="requestedEndDate"
            label="Ngày dự kiến trả phòng"
            rules={[{ required: true, message: 'Chọn ngày dự kiến trả phòng' }]}
            extra={contract && `Từ hôm nay đến hết hạn hợp đồng (${formatDate(contract.endDate)})`}
          >
            <DatePicker
              format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày bàn giao phòng"
              disabledDate={(d) => d.isBefore(dayjs(), 'day') || (contract && d.isAfter(dayjs(contract.endDate), 'day'))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="reason"
          label={type === 'checkout' ? 'Lý do trả phòng' : 'Lý do / ghi chú'}
          rules={type === 'checkout' ? [{ required: true, whitespace: true, message: 'Nhập lý do trả phòng' }] : []}
        >
          <Input.TextArea
            rows={3} maxLength={500} showCount
            placeholder={type === 'checkout' ? 'VD: Em chuyển ra ở cùng gia đình' : 'VD: Em học tiếp năm sau, muốn giữ chỗ hiện tại'}
          />
        </Form.Item>

        {type === 'checkout' && contract && (
          <Alert
            type="info" showIcon
            title={`Tiền cọc ${formatCurrency(contract.depositAmount)} sẽ được trừ vào công nợ còn lại (${formatCurrency(debt)}) và quyết toán khi ban quản lý duyệt`}
            description="Tiền phòng tháng trả phòng tính theo số ngày ở thực tế. Đơn nhu yếu phẩm chưa thanh toán sẽ tự hủy, không trừ vào tiền cọc. Nhớ bàn giao chìa khóa đúng hẹn."
          />
        )}
        {type === 'renewal' && (
          <Alert type="info" showIcon title="Gia hạn không thu thêm tiền cọc" description="Tiền phòng các tháng gia hạn được lập hóa đơn hằng tháng như hiện tại." />
        )}
      </Form>
    </Modal>
  );
}
