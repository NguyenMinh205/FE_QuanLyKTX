/**
 * Toàn bộ endpoint giả, gom theo module giống `modules/` của backend.
 * Mỗi hàm tương ứng một endpoint trong API.md v1.2 và ném ĐÚNG mã lỗi nghiệp vụ.
 */
import { delay, ok, paginate, fail, search } from './mockHelpers';
import { authStorage } from '../lib/authStorage';
import {
  DEMO_STUDENT_INDEX, buildings, rooms, beds, students, contracts,
  utilityReadings, invoices, payments, TERM_MONTHS, residentsOf, meterOf, newReading, billReading,
  issuePersonalInvoice, collectInvoice,
  bedsOf, availableSlots, generateBeds, newApplication, approveContract, pendingOn, selectableBeds,
  occupancyStats, debtOf, demoRaceRoomIds, rivalStudentFor, todayPlus, periodPlus,
} from './mockDb';

// ---------------------------------------------------------------- tiện ích
/**
 * Hợp đồng đang giữ giường của sinh viên — gồm cả hợp đồng đã quá ngày kết thúc mà chưa thanh lý.
 * ⚠️ Mock lưu `status: 'active'` cho tới khi thanh lý; `expired` chỉ là trạng thái SUY RA khi đọc (statusOf).
 * Mọi chỗ hỏi "còn giữ giường không" dùng status lưu; chỗ trả ra cho FE thì dùng statusOf.
 */
const activeContractOf = (studentId) => contracts.find((c) => c.studentId === studentId && c.status === 'active');
/** API.md §6: `expired` = active và đã qua endDate, suy ra lúc đọc (không có job đổi trạng thái) */
const statusOf = (c) => (c.status === 'active' && c.endDate < todayPlus(0) ? 'expired' : c.status);

const roomView = (r) => {
  const bs = bedsOf(r.id);
  return {
    ...r,
    occupied: bs.filter((b) => b.status === 'occupied').length,
    availableSlots: availableSlots(r.id),
    maintenanceBeds: bs.filter((b) => b.status === 'maintenance').length,
  };
};

/** Sinh viên đang đăng nhập (chỉ dùng cho mock — backend thật lấy từ JWT) */
const me = () => {
  const user = authStorage.getUser();
  return students.find((s) => s.id === user?.studentId) || students[DEMO_STUDENT_INDEX.sv001];
};

// ---------------------------------------------------------------- auth
const account = (email, password, role, fullName, studentIndex = null, mustChangePassword = false, extra = {}) => ({
  email, password, role, mustChangePassword,
  id: `u-${email.split('@')[0]}`,
  fullName: studentIndex === null ? fullName : students[studentIndex].fullName,
  studentId: studentIndex === null ? null : students[studentIndex].id,
  studentCode: studentIndex === null ? null : students[studentIndex].studentCode,
  isActive: true,
  lastLoginAt: null,
  createdAt: '2026-08-01T08:00:00+07:00',
  ...extra,
});

