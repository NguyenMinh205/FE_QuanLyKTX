/**
 * Toàn bộ endpoint giả, gom theo module giống `modules/` của backend.
 * Mỗi hàm ở đây tương ứng một endpoint trong API.md.
 */
import { delay, ok, paginate, fail, search } from './mockHelpers';
import {
  buildings, rooms, beds, students, residencies, contracts,
  feeTypes, utilityReadings, invoices, payments, requests,
  occupancyStats, debtOf,
} from './mockDb';

// ---------------------------------------------------------------- auth
const ACCOUNTS = [
  { email: 'admin@dorm.local',  password: 'Admin@123',   id: 'u1', fullName: 'Nguyễn Văn Quản Trị', role: 'admin',   studentId: null },
  { email: 'staff@dorm.local',  password: 'Staff@123',   id: 'u2', fullName: 'Lê Thị Nhân Viên',    role: 'staff',   studentId: null },
  { email: 'viewer@dorm.local', password: 'Viewer@123',  id: 'u3', fullName: 'Trần Văn Người Xem',  role: 'viewer',  studentId: null },
  { email: 'sv001@dorm.local',  password: 'Student@123', id: 'u4', fullName: students[0].fullName,  role: 'student', studentId: students[0].id },
];

export const mockAuth = {
  login: async ({ email, password }) => {
    await delay(400);
    const found = ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!found) fail(401, 'UNAUTHORIZED', 'Email hoặc mật khẩu không đúng');
    return ok({
      token: `mock-token-${found.role}`,
      expiresIn: 604800,
      user: {
        id: found.id, email: found.email, fullName: found.fullName,
        role: found.role, studentId: found.studentId, mustChangePassword: false,
      },
    }, 'Đăng nhập thành công');
  },
  changePassword: async ({ currentPassword }) => {
    await delay();
    if (currentPassword !== 'Admin@123' && currentPassword !== 'Staff@123'
        && currentPassword !== 'Viewer@123' && currentPassword !== 'Student@123') {
      fail(400, 'VALIDATION_ERROR', 'Mật khẩu hiện tại không đúng',
        { errors: [{ field: 'currentPassword', message: 'Mật khẩu hiện tại không đúng' }] });
    }
    return ok(null, 'Đổi mật khẩu thành công');
  },
};

// ---------------------------------------------------------------- students
export const mockStudents = {
  getList: async (q = {}) => {
    await delay();
    let rows = students.filter((s) => s.status === (q.status || 'active'));
    rows = search(rows, q.search, ['fullName', 'studentCode', 'phone']);
    if (q.gender) rows = rows.filter((s) => s.gender === q.gender);
    if (q.faculty) rows = rows.filter((s) => s.faculty === q.faculty);

    const items = rows.map((s) => {
      const c = contracts.find((x) => x.studentId === s.id && x.status === 'active');
      return {
        ...s,
        residence: c ? { bedCode: c.bedCode, buildingName: c.buildingName, roomNumber: c.roomNumber, endDate: c.endDate } : null,
        totalDebt: debtOf(s.id),
      };
    });
    return paginate(items, q);
  },
  getById: async (id) => {
    await delay();
    const s = students.find((x) => x.id === id);
    if (!s) fail(404, 'NOT_FOUND', 'Không tìm thấy sinh viên');
    const c = contracts.find((x) => x.studentId === id && x.status === 'active');
    return ok({ ...s, contract: c || null, totalDebt: debtOf(id) });
  },
  create: async (body) => {
    await delay();
    if (students.some((s) => s.studentCode === body.studentCode)) {
      fail(409, 'DUPLICATE_ENTRY', 'Mã số sinh viên đã tồn tại',
        { errors: [{ field: 'studentCode', message: 'Mã số sinh viên đã tồn tại' }] });
    }
    const s = { id: `s${students.length + 1}`, status: 'active', ...body };
    students.push(s);
    return ok(s, 'Thêm sinh viên thành công');
  },
  update: async (id, body) => {
    await delay();
    const s = students.find((x) => x.id === id);
    if (!s) fail(404, 'NOT_FOUND', 'Không tìm thấy sinh viên');
    Object.assign(s, body);
    return ok(s, 'Cập nhật thành công');
  },
  deactivate: async (id) => {
    await delay();
    if (contracts.some((c) => c.studentId === id && ['pending', 'active'].includes(c.status))) {
      fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đang có hợp đồng hiệu lực, không thể vô hiệu hóa');
    }
    if (debtOf(id) > 0) fail(422, 'STUDENT_HAS_DEBT', 'Sinh viên còn công nợ chưa thanh toán');
    const s = students.find((x) => x.id === id);
    s.status = 'inactive';
    return ok(s, 'Đã vô hiệu hóa sinh viên');
  },
};

