import { InputNumber, Typography } from 'antd';

const { Text } = Typography;

const meterFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const meterParser = (v) => (v ? v.replace(/\D/g, '') : '');

/**
 * Ô nhập một chỉ số công tơ. Enter nhảy xuống cùng cột ở phòng kế tiếp để nhập nhanh cả tòa.
 * `prefilled` = chỉ số đầu kỳ tự điền từ kỳ trước (BR-51) — nền xám nhưng vẫn sửa được.
 */
export default function MeterCell({ id, nextId, value, onChange, disabled, error, warning, prefilled, label }) {
  const focusNext = () => {
    const next = nextId && document.getElementById(nextId);
    if (next) { next.focus(); next.select?.(); }
  };

  return (
    <div>
      <InputNumber
        id={id}
        aria-label={label}
        size="small"
        style={{ width: '100%' }}
        variant={prefilled && !error && !warning ? 'filled' : 'outlined'}
        value={value}
        onChange={(v) => onChange(v === null ? null : Math.trunc(v))}
        onPressEnter={focusNext}
        min={0}
        max={9999999}
        precision={0}
        controls={false}
        formatter={meterFormatter}
        parser={meterParser}
        placeholder={disabled ? '' : 'Nhập số'}
        disabled={disabled}
        status={error ? 'error' : warning ? 'warning' : undefined}
      />
      {(error || warning) && (
        <Text type={error ? 'danger' : 'warning'} style={{ fontSize: 12, display: 'block', lineHeight: 1.3, marginTop: 2 }}>
          {error || warning}
        </Text>
      )}
    </div>
  );
}
