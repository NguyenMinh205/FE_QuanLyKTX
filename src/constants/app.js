/**
 * Thông tin hiển thị chính thức của Trung tâm Ký túc xá HaUI (2026–2027).
 */
export const APP_VERSION = 'v3.0';

/** Danh mục Khoa / Viện HaUI */
export const FACULTIES = [
  'Công nghệ thông tin',
  'Cơ khí',
  'Điện',
  'Điện tử',
  'Kế toán - Kiểm toán',
  'Quản lý kinh doanh',
  'Du lịch',
  'Ngoại ngữ',
  'Ngôn ngữ Anh',
  'Ngôn ngữ Trung Quốc',
  'Ngôn ngữ Hàn Quốc',
  'Ngôn ngữ Nhật',
  'Công nghệ May và Thiết kế thời trang',
  'Công nghệ Hóa',
  'Công nghệ thực phẩm',
  'Công nghệ kỹ thuật môi trường',
];

export const FACULTY_OPTIONS = FACULTIES.map((value) => ({ value, label: value }));

export const SUPPORT_CONTACT = {
  office: 'Văn phòng KTX Cơ sở 1 — Tầng 1 nhà A14 (Khu A14–A15), Ngõ 296 Đường Cầu Diễn, P. Tây Tựu, Hà Nội',
  hotline: '0964.331.300',
  email: 'ssc@haui.edu.vn',
  website: 'https://ssc.haui.edu.vn',
  workingHours: '7:30 – 17:00, Thứ 2 đến Thứ 6',
};