// ---------------------------------------------------------------- rooms / beds
export const mockRooms = {
  getBuildings: async () => {
    await delay();
    const stats = occupancyStats();
    return ok(buildings.map((b) => ({
      ...b,
      stats: stats.byBuilding.find((x) => x.buildingName === b.name),
    })));
  },
  getRooms: async (q = {}) => {
    await delay();
    let rows = rooms;
    if (q.buildingId) rows = rows.filter((r) => r.buildingId === q.buildingId);
    if (q.gender) rows = rows.filter((r) => r.gender === q.gender);
    rows = search(rows, q.search, ['roomNumber', 'buildingName']);

    const items = rows.map((r) => {
      const bs = beds.filter((b) => b.roomId === r.id);
      return {
        ...r,
        totalBeds: bs.length,
        occupied: bs.filter((b) => b.status === 'occupied').length,
        available: bs.filter((b) => b.status === 'available').length,
        maintenance: bs.filter((b) => b.status === 'maintenance').length,
      };
    });
    const filtered = q.hasAvailableBed === 'true' ? items.filter((r) => r.available > 0) : items;
    return paginate(filtered, q);
  },
  getBeds: async (roomId) => {
    await delay();
    const items = beds.filter((b) => b.roomId === roomId).map((b) => {
      const c = contracts.find((x) => x.bedId === b.id && ['pending', 'active'].includes(x.status));
      return { ...b, occupant: c ? { studentCode: c.studentCode, studentName: c.studentName } : null };
    });
    return ok({ items, total: items.length, page: 1, limit: items.length });
  },
  getAvailableBeds: async (q = {}) => {
    await delay();
    let rows = beds.filter((b) => b.status === 'available');
    if (q.gender) rows = rows.filter((b) => b.gender === q.gender);
    if (q.buildingId) {
      const ids = rooms.filter((r) => r.buildingId === q.buildingId).map((r) => r.id);
      rows = rows.filter((b) => ids.includes(b.roomId));
    }
    if (q.maxPrice) rows = rows.filter((b) => b.pricePerBed <= Number(q.maxPrice));
    return paginate(rows, q);
  },
  setBedStatus: async (id, status) => {
    await delay();
    const b = beds.find((x) => x.id === id);
    if (!b) fail(404, 'NOT_FOUND', 'Không tìm thấy giường');
    if (b.status === 'occupied') fail(422, 'BED_OCCUPIED', 'Giường đang có người ở, không thể chuyển bảo trì');
    b.status = status;
    return ok(b, 'Đã cập nhật trạng thái giường');
  },
};