const ACCOUNTS = [
  account('admin@dorm.local', 'Admin@123', 'admin', 'Nguyễn Văn Quản Trị'),
  account('staff@dorm.local', 'Staff@123', 'staff', 'Lê Thị Nhân Viên'),
  account('sv001@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv001),
  account('sv002@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv002),
  account('sv003@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv003),
  account('sv004@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv004),
  account('sv005@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv005),
  account('sv006@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv006),
  account('sv007@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv007),
  // Vừa được duyệt đơn: tài khoản = mật khẩu = MSSV, phải đổi ở lần đăng nhập đầu (FR-02, BR-06)
  account('sv008@dorm.local', students[DEMO_STUDENT_INDEX.sv008].studentCode, 'student', null, DEMO_STUDENT_INDEX.sv008, true),
  // Hợp đồng đã hết hạn 5 ngày, chưa thanh lý, còn nợ hóa đơn tháng
  account('sv009@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv009),
  // Mật khẩu tạm do ban quản lý cấp — đăng nhập xong bị buộc đổi mật khẩu (BR-85)
  account('doimk@dorm.local', 'Tam@12345', 'staff', 'Phạm Văn Mới Vào', null, true, { createdAt: '2026-09-10T09:00:00+07:00' }),
  // Cho màn Tài khoản (SCR-81): thêm một quản trị viên và một nhân viên đã bị khóa
  account('admin2@dorm.local', 'Admin@123', 'admin', 'Hoàng Thị Phó Ban', null, false, { lastLoginAt: '2026-09-12T08:10:00+07:00', createdAt: '2026-08-01T08:05:00+07:00' }),
  account('staff2@dorm.local', 'Staff@123', 'staff', 'Đỗ Minh Tuấn', null, false, { isActive: false, lastLoginAt: '2026-08-20T17:30:00+07:00', createdAt: '2026-08-01T08:10:00+07:00' }),
];

export const mockAuth = {
  /** { identifier, password } — identifier là email hoặc mã sinh viên (FR-01) */
  login: async ({ identifier, password }) => {
    await delay(400);
    const key = String(identifier || '').trim();
    const found = ACCOUNTS.find((a) => (a.email === key.toLowerCase() || a.studentCode === key.toUpperCase()) && a.password === password);
    if (!found) fail(401, 'INVALID_CREDENTIALS', 'Tài khoản hoặc mật khẩu không chính xác');
    if (!found.isActive) fail(403, 'ACCOUNT_LOCKED', 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ ban quản lý');
    found.lastLoginAt = new Date().toISOString();
    return ok({
      token: `mock-token-${found.id}`,
      expiresIn: 604800,
      user: {
        id: found.id, email: found.email, fullName: found.fullName,
        role: found.role, studentId: found.studentId, studentCode: found.studentCode, mustChangePassword: found.mustChangePassword,
      },
    }, 'Đăng nhập thành công');
  },
  /** Khớp BE: body { oldPassword, newPassword }, sai mật khẩu hiện tại → 400 INVALID_CURRENT_PASSWORD */
  changePassword: async ({ oldPassword, newPassword } = {}) => {
    await delay();
    if (!oldPassword || !newPassword) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', {
        errors: [
          ...(!oldPassword ? [{ field: 'oldPassword', message: 'Mật khẩu hiện tại là bắt buộc' }] : []),
          ...(!newPassword ? [{ field: 'newPassword', message: 'Mật khẩu mới là bắt buộc' }] : []),
        ],
      });
    }
    const acc = ACCOUNTS.find((x) => x.email === authStorage.getUser()?.email);
    if (!acc || acc.password !== oldPassword) fail(400, 'INVALID_CURRENT_PASSWORD', 'Mật khẩu hiện tại không chính xác');
    if (acc.studentCode && newPassword === acc.studentCode) fail(400, 'PASSWORD_SAME_AS_DEFAULT', 'Mật khẩu mới không được trùng mã sinh viên');
    Object.assign(acc, { password: newPassword, mustChangePassword: false });
    return ok(null, 'Đổi mật khẩu thành công');
  },
};

// ---------------------------------------------------------------- tài khoản (SCR-81)
const ROLE_ENUM = ['admin', 'staff', 'student'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mật khẩu tạm ≥ 10 ký tự, có chữ và số (BR-81, BR-85). Backend dùng crypto.randomBytes */
const genTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return /\d/.test(s) && /[A-Za-z]/.test(s) ? s : genTempPassword();
};

const currentAccount = () => ACCOUNTS.find((a) => a.email === authStorage.getUser()?.email);

const userView = (a) => {
  const st = a.studentId ? students.find((s) => s.id === a.studentId) : null;
  return {
    id: a.id, email: a.email, fullName: a.fullName, role: a.role,
    isActive: a.isActive, mustChangePassword: a.mustChangePassword,
    lastLoginAt: a.lastLoginAt, createdAt: a.createdAt,
    student: st ? { id: st.id, studentCode: st.studentCode, fullName: st.fullName } : null,
  };
};

const findAccount = (id) => {
  const a = ACCOUNTS.find((x) => x.id === id);
  if (!a) fail(404, 'NOT_FOUND', 'Không tìm thấy tài khoản');
  return a;
};

const activeAdmins = () => ACCOUNTS.filter((a) => a.role === 'admin' && a.isActive);

export const mockUsers = {
  getList: async (q = {}) => {
    await delay();
    let rows = ACCOUNTS.map(userView);
    if (q.role) rows = rows.filter((u) => u.role === q.role);
    if (q.isActive !== undefined && q.isActive !== '') rows = rows.filter((u) => String(u.isActive) === String(q.isActive));
    if (q.search) {
      const kw = String(q.search).toLowerCase().trim();
      rows = rows.filter((u) => [u.email, u.fullName, u.student?.studentCode].some((v) => String(v ?? '').toLowerCase().includes(kw)));
    }
    const order = { admin: 0, staff: 1, student: 2 };
    rows.sort((a, b) => order[a.role] - order[b.role] || a.fullName.localeCompare(b.fullName, 'vi'));
    const res = paginate(rows, q);
    res.data.data.summary = {
      all: ACCOUNTS.length,
      admin: ACCOUNTS.filter((a) => a.role === 'admin').length,
      staff: ACCOUNTS.filter((a) => a.role === 'staff').length,
      student: ACCOUNTS.filter((a) => a.role === 'student').length,
      locked: ACCOUNTS.filter((a) => !a.isActive).length,
    };
    return res;
  },
  /** { email, fullName, role: admin|staff } → { user, temporaryPassword } — mật khẩu tạm hiện MỘT lần. Tài khoản sinh viên chỉ sinh ra khi duyệt đơn (FR-02) */
  create: async (body = {}) => {
    await delay();
    const email = String(body.email || '').trim().toLowerCase();
    const role = body.role;
    const errors = [];
    if (!EMAIL_RE.test(email)) errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    else if (ACCOUNTS.some((a) => a.email === email)) errors.push({ field: 'email', message: 'Email này đã được dùng cho tài khoản khác' }); // BR-80
    if (!['admin', 'staff'].includes(role)) errors.push({ field: 'role', message: 'Chọn vai trò' });
    if (!String(body.fullName || '').trim()) errors.push({ field: 'fullName', message: 'Nhập họ tên' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });

    const temporaryPassword = genTempPassword();
    const acc = {
      ...account(email, temporaryPassword, role, String(body.fullName).trim(), null, true),
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    ACCOUNTS.push(acc);
    return ok({ user: userView(acc), temporaryPassword }, 'Đã tạo tài khoản');
  },
  /** { email, fullName, role } — không đổi vai trò của chính mình, không đổi vai trò sinh viên */
  update: async (id, body = {}) => {
    await delay();
    const a = findAccount(id);
    const me = currentAccount();
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : a.email;
    const role = body.role ?? a.role;
    const errors = [];
    if (!EMAIL_RE.test(email)) errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    else if (ACCOUNTS.some((x) => x.id !== a.id && x.email === email)) errors.push({ field: 'email', message: 'Email này đã được dùng cho tài khoản khác' });
    if (a.role !== 'student' && body.fullName !== undefined && !String(body.fullName).trim()) errors.push({ field: 'fullName', message: 'Nhập họ tên' });
    if (!ROLE_ENUM.includes(role)) errors.push({ field: 'role', message: 'Vai trò không hợp lệ' });
    if (role !== a.role && (role === 'student' || a.role === 'student')) {
      errors.push({ field: 'role', message: 'Không đổi được vai trò giữa sinh viên và cán bộ' });
    }
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    if (role !== a.role && me?.id === a.id) fail(422, 'CANNOT_MODIFY_SELF', 'Không thể tự đổi vai trò của chính mình');
    if (a.role === 'admin' && role !== 'admin' && a.isActive && activeAdmins().length === 1) {
      fail(422, 'LAST_ACTIVE_ADMIN', 'Không thể đổi vai trò của quản trị viên cuối cùng đang hoạt động'); // BR-83
    }
    Object.assign(a, { email, role, ...(a.role !== 'student' && body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {}) });
    return ok(userView(a), 'Cập nhật tài khoản thành công');
  },
  /** { isActive } — khóa / mở khóa */
  setStatus: async (id, { isActive } = {}) => {
    await delay();
    const a = findAccount(id);
    if (typeof isActive !== 'boolean') fail(400, 'VALIDATION_ERROR', 'Trạng thái không hợp lệ');
    if (!isActive && currentAccount()?.id === a.id) fail(422, 'CANNOT_MODIFY_SELF', 'Không thể tự khóa tài khoản của chính mình');
    if (!isActive && a.role === 'admin' && a.isActive && activeAdmins().length === 1) {
      fail(422, 'LAST_ACTIVE_ADMIN', 'Không thể khóa quản trị viên cuối cùng đang hoạt động'); // BR-83
    }
    a.isActive = isActive;
    return ok(userView(a), isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
  },
  /** FR-09 — Staff không được đặt lại mật khẩu Admin (BR-84) */
  resetPassword: async (id) => {
    await delay();
    const a = findAccount(id);
    const me = currentAccount();
    if (me?.role === 'staff' && a.role === 'admin') fail(403, 'FORBIDDEN', 'Nhân viên không được đặt lại mật khẩu tài khoản quản trị');
    if (me?.id === a.id) fail(422, 'CANNOT_MODIFY_SELF', 'Dùng chức năng Đổi mật khẩu cho tài khoản của chính mình');
    const temporaryPassword = genTempPassword();
    Object.assign(a, { password: temporaryPassword, mustChangePassword: true });
    return ok({ temporaryPassword, mustChangePassword: true }, 'Đã đặt lại mật khẩu');
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
      const c = activeContractOf(s.id);
      return {
        ...s,
        residence: c ? { room: roomRef(rooms.find((r) => r.id === c.roomId)), bedNumber: c.bedNumber, endDate: c.endDate } : null,
        hasAccount: ACCOUNTS.some((a) => a.studentId === s.id),
        totalDebt: debtOf(s.id),
      };
    });
    return paginate(items, q);
  },
  getById: async (id) => {
    await delay();
    const s = students.find((x) => x.id === id);
    if (!s) fail(404, 'NOT_FOUND', 'Không tìm thấy sinh viên');
    return ok({ ...s, contract: activeContractOf(id) || null, totalDebt: debtOf(id) });
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
    if (activeContractOf(id) || contracts.some((c) => c.studentId === id && c.status === 'pending')) {
      fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đang có hợp đồng hiệu lực hoặc đơn đăng ký chờ duyệt, không thể vô hiệu hóa');
    }
    if (debtOf(id) > 0) fail(422, 'STUDENT_HAS_DEBT', 'Sinh viên còn công nợ chưa thanh toán');
    const s = students.find((x) => x.id === id);
    s.status = 'inactive';
    return ok(s, 'Đã vô hiệu hóa sinh viên');
  },
};

// ---------------------------------------------------------------- rooms: tòa nhà, phòng (giường, giá, cọc nằm trên phòng)
/** Kiểm tra body thêm/sửa phòng (FR-24): sức chứa 4/6/8, tiền là số nguyên không âm */
const roomErrors = ({ roomNumber, floor, gender, capacity, pricePerMonth, depositAmount, status = 'active' }) => {
  const errors = [];
  const money = (v) => Number.isInteger(Number(v)) && v !== '' && v !== null && v !== undefined && Number(v) >= 0;
  if (!String(roomNumber || '').trim()) errors.push({ field: 'roomNumber', message: 'Nhập số phòng' });
  if (!(Number(floor) >= 1)) errors.push({ field: 'floor', message: 'Nhập tầng' });
  if (!['male', 'female'].includes(gender)) errors.push({ field: 'gender', message: 'Vui lòng chọn giới tính phòng' });
  if (![4, 6, 8].includes(Number(capacity))) errors.push({ field: 'capacity', message: 'Sức chứa phải là 4, 6 hoặc 8' });
  if (!money(pricePerMonth)) errors.push({ field: 'pricePerMonth', message: 'Nhập đơn giá thuê' });
  if (!money(depositAmount)) errors.push({ field: 'depositAmount', message: 'Nhập tiền cọc' });
  if (!['active', 'maintenance'].includes(status)) errors.push({ field: 'status', message: 'Trạng thái không hợp lệ' });
  return errors;
};

const assertRoomNumberFree = (buildingId, roomNumber) => {
  if (rooms.some((r) => r.buildingId === buildingId && r.roomNumber === roomNumber)) {
    fail(409, 'DUPLICATE_ENTRY', 'Số phòng đã tồn tại trong tòa nhà', { errors: [{ field: 'roomNumber', message: 'Số phòng đã tồn tại trong tòa nhà' }] });
  }
};

export const mockRooms = {
  /** Mặc định chỉ tòa đang hoạt động (giống backend); màn Tòa nhà gửi includeInactive=true */
  getBuildings: async (q = {}) => {
    await delay();
    const list = String(q.includeInactive) === 'true' ? buildings : buildings.filter((b) => b.isActive);
    return ok([...list].sort((a, b) => a.code.localeCompare(b.code)).map((b) => {
      const roomIds = rooms.filter((r) => r.buildingId === b.id).map((r) => r.id);
      const bs = beds.filter((x) => roomIds.includes(x.roomId));
      return {
        ...b,
        stats: {
          totalRooms: roomIds.length,
          totalBeds: bs.length,
          occupiedBeds: bs.filter((x) => x.status === 'occupied').length,
          availableBeds: bs.filter((x) => x.status === 'available').length,
          maintenanceBeds: bs.filter((x) => x.status === 'maintenance').length,
        },
      };
    }));
  },
  /** { code, name, description? } — mã duy nhất, viết hoa (BR-01) */
  createBuilding: async (body = {}) => {
    await delay();
    const code = String(body.code || '').trim().toUpperCase();
    const name = String(body.name || '').trim();
    const errors = [];
    if (!code) errors.push({ field: 'code', message: 'Nhập mã tòa nhà' });
    else if (!/^[A-Z0-9-]{1,10}$/.test(code)) errors.push({ field: 'code', message: 'Mã gồm chữ, số, dấu -, tối đa 10 ký tự' });
    if (!name) errors.push({ field: 'name', message: 'Nhập tên tòa nhà' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    if (buildings.some((b) => b.code === code)) fail(409, 'DUPLICATE_ENTRY', `Mã tòa nhà ${code} đã tồn tại`, { errors: [{ field: 'code', message: `Mã tòa nhà ${code} đã tồn tại` }] });
    const b = {
      id: `b-${Date.now()}`, code, name,
      description: String(body.description || '').trim(), isActive: true,
    };
    buildings.push(b);
    return ok(b, `Đã thêm tòa nhà ${name}`);
  },
  /** { name, description, isActive } — không đổi mã; không ngừng hoạt động khi còn người ở */
  updateBuilding: async (id, body = {}) => {
    await delay();
    const b = buildings.find((x) => x.id === id);
    if (!b) fail(404, 'NOT_FOUND', 'Không tìm thấy tòa nhà');
    if (body.name !== undefined && !String(body.name).trim()) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'name', message: 'Nhập tên tòa nhà' }] });
    }
    if (body.isActive === false && b.isActive) {
      const roomIds = rooms.filter((r) => r.buildingId === id).map((r) => r.id);
      const occupied = beds.filter((x) => roomIds.includes(x.roomId) && x.status === 'occupied').length;
      if (occupied > 0) fail(422, 'BUILDING_HAS_OCCUPANTS', `Tòa ${b.name} còn ${occupied} sinh viên đang ở, không thể ngừng hoạt động`);
    }
    ['name', 'description'].forEach((k) => { if (body[k] !== undefined) b[k] = String(body[k]).trim(); });
    if (typeof body.isActive === 'boolean') b.isActive = body.isActive;
    const message = body.isActive === false ? 'Đã ngừng hoạt động tòa nhà' : body.isActive === true && Object.keys(body).length === 1 ? 'Đã kích hoạt lại tòa nhà' : 'Cập nhật tòa nhà thành công';
    return ok(b, message);
  },

  getRooms: async (q = {}) => {
    await delay();
    let rows = rooms.map(roomView);
    if (q.buildingId) rows = rows.filter((r) => r.buildingId === q.buildingId);
    if (q.floor) rows = rows.filter((r) => r.floor === Number(q.floor));
    if (q.gender) rows = rows.filter((r) => r.gender === q.gender);
    if (q.capacity) rows = rows.filter((r) => r.capacity === Number(q.capacity));
    if (q.status) rows = rows.filter((r) => r.status === q.status);
    if (q.availability === 'has_slot') rows = rows.filter((r) => r.availableSlots > 0);
    if (q.availability === 'full') rows = rows.filter((r) => r.availableSlots === 0);
    return paginate(search(rows, q.search, ['roomNumber', 'buildingName']), { limit: 100, ...q });
  },
  getRoomById: async (id) => {
    await delay();
    const r = rooms.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const bedList = bedsOf(id).map((b) => {
      const c = contracts.find((x) => x.bedId === b.id && x.status === 'active');
      const st = c && students.find((s) => s.id === c.studentId);
      return {
        ...b, hasPendingApplication: pendingOn(id, b.bedNumber),
        occupant: c ? { studentCode: c.studentCode, fullName: c.studentName, className: st?.className ?? null } : null,
      };
    });
    return ok({ ...roomView(r), beds: bedList });
  },
  createRoom: async (body = {}) => {
    await delay();
    const b = buildings.find((x) => x.id === body.buildingId);
    const errors = roomErrors(body);
    if (!b) errors.push({ field: 'buildingId', message: 'Chọn tòa nhà' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    assertRoomNumberFree(b.id, body.roomNumber);
    const capacity = Number(body.capacity);
    const room = {
      id: `r-new-${Date.now()}`, buildingId: b.id, buildingCode: b.code, buildingName: b.name,
      roomNumber: body.roomNumber, floor: Number(body.floor), gender: body.gender, capacity,
      pricePerMonth: Number(body.pricePerMonth), depositAmount: Number(body.depositAmount), status: 'active',
    };
    rooms.push(room);
    generateBeds(room);
    return ok(roomView(room), `Đã tạo phòng ${room.roomNumber} với ${capacity} giường`);
  },
  updateRoom: async (id, body = {}) => {
    await delay();
    const r = rooms.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const errors = roomErrors({ ...r, ...body });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    const capacity = Number(body.capacity ?? r.capacity);
    const capacityChanged = capacity !== r.capacity;
    const genderChanged = body.gender && body.gender !== r.gender;
    if (bedsOf(id).some((b) => b.status === 'occupied') && (capacityChanged || genderChanged)) {
      fail(422, 'ROOM_HAS_OCCUPANTS', 'Phòng đang có người ở, không thể đổi giới tính hoặc sức chứa'); // FR-25
    }
    if (body.roomNumber && body.roomNumber !== r.roomNumber) assertRoomNumberFree(r.buildingId, body.roomNumber);
    if (capacityChanged) {
      for (let i = beds.length - 1; i >= 0; i -= 1) if (beds[i].roomId === id) beds.splice(i, 1);
      r.capacity = capacity;
      generateBeds(r);
    }
    Object.assign(r, {
      roomNumber: body.roomNumber ?? r.roomNumber,
      floor: body.floor !== undefined ? Number(body.floor) : r.floor,
      gender: body.gender ?? r.gender,
      pricePerMonth: body.pricePerMonth !== undefined ? Number(body.pricePerMonth) : r.pricePerMonth,
      depositAmount: body.depositAmount !== undefined ? Number(body.depositAmount) : r.depositAmount,
      status: body.status ?? r.status,
    });
    return ok(roomView(r), 'Cập nhật phòng thành công');
  },
};

// ---------------------------------------------------------------- công khai: nộp đơn, tra cứu (không cần đăng nhập)
const roomRef = (room) => (room ? {
  id: room.id, buildingId: room.buildingId, buildingCode: room.buildingCode, buildingName: room.buildingName,
  roomNumber: room.roomNumber, floor: room.floor, gender: room.gender, capacity: room.capacity,
} : null);
const bedText = (room, bedNumber) => `giường ${String(bedNumber).padStart(2, '0')} phòng ${room.buildingCode}-${room.roomNumber}`;
const EMAIL_RE_PUBLIC = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const mockPublic = {
  /** GET /public/rooms/available?gender= — sắp theo ngăn xếp: tầng thấp → số phòng nhỏ (BR-07), không lộ tên người ở */
  getAvailableRooms: async (q = {}) => {
    await delay();
    if (!['male', 'female'].includes(q.gender)) fail(400, 'VALIDATION_ERROR', 'Chọn giới tính để xem phòng trống');
    const open = new Set(buildings.filter((b) => b.isActive).map((b) => b.id));
    const rows = rooms
      .filter((r) => r.status === 'active' && open.has(r.buildingId) && r.gender === q.gender && (!q.buildingId || r.buildingId === q.buildingId))
      .map((r) => ({
        ...roomRef(r), pricePerMonth: r.pricePerMonth, depositAmount: r.depositAmount,
        availableSlots: selectableBeds(r.id).length,
        beds: bedsOf(r.id).map((b) => ({ bedNumber: b.bedNumber, status: b.status, hasPendingApplication: pendingOn(r.id, b.bedNumber) })),
      }))
      .filter((r) => r.availableSlots > 0)
      .sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber, 'vi', { numeric: true }));
    return paginate(rows, { page: 1, limit: 100, ...q });
  },
  /** POST /contracts/register-online (FR-30) — giá lấy từ phòng, không khóa giường */
  registerOnline: async (body = {}) => {
    await delay(500);
    const code = String(body.studentCode || '').trim().toUpperCase();
    const email = String(body.email || '').trim().toLowerCase();
    const errors = [];
    if (!/^[A-Z0-9]{6,20}$/.test(code)) errors.push({ field: 'studentCode', message: 'Mã sinh viên gồm 6–20 ký tự chữ và số' });
    if (!String(body.fullName || '').trim()) errors.push({ field: 'fullName', message: 'Nhập họ và tên' });
    if (!['male', 'female'].includes(body.gender)) errors.push({ field: 'gender', message: 'Chọn giới tính' });
    if (!/^0\d{9}$/.test(String(body.phone || ''))) errors.push({ field: 'phone', message: 'Số điện thoại gồm 10 số, bắt đầu bằng 0' });
    if (!EMAIL_RE_PUBLIC.test(email)) errors.push({ field: 'email', message: 'Email không đúng định dạng' });
    if (!TERM_MONTHS[body.term]) errors.push({ field: 'term', message: 'Chọn gói thuê 6 hoặc 12 tháng' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });

    let st = students.find((s) => s.studentCode === code);
    if (st && contracts.some((c) => c.studentId === st.id && ['pending', 'active'].includes(c.status))) {
      fail(409, 'APPLICATION_OR_CONTRACT_EXISTS', 'Mã sinh viên này đã có đơn đăng ký hoặc đang lưu trú tại ký túc xá');
    }
    const room = rooms.find((r) => r.id === body.roomId && r.status === 'active');
    if (!room) fail(404, 'NOT_FOUND', 'Phòng không còn nhận đơn, vui lòng chọn phòng khác');
    if (room.gender !== body.gender) fail(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${room.gender === 'male' ? 'nam' : 'nữ'}`);
    const bedNumber = Number(body.bedNumber);
    const bed = bedsOf(room.id).find((b) => b.bedNumber === bedNumber);
    if (!bed || bed.status !== 'available') fail(409, 'BED_ALREADY_OCCUPIED', `${bedText(room, bedNumber)} không còn trống, vui lòng chọn giường khác`);
    // Giả lập một sinh viên khác vừa nộp trước vào đúng giường cuối (chỉ có trong dữ liệu giả)
    if (demoRaceRoomIds.has(room.id) && selectableBeds(room.id).length === 1) {
      const rival = rivalStudentFor(room.gender);
      if (rival) newApplication(rival, room, bedNumber, { createdAt: new Date().toISOString() });
    }
    if (pendingOn(room.id, bedNumber)) fail(409, 'BED_ALREADY_REQUESTED', `${bedText(room, bedNumber)} vừa có người khác đăng ký, vui lòng chọn giường khác`);

    const profile = {
      studentCode: code, fullName: String(body.fullName).trim(), gender: body.gender, phone: String(body.phone), email,
      dob: body.dob || null, faculty: body.faculty || '', className: body.className || '',
      emergencyContact: body.emergencyContact || null, status: 'active',
    };
    // MSSV đã có hồ sơ (sinh viên cũ quay lại) → dùng lại hồ sơ, cập nhật theo form
    if (st) Object.assign(st, profile);
    else { st = { id: `s-new-${Date.now()}`, ...profile }; students.push(st); }
    const c = newApplication(st, room, bedNumber, { term: body.term, createdAt: new Date().toISOString() });
    return ok({
      contractCode: c.contractCode, status: c.status, room: roomRef(room), bedNumber, term: c.term,
      pricePerMonth: c.pricePerMonth, totalRoomFee: c.totalRoomFee, depositAmount: c.depositAmount,
    }, 'Đã gửi đơn đăng ký. Vui lòng theo dõi email để nhận kết quả xét duyệt');
  },
  /** GET /public/applications/status?studentCode=&email= (FR-33) — sai mã hay sai email đều báo như nhau */
  getApplicationStatus: async ({ studentCode, email } = {}) => {
    await delay();
    const code = String(studentCode || '').trim().toUpperCase();
    const mail = String(email || '').trim().toLowerCase();
    if (!code || !mail) fail(400, 'VALIDATION_ERROR', 'Nhập mã sinh viên và email đã khai trong đơn');
    const st = students.find((s) => s.studentCode === code && String(s.email || '').toLowerCase() === mail);
    const c = st && contracts.filter((x) => x.studentId === st.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
    if (!c) fail(404, 'APPLICATION_NOT_FOUND', 'Không tìm thấy đơn đăng ký khớp mã sinh viên và email này');
    return ok({
      contractCode: c.contractCode, status: c.status, submittedAt: c.createdAt, room: roomRef(rooms.find((r) => r.id === c.roomId)),
      bedNumber: c.bedNumber, term: c.term, startDate: c.startDate, endDate: c.endDate, rejectionReason: c.rejectionReason,
      pricePerMonth: c.pricePerMonth, totalRoomFee: c.totalRoomFee, depositAmount: c.depositAmount,
    });
  },
};

// ---------------------------------------------------------------- contracts (gồm cả đơn chờ duyệt)
/** Hợp đồng còn hiệu lực và hết hạn trong N ngày tới (BR-29) */
const isExpiring = (c, days = 30) => c.status === 'active' && c.endDate >= todayPlus(0) && c.endDate <= todayPlus(days);
const countBy = (st) => contracts.filter((c) => statusOf(c) === st).length;

const contractView = (c) => {
  const room = rooms.find((r) => r.id === c.roomId);
  const st = students.find((s) => s.id === c.studentId);
  const { demoRace, ...fields } = c; // eslint-disable-line no-unused-vars -- cờ nội bộ của mock, không trả ra
  return {
    ...fields,
    status: statusOf(c),
    student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender },
    room: roomRef(room),
    buildingId: room?.buildingId,
    buildingCode: room?.buildingCode,
    isExpiring: isExpiring(c),
    totalDebt: debtOf(c.studentId),
  };
};

export const mockContracts = {
  /** ?status= nhận một hoặc nhiều trạng thái cách nhau dấu phẩy */
  getList: async (q = {}) => {
    await delay();
    const statuses = q.status ? String(q.status).split(',') : null;
    let rows = contracts.map(contractView);
    if (statuses) rows = rows.filter((c) => statuses.includes(c.status));
    if (q.expiringInDays) rows = rows.filter((c) => isExpiring(c, Number(q.expiringInDays)));
    if (q.buildingId) rows = rows.filter((c) => c.buildingId === q.buildingId);
    if (q.term) rows = rows.filter((c) => c.term === q.term);
    if (q.isDepositRefunded !== undefined) rows = rows.filter((c) => String(c.isDepositRefunded) === String(q.isDepositRefunded));
    rows = search(rows, q.search, ['contractCode', 'studentCode', 'studentName', 'roomNumber', 'bedCode']);
    // Đơn chờ duyệt: nộp sớm lên đầu · đơn bị từ chối: xử lý gần nhất · sắp hết hạn: gần hết hạn nhất · còn lại: bắt đầu gần nhất
    const sortKey = (c) => String(c.startDate || c.reviewedAt || c.createdAt);
    if (statuses?.length === 1 && statuses[0] === 'pending') rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (q.expiringInDays) rows.sort((a, b) => a.endDate.localeCompare(b.endDate));
    else rows.sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || a.contractCode.localeCompare(b.contractCode));
    const res = paginate(rows, q);
    // Số theo tab — không phụ thuộc bộ lọc, đúng các khóa của API.md §6
    res.data.data.summary = {
      pending: countBy('pending'), active: countBy('active'), expired: countBy('expired'),
      terminated: countBy('terminated'), rejected: countBy('rejected'),
      awaitingDepositRefund: contracts.filter((c) => c.status === 'terminated' && !c.isDepositRefunded).length,
    };
    return res;
  },
  getById: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    const st = students.find((s) => s.id === c.studentId);
    const contractInvoices = invoices.filter((i) => i.contractId === id).map(invoiceView)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const depositInvoice = contractInvoices.find((i) => i.type === 'deposit');

    // Lịch sử hợp đồng — mới nhất lên đầu
    const history = [
      { at: c.createdAt, type: 'application_submitted', title: 'Nộp đơn đăng ký', description: `Mã ${c.contractCode}` },
      c.reviewedAt && c.status !== 'rejected' && {
        at: c.reviewedAt, type: 'application_approved', title: 'Duyệt đơn, khóa giường',
        description: `Phòng ${c.roomNumber} giường ${String(c.bedNumber).padStart(2, '0')} · tạo hóa đơn tiền cọc và tiền phòng cả kỳ`,
      },
      c.status === 'rejected' && { at: c.reviewedAt, type: 'rejected', title: 'Từ chối đơn', description: c.rejectionReason },
      statusOf(c) === 'expired' && { at: c.endDate, type: 'expired', title: 'Hết hạn hợp đồng', description: 'Chưa thanh lý — sinh viên vẫn giữ giường' },
      c.status === 'terminated' && { at: c.terminatedAt, type: 'terminated', title: 'Thanh lý hợp đồng', description: 'Trả phòng, giường trả về trống' },
      c.isDepositRefunded && {
        at: c.depositRefundedAt, type: 'deposit_refunded', title: 'Hoàn cọc',
        description: `Đã trả lại tiền cọc${c.depositRefundedByName ? ` · ${c.depositRefundedByName}` : ''}`,
      },
    ].filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));

    return ok({
      ...contractView(c),
      student: {
        id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender, phone: st.phone, email: st.email,
        dob: st.dob, faculty: st.faculty, className: st.className, emergencyContact: st.emergencyContact,
      },
      depositStatus: depositInvoice?.status ?? null,
      invoices: contractInvoices,
      history,
    });
  },
  /** PATCH /contracts/:id/approve — { roomId?, bedNumber? }: bỏ trống là giữ giường sinh viên đã chọn (FR-32) */
  approve: async (id, { roomId, bedNumber } = {}) => {
    await delay(500);
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn đăng ký');
    if (c.status !== 'pending') fail(409, 'CONTRACT_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
    const st = students.find((s) => s.id === c.studentId);
    const room = rooms.find((r) => r.id === (roomId || c.roomId));
    if (!room) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const bedNo = Number(bedNumber ?? c.bedNumber);
    if (room.gender !== st.gender) fail(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${room.gender === 'male' ? 'nam' : 'nữ'}`);
    if (activeContractOf(st.id)) fail(409, 'APPLICATION_OR_CONTRACT_EXISTS', 'Sinh viên đã có hợp đồng đang hiệu lực');
    if (pendingOn(room.id, bedNo, c.id)) fail(409, 'BED_ALREADY_REQUESTED', `${bedText(room, bedNo)} đang được giữ cho một đơn khác`);
    let account = ACCOUNTS.find((a) => a.studentId === st.id);
    if (!account && ACCOUNTS.some((a) => a.email === String(st.email).toLowerCase())) {
      fail(409, 'EMAIL_ALREADY_USED', `Email ${st.email} đã thuộc tài khoản khác. Liên hệ sinh viên để đổi email trong đơn`);
    }

    // Giả lập một cán bộ khác vừa xếp người vào đúng giường này (chỉ có trong dữ liệu giả, chạy một lần)
    if (c.demoRace) {
      delete c.demoRace;
      const rival = rivalStudentFor(room.gender);
      if (rival) approveContract(newApplication(rival, room, bedNo, { createdAt: new Date().toISOString() }));
    }
    const result = approveContract(c, { roomId: room.id, bedNumber: bedNo, approvedByName: authStorage.getUser()?.fullName ?? null });
    if (!result) fail(409, 'BED_ALREADY_OCCUPIED', `${bedText(room, bedNo)} vừa có người nhận. Vui lòng chọn giường khác`);

    // FR-02, BR-06: tài khoản = mật khẩu = MSSV, buộc đổi ở lần đăng nhập đầu
    const isNew = !account;
    if (isNew) {
      account = {
        id: `u-${st.id}`, email: String(st.email).toLowerCase(), password: st.studentCode, role: 'student', fullName: st.fullName,
        studentId: st.id, studentCode: st.studentCode, mustChangePassword: true, isActive: true,
        lastLoginAt: null, createdAt: new Date().toISOString(),
      };
      ACCOUNTS.push(account);
    }
    const created = [issuePersonalInvoice(c, 'deposit'), issuePersonalInvoice(c, 'room_semester')];
    return ok({
      contract: contractView(c),
      account: { studentCode: st.studentCode, email: account.email, isNew },
      emailSent: true,
      invoices: created.map((i) => ({ id: i.id, invoiceCode: i.invoiceCode, type: i.type, amount: i.amount, dueDate: i.dueDate })),
    }, 'Đã duyệt đơn');
  },
  /** PATCH /contracts/:id/reject — { reason } bắt buộc (FR-33), không đụng giường */
  reject: async (id, { reason } = {}) => {
    await delay();
    if (!String(reason || '').trim()) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'reason', message: 'Nhập lý do từ chối' }] });
    }
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn đăng ký');
    if (c.status !== 'pending') fail(409, 'CONTRACT_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
    Object.assign(c, {
      status: 'rejected', rejectionReason: String(reason).trim(), reviewedAt: new Date().toISOString(),
      approvedByName: authStorage.getUser()?.fullName ?? null,
    });
    return ok(contractView(c), 'Đã từ chối đơn đăng ký');
  },
  /**
   * PATCH /contracts/:id/terminate — thanh lý khi sinh viên trả phòng tại văn phòng (FR-34, D1). Không có body.
   * Áp cho active và expired. BR-04: chặn nếu sinh viên còn hóa đơn chưa trả, hoặc phòng còn hóa đơn điện nước chưa trả.
   */
  terminate: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    if (c.status !== 'active') fail(409, 'CONTRACT_NOT_TERMINABLE', 'Chỉ thanh lý được hợp đồng đang hiệu lực hoặc đã hết hạn');
    const outstanding = invoices.filter((i) => i.status === 'unpaid' && (
      i.studentId === c.studentId || (i.type === 'utility' && i.roomId === c.roomId)
    ));
    if (outstanding.length) {
      fail(422, 'OUTSTANDING_INVOICES', `Còn ${outstanding.length} hóa đơn chưa thanh toán, chưa thể thanh lý`, {
        invoices: outstanding.map((i) => ({
          id: i.id, invoiceCode: i.invoiceCode, type: i.type, amount: i.amount, status: i.status,
        })),
      });
    }
    Object.assign(c, { status: 'terminated', terminatedAt: todayPlus(0) });
    // Chỉ trả giường nếu đúng giường của hợp đồng này và không hợp đồng nào khác đang giữ
    const bed = beds.find((b) => b.id === c.bedId);
    if (bed && !contracts.some((x) => x.id !== c.id && x.bedId === bed.id && x.status === 'active')) bed.status = 'available';
    return ok({ contract: contractView(c) }, `Đã thanh lý hợp đồng ${c.contractCode}`);
  },
  /** PATCH /contracts/:id/deposit-refund — xác nhận đã trả cọc tại văn phòng (FR-35, BR-08): một chiều, một lần, hoàn đủ */
  refundDeposit: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    if (c.status !== 'terminated') fail(409, 'CONTRACT_NOT_TERMINATED', 'Chỉ hoàn cọc sau khi đã thanh lý hợp đồng');
    if (c.isDepositRefunded) fail(409, 'DEPOSIT_ALREADY_REFUNDED', 'Hợp đồng này đã được xác nhận hoàn cọc');
    Object.assign(c, {
      isDepositRefunded: true, depositRefundedAt: new Date().toISOString(),
      depositRefundedByName: authStorage.getUser()?.fullName ?? null,
    });
    return ok(contractView(c), 'Đã xác nhận hoàn cọc');
  },
};

