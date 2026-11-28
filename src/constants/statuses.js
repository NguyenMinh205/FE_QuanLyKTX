/**
 * Nguồn duy nhất định nghĩa enum, nhãn tiếng Việt, màu thẻ và bảng giá HaUI 2026–2027 (v3.0).
 * Khớp 100% với BE_QLKTX/src/shared/constants/enums.js.
 */

export const CAMPUS = {
  cs1: {
    label: 'Cơ sở 1 (Cầu Diễn)',
    shortLabel: 'CS1 - Cầu Diễn',
    color: 'blue',
    address: 'Ngõ 296 / Số 298 Đường Cầu Diễn, Phường Tây Tựu, TP. Hà Nội',
    buildings: ['A14', 'A15'],
  },
  all: {
    label: 'Toàn bộ KTX Cơ sở 1',
    shortLabel: 'KTX Cơ sở 1',
    color: 'geekblue',
  },
};

export const ROOM_TIER = {
  high_quality: { label: 'Chất lượng cao', color: 'gold' },
  standard:     { label: 'Tiêu chuẩn',     color: 'blue' },
};

export const ROOM_TIER_OPTIONS = Object.entries(ROOM_TIER).map(([value, { label }]) => ({ value, label }));

export const ROOM_CAPACITY_OPTIONS = [2, 3, 4, 6].map((n) => ({ value: n, label: `${n} người` }));

/** Bảng giá phòng ở KTX HaUI chính thức năm học 2026–2027 — Cơ sở 1 (VNĐ/SV/tháng) */
export const ROOM_PRICES_2026 = {
  high_quality: {
    3: { cs1: 930000 },
    4: { cs1: 700000 },
    6: { cs1: 470000 },
  },
  standard: {
    4: { cs1: 550000 },
    6: { cs1: 380000 },
  },
};

export const suggestedPriceOf = (roomTier, capacity, campus) =>
  ROOM_PRICES_2026[roomTier]?.[Number(capacity)]?.[campus] ?? null;

export const ROOM_STATUS = {
  active:      { label: 'Đang hoạt động', color: 'success' },
  maintenance: { label: 'Đang bảo trì',   color: 'warning' },
};

export const PRIORITY_TYPE = {
  policy_family:  { label: 'Gia đình chính sách', color: 'red' },
  poor_household: { label: 'Hộ nghèo / Cận nghèo', color: 'volcano' },
  remote_area:    { label: 'Vùng sâu / Vùng xa',  color: 'orange' },
  normal:         { label: 'Thông thường',        color: 'default' },
};

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_TYPE).map(([value, { label }]) => ({ value, label }));

export const TARGET_COHORT = {
  freshman:  { label: 'Tân sinh viên (Năm 1)', color: 'purple' },
  returning: { label: 'Sinh viên năm 2+',      color: 'blue' },
  all:       { label: 'Mọi khóa sinh viên',    color: 'cyan' },
};

export const TARGET_COHORT_OPTIONS = Object.entries(TARGET_COHORT).map(([value, { label }]) => ({ value, label }));

export const PERIOD_STATUS = {
  upcoming: { label: 'Sắp mở',  color: 'default' },
  open:     { label: 'Đang mở', color: 'success' },
  closed:   { label: 'Đã đóng', color: 'error' },
};

export const PERIOD_STATUS_OPTIONS = Object.entries(PERIOD_STATUS).map(([value, { label }]) => ({ value, label }));

/** Vòng đời đơn & hợp đồng v3.0 */
export const CONTRACT_STATUS = {
  pending:         { label: 'Chờ duyệt',     color: 'warning' },
  pending_payment: { label: 'Chờ đóng phí',  color: 'processing' },
  active:          { label: 'Đang hiệu lực', color: 'success' },
  expired:         { label: 'Hết hạn',       color: 'volcano' },
  terminated:      { label: 'Đã thanh lý',   color: 'default' },
  rejected:        { label: 'Bị từ chối',    color: 'error' },
  cancelled:       { label: 'Đã hủy',        color: 'default' },
};