// ---------------------------------------------------------------- residencies
export const mockResidencies = {
  getList: async (q = {}) => {
    await delay();
    const items = residencies.map((r) => {
      const st = students.find((s) => s.id === r.studentId);
      const bd = beds.find((b) => b.id === r.bedId);
      const c = contracts.find((x) => x.residencyId === r.id);
      return {
        ...r,
        studentCode: st?.studentCode, studentName: st?.fullName,
        bedCode: bd?.bedCode, buildingName: bd?.buildingName, roomNumber: bd?.roomNumber,
        contractCode: c?.contractCode, contractStatus: c?.status,
      };
    });
    return paginate(search(items, q.search, ['studentCode', 'studentName', 'bedCode']), q);
  },
  create: async ({ studentId, bedId }) => {
    await delay();
    const st = students.find((s) => s.id === studentId);
    const bd = beds.find((b) => b.id === bedId);
    if (!st || !bd) fail(404, 'NOT_FOUND', 'Không tìm thấy sinh viên hoặc giường');
    if (contracts.some((c) => c.studentId === studentId && ['pending', 'active'].includes(c.status))) {
      fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đã có hợp đồng đang hiệu lực');
    }
    if (bd.gender !== st.gender) {
      fail(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${bd.gender === 'male' ? 'nam' : 'nữ'}`);
    }
    if (bd.status !== 'available') fail(409, 'BED_NOT_AVAILABLE', 'Giường này vừa được xếp cho sinh viên khác');
    bd.status = 'occupied';
    return ok({ id: `res${residencies.length + 1}`, status: 'active' }, 'Đăng ký lưu trú thành công');
  },
};

// ---------------------------------------------------------------- contracts
export const mockContracts = {
  getList: async (q = {}) => {
    await delay();
    let rows = contracts;
    if (q.status) rows = rows.filter((c) => c.status === q.status);
    if (q.expiringInDays) {
      const limit = new Date('2026-11-01');
      limit.setDate(limit.getDate() + Number(q.expiringInDays));
      rows = rows.filter((c) => c.status === 'active' && new Date(c.endDate) <= limit);
    }
    rows = search(rows, q.search, ['contractCode', 'studentCode', 'studentName', 'bedCode']);
    return paginate(rows.map((c) => ({ ...c, totalDebt: debtOf(c.studentId) })), q);
  },
  getById: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    return ok({ ...c, totalDebt: debtOf(c.studentId), invoices: invoices.filter((i) => i.contractId === id) });
  },
  activate: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    if (c.status !== 'pending') fail(422, 'CONTRACT_NOT_ACTIVE', 'Hợp đồng không ở trạng thái chờ kích hoạt');
    c.status = 'active';
    return ok({
      contract: c,
      invoices: [
        { invoiceCode: 'INV-202609-90001', type: 'deposit', billingPeriod: null, totalAmount: c.depositAmount, dueDate: '2026-09-08' },
        { invoiceCode: 'INV-202609-90002', type: 'monthly', billingPeriod: '2026-09', totalAmount: c.monthlyPrice, dueDate: '2026-09-08' },
      ],
    }, 'Kích hoạt hợp đồng thành công');
  },
  terminate: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    c.status = 'terminated';
    const bd = beds.find((b) => b.id === c.bedId);
    if (bd) bd.status = 'available';
    return ok(c, 'Đã chấm dứt hợp đồng');
  },
};

// ---------------------------------------------------------------- fees
export const mockFees = {
  getFeeTypes: async () => { await delay(); return ok(feeTypes); },
  getUtilityReadings: async (q = {}) => {
    await delay();
    let rows = utilityReadings;
    if (q.billingPeriod) rows = rows.filter((u) => u.billingPeriod === q.billingPeriod);
    const items = rows.map((u) => ({
      ...u,
      electricityConsumption: u.electricityEnd - u.electricityStart,
      electricityAmount: (u.electricityEnd - u.electricityStart) * u.electricityUnitPrice,
      waterConsumption: u.waterEnd - u.waterStart,
      waterAmount: (u.waterEnd - u.waterStart) * u.waterUnitPrice,
    }));
    return paginate(items, q);
  },
  saveUtilityReading: async (body) => {
    await delay();
    if (Number(body.electricityEnd) < Number(body.electricityStart)
        || Number(body.waterEnd) < Number(body.waterStart)) {
      fail(422, 'INVALID_METER_READING', 'Chỉ số cuối kỳ phải lớn hơn hoặc bằng chỉ số đầu kỳ');
    }
    return ok(body, 'Lưu chỉ số thành công');
  },
  getInvoices: async (q = {}) => {
    await delay();
    let rows = invoices;
    if (q.status) rows = rows.filter((i) => i.status === q.status);
    if (q.type) rows = rows.filter((i) => i.type === q.type);
    if (q.billingPeriod) rows = rows.filter((i) => i.billingPeriod === q.billingPeriod);
    if (q.studentId) rows = rows.filter((i) => i.studentId === q.studentId);
    rows = search(rows, q.search, ['invoiceCode', 'studentCode', 'studentName']);
    return paginate(rows.map((i) => ({ ...i, remainingAmount: i.totalAmount - i.paidAmount })), q);
  },
  getInvoiceById: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    return ok({
      ...inv,
      remainingAmount: inv.totalAmount - inv.paidAmount,
      payments: payments.filter((p) => p.invoiceId === id),
    });
  },
  generateInvoices: async ({ billingPeriod }) => {
    await delay(600);
    return ok({
      created: 24, updated: 2, totalAmount: 16_320_000,
      skipped: [
        { roomNumber: '310', reason: 'Chưa nhập chỉ số điện nước' },
        { roomNumber: '208', reason: 'Không có sinh viên đang ở' },
      ],
    }, `Đã lập 24 hóa đơn cho kỳ ${billingPeriod}`);
  },
  cancelInvoice: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (inv.paidAmount > 0) fail(422, 'INVOICE_HAS_PAYMENT', 'Hóa đơn đã phát sinh thanh toán, không thể hủy');
    inv.status = 'cancelled';
    return ok(inv, 'Đã hủy hóa đơn');
  },
};

// ---------------------------------------------------------------- payments
export const mockPayments = {
  getList: async (q = {}) => {
    await delay();
    let rows = payments;
    if (q.method) rows = rows.filter((p) => p.method === q.method);
    if (q.status) rows = rows.filter((p) => p.status === q.status);
    rows = search(rows, q.search, ['transactionRef', 'invoiceCode', 'studentName']);
    return paginate(rows, q);
  },
  recordOffline: async ({ invoiceId, amount }) => {
    await delay();
    const inv = invoices.find((x) => x.id === invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    const remaining = inv.totalAmount - inv.paidAmount;
    if (inv.status === 'paid') fail(422, 'INVOICE_ALREADY_PAID', 'Hóa đơn đã được thanh toán đủ');
    if (Number(amount) > remaining) {
      fail(422, 'PAYMENT_EXCEEDS_REMAINING', 'Số tiền thanh toán vượt quá số còn nợ');
    }
    inv.paidAmount += Number(amount);
    inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';
    return ok({ invoice: inv }, 'Ghi nhận thanh toán thành công');
  },
  checkout: async ({ invoiceId, gateway }) => {
    await delay();
    return ok({
      paymentId: 'p999',
      transactionRef: `PAY${Date.now()}`,
      redirectUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock=1&invoice=${invoiceId}&gateway=${gateway}`,
    });
  },
};

