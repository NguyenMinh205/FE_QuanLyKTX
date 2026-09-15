import { formatCurrency } from '../../../utils/formatter';

/** Loại phí hệ thống — lập hóa đơn, quyết toán cần tới nên không ngừng dùng được (DATA-SCHEMA 3.8) */
export const SYSTEM_FEE_CODES = ['rent', 'electricity', 'water', 'deposit', 'supplies', 'other'];

/** Chỉ điện, nước đọc defaultAmount làm đơn giá khi nhập chỉ số */
export const PRICED_FEE_CODES = ['electricity', 'water'];

/** Loại phí có số tiền lấy từ nơi khác — đơn giá ở danh mục không dùng */
export const PRICE_SOURCE = {
  rent: 'Theo hợp đồng',
  deposit: 'Theo hợp đồng',
  supplies: 'Theo đơn hàng',
};

export const UNIT_OPTIONS = ['tháng', 'kWh', 'm3', 'lần', 'chiếc', 'đơn', 'người'].map((value) => ({ value }));

export const isSystemFee = (t) => t?.isSystem ?? SYSTEM_FEE_CODES.includes(t?.code);

/** { main, hint } — cách hiển thị đơn giá theo loại phí */
export const priceTextOf = (t) => {
  if (PRICE_SOURCE[t.code]) return { main: null, hint: PRICE_SOURCE[t.code] };
  if (PRICED_FEE_CODES.includes(t.code)) return { main: `${formatCurrency(t.defaultAmount)}/${t.unit}`, hint: 'Dùng khi nhập chỉ số điện nước' };
  if (t.defaultAmount > 0) return { main: `${formatCurrency(t.defaultAmount)}/${t.unit}`, hint: 'Gợi ý khi lập hóa đơn thủ công' };
  return { main: null, hint: 'Nhập số tiền khi lập hóa đơn' };
};

/** Loại hệ thống theo thứ tự trên hóa đơn, rồi loại tự thêm theo mã */
export const sortFeeTypes = (list) => {
  const rank = (t) => { const i = SYSTEM_FEE_CODES.indexOf(t.code); return i === -1 ? SYSTEM_FEE_CODES.length : i; };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code));
};
