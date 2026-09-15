import { useState } from 'react';
import { Modal, Typography, Alert, Button, Input, Space } from 'antd';
import { CopyOutlined, CheckOutlined, KeyOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Hiện mật khẩu tạm MỘT lần (BR-85). Đóng hộp là không xem lại được — không lưu vào state ngoài, không log.
 * @param info { title, email, fullName, password }
 */
export default function TemporaryPasswordModal({ info, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={!!info}
      title={<span><KeyOutlined style={{ color: '#1677FF' }} /> {info?.title}</span>}
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose}>Tôi đã ghi lại mật khẩu</Button>}
      mask={{ closable: false }}
      destroyOnHidden
      width={480}
    >
      {info && (
        <>
          <Text>Mật khẩu tạm của <b>{info.fullName}</b> ({info.email}):</Text>
          <Space.Compact style={{ width: '100%', marginTop: 12 }}>
            <Input
              readOnly value={info.password} aria-label="Mật khẩu tạm"
              style={{ fontFamily: 'Consolas, monospace', fontSize: 20, letterSpacing: 2, textAlign: 'center' }}
            />
            <Button icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={copy} style={{ height: 'auto' }}>
              {copied ? 'Đã chép' : 'Chép'}
            </Button>
          </Space.Compact>
          <Alert
            type="warning" showIcon style={{ marginTop: 16 }}
            title="Mật khẩu chỉ hiện một lần"
            description="Trao trực tiếp cho người dùng. Đóng hộp này sẽ không xem lại được; người dùng bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên."
          />
        </>
      )}
    </Modal>
  );
}