// ---------------------------------------------------------------- requests
export const mockRequests = {
  getList: async (q = {}) => {
    await delay();
    let rows = requests;
    if (q.status) rows = rows.filter((r) => r.status === q.status);
    if (q.type) rows = rows.filter((r) => r.type === q.type);
    return paginate(rows, q);
  },
  getById: async (id) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu');
    return ok(r);
  },
  approve: async (id, { forceConfirm } = {}) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (r.type === 'checkout' && r.outstandingDebt > 0 && !forceConfirm) {
      fail(422, 'STUDENT_HAS_DEBT',
        `Sinh viên còn nợ ${r.outstandingDebt.toLocaleString('vi-VN')} đ. Xác nhận vẫn duyệt?`,
        { outstandingDebt: r.outstandingDebt });
    }
    r.status = 'approved';
    const settlement = r.type === 'checkout'
      ? { outstandingDebt: r.outstandingDebt, depositAmount: 500000,
          refundAmount: Math.max(0, 500000 - r.outstandingDebt),
          studentStillOwes: Math.max(0, r.outstandingDebt - 500000) }
      : null;
    return ok({ request: r, settlement }, 'Duyệt yêu cầu thành công');
  },
  reject: async (id, { reviewNote }) => {
    await delay();
    if (!reviewNote?.trim()) {
      fail(400, 'VALIDATION_ERROR', 'Vui lòng nhập lý do từ chối',
        { errors: [{ field: 'reviewNote', message: 'Vui lòng nhập lý do từ chối' }] });
    }
    const r = requests.find((x) => x.id === id);
    r.status = 'rejected';
    r.reviewNote = reviewNote;
    return ok(r, 'Đã từ chối yêu cầu');
  },
};

// ---------------------------------------------------------------- dashboard
export const mockDashboard = {
  getOccupancy: async () => { await delay(); return ok(occupancyStats()); },
  getSummary: async () => {
    await delay();
    const totalDebt = students.reduce((s, st) => s + debtOf(st.id), 0);
    const overdue = invoices.filter((i) => i.status === 'overdue');
    return ok({
      occupancy: occupancyStats().overall,
      residents: {
        activeStudents: contracts.filter((c) => c.status === 'active').length,
        activeContracts: contracts.filter((c) => c.status === 'active').length,
        pendingContracts: contracts.filter((c) => c.status === 'pending').length,
        expiringIn30Days: contracts.filter((c) => c.status === 'active' && c.endDate < '2026-12-01').length,
      },
      finance: {
        totalDebt,
        overdueInvoiceCount: overdue.length,
        overdueAmount: overdue.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0),
      },
      pendingRequests: {
        renewal: requests.filter((r) => r.status === 'pending' && r.type === 'renewal').length,
        checkout: requests.filter((r) => r.status === 'pending' && r.type === 'checkout').length,
      },
    });
  },
};

// ---------------------------------------------------------------- portal (sinh viên)
const ME = students[0];

export const mockPortal = {
  getProfile: async () => { await delay(); return ok(ME); },
  getMyResidence: async () => {
    await delay();
    const c = contracts.find((x) => x.studentId === ME.id && x.status === 'active');
    if (!c) return ok({ hasResidence: false });
    return ok({
      hasResidence: true,
      contract: c,
      debtSummary: {
        totalDebt: debtOf(ME.id),
        unpaidInvoiceCount: invoices.filter((i) => i.studentId === ME.id && i.status !== 'paid').length,
      },
    });
  },
  getMyContracts: async () => { await delay(); return ok(contracts.filter((c) => c.studentId === ME.id)); },
  getMyInvoices: async (q = {}) =>
    mockFees.getInvoices({ ...q, studentId: ME.id }),
  getMyPayments: async () => { await delay(); return ok(payments.filter((p) => p.studentId === ME.id)); },
  getMyRequests: async () => { await delay(); return ok(requests.filter((r) => r.studentId === ME.id)); },
  createRequest: async (body) => {
    await delay();
    if (requests.some((r) => r.studentId === ME.id && r.type === body.type && r.status === 'pending')) {
      fail(409, 'DUPLICATE_PENDING_REQUEST', 'Bạn đã có một yêu cầu cùng loại đang chờ xử lý');
    }
    return ok({ id: 'rq99', status: 'pending', ...body }, 'Gửi yêu cầu thành công');
  },
};
