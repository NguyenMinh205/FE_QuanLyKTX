import { Card, Typography } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { SUPPORT_CONTACT } from '../../../constants/app';

const { Text } = Typography;

export default function SupportCard({ title = 'Cần hỗ trợ đăng ký?' }) {
  return (
    <Card styles={{ body: { display: 'flex', gap: 12, alignItems: 'flex-start' } }} style={{ background: '#FAFAFA' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <CustomerServiceOutlined style={{ fontSize: 18, color: '#595959' }} />
      </div>
      <div>
        <Text strong>{title}</Text>
        <div><Text type="secondary">Hotline: <a href={`tel:${SUPPORT_CONTACT.hotline.replace(/\s/g, '')}`}>{SUPPORT_CONTACT.hotline}</a> — {SUPPORT_CONTACT.office}</Text></div>
        <div><Text type="secondary" style={{ fontSize: 12 }}>Giờ làm việc: {SUPPORT_CONTACT.workingHours}</Text></div>
      </div>
    </Card>
  );
}