// ---------------------------------------------------------------- fees
/** StudentRef / người nộp từ id sinh viên */
const studentRefOf = (id) => {
  const st = students.find((x) => x.id === id);
  return st ? { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender } : null;
};
const payerRefOf = (id) => {
  const st = students.find((x) => x.id === id);
  return st ? { id: st.id, studentCode: st.studentCode, fullName: st.fullName } : null;
};
/** Invoice của API.md §8: StudentRef chỉ ở hóa đơn cá nhân, RoomRef luôn có, `payer` khi đã thu */
const invoiceView = (inv) => ({
  id: inv.id, invoiceCode: inv.invoiceCode, type: inv.type, scope: inv.scope, amount: inv.amount, description: inv.description,
  createdAt: inv.createdAt, dueDate: inv.dueDate, status: inv.status, paidAt: inv.paidAt,
  student: inv.scope === 'personal' ? studentRefOf(inv.studentId) : null,
  room: roomRef(rooms.find((r) => r.id === inv.roomId)),
  contractId: inv.contractId, utilityReadingId: inv.utilityReadingId, monthYear: inv.monthYear,
  payer: inv.payerStudentId ? payerRefOf(inv.payerStudentId) : null,
});
/** Payment của API.md §8 — là biên lai của lần thu */
const paymentView = (p) => {
  const inv = invoices.find((i) => i.id === p.invoiceId);
  return {
    id: p.id, paymentCode: p.paymentCode, invoiceId: p.invoiceId, invoiceCode: inv?.invoiceCode, invoiceType: inv?.type,
    amount: p.amount, method: p.method, transactionCode: p.transactionCode, note: p.note, paidAt: p.paidAt,
    collectedByName: p.collectedByName, payer: payerRefOf(p.payerStudentId), room: roomRef(rooms.find((r) => r.id === inv?.roomId)),
  };
};