/** Các gói kỳ hạn hợp lệ (Nửa năm / 1 năm) */
export const CONTRACT_TERM = {
  '6_months':  { label: 'Nửa năm (6 tháng)', hint: '1 học kỳ',   months: 6 },
  '12_months': { label: '1 năm (12 tháng)',  hint: 'Cả năm học', months: 12 },
};

export const CONTRACT_TERM_OPTIONS = Object.entries(CONTRACT_TERM).map(([value, { label, hint }]) => ({
  value,
  label: `${label} (${hint})`,
}));

export const INVOICE_STATUS = {
  unpaid:    { label: 'Chưa thanh toán', color: 'warning' },
  paid:      { label: 'Đã thanh toán',   color: 'success' },
  cancelled: { label: 'Đã hủy',          color: 'default' },
};

export const INVOICE_TYPE = {
  initial_payment: { label: 'Phí đầu kỳ (Phòng + Cọc)', color: 'geekblue' },
  deposit:         { label: 'Tiền cọc',                 color: 'blue' },
  room_semester:   { label: 'Tiền phòng cả kỳ',         color: 'geekblue' },
  utility:         { label: 'Điện nước',                color: 'cyan' },
};

export const INVOICE_TYPE_FILTER_OPTIONS = [
  { value: 'initial_payment', label: 'Phí đầu kỳ (Phòng + Cọc)' },
  { value: 'utility',         label: 'Điện nước' },
];

export const INVOICE_SCOPE = {
  personal: { label: 'Cá nhân' },
  room:     { label: 'Cả phòng' },
};

export const PAYMENT_METHOD = {
  cash:   { label: 'Tiền mặt' },
  vietqr: { label: 'Chuyển khoản VietQR' },
};

export const PAYMENT_TYPE = {
  payment: { label: 'Phiếu thu',      color: 'success' },
  refund:  { label: 'Chi hoàn cọc',   color: 'purple' },
};

export const REQUEST_TYPE = {
  repair:   { label: 'Báo hỏng sửa chữa', color: 'orange' },
  transfer: { label: 'Xin chuyển phòng',  color: 'blue' },
  checkout: { label: 'Đăng ký trả phòng', color: 'volcano' },
};

export const REQUEST_TYPE_OPTIONS = Object.entries(REQUEST_TYPE).map(([value, { label }]) => ({ value, label }));

export const REPAIR_CATEGORY = {
  electric:  { label: 'Hệ thống điện' },
  water:     { label: 'Nước / Vệ sinh' },
  ac:        { label: 'Điều hòa / Nóng lạnh' },
  furniture: { label: 'Giường / Tủ / Cửa' },
  other:     { label: 'Khác' },
};

export const REPAIR_CATEGORY_OPTIONS = Object.entries(REPAIR_CATEGORY).map(([value, { label }]) => ({ value, label }));

export const REQUEST_STATUS = {
  pending:     { label: 'Chờ tiếp nhận', color: 'warning' },
  in_progress: { label: 'Đang xử lý',    color: 'processing' },
  approved:    { label: 'Đã phê duyệt',  color: 'cyan' },
  completed:   { label: 'Hoàn tất',      color: 'success' },
  rejected:    { label: 'Từ chối',       color: 'error' },
  cancelled:   { label: 'SV đã hủy',     color: 'default' },
};

export const NOTIFICATION_TYPE = {
  application:  { label: 'Xếp phòng / HĐ', color: 'blue' },
  payment:      { label: 'Thanh toán',     color: 'green' },
  utility:      { label: 'Điện nước',      color: 'orange' },
  request:      { label: 'Yêu cầu SV',     color: 'purple' },
  announcement: { label: 'Bảng tin',       color: 'default' },
};

export const NOTIFICATION_PRIORITY = {
  urgent:    { label: 'Khẩn cấp',     color: 'red' },
  important: { label: 'Quan trọng',   color: 'warning' },
  normal:    { label: 'Thông thường', color: 'default' },
};

export const NOTIFICATION_PRIORITY_OPTIONS = [
  { value: 'normal',    label: 'Thông thường' },
  { value: 'important', label: 'Quan trọng (Vàng cam)' },
  { value: 'urgent',    label: 'Khẩn cấp (Đỏ · Ghim đầu)' },
];

export const GENDER = {
  male:   { label: 'Nam' },
  female: { label: 'Nữ' },
};

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];
