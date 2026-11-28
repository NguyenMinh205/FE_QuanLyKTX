import dayjs from 'dayjs';
import { downloadWorkbook, loadExcelJS } from '../../../utils/excel';
import { INVOICE_SCOPE, INVOICE_STATUS, INVOICE_TYPE, PAYMENT_METHOD, PAYMENT_TYPE } from '../../../constants/statuses';
import { roomTextOf, subjectOf } from './invoiceView';

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4FF' } };
const TOTAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
const CURRENCY_FMT = '#,##0';

const formatDateShort = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '');
const formatDateTimeShort = (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '');

/** Xuất Bảng kê Hóa đơn / Công nợ (InvoicesPage) ra file .xlsx chuẩn kế toán */
export async function exportInvoicesExcel({ items = [], summary = null }) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Bảng kê hóa đơn', { views: [{ state: 'frozen', ySplit: 3 }] });

  ws.mergeCells('A1:K1');
  ws.getCell('A1').value = `BẢNG KÊ HÓA ĐƠN & CÔNG NỢ KÝ TÚC XÁ HaUI CƠ SỞ 1 — XUẤT NGÀY ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  ws.getCell('A1').font = { bold: true, size: 13 };

  ws.mergeCells('A2:K2');
  ws.getCell('A2').value = summary
    ? `Tổng phải thu: ${Number(summary.totalAmount || 0).toLocaleString('vi-VN')}đ | Đã thu: ${Number(summary.paidAmount || 0).toLocaleString('vi-VN')}đ | Chưa thu: ${Number(summary.unpaidAmount || 0).toLocaleString('vi-VN')}đ (${summary.unpaidCount || 0} hóa đơn)`
    : `Tổng số dòng: ${items.length}`;
  ws.getCell('A2').font = { italic: true, size: 10.5, color: { argb: 'FF475569' } };

  const columns = [
    { key: 'invoiceCode', header: 'Mã hóa đơn', width: 22 },
    { key: 'scope', header: 'Phạm vi', width: 12 },
    { key: 'subject', header: 'Đối tượng / Phòng', width: 26 },
    { key: 'sub', header: 'MSSV / Chi tiết', width: 20 },
    { key: 'type', header: 'Loại hóa đơn', width: 24 },
    { key: 'roomFeeAmount', header: 'Tiền phòng (đ)', width: 16 },
    { key: 'depositAmount', header: 'Tiền cọc (đ)', width: 14 },
    { key: 'amount', header: 'Tổng tiền (đ)', width: 16 },
    { key: 'dueDate', header: 'Hạn nộp', width: 14 },
    { key: 'status', header: 'Trạng thái', width: 16 },
    { key: 'paidInfo', header: 'Người nộp / Ngày thu', width: 28 },
  ];

  ws.columns = columns.map((c) => ({ key: c.key, width: c.width }));
  const headerRow = ws.getRow(3);
  columns.forEach((c, idx) => { headerRow.getCell(idx + 1).value = c.header; });
  headerRow.font = { bold: true };
  headerRow.fill = HEADER_FILL;

  let totalRoom = 0;
  let totalDep = 0;
  let totalAmt = 0;

  items.forEach((inv) => {
    const subj = subjectOf(inv);
    const isEffective = inv.status !== 'cancelled';
    const roomPart = inv.type === 'initial_payment'
      ? (inv.roomFeeAmount ?? 0)
      : inv.type === 'room_semester' ? inv.amount : 0;
    const depPart = inv.type === 'initial_payment'
      ? (inv.depositAmount ?? 0)
      : inv.type === 'deposit' ? inv.amount : 0;

    if (isEffective) {
      totalRoom += roomPart;
      totalDep += depPart;
      totalAmt += inv.amount || 0;
    }

    const row = ws.addRow({
      invoiceCode: inv.invoiceCode,
      scope: INVOICE_SCOPE[inv.scope]?.label ?? inv.scope,
      subject: subj.name,
      sub: subj.sub || (inv.room ? roomTextOf(inv.room) : ''),
      type: INVOICE_TYPE[inv.type]?.label ?? inv.type,
      roomFeeAmount: roomPart || null,
      depositAmount: depPart || null,
      amount: inv.amount || 0,
      dueDate: formatDateShort(inv.dueDate),
      status: INVOICE_STATUS[inv.status]?.label ?? inv.status,
      paidInfo: inv.paidAt ? `${inv.payer?.fullName || ''} (${formatDateShort(inv.paidAt)})`.trim() : '',
    });
    [6, 7, 8].forEach((colIdx) => { row.getCell(colIdx).numFmt = CURRENCY_FMT; });
  });

  const sumRow = ws.addRow({
    invoiceCode: `TỔNG CỘNG (${items.filter((i) => i.status !== 'cancelled').length} HĐ hiệu lực)`,
    roomFeeAmount: totalRoom,
    depositAmount: totalDep,
    amount: totalAmt,
  });
  sumRow.font = { bold: true };
  sumRow.fill = TOTAL_FILL;
  [6, 7, 8].forEach((colIdx) => { sumRow.getCell(colIdx).numFmt = CURRENCY_FMT; });

  await downloadWorkbook(wb, `bang-ke-hoa-don-ktx-${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

/** Xuất Sổ Thu Chi & Hoàn cọc (PaymentsPage) ra file .xlsx */
export async function exportPaymentsExcel({ items = [], summary = null }) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sổ thu chi & Hoàn cọc', { views: [{ state: 'frozen', ySplit: 3 }] });

  ws.mergeCells('A1:K1');
  ws.getCell('A1').value = `SỔ THU CHI & HOÀN CỌC KÝ TÚC XÁ HaUI CƠ SỞ 1 — XUẤT NGÀY ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  ws.getCell('A1').font = { bold: true, size: 13 };

  ws.mergeCells('A2:K2');
  ws.getCell('A2').value = summary
    ? `Tổng thu: ${Number(summary.totalAmount || 0).toLocaleString('vi-VN')}đ (Tiền mặt: ${Number(summary.cashAmount || 0).toLocaleString('vi-VN')}đ · VietQR: ${Number(summary.vietqrAmount || 0).toLocaleString('vi-VN')}đ) | Đã chi hoàn cọc: ${Number(summary.refundAmount || 0).toLocaleString('vi-VN')}đ`
    : `Tổng số chứng từ: ${items.length}`;
  ws.getCell('A2').font = { italic: true, size: 10.5, color: { argb: 'FF475569' } };

  const columns = [
    { key: 'paymentCode', header: 'Mã chứng từ', width: 18 },
    { key: 'paymentType', header: 'Loại phiếu', width: 15 },
    { key: 'paidAt', header: 'Thời gian', width: 18 },
    { key: 'refCode', header: 'Hóa đơn / Hợp đồng', width: 22 },
    { key: 'invoiceType', header: 'Khoản mục', width: 22 },
    { key: 'studentName', header: 'Sinh viên', width: 24 },
    { key: 'studentCode', header: 'MSSV', width: 14 },
    { key: 'room', header: 'Phòng', width: 12 },
    { key: 'signedAmount', header: 'Số tiền (+Thu / -Chi)', width: 20 },
    { key: 'method', header: 'Hình thức / Mã GD', width: 24 },
    { key: 'collector', header: 'Người xử lý / Ghi chú', width: 32 },
  ];

  ws.columns = columns.map((c) => ({ key: c.key, width: c.width }));
  const headerRow = ws.getRow(3);
  columns.forEach((c, idx) => { headerRow.getCell(idx + 1).value = c.header; });
  headerRow.font = { bold: true };
  headerRow.fill = HEADER_FILL;

  let netFlow = 0;
  items.forEach((p) => {
    const isRefund = p.paymentType === 'refund';
    const signed = isRefund ? -(p.amount || 0) : (p.amount || 0);
    netFlow += signed;

    const row = ws.addRow({
      paymentCode: p.paymentCode,
      paymentType: PAYMENT_TYPE[p.paymentType || 'payment']?.label ?? p.paymentType,
      paidAt: formatDateTimeShort(p.paidAt),
      refCode: p.invoiceCode || p.contractCode || '',
      invoiceType: isRefund ? 'Hoàn cọc thanh lý' : (INVOICE_TYPE[p.invoiceType]?.label ?? p.invoiceType ?? ''),
      studentName: p.payer?.fullName ?? '',
      studentCode: p.payer?.studentCode ?? '',
      room: p.room ? roomTextOf(p.room) : '',
      signedAmount: signed,
      method: `${PAYMENT_METHOD[p.method]?.label ?? p.method}${p.transactionCode ? ` (${p.transactionCode})` : ''}`,
      collector: [p.collectedByName || 'Webhook tự động', p.note].filter(Boolean).join(' — '),
    });
    row.getCell(7).numFmt = '@';
    row.getCell(9).numFmt = CURRENCY_FMT;
    row.getCell(9).font = { color: { argb: isRefund ? 'FF6D28D9' : 'FF15803D' }, bold: true };
  });

  const sumRow = ws.addRow({
    paymentCode: `DÒNG TIỀN RÒNG (${items.length} phiếu)`,
    signedAmount: netFlow,
  });
  sumRow.font = { bold: true };
  sumRow.fill = TOTAL_FILL;
  sumRow.getCell(9).numFmt = CURRENCY_FMT;

  await downloadWorkbook(wb, `so-thu-chi-ktx-${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