// ---------------------------------------------------------------- chỉ số điện nước (API.md §7, FR-40→42)
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
/** Tháng hợp lệ và không ở tương lai */
const checkMonth = (value, field = 'monthYear') => {
  const monthYear = String(value || '');
  if (!MONTH_RE.test(monthYear)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field, message: 'Chọn tháng' }] });
  if (monthYear > periodPlus(0)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field, message: 'Chưa tới tháng này, không nhập trước được' }] });
  return monthYear;
};
/** Phòng đang dùng của một tòa, xếp theo tầng rồi số phòng (BR-07) */
const activeRoomsOf = (buildingId) => rooms
  .filter((r) => r.buildingId === buildingId && r.status === 'active')
  .sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber, 'vi', { numeric: true }));
const readingOf = (roomId, monthYear) => utilityReadings.find((u) => u.roomId === roomId && u.monthYear === monthYear);
/** Bản ghi gần nhất TRƯỚC tháng này của phòng — chỉ số cũ tự điền từ đây (BR-51) */
const previousReadingOf = (roomId, monthYear) => utilityReadings
  .filter((u) => u.roomId === roomId && u.monthYear < monthYear)
  .sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
const isIndex = (v) => v !== '' && v !== null && v !== undefined && Number.isInteger(Number(v)) && Number(v) >= 0;
const isPrice = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

