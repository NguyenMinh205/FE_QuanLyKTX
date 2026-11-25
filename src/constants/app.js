/**
 * Thông tin hiển thị chính thức của Trung tâm Ký túc xá HaUI (2026–2027).
 */
export const APP_VERSION = 'v3.0';

/** Danh mục Khoa / Viện HaUI — đồng bộ với quy tắc phân luồng CS1-CS2 vs CS3 của BE */
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
  office: 'Trung tâm Hỗ trợ SV / KTX HaUI — CS1 (A14/A15), CS2 (B12), CS3 (C15 Phù Vân)',
  hotline: '0964.331.300',
  email: 'ssc@haui.edu.vn',
  website: 'https://ssc.haui.edu.vn',
  workingHours: '7:30 – 17:00, Thứ 2 đến Thứ 6',
};
