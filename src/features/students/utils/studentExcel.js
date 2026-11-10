import { FACULTY_OPTIONS } from '../../../constants/app';
import {
  cellText, downloadWorkbook, fold, loadExcelJS, readFirstSheet,
} from '../../../utils/excel';

/** Cột của file mẫu — `header` là chữ trên file, `key` là trường gửi lên POST /students/import */
export const TEMPLATE_COLUMNS = [
  { key: 'studentCode', header: 'MSSV *', width: 14, text: true },
  { key: 'fullName', header: 'Họ và tên *', width: 26 },
  { key: 'gender', header: 'Giới tính * (Nam/Nữ)', width: 18 },
  { key: 'phone', header: 'Số điện thoại *', width: 16, text: true },
  { key: 'email', header: 'Email', width: 28 },
  { key: 'dob', header: 'Ngày sinh (dd/mm/yyyy)', width: 20, text: true },
  { key: 'className', header: 'Lớp', width: 14 },
  { key: 'faculty', header: 'Khoa', width: 24 },
];
export const MAX_IMPORT_ROWS = 1000;

/** File mẫu: trang "Sinh viên" chỉ có dòng tiêu đề (không có dòng ví dụ, tránh nhập nhầm) + trang "Hướng dẫn" */
export const downloadStudentTemplate = async () => {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sinh viên', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = TEMPLATE_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4FF' } };
  // ⚠️ MSSV, SĐT, ngày sinh để dạng chữ: dạng số thì Excel nuốt số 0 đầu của SĐT và tự đổi ngày theo máy
  TEMPLATE_COLUMNS.forEach((c, i) => { if (c.text) ws.getColumn(i + 1).numFmt = '@'; });
  for (let r = 2; r <= MAX_IMPORT_ROWS + 1; r += 1) {
    ws.getCell(r, 3).dataValidation = { type: 'list', allowBlank: false, formulae: ['"Nam,Nữ"'] };
    ws.getCell(r, 8).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${FACULTY_OPTIONS.join(',')}"`] };
  }
  const guide = wb.addWorksheet('Hướng dẫn');
  guide.getColumn(1).width = 100;
  [
    'Điền mỗi sinh viên một dòng ở trang "Sinh viên", bắt đầu từ dòng 2. Cột có dấu * là bắt buộc.',
    'MSSV: đúng 10 chữ số, không trùng sinh viên đã có. Giới tính: chọn Nam hoặc Nữ.',
    'Số điện thoại: 10 số, bắt đầu bằng 0. Ngày sinh: dd/mm/yyyy, ví dụ 05/09/2005.',
    `Mỗi lần nhập tối đa ${MAX_IMPORT_ROWS} dòng. Dòng đúng được lưu kể cả khi có dòng lỗi; xem báo cáo để sửa dòng lỗi rồi nhập lại.`,
    'Nhập sinh viên chỉ tạo hồ sơ, không tạo tài khoản đăng nhập. Tài khoản được cấp khi duyệt đơn ở ký túc xá.',
  ].forEach((line, i) => { guide.getCell(i + 1, 1).value = line; });
  await downloadWorkbook(wb, 'mau-nhap-sinh-vien.xlsx');
};

const GENDER_OF = { nam: 'male', male: 'male', nu: 'female', female: 'female' };

/** "05/09/2005" | "2005-09-05" → "2005-09-05"; sai định dạng thì giữ nguyên để backend báo lỗi đúng dòng */
const toIsoDate = (text) => {
  const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return text;
};

/**
 * Đọc file người dùng chọn → { rows, missing }. Nhận diện cột theo tiêu đề (bỏ dấu, bỏ "*") nên đổi thứ tự cột vẫn đọc đúng.
 * Mỗi dòng mang `row` = số dòng trong Excel để báo cáo lỗi chỉ đúng chỗ. Bỏ qua dòng trống hoàn toàn.
 */
export const parseStudentFile = async (file) => {
  const ws = await readFirstSheet(file);
  const colOf = {};
  ws.getRow(1).eachCell((cell, col) => {
    const head = fold(cellText(cell)).replace(/\*/g, '');
    const match = TEMPLATE_COLUMNS.find((c) => head.startsWith(fold(c.header).replace(/\*/g, '').split('(')[0].trim()));
    if (match && !colOf[match.key]) colOf[match.key] = col;
  });
  const missing = TEMPLATE_COLUMNS.filter((c) => c.header.includes('*') && !colOf[c.key]).map((c) => c.header.replace(' *', '').split(' (')[0]);
  const rows = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (key) => (colOf[key] ? cellText(row.getCell(colOf[key])) : '');
    const values = Object.fromEntries(TEMPLATE_COLUMNS.map((c) => [c.key, get(c.key)]));
    if (Object.values(values).every((v) => v === '')) return;
    // SĐT gõ thành số thì mất số 0 đầu: 912345678 → 0912345678
    const phone = /^\d{9}$/.test(values.phone) ? `0${values.phone}` : values.phone;
    rows.push({
      row: rowNumber,
      studentCode: values.studentCode,
      fullName: values.fullName,
      gender: GENDER_OF[fold(values.gender)] ?? values.gender,
      phone,
      email: values.email || undefined,
      dob: values.dob ? toIsoDate(values.dob) : undefined,
      className: values.className || undefined,
      faculty: values.faculty || undefined,
    });
  });
  return { rows, missing };
};
