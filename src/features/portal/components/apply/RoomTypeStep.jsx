import { Card, Segmented, Tag, Typography, Skeleton, Alert } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { ROOM_TIER } from '../../../../constants/statuses';
import { formatCurrency } from '../../../../utils/formatter';
import EmptyState from '../../../../components/EmptyState';

const { Text } = Typography;

function RoomTypeRow({ type, selected, onSelect }) {
  const full = !(type.availableSlots > 0);
  const choose = () => !full && onSelect(type.id);

  return (
    <div
      role="radio"
      tabIndex={full ? -1 : 0}
      aria-checked={selected}
      aria-disabled={full}
      aria-label={`${type.name}, ${full ? 'hết chỗ' : `còn ${type.availableSlots} chỗ`}`}
      onClick={choose}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), choose())}
      style={{
        display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16, borderRadius: 10,
        cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.55 : 1,
        background: selected ? '#F0F7FF' : '#fff',
        border: `${selected ? 2 : 1}px solid ${selected ? '#1677FF' : '#F0F0F0'}`,
        margin: selected ? 0 : 1, transition: 'border-color .15s, background .15s',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', textAlign: 'center',
        background: selected ? '#1677FF' : '#E6F4FF', color: selected ? '#fff' : '#1677FF', lineHeight: 1.1,
      }}>
        <div><div style={{ fontSize: 20, fontWeight: 700 }}>{type.capacity}</div><div style={{ fontSize: 11 }}>người</div></div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ fontSize: 16 }}>{type.name}</Text>
        <div><Text type="secondary" style={{ fontSize: 13 }}>{type.amenities.join(' · ')}</Text></div>
        {type.includedSupplies?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {type.includedSupplies.map((s) => <Tag key={s} color="blue" variant="outlined" style={{ margin: 0 }}>Cấp sẵn: {s}</Tag>)}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          {full
            ? <Text type="danger" strong>● Hết chỗ</Text>
            : <Text style={{ color: '#389E0D' }}>● Còn {type.availableSlots} chỗ · {type.roomCount} phòng</Text>}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {selected && <Text style={{ color: '#1677FF', display: 'block', fontSize: 13 }}><CheckCircleFilled /> Đang chọn</Text>}
        <Text strong style={{ fontSize: 18, color: selected ? '#1677FF' : undefined }}>{formatCurrency(type.pricePerMonth)}</Text>
        <div><Text type="secondary" style={{ fontSize: 12 }}>/ người / tháng</Text></div>
      </div>
    </div>
  );
}

/** Bước 1 — chọn loại phòng. Số chỗ đã được backend lọc theo giới tính của sinh viên */
export default function RoomTypeStep({ types, loading, error, tier, onTierChange, selectedId, onSelect }) {
  const tiers = Object.keys(ROOM_TIER).filter((t) => (types || []).some((x) => x.tier === t));
  const shown = (types || []).filter((t) => t.tier === tier).sort((a, b) => b.capacity - a.capacity);

  return (
    <Card>
      {error && <Alert type="error" showIcon title={error} />}
      {!error && loading && !types && <Skeleton active paragraph={{ rows: 6 }} />}
      {!error && types && types.length === 0 && <EmptyState description="Hiện chưa mở đăng ký loại phòng nào" />}
      {!error && types && types.length > 0 && (
        <>
          <Segmented
            value={tier}
            onChange={onTierChange}
            options={tiers.map((t) => ({ value: t, label: ROOM_TIER[t].label }))}
            style={{ marginBottom: 16 }}
          />
          <div role="radiogroup" aria-label="Loại phòng" style={{ display: 'grid', gap: 12 }}>
            {shown.map((t) => <RoomTypeRow key={t.id} type={t} selected={t.id === selectedId} onSelect={onSelect} />)}
          </div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 12 }}>
            Giá tính cho <b>một sinh viên</b> mỗi tháng, chưa gồm tiền điện nước chia theo chỉ số hằng tháng.
          </Text>
        </>
      )}
    </Card>
  );
}
