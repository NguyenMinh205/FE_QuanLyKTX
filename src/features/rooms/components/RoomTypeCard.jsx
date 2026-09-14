import { Card, Tag, Typography, Divider, Tooltip } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import StatusTag from '../../../components/StatusTag';
import { formatCurrency } from '../../../utils/formatter';

const { Title, Text } = Typography;

/** Thẻ một loại phòng — SCR-22 (docs/08 mục 6.2) */
export default function RoomTypeCard({ roomType: t, canEdit, onEdit }) {
  const hasStats = typeof t.roomCount === 'number';

  return (
    <Card
      style={{ height: '100%', opacity: t.isActive ? 1 : 0.6 }}
      styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          <StatusTag type="roomTier" value={t.tier} />
          {!t.isActive && <Tag>Ngừng sử dụng</Tag>}
        </span>
        <Text strong><TeamOutlined /> {t.capacity} người</Text>
      </div>

      <Title level={5} style={{ margin: '12px 0 4px' }}>{t.name}</Title>
      <div>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#1677FF' }}>{formatCurrency(t.pricePerMonth)}</span>
        <Text type="secondary"> /người/tháng</Text>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>Tiền cọc {formatCurrency(t.depositAmount)}</Text>

      <Divider style={{ margin: '16px 0' }} />

      <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>CẤP SẴN TRONG PHÒNG</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, flex: 1, alignContent: 'flex-start' }}>
        {t.amenities.map((a) => <Tag key={a} variant="outlined" style={{ margin: 0 }}>{a}</Tag>)}
        {t.includedSupplies?.map((s) => (
          <Tooltip key={s} title="Nhu yếu phẩm cấp sẵn — chỉnh ở màn Nhu yếu phẩm">
            <Tag color="blue" variant="outlined" style={{ margin: 0 }}>{s}</Tag>
          </Tooltip>
        ))}
        {t.amenities.length === 0 && !t.includedSupplies?.length && <Text type="secondary">Chưa khai báo</Text>}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {hasStats ? (
          <Text type="secondary">
            {t.roomCount} phòng ·{' '}
            {t.availableSlots > 0
              ? <>còn <Text strong>{t.availableSlots}</Text> chỗ trống</>
              : <Text type="danger" strong>hết chỗ</Text>}
          </Text>
        ) : <span />}
        {canEdit && <a onClick={onEdit}>Sửa</a>}
      </div>
    </Card>
  );
}
