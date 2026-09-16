/** Giao dịch qua cổng thanh toán — offline (tiền mặt, chuyển khoản) không đối soát với cổng */
export const ONLINE_METHODS = ['vnpay', 'zalopay'];

/** Chỉ hỏi lại cổng khi giao dịch online còn treo (FR-56, BR-64) */
export const isReconcilable = (p) => p?.status === 'pending' && ONLINE_METHODS.includes(p.method);

/** Thời điểm hiển thị: thành công thì lấy lúc trả tiền, chưa thì lúc tạo giao dịch */
export const paymentTimeOf = (p) => p?.paidAt || p?.createdAt || null;

/** Backend hiện tại: `paymentMethod`, `transactionId`, trạng thái `completed`, `studentId`/`invoiceId` là object */
export const normalizePayment = (p = {}) => {
  const student = p.studentId && typeof p.studentId === 'object' ? p.studentId : null;
  const invoice = p.invoiceId && typeof p.invoiceId === 'object' ? p.invoiceId : null;
  return {
    ...p,
    studentId: student ? (student.id ?? student._id) : p.studentId,
    studentName: p.studentName ?? student?.fullName ?? null,
    studentCode: p.studentCode ?? student?.studentCode ?? null,
    invoiceId: invoice ? (invoice.id ?? invoice._id) : p.invoiceId,
    invoiceCode: p.invoiceCode ?? invoice?.invoiceCode ?? null,
    invoiceType: p.invoiceType ?? invoice?.type ?? null,
    method: p.method ?? p.paymentMethod,
    gatewayTransactionId: p.gatewayTransactionId ?? p.transactionId ?? null,
    recordedByName: p.recordedByName ?? p.recordedBy?.fullName ?? null,
    status: p.status === 'completed' ? 'success' : p.status,
    type: p.type ?? 'payment',
  };
};