export const mockFees = {
  /** GET /utility-readings/sheet?buildingId=&monthYear= — một lưới cho một tòa một tháng (FR-40) */
  getUtilitySheet: async (q = {}) => {
    await delay();
    const building = buildings.find((b) => b.id === q.buildingId);
    if (!building) fail(404, 'NOT_FOUND', 'Không tìm thấy tòa nhà');
    const monthYear = checkMonth(q.monthYear);
    const roomList = activeRoomsOf(building.id);
    // Đơn giá mặc định: bản ghi gần nhất của tòa (tháng này nếu đã lưu), không có thì 0 (D4)
    const latest = utilityReadings
      .filter((u) => u.monthYear <= monthYear && roomList.some((r) => r.id === u.roomId))
      .sort((a, b) => b.monthYear.localeCompare(a.monthYear) || String(b.recordedAt).localeCompare(String(a.recordedAt)))[0];
    return ok({
      buildingId: building.id, monthYear,
      defaultUnitPrices: { electricity: latest?.electricity.unitPrice ?? 0, water: latest?.water.unitPrice ?? 0 },
      rows: roomList.map((r) => {
        const prev = previousReadingOf(r.id, monthYear);
        return {
          room: { id: r.id, roomNumber: r.roomNumber, floor: r.floor, capacity: r.capacity, occupied: residentsOf(r.id).length },
          previous: prev ? { electricityNewIndex: prev.electricity.newIndex, waterNewIndex: prev.water.newIndex } : null,
          reading: readingOf(r.id, monthYear) ?? null,
        };
      }),
    });
  },
  /**
   * POST /utility-readings/bulk — { buildingId, monthYear, electricityUnitPrice, waterUnitPrice, rows[] }.
   * Lưu từng dòng: dòng hợp lệ vẫn lưu khi dòng khác lỗi. Đơn giá chung cho cả lần lưu, ghi vào từng bản ghi.
   */
  saveUtilityBulk: async (body = {}) => {
    await delay(500);
    const building = buildings.find((b) => b.id === body.buildingId);
    if (!building) fail(404, 'NOT_FOUND', 'Không tìm thấy tòa nhà');
    const monthYear = checkMonth(body.monthYear);
    const priceErrors = [];
    if (!isPrice(body.electricityUnitPrice)) priceErrors.push({ field: 'electricityUnitPrice', message: 'Đơn giá điện phải là số nguyên lớn hơn 0' });
    if (!isPrice(body.waterUnitPrice)) priceErrors.push({ field: 'waterUnitPrice', message: 'Đơn giá nước phải là số nguyên lớn hơn 0' });
    if (priceErrors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: priceErrors });
    const roomList = activeRoomsOf(building.id);
    const errors = [];
    let savedCount = 0;
    (Array.isArray(body.rows) ? body.rows : []).forEach((row) => {
      const room = roomList.find((r) => r.id === row.roomId);
      const err = (message) => errors.push({ roomId: row.roomId, message });
      if (!room) { err('Phòng không thuộc tòa này hoặc đang bảo trì'); return; }
      const fields = ['electricityOldIndex', 'electricityNewIndex', 'waterOldIndex', 'waterNewIndex'];
      if (!fields.every((f) => isIndex(row[f]))) { err('Nhập đủ 4 chỉ số, là số nguyên không âm'); return; }
      const v = Object.fromEntries(fields.map((f) => [f, Number(row[f])]));
      if (v.electricityNewIndex < v.electricityOldIndex || v.waterNewIndex < v.waterOldIndex) { err('Chỉ số mới không được nhỏ hơn chỉ số cũ'); return; }
      const existing = readingOf(room.id, monthYear);
      if (existing?.isBilled) { err('Tháng này đã chốt, không sửa được chỉ số'); return; }
      const electricity = meterOf(v.electricityOldIndex, v.electricityNewIndex, Number(body.electricityUnitPrice));
      const water = meterOf(v.waterOldIndex, v.waterNewIndex, Number(body.waterUnitPrice));
      const stamp = { recordedByName: authStorage.getUser()?.fullName ?? null, recordedAt: new Date().toISOString() };
      if (existing) Object.assign(existing, { electricity, water, totalAmount: electricity.amount + water.amount, ...stamp });
      else newReading(room.id, monthYear, electricity, water, stamp);
      savedCount += 1;
    });
    const message = errors.length ? `Đã lưu ${savedCount} phòng, ${errors.length} phòng lỗi` : `Đã lưu ${savedCount} phòng`;
    return ok({ savedCount, errors }, message);
  },
  /**
   * POST /utility-readings/publish — { buildingId, monthYear } (FR-41). Mỗi bản ghi chưa chốt của phòng có người →
   * một hóa đơn phòng hạn 7 ngày, khóa bản ghi. Phòng không có người bị bỏ qua, không bao giờ lập hóa đơn.
   */
  publishUtility: async (body = {}) => {
    await delay(700);
    const building = buildings.find((b) => b.id === body.buildingId);
    if (!building) fail(404, 'NOT_FOUND', 'Không tìm thấy tòa nhà');
    const monthYear = checkMonth(body.monthYear);
    const pending = activeRoomsOf(building.id)
      .map((room) => ({ room, reading: readingOf(room.id, monthYear) }))
      .filter((x) => x.reading && !x.reading.isBilled);
    const skipped = [];
    let publishedCount = 0;
    let notifiedCount = 0;
    pending.forEach(({ room, reading }) => {
      const residents = residentsOf(room.id);
      if (!residents.length) { skipped.push({ roomId: room.id, roomNumber: room.roomNumber, reason: 'Phòng không có người ở' }); return; }
      billReading(reading);
      publishedCount += 1;
      notifiedCount += residents.length;
    });
    if (!publishedCount) fail(422, 'NOTHING_TO_PUBLISH', 'Không có phòng nào sẵn sàng phát hành: chưa nhập chỉ số, đã chốt hết, hoặc phòng không có người ở', { skipped });
    return ok({ publishedCount, notifiedCount, skipped }, `Đã phát hành ${publishedCount} hóa đơn điện nước`);
  },
  /** GET /utility-readings/history?roomId=&limit=12 — mới nhất lên đầu (FR-42) */
  getUtilityHistory: async (q = {}) => {
    await delay();
    if (!rooms.some((r) => r.id === q.roomId)) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const limit = Math.min(Number(q.limit) || 12, 24);
    return ok(utilityReadings
      .filter((u) => u.roomId === q.roomId)
      .sort((a, b) => b.monthYear.localeCompare(a.monthYear))
      .slice(0, limit));
  },
  /** GET /invoices ?status=&type=&scope=&buildingId=&search=&page=&limit= (FR-50) — kèm summary của cả tập đã lọc */
  getInvoices: async (q = {}) => {
    await delay();
    let rows = invoices.map(invoiceView);
    if (q.status) rows = rows.filter((i) => i.status === q.status);
    if (q.type) rows = rows.filter((i) => i.type === q.type);
    if (q.scope) rows = rows.filter((i) => i.scope === q.scope);
    if (q.buildingId) rows = rows.filter((i) => i.room?.buildingId === q.buildingId);
    // chỉ cổng SV dùng (mockPortal) — API thật lấy danh tính từ JWT
    if (q.studentId) rows = rows.filter((i) => i.student?.id === q.studentId);
    const term = String(q.search || '').trim().toLowerCase();
    if (term) {
      rows = rows.filter((i) => [i.invoiceCode, i.student?.studentCode, i.student?.fullName, i.room?.roomNumber, i.room && `${i.room.buildingCode}-${i.room.roomNumber}`]
        .some((v) => String(v || '').toLowerCase().includes(term)));
    }
    rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b.invoiceCode.localeCompare(a.invoiceCode));
    const sum = (list) => list.reduce((t, i) => t + i.amount, 0);
    const unpaid = rows.filter((i) => i.status === 'unpaid');
    const res = paginate(rows, q);
    res.data.data.summary = {
      totalAmount: sum(rows), paidAmount: sum(rows.filter((i) => i.status === 'paid')),
      unpaidAmount: sum(unpaid), unpaidCount: unpaid.length,
    };
    return res;
  },
  /** GET /invoices/:id — kèm phiếu thu; hóa đơn điện nước kèm chỉ số và thành viên phòng hiện tại (FR-51) */
  getInvoiceById: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    const detail = {
      ...invoiceView(inv),
      contractCode: contracts.find((c) => c.id === inv.contractId)?.contractCode ?? null,
      payments: payments.filter((p) => p.invoiceId === id).map(paymentView),
    };
    if (inv.type === 'utility') {
      detail.reading = utilityReadings.find((u) => u.id === inv.utilityReadingId) ?? null;
      detail.members = residentsOf(inv.roomId).map((c) => ({ id: c.studentId, studentCode: c.studentCode, fullName: c.studentName }));
    }
    return ok(detail);
  },
};

