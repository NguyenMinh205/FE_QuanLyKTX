/**
 * Đọc / ghi Excel ở trình duyệt (API.md: FE đọc file rồi gửi JSON, backend không nhận upload).
 * ⚠️ exceljs nặng cỡ 1 MB — luôn tải động qua loadExcelJS() khi người dùng bấm nút, không import tĩnh,
 * kẻo kéo vào bundle chính của mọi trang.
 */
export const loadExcelJS = async () => {
  const mod = await import('exceljs');
  return mod.default ?? mod;
};

/** Tải workbook về máy với tên file cho trước */
export const downloadWorkbook = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Sheet đầu tiên của file .xlsx người dùng chọn */
export const readFirstSheet = async (file) => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('File không có trang tính nào');
  return sheet;
};

/**
 * Giá trị một ô về chuỗi đã cắt khoảng trắng. Excel trả nhiều dạng: số, ngày, công thức, chữ định dạng, link.
 * Ngày trả "YYYY-MM-DD" theo giờ UTC — exceljs đọc ngày Excel ra Date ở UTC nửa đêm.
 */
export const cellText = (cell) => {
  const v = cell?.value;
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('').trim();
    if (v.text !== undefined) return String(v.text).trim();
    if (v.result !== undefined) return v.result instanceof Date ? v.result.toISOString().slice(0, 10) : String(v.result).trim();
    return '';
  }
  return String(v).trim();
};

/** Bỏ dấu + chữ thường để so tiêu đề cột, "Nữ"/"nu"... */
export const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
