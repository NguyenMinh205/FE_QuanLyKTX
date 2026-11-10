/**
 * Trạng thái hiển thị một giường khi chọn. Giường nhận đơn = trống và chưa bị đơn khác giữ (UC-01 nhánh 6a).
 * @param ownBed giường của chính đơn đang xét — cán bộ duyệt vẫn chọn lại được dù đơn đó đang "giữ" nó
 */
export const bedStateOf = (bed, ownBed = null) => {
  if (bed.status === 'occupied') return 'occupied';
  if (bed.status === 'maintenance') return 'maintenance';
  if (bed.hasPendingApplication && bed.bedNumber !== ownBed) return 'requested';
  return 'selectable';
};