// ---------------------------------------------------------------- payments (API.md §8)
/**
 * POST /payments/cash và /payments/vietqr/confirm — luôn thu đủ `amount`.
 * Hóa đơn phòng bắt buộc `payerStudentId` là người đang ở phòng đó (BR-03, D5); hóa đơn cá nhân thì người nộp là chủ hóa đơn.
 */
const collect = async (method, body = {}) => {
  await delay();
  const inv = invoices.find((x) => x.id === body.invoiceId);
  if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
  if (inv.status === 'paid') fail(409, 'INVOICE_ALREADY_PAID', `Hóa đơn ${inv.invoiceCode} đã được thanh toán`);
  let payerStudentId = inv.studentId;
  if (inv.scope === 'room') {
    payerStudentId = body.payerStudentId;
    if (!residentsOf(inv.roomId).some((c) => c.studentId === payerStudentId)) {
      fail(422, 'PAYER_NOT_IN_ROOM', 'Chọn người nộp là sinh viên đang ở phòng này', { errors: [{ field: 'payerStudentId', message: 'Chọn người nộp đang ở phòng này' }] });
    }
  }
  const transactionCode = method === 'vietqr' ? (String(body.transactionCode || '').trim().toUpperCase() || null) : null;
  if (transactionCode && payments.some((p) => p.transactionCode === transactionCode)) {
    fail(409, 'DUPLICATE_TRANSACTION_CODE', `Mã giao dịch ${transactionCode} đã được ghi nhận`, { errors: [{ field: 'transactionCode', message: 'Mã giao dịch này đã được ghi nhận trước đó' }] });
  }
  const payment = collectInvoice(inv, {
    payerStudentId, method, transactionCode, note: String(body.note || '').trim(),
    collectedByName: authStorage.getUser()?.fullName ?? null,
  });
  return ok({ payment: paymentView(payment), invoice: invoiceView(inv) }, 'Đã xác nhận thu tiền');
};

