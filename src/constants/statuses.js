/**
 * Nguồn duy nhất định nghĩa nhãn tiếng Việt + màu cho mọi trạng thái.
 * Xem docs/08 mục 4.2. KHÔNG viết chuỗi trạng thái trực tiếp ở bất kỳ đâu khác.
 */

export const CONTRACT_STATUS = {
  PENDING:    { label: 'Chờ duyệt',     color: 'warning' },
  ACTIVE:     { label: 'Đang hiệu lực', color: 'success' },
  REJECTED:   { label: 'Bị từ chối',    color: 'error' },
  CANCELLED:  { label: 'Đã hủy',        color: 'default' },
  EXPIRED:    { label: 'Hết hạn',       color: 'default' },
  TERMINATED: { label: 'Đã chấm dứt',   color: 'default' },
};

export const INVOICE_STATUS = {
  UNPAID:         { label: 'Chưa thanh toán',     color: 'warning' },
  PARTIALLY_PAID: { label: 'Thanh toán một phần', color: 'processing' },
  PAID:           { label: 'Đã thanh toán',       color: 'success' },
  OVERDUE:        { label: 'Quá hạn',             color: 'error' },
  CANCELLED:      { label: 'Đã hủy',              color: 'default' },
};

export const BED_STATUS = {
  AVAILABLE:   { label: 'Trống',      color: 'success' },
  RESERVED:    { label: 'Giữ chỗ',    color: 'warning' },
  OCCUPIED:    { label: 'Đã sử dụng', color: 'processing' },
  MAINTENANCE: { label: 'Bảo trì',    color: 'default' },
};

export const PAYMENT_STATUS = {
  PENDING:              { label: 'Đang xử lý',   color: 'processing' },
  SUCCESS:              { label: 'Thành công',   color: 'success' },
  FAILED:               { label: 'Thất bại',     color: 'error' },
  EXPIRED:              { label: 'Hết hạn',      color: 'default' },
  REFUNDED:             { label: 'Đã hoàn tiền', color: 'warning' },
  NEEDS_RECONCILIATION: { label: 'Cần đối soát', color: 'error' },
};

export const REQUEST_STATUS = {
  PENDING:   { label: 'Chờ xử lý',  color: 'warning' },
  APPROVED:  { label: 'Đã duyệt',   color: 'success' },
  REJECTED:  { label: 'Bị từ chối', color: 'error' },
  CANCELLED: { label: 'Đã hủy',     color: 'default' },
};

export const GENDER = {
  MALE:   { label: 'Nam' },
  FEMALE: { label: 'Nữ' },
};

export const GENDER_OPTIONS = [
  { value: 'MALE',   label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
];
