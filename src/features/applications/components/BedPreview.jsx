import { Typography } from 'antd';
import { StarFilled, ToolOutlined } from '@ant-design/icons';
import { bedLabelOf } from '../../rooms/utils/roomStatus';

const { Text } = Typography;

/**
 * Sơ đồ giường của phòng sẽ xếp — CHỈ ĐỂ XEM, không bấm được (BR-38).
 * Ngôi sao đánh dấu giường trống số nhỏ nhất = giường hệ thống dự kiến gán, không phải lựa chọn.
 */
export default function BedPreview({ beds = [] }) {
  const nextBed = beds.find((b) => b.status === 'available');

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {beds.map((bed) => {
          const isNext = bed.id === nextBed?.id;
          const style = {
            occupied:    { bg: '#FAFAFA', border: '#F0F0F0', color: '#595959' },
            available:   { bg: '#F6FFED', border: '#B7EB8F', color: '#389E0D' },
            maintenance: { bg: '#FFF1F0', border: '#FFCCC7', color: '#CF1322' },
          }[bed.status];
          return (
            <div
              key={bed.id}
              data-bed={bedLabelOf(bed)}
              style={{
                padding: '8px 10px', borderRadius: 8, background: isNext ? '#E6F4FF' : style.bg,
                border: `${isNext ? 2 : 1}px solid ${isNext ? '#1677FF' : style.border}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Giường {String(bed.bedNumber).padStart(2, '0')}</Text>
                {isNext && <StarFilled style={{ color: '#1677FF' }} />}
              </div>
              {bed.status === 'occupied' && <Text ellipsis style={{ display: 'block', fontSize: 13 }}>{bed.occupant?.studentName ?? 'Đang có người'}</Text>}
              {bed.status === 'available' && (
                <Text strong style={{ display: 'block', fontSize: 13, color: isNext ? '#1677FF' : style.color }}>
                  {isNext ? 'Dự kiến gán' : 'Trống'}
                </Text>
              )}
              {bed.status === 'maintenance' && (
                <Text style={{ display: 'block', fontSize: 13, color: style.color }}><ToolOutlined /> Bảo trì</Text>
              )}
            </div>
          );
        })}
      </div>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
        <StarFilled style={{ color: '#1677FF' }} /> Hệ thống tự gán giường trống số nhỏ nhất khi duyệt. Sơ đồ chỉ để xem, không chọn giường.
      </Text>
    </>
  );
}