export const mockPayments = {
  /** GET /payments ?method=&type=&from=&to=&search=&invoiceId=&page=&limit= — mới nhất lên đầu, summary của cả tập đã lọc */
  getList: async (q = {}) => {
    await delay();
    let rows = payments.map(paymentView);
    if (q.invoiceId) rows = rows.filter((p) => p.invoiceId === q.invoiceId);
    if (q.method) rows = rows.filter((p) => p.method === q.method);
    if (q.type) rows = rows.filter((p) => p.invoiceType === q.type);
    if (q.from) rows = rows.filter((p) => String(p.paidAt).slice(0, 10) >= q.from);
    if (q.to) rows = rows.filter((p) => String(p.paidAt).slice(0, 10) <= q.to);
    const term = String(q.search || '').trim().toLowerCase();
    if (term) {
      rows = rows.filter((p) => [p.paymentCode, p.invoiceCode, p.transactionCode, p.payer?.fullName, p.payer?.studentCode]
        .some((v) => String(v || '').toLowerCase().includes(term)));
    }
    rows.sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
    const sumOf = (list) => list.reduce((t, p) => t + p.amount, 0);
    const res = paginate(rows, q);
    res.data.data.summary = {
      totalAmount: sumOf(rows), cashAmount: sumOf(rows.filter((p) => p.method === 'cash')),
      vietqrAmount: sumOf(rows.filter((p) => p.method === 'vietqr')),
    };
    return res;
  },
  /** POST /payments/cash — { invoiceId, payerStudentId?, note? } (FR-52) */
  collectCash: (body) => collect('cash', body),
  /** POST /payments/vietqr/confirm — { invoiceId, payerStudentId?, transactionCode?, note? } (FR-54) */
  confirmVietqr: (body) => collect('vietqr', body),

  // ⚠️ Luồng VNPay thử của cổng sinh viên (v1) — giữ tạm để màn cổng SV không gãy, M8 thay bằng VietQR rồi xoá.
  // Giao dịch "đang chờ cổng" nằm ở mảng riêng, không lẫn vào phiếu thu của cán bộ.
  checkout: async ({ invoiceId }) => {
    await delay();
    const inv = invoices.find((x) => x.id === invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    if (inv.status === 'paid') fail(409, 'INVOICE_ALREADY_PAID', `Hóa đơn ${inv.invoiceCode} đã được thanh toán`);
    const transactionRef = `PAY${Date.now()}`;
    const pending = {
      transactionRef, invoiceId: inv.id, studentId: inv.studentId, amount: inv.amount, method: 'vnpay',
      status: 'pending', paidAt: null, createdAt: new Date().toISOString(), demoWebhookAt: Date.now() + 5000,
    };
    demoOnline.push(pending);
    saveDemoPayment(pending);
    return ok({ transactionRef, gateway: 'vnpay', amount: inv.amount, redirectUrl: `${window.location.origin}/portal/payment-result?ref=${transactionRef}` });
  },
};

/** Giao dịch VNPay thử của cổng SV — xem chú thích ở mockPayments.checkout */
const demoOnline = [];
const DEMO_PAYMENT_KEY = 'mockOnlinePayments';
/** Dữ liệu giả sống trong bộ nhớ, mà cổng thanh toán lại tải lại trang → giữ giao dịch đang chờ ở sessionStorage */
const saveDemoPayment = (p) => {
  try {
    const kept = JSON.parse(sessionStorage.getItem(DEMO_PAYMENT_KEY) || '[]');
    sessionStorage.setItem(DEMO_PAYMENT_KEY, JSON.stringify([...kept, p].slice(-5)));
  } catch { /* chế độ riêng tư: bỏ qua */ }
};
const applyDemoWebhooks = () => {
  try {
    JSON.parse(sessionStorage.getItem(DEMO_PAYMENT_KEY) || '[]')
      .filter((p) => !demoOnline.some((x) => x.transactionRef === p.transactionRef))
      .forEach((p) => demoOnline.push({ ...p }));
  } catch { /* bỏ qua */ }
  demoOnline.filter((p) => p.status === 'pending' && Date.now() >= p.demoWebhookAt).forEach((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId);
    p.status = 'success';
    p.paidAt = new Date().toISOString();
    if (inv && inv.status === 'unpaid') {
      collectInvoice(inv, { payerStudentId: p.studentId, method: 'vietqr', note: 'Thanh toán online (bản thử)', paidAt: p.paidAt, collectedByName: null });
    }
  });
};

