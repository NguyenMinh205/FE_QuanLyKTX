import axiosClient from '../../../lib/axiosClient';

/** Cổng công khai HaUI - DMS v3.0 (không cần đăng nhập) */
export const applyApi = {
  /** Thông tin 3 cơ sở (địa chỉ 2026), tòa nhà và bảng giá 2026–2027 */
  getCampuses:       ()       => axiosClient.get('/public/campuses'),
  /** Tin tức & bảng tin mở đợt công khai */
  getAnnouncements:  (params) => axiosClient.get('/public/announcements', { params }),
  /** Đợt đăng ký đang mở (?studentCode=&faculty= tự gắn eligibility) */
  getOpenPeriods:    (params) => axiosClient.get('/public/periods/open', { params }),
  /** Phòng còn chỗ trống lọc theo ?periodId=&campus=&buildingId=&gender=&roomTier=&capacity=&maxFloor= */
  getAvailableRooms: (params) => axiosClient.get('/public/rooms/available', { params }),
  /** Nộp đơn trực tuyến trong đợt đang mở */
  submit:            (data)   => axiosClient.post('/contracts/register-online', data),
  /** Tra cứu tiến độ đơn (?studentCode=&email=) */
  getStatus:         (params) => axiosClient.get('/public/applications/status', { params }),
  /** Sinh viên tự hủy đơn khi còn pending ({ studentCode, email, citizenId, reason? }) */
  cancelApplication: (data)   => axiosClient.post('/public/applications/cancel', data),
};
