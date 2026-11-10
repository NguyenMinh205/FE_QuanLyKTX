/**
 * Nguồn duy nhất định nghĩa nhãn tiếng Việt + màu cho mọi trạng thái (docs/08 mục 4.2).
 * Giá trị enum viết CHỮ THƯỜNG, khớp DATA-SCHEMA.md.
 * KHÔNG viết chuỗi trạng thái trực tiếp ở bất kỳ đâu khác.
 */

export const APPLICATION_STATUS = {
  pending:   { label: 'Chờ duyệt',  color: 'warning' },
  approved:  { label: 'Đã duyệt',   color: 'success' },
  rejected:  { label: 'Bị từ chối', color: 'error' },
  cancelled: { label: 'Đã hủy',     color: 'default' },
};

/** Không có `pending` — giai đoạn chờ nằm ở đơn đăng ký */
export const CONTRACT_STATUS = {
  active:     { label: 'Đang hiệu lực', color: 'success' },
  expired:    { label: 'Hết hạn',       color: 'default' },
  terminated: { label: 'Đã chấm dứt',   color: 'default' },
};

export const INVOICE_STATUS = {
  unpaid:    { label: 'Chưa thanh toán',     color: 'warning' },
  partial:   { label: 'Thanh toán một phần', color: 'processing' },
  paid:      { label: 'Đã thanh toán',       color: 'success' },
  overdue:   { label: 'Quá hạn',             color: 'error' },
  cancelled: { label: 'Đã hủy',              color: 'default' },
};

export const INVOICE_TYPE = {
  deposit:    { label: 'Tiền cọc',     color: 'blue' },
  monthly:    { label: 'Hàng tháng',   color: 'default' },
  other:      { label: 'Khác',         color: 'default' },
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

export const ROOM_TIER = {
  standard: { label: 'Tiêu chuẩn',     short: 'TC',  color: 'default' },
  premium:  { label: 'Chất lượng cao', short: 'CLC', color: 'gold' },
};

export const ROOM_CAPACITY_OPTIONS = [4, 6, 8].map((n) => ({ value: n, label: `${n} chỗ` }));

export const PAYMENT_STATUS = {
  pending: { label: 'Đang xử lý', color: 'processing' },
  success: { label: 'Thành công', color: 'success' },
  failed:  { label: 'Thất bại',   color: 'error' },
  expired: { label: 'Hết hạn',    color: 'default' },
};

export const PAYMENT_METHOD = {
  cash:          { label: 'Tiền mặt' },
  bank_transfer: { label: 'Chuyển khoản' },
  vnpay:         { label: 'VNPay' },
  zalopay:       { label: 'ZaloPay' },
};

export const GENDER = {
  male:   { label: 'Nam' },
  female: { label: 'Nữ' },
};

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];
