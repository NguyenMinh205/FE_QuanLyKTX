/**
 * Thông tin hiển thị của đơn vị vận hành.
 * ⚠️ Số liệu dưới đây là GIÁ TRỊ MẪU lấy từ bản thiết kế — thay bằng thông tin thật của ban quản lý KTX trước khi demo.
 */
export const APP_VERSION = 'v2.0';

/** Khoa/Viện gợi ý ở form nộp đơn, form sinh viên, bộ lọc — dữ liệu minh họa theo SRS, vẫn gõ tên khác được */
export const FACULTIES = ['Công nghệ thông tin', 'Cơ khí', 'Điện', 'Điện tử', 'Du lịch', 'Ngoại ngữ', 'Kinh tế'];

/**
 * Option dựng sẵn cho AutoComplete / Select: dùng thẳng, KHÔNG map thêm lần nữa.
 * ⚠️ Từng bọc hai lần ({ value: { value } }) → bấm vào ô là sập cả trang ("Objects are not valid as a React child").
 */
export const FACULTY_OPTIONS = FACULTIES.map((value) => ({ value, label: value }));

export const SUPPORT_CONTACT = {
  office: 'Phòng Quản sinh KTX (P.101 Tòa K1)',
  hotline: '1900 6868',
  workingHours: '8:00 – 17:00, thứ 2 đến thứ 6',
};
