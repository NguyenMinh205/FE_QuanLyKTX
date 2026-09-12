import { formatCurrency } from '../utils/formatter';

/**
 * Hiển thị số tiền. Nếu là công nợ (danger) và > 0 thì tô đỏ.
 * @example <MoneyText value={646000} danger />
 */
export default function MoneyText({ value, danger = false, strong = false }) {
  const isDebt = danger && Number(value) > 0;
  return (
    <span style={{ color: isDebt ? '#FF4D4F' : undefined, fontWeight: strong || isDebt ? 600 : undefined }}>
      {formatCurrency(value)}
    </span>
  );
}
