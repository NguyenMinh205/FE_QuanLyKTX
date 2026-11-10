import {
  cellText, downloadWorkbook, loadExcelJS, readFirstSheet,
} from '../../../utils/excel';
import { periodLabel } from './readingSheet';

const HEADERS = ['Phòng', 'Người ở', 'Điện cũ', 'Điện mới', 'Nước cũ', 'Nước mới'];
const FIELD_COLS = { electricityOldIndex: 3, electricityNewIndex: 4, waterOldIndex: 5, waterNewIndex: 6 };
/** Dòng 1 ghi tòa + tháng; khi nhập đọc lại để không nạp nhầm file tòa khác / tháng khác vào lưới */
const META_RE = /\[(\S+)\|(\d{4}-\d{2})\]/;

/**
 * FR-40: xuất danh sách phòng của tòa + tháng đang mở, số cũ điền sẵn, số mới để trống (hoặc số đã lưu).
 * Phòng trống và phòng đã chốt vẫn có mặt cho đủ danh sách nhưng ghi chú để cán bộ bỏ qua.
 */
export const exportReadingSheet = async ({ buildingCode, buildingName, monthYear, rows }) => {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Chỉ số', { views: [{ state: 'frozen', ySplit: 2 }] });
  ws.getCell('A1').value = `Chỉ số điện nước ${buildingName} — ${periodLabel(monthYear)} [${buildingCode}|${monthYear}]`;
  ws.getCell('A1').font = { bold: true };
  ws.getRow(2).values = [...HEADERS, 'Ghi chú'];
  ws.getRow(2).font = { bold: true };
  // ⚠️ ws.columns là null khi chưa khai báo cột — đặt độ rộng qua getColumn
  for (let c = 1; c <= 7; c += 1) ws.getColumn(c).width = c === 7 ? 34 : 12;
  rows.forEach((r, i) => {
    const note = r.billed ? 'Đã chốt — không sửa' : r.skipped ? 'Phòng trống — bỏ qua' : '';
    ws.getRow(i + 3).values = [
      r.roomLabel, r.occupants,
      r.values.electricityOldIndex ?? null, r.values.electricityNewIndex ?? null,
      r.values.waterOldIndex ?? null, r.values.waterNewIndex ?? null, note,
    ];
    // Ô cần nhập tô vàng nhạt cho dễ nhìn
    if (!note) [4, 6].forEach((c) => { ws.getCell(i + 3, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBE6' } }; });
  });
  await downloadWorkbook(wb, `chi-so-${buildingCode}-${monthYear}.xlsx`);
};

/**
 * Đọc file đã điền → { buildingCode, monthYear, entries: [{ excelRow, label, values }] }.
 * `values` chỉ gồm ô có số (ô trống không ghi đè lưới). Ô không phải số nguyên không âm → `invalid`.
 */
export const parseReadingFile = async (file) => {
  const ws = await readFirstSheet(file);
  const meta = cellText(ws.getCell('A1')).match(META_RE);
  const entries = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 2) return;
    const label = cellText(row.getCell(1));
    if (!label) return;
    const values = {};
    const invalid = [];
    Object.entries(FIELD_COLS).forEach(([field, col]) => {
      // ⚠️ Không bỏ dấu . hay , — 312.5 (hoặc 312,5 kiểu Việt) sẽ thành 3125, tiền gấp 10 lần
      const text = cellText(row.getCell(col)).replace(/\s/g, '');
      if (text === '') return;
      if (/^\d+$/.test(text)) values[field] = Number(text);
      else invalid.push(HEADERS[col - 1]);
    });
    entries.push({ excelRow: rowNumber, label, values, invalid });
  });
  return { buildingCode: meta?.[1] ?? null, monthYear: meta?.[2] ?? null, entries };
};