// ---------------------------------------------------------------- dashboard
export const mockDashboard = {
  getOccupancy: async () => { await delay(); return ok(occupancyStats()); },
  getSummary: async () => {
    await delay();
    // Hết khái niệm quá hạn ở v2 — tạm hiểu là chưa trả và đã qua hạn, M9 làm lại thẻ này
    const overdue = invoices.filter((i) => i.status === 'unpaid' && i.dueDate < todayPlus(0));
    const active = contracts.filter((c) => statusOf(c) === 'active');
    return ok({
      occupancy: occupancyStats().overall,
      residents: {
        activeStudents: active.length,
        activeContracts: active.length,
        expiringIn30Days: active.filter((c) => isExpiring(c)).length,
        contractsByStatus: {
          active: active.length,
          expired: countBy('expired'),
          terminated: contracts.filter((c) => c.status === 'terminated').length,
        },
      },
      finance: {
        totalDebt: students.reduce((s, st) => s + debtOf(st.id), 0),
        overdueInvoiceCount: overdue.length,
        overdueAmount: overdue.reduce((s, i) => s + i.amount, 0),
      },
      pendingApplications: contracts.filter((c) => c.status === 'pending').length,
    });
  },
};

// ---------------------------------------------------------------- portal (sinh viên) — danh tính luôn lấy từ me()
export const mockPortal = {
  getProfile: async () => { await delay(); return ok(me()); },
  getMyResidence: async () => {
    await delay();
    const st = me();
    const c = activeContractOf(st.id);
    if (!c) return ok({ hasResidence: false });
    const roommates = contracts
      .filter((x) => x.roomId === c.roomId && x.status === 'active' && x.studentId !== st.id)
      .map((x) => ({ studentCode: x.studentCode, fullName: x.studentName })); // chỉ họ tên + MSSV
    return ok({
      hasResidence: true,
      contract: contractView(c), // active hoặc expired (chưa thanh lý thì vẫn đang ở)
      roommates,
      debtSummary: {
        totalDebt: debtOf(st.id),
        unpaidInvoiceCount: invoices.filter((i) => i.studentId === st.id && i.status === 'unpaid').length,
      },
    });
  },
  /** Mọi hợp đồng và đơn của chính sinh viên, mới nhất lên đầu */
  getMyContracts: async () => {
    await delay();
    return ok(contracts.filter((c) => c.studentId === me().id).map(contractView)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
  },
  getMyInvoices: async (q = {}) => mockFees.getInvoices({ ...q, studentId: me().id }),
  getMyInvoiceById: async (id) => {
    applyDemoWebhooks();
    const inv = invoices.find((x) => x.id === id);
    if (inv && inv.studentId !== me().id) { await delay(); fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này'); }
    return mockFees.getInvoiceById(id);
  },
  /** ?transactionRef= — màn Kết quả thanh toán (VNPay thử, bỏ ở M8) hỏi lại giao dịch vừa tạo */
  getMyPayments: async (q = {}) => {
    await delay();
    applyDemoWebhooks();
    const mine = demoOnline.filter((p) => p.studentId === me().id && (!q.transactionRef || p.transactionRef === q.transactionRef));
    return ok(mine.map((p) => {
      const inv = invoices.find((i) => i.id === p.invoiceId);
      return { ...p, invoiceCode: inv?.invoiceCode, invoice: inv ? invoiceView(inv) : null };
    }));
  },
};
