import { Card, Typography } from 'antd';
import { SUPPORT_CONTACT } from '../../../constants/app';

const { Text } = Typography;

/** Khối thông tin liên hệ văn phòng KTX tối giản */
export default function SupportCard({ title = 'Hỗ trợ sinh viên' }) {
  return (
    <Card title={title} styles={{ body: { padding: '14px 18px' } }}>
      <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
        <div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Hotline trực tiếp</Text>
          <a href={`tel:${SUPPORT_CONTACT.hotline.replace(/\s/g, '')}`} className="mono" style={{ fontSize: 15, fontWeight: 600 }}>
            {SUPPORT_CONTACT.hotline}
          </a>
        </div>
        <div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Văn phòng</Text>
          <Text>{SUPPORT_CONTACT.office}</Text>
        </div>
        <div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Giờ tiếp nhận</Text>
          <Text>{SUPPORT_CONTACT.workingHours}</Text>
        </div>
      </div>
    </Card>
  );
}
