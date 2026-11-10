import { bedStateOf } from '../utils/bedState';

const pad2 = (n) => String(n).padStart(2, '0');

const LOOK = {
  selectable:  { bg: '#F6FFED', border: '#B7EB8F', color: '#389E0D', text: 'Trống' },
  selected:    { bg: '#1677FF', border: '#1677FF', color: '#fff', text: 'Đang chọn' },
  occupied:    { bg: '#FAFAFA', border: '#F0F0F0', color: '#8C8C8C', text: 'Đã có người' },
  requested:   { bg: '#FFF7E6', border: '#FFD591', color: '#D46B08', text: 'Đã có người đăng ký' },
  maintenance: { bg: '#FFF1F0', border: '#FFCCC7', color: '#CF1322', text: 'Bảo trì' },
};

/**
 * Lưới giường để chọn (FR-30, FR-32). Chỉ giường nhận đơn mới bấm được.
 * @param markedBed giường sinh viên đã chọn trong đơn — gắn nhãn để cán bộ đối chiếu
 */
export default function BedPicker({ beds = [], selected, onSelect, ownBed = null, markedBed = null, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 8 }}>
      {beds.map((bed) => {
        const state = bedStateOf(bed, ownBed);
        const enabled = state === 'selectable';
        const isSelected = enabled && bed.bedNumber === selected;
        const look = LOOK[isSelected ? 'selected' : state];
        return (
          <button
            key={bed.bedNumber}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Giường ${pad2(bed.bedNumber)}: ${look.text}`}
            disabled={!enabled}
            onClick={() => onSelect(bed.bedNumber)}
            style={{
              cursor: enabled ? 'pointer' : 'not-allowed', textAlign: 'left', padding: '8px 10px', borderRadius: 8,
              background: look.bg, border: `1px solid ${look.border}`, font: 'inherit', minWidth: 0,
            }}
          >
            <div style={{ fontWeight: 600, color: isSelected ? '#fff' : '#262626' }}>Giường {pad2(bed.bedNumber)}</div>
            <div style={{ fontSize: 12, color: look.color }}>{look.text}</div>
            {markedBed === bed.bedNumber && (
              <div style={{ fontSize: 11, color: isSelected ? '#fff' : '#1677FF' }}>Sinh viên chọn</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
