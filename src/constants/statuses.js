/**
 * Nguồn duy nhất định nghĩa nhãn tiếng Việt + màu cho mọi trạng thái.
 * Giá trị enum viết CHỮ THƯỜNG, khớp DATA-SCHEMA.md mục 1.
 * KHÔNG viết chuỗi trạng thái trực tiếp ở bất kỳ đâu khác.
 */

export const CONTRACT_STATUS = {
  pending:    { label: 'Chờ kích hoạt', color: 'warning' },
  active:     { label: 'Đang hiệu lực', color: 'success' },
  expired:    { label: 'Hết hạn',       color: 'default' },
  terminated: { label: 'Đã chấm dứt',   color: 'default' },
};

export const RESIDENCY_STATUS = {
  active: { label: 'Đang ở',     color: 'success' },
  closed: { label: 'Đã kết thúc', color: 'default' },
};

export const INVOICE_STATUS = {
  unpaid:    { label: 'Chưa thanh toán',     color: 'warning' },
  partial:   { label: 'Thanh toán một phần', color: 'processing' },
  paid:      { label: 'Đã thanh toán',       color: 'success' },
  overdue:   { label: 'Quá hạn',             color: 'error' },
  cancelled: { label: 'Đã hủy',              color: 'default' },
};

export const INVOICE_TYPE = {
  deposit:    { label: 'Tiền cọc' },
  monthly:    { label: 'Phí hằng tháng' },
  settlement: { label: 'Thanh lý' },
  other:      { label: 'Khác' },
};

export const BED_STATUS = {
  available:   { label: 'Trống',      color: 'success' },
  occupied:    { label: 'Đã sử dụng', color: 'processing' },
  maintenance: { label: 'Bảo trì',    color: 'default' },
};

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

export const REQUEST_STATUS = {
  pending:   { label: 'Chờ xử lý',  color: 'warning' },
  approved:  { label: 'Đã duyệt',   color: 'success' },
  rejected:  { label: 'Bị từ chối', color: 'error' },
  cancelled: { label: 'Đã hủy',     color: 'default' },
};

export const REQUEST_TYPE = {
  renewal:  { label: 'Gia hạn' },
  checkout: { label: 'Trả phòng' },
};

export const GENDER = {
  male:   { label: 'Nam' },
  female: { label: 'Nữ' },
};

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];
