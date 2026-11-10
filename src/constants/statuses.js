/**
 * Nguồn duy nhất định nghĩa nhãn tiếng Việt + màu cho mọi trạng thái (docs/08 mục 4.2).
 * Giá trị enum viết CHỮ THƯỜNG, khớp DATA-SCHEMA.md.
 * KHÔNG viết chuỗi trạng thái trực tiếp ở bất kỳ đâu khác.
 */

/** Đơn đăng ký và hợp đồng chung một bản ghi (FR-31): `pending`, `rejected` là đơn; còn lại là hợp đồng */
export const CONTRACT_STATUS = {
  pending:    { label: 'Chờ duyệt',     color: 'warning' },
  rejected:   { label: 'Bị từ chối',    color: 'error' },
  active:     { label: 'Đang hiệu lực', color: 'success' },
  expired:    { label: 'Hết hạn',       color: 'default' },
  terminated: { label: 'Đã chấm dứt',   color: 'default' },
};

/** Gói thuê trọn gói (BR-02) */
export const CONTRACT_TERM = {
  '6_months':  { label: '6 tháng',  hint: '1 học kỳ',   months: 6 },
  '12_months': { label: '12 tháng', hint: 'cả năm học', months: 12 },
};

/** v2: không thu một phần, không hủy, không có trạng thái quá hạn — hạn đã qua chỉ tô đỏ ngày (API.md §8) */
export const INVOICE_STATUS = {
  unpaid: { label: 'Chưa thanh toán', color: 'warning' },
  paid:   { label: 'Đã thanh toán',   color: 'success' },
};

export const INVOICE_TYPE = {
  deposit:       { label: 'Tiền cọc',         color: 'blue' },
  room_semester: { label: 'Tiền phòng cả kỳ', color: 'geekblue' },
  utility:       { label: 'Điện nước',        color: 'cyan' },
};

/** Hóa đơn cá nhân (cọc, tiền phòng) hay của cả phòng (điện nước, một bạn đại diện nộp) */
export const INVOICE_SCOPE = {
  personal: { label: 'Cá nhân' },
  room:     { label: 'Cả phòng' },
};

export const BED_STATUS = {
  available:   { label: 'Trống',      color: 'success' },
  occupied:    { label: 'Đã sử dụng', color: 'processing' },
  maintenance: { label: 'Bảo trì',    color: 'default' },
};

export const ROOM_STATUS = {
  active:   { label: 'Đang hoạt động',  color: 'success' },
  maintenance: { label: 'Đang bảo trì', color: 'warning' },
};

export const ROOM_CAPACITY_OPTIONS = [4, 6, 8].map((n) => ({ value: n, label: `${n} chỗ` }));

export const PAYMENT_METHOD = {
  cash:   { label: 'Tiền mặt' },
  vietqr: { label: 'Chuyển khoản VietQR' },
  vnpay:  { label: 'VNPay' }, // chỉ còn ở luồng thử của cổng SV — bỏ ở M8
};

export const GENDER = {
  male:   { label: 'Nam' },
  female: { label: 'Nữ' },
};

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];
