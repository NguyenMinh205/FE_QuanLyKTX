/**
 * Toàn bộ endpoint giả, gom theo module giống `modules/` của backend.
 * Mỗi hàm tương ứng một endpoint trong API.md v1.2 và ném ĐÚNG mã lỗi nghiệp vụ.
 */
import { delay, ok, paginate, fail, search } from './mockHelpers';
import { authStorage } from '../lib/authStorage';
import {
  DEMO_STUDENT_INDEX, buildings, rooms, beds, students, contracts,
  feeTypes, utilityReadings, invoices, payments, ROOM_AMENITIES, TERM_MONTHS,
  bedsOf, availableSlots, generateBeds, newApplication, approveContract, pendingOn, selectableBeds,
  occupancyStats, debtOf, demoRaceRoomIds, rivalStudentFor, todayPlus, periodPlus,
} from './mockDb';

// ---------------------------------------------------------------- tiện ích
const activeContractOf = (studentId) => contracts.find((c) => c.studentId === studentId && c.status === 'active');
const withRemaining = (inv) => ({ ...inv, remainingAmount: inv.totalAmount - inv.paidAmount });

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
        residence: c ? { bedCode: c.bedCode, buildingName: c.buildingName, roomNumber: c.roomNumber, endDate: c.endDate } : null,
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
const countBy = (st) => contracts.filter((c) => c.status === st).length;

const contractView = (c) => {
  const room = rooms.find((r) => r.id === c.roomId);
  const st = students.find((s) => s.id === c.studentId);
  const { demoRace, ...fields } = c; // eslint-disable-line no-unused-vars -- cờ nội bộ của mock, không trả ra
  return {
    ...fields,
    student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender },
    room: roomRef(room),
    buildingId: room?.buildingId,
    buildingCode: room?.buildingCode,
    isExpiring: isExpiring(c),
    totalDebt: debtOf(c.studentId),
  };
};

let issuedSeq = 0;
/** Hai hóa đơn lúc duyệt (FR-32): tiền cọc + tiền phòng trọn gói, hạn 7 ngày */
const issueContractInvoice = (c, st, type, amount, description) => {
  issuedSeq += 1;
  const inv = {
    id: `i-${type}-${c.id}`, invoiceCode: `INV-2026-${String(9000 + issuedSeq).padStart(4, '0')}`,
    studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
    contractId: c.id, bedCode: c.bedCode, type, billingPeriod: null,
    lineItems: [{ feeTypeId: type === 'deposit' ? 'f4' : 'f1', description, quantity: 1, unitPrice: amount, amount }],
    amount, totalAmount: amount, paidAmount: 0, issueDate: todayPlus(0), dueDate: todayPlus(7), status: 'unpaid',
  };
  invoices.push(inv);
  return inv;
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
    // Số theo tab — không phụ thuộc bộ lọc. `all`, `expiring` là của màn Hợp đồng hiện tại, sửa ở M5
    res.data.data.summary = {
      pending: countBy('pending'), active: countBy('active'), expired: countBy('expired'),
      terminated: countBy('terminated'), rejected: countBy('rejected'),
      awaitingDepositRefund: contracts.filter((c) => c.status === 'terminated' && !c.isDepositRefunded).length,
      all: countBy('active') + countBy('expired') + countBy('terminated'),
      expiring: contracts.filter((c) => isExpiring(c)).length,
    };
    return res;
  },
  getById: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    const st = students.find((s) => s.id === c.studentId);
    const contractInvoices = invoices.filter((i) => i.contractId === id).map(withRemaining)
      .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
    const depositInvoice = contractInvoices.find((i) => i.type === 'deposit');

    // Lịch sử hợp đồng — mới nhất lên đầu
    const history = [
      { at: c.createdAt, type: 'application_submitted', title: 'Nộp đơn đăng ký', description: `Mã ${c.contractCode}` },
      c.reviewedAt && c.status !== 'rejected' && {
        at: c.reviewedAt, type: 'application_approved', title: 'Duyệt đơn, khóa giường',
        description: `Giường ${c.bedCode} · tạo hóa đơn tiền cọc và tiền phòng cả kỳ`,
      },
      c.status === 'rejected' && { at: c.reviewedAt, type: 'rejected', title: 'Từ chối đơn', description: c.rejectionReason },
      c.status === 'terminated' && { at: c.terminatedAt, type: 'terminated', title: 'Chấm dứt hợp đồng', description: c.terminationReason },
      c.status === 'expired' && { at: c.endDate, type: 'expired', title: 'Hết hạn hợp đồng', description: 'Hết thời hạn thuê' },
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
    const months = TERM_MONTHS[c.term];
    const created = [
      issueContractInvoice(c, st, 'deposit', c.depositAmount, 'Tiền đặt cọc'),
      issueContractInvoice(c, st, 'room_semester', c.totalRoomFee, `Tiền phòng ${room.buildingCode}-${room.roomNumber} (${months} tháng)`),
    ];
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
  update: async (id, { terms } = {}) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    if (!terms || !terms.trim()) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'terms', message: 'Điều khoản không được để trống' }] });
    }
    c.terms = terms.trim();
    return ok(c, 'Cập nhật điều khoản thành công');
  },
  /** { reason, terminationDate } — trả giường, đóng lưu trú, quyết toán cọc */
  terminate: async (id, { reason, terminationDate } = {}) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    if (c.status !== 'active') fail(422, 'CONTRACT_NOT_ACTIVE', 'Hợp đồng không ở trạng thái hiệu lực');
    const date = terminationDate || todayPlus(0);
    const errors = [];
    if (!reason || reason.trim().length < 10) errors.push({ field: 'reason', message: 'Lý do chấm dứt tối thiểu 10 ký tự' });
    if (date < c.startDate || date > c.endDate) errors.push({ field: 'terminationDate', message: 'Ngày chấm dứt phải nằm trong thời hạn hợp đồng' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });

    // Mock KHÔNG tính tiền phòng kỳ dở theo ngày ở thực tế (BR-31) — con số cuối cùng do backend chốt
    const outstandingDebt = debtOf(c.studentId);
    const refund = c.depositAmount - outstandingDebt;

    Object.assign(c, {
      status: 'terminated', terminatedAt: date, terminationReason: reason.trim(), depositRefunded: Math.max(0, refund),
    });
    const bed = beds.find((b) => b.id === c.bedId);
    if (bed) bed.status = 'available';

    return ok({
      contract: { id: c.id, contractCode: c.contractCode, status: c.status, terminatedAt: date },
      settlement: {
        outstandingDebt,
        depositAmount: c.depositAmount,
        refundAmount: Math.max(0, refund),
        studentStillOwes: Math.max(0, -refund),
      },
    }, 'Đã chấm dứt hợp đồng');
  },
};

// ---------------------------------------------------------------- fees
/** Hóa đơn lẻ không dùng các loại phí có nguồn tiền riêng (hợp đồng) */
const MANUAL_BLOCKED_FEE_CODES = ['rent', 'deposit'];
const feeIdOf = (code) => feeTypes.find((t) => t.code === code)?.id;
const UTILITY_FEE_IDS = ['f2', 'f3'];
let manualInvoiceSeq = 0;
const nextManualInvoiceCode = () => {
  manualInvoiceSeq += 1;
  const ym = todayPlus(0).slice(0, 7).replace('-', '');
  return { id: `i-new${manualInvoiceSeq}`, invoiceCode: `INV-${ym}-${String(90000 + manualInvoiceSeq).padStart(5, '0')}` };
};
/** Hóa đơn + phòng, tòa (suy từ hợp đồng) + còn lại */
const invoiceView = (inv) => {
  const c = contracts.find((x) => x.id === inv.contractId);
  const room = c && rooms.find((r) => r.id === c.roomId);
  return {
    ...withRemaining(inv),
    roomNumber: room?.roomNumber ?? null, buildingId: room?.buildingId ?? null,
    buildingCode: room?.buildingCode ?? null, buildingName: room?.buildingName ?? null,
  };
};
/** Kỳ lập hóa đơn hợp lệ và không ở tương lai */
const checkGenerationPeriod = (value) => {
  const period = String(value || '');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'billingPeriod', message: 'Chọn kỳ' }] });
  if (period > periodPlus(0)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'billingPeriod', message: 'Chưa tới kỳ này' }] });
  return period;
};
const periodText = (period) => { const [y, m] = period.split('-'); return `tháng ${Number(m)}/${y}`; };
/**
 * Lập hóa đơn kỳ (UC-04): mỗi phòng có người ở + đã nhập chỉ số → chia đều điện, nước (floor, dư cho mã SV nhỏ nhất);
 * sinh viên chưa có hóa đơn tháng → tạo mới (tiền phòng + điện + nước); đã có → bổ sung dòng còn thiếu (BR-48).
 */
const runInvoiceGeneration = (period, buildingIds, dueDate, dryRun) => {
  const targetBuildings = buildings.filter((b) => b.isActive && (!buildingIds.length || buildingIds.includes(b.id)));
  const result = { created: 0, updated: 0, totalAmount: 0, eligibleStudents: 0, readyRooms: 0, skipped: [] };
  let seq = 0;
  targetBuildings.forEach((b) => {
    rooms.filter((r) => r.buildingId === b.id && r.status !== 'inactive').forEach((room) => {
      const residents = contracts.filter((c) => c.roomId === room.id && c.status === 'active')
        .sort((x, y) => x.studentCode.localeCompare(y.studentCode));
      const skip = (code, reason) => result.skipped.push({ roomId: room.id, roomNumber: room.roomNumber, buildingCode: room.buildingCode, code, reason });
      if (!residents.length) { skip('NO_RESIDENT', 'Không có sinh viên đang ở'); return; }
      const reading = utilityReadings.find((u) => u.roomId === room.id && u.billingPeriod === period);
      if (!reading) { skip('NO_READING', 'Chưa nhập chỉ số điện nước'); return; }
      if (reading.isInvoiced) { skip('ALREADY_INVOICED', 'Kỳ này đã lập hóa đơn'); return; }
      result.readyRooms += 1;
      const n = residents.length;
      const eUse = reading.electricityEnd - reading.electricityStart;
      const wUse = reading.waterEnd - reading.waterStart;
      const eTotal = eUse * reading.electricityUnitPrice;
      const wTotal = wUse * reading.waterUnitPrice;
      const share = (total, idx) => Math.floor(total / n) + (idx === 0 ? total - Math.floor(total / n) * n : 0);
      residents.forEach((c, idx) => {
        result.eligibleStudents += 1;
        const utilityLines = [
          { feeTypeId: feeIdOf('electricity'), description: `Tiền điện ${periodText(period)} (${eUse} kWh, chia đều ${n} người)`, quantity: 1, unitPrice: share(eTotal, idx), amount: share(eTotal, idx) },
          { feeTypeId: feeIdOf('water'), description: `Tiền nước ${periodText(period)} (${wUse} m³, chia đều ${n} người)`, quantity: 1, unitPrice: share(wTotal, idx), amount: share(wTotal, idx) },
        ];
        const existing = invoices.find((i) => i.studentId === c.studentId && i.type === 'monthly' && i.billingPeriod === period && i.status !== 'cancelled');
        if (existing) {
          const missing = utilityLines.filter((l) => !existing.lineItems.some((x) => x.feeTypeId === l.feeTypeId));
          if (!missing.length) return;
          const added = missing.reduce((t, l) => t + l.amount, 0);
          result.updated += 1;
          result.totalAmount += added;
          if (!dryRun) {
            existing.lineItems.push(...missing);
            existing.totalAmount += added;
            existing.status = existing.paidAmount >= existing.totalAmount ? 'paid' : existing.paidAmount > 0 ? 'partial' : 'unpaid';
          }
          return;
        }
        const lineItems = [{ feeTypeId: feeIdOf('rent'), description: `Tiền phòng ${periodText(period)}`, quantity: 1, unitPrice: c.monthlyPrice, amount: c.monthlyPrice }, ...utilityLines];
        const total = lineItems.reduce((t, l) => t + l.amount, 0);
        result.created += 1;
        result.totalAmount += total;
        if (!dryRun) {
          seq += 1;
          invoices.push({
            id: `i-gen-${period}-${c.id}`, invoiceCode: `INV-${period.replace('-', '')}-${String(50000 + invoices.length + seq).padStart(5, '0')}`,
            studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
            contractId: c.id, bedCode: c.bedCode, type: 'monthly', billingPeriod: period, lineItems,
            totalAmount: total, paidAmount: 0, issueDate: todayPlus(0), dueDate, status: 'unpaid',
          });
        }
      });
      if (!dryRun) reading.isInvoiced = true;
    });
  });
  return result;
};

let readingIdSeq = 0;
/** Cán bộ đang đăng nhập (mock) — ghi người nhập chỉ số */
const currentUser = () => authStorage.getUser();
const readingView = (u) => {
  const room = rooms.find((r) => r.id === u.roomId);
  const electricityConsumption = u.electricityEnd - u.electricityStart;
  const waterConsumption = u.waterEnd - u.waterStart;
  return {
    ...u,
    roomNumber: room?.roomNumber, buildingId: room?.buildingId, buildingName: room?.buildingName,
    electricityConsumption, electricityAmount: electricityConsumption * u.electricityUnitPrice,
    waterConsumption, waterAmount: waterConsumption * u.waterUnitPrice,
  };
};
/** 4 chỉ số là số nguyên không âm; cuối ≥ đầu (BR-50) */
const meterValues = (body) => {
  const fields = ['electricityStart', 'electricityEnd', 'waterStart', 'waterEnd'];
  const errors = fields
    .filter((f) => body[f] === '' || body[f] === null || body[f] === undefined || !Number.isInteger(Number(body[f])) || Number(body[f]) < 0)
    .map((f) => ({ field: f, message: 'Chỉ số là số nguyên không âm' }));
  if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
  const v = Object.fromEntries(fields.map((f) => [f, Number(body[f])]));
  if (v.electricityEnd < v.electricityStart || v.waterEnd < v.waterStart) {
    fail(422, 'INVALID_METER_READING', 'Chỉ số cuối kỳ phải lớn hơn hoặc bằng chỉ số đầu kỳ');
  }
  return v;
};

/** Loại phí hệ thống — lập hóa đơn cần tới, không ngừng dùng được (DATA-SCHEMA 3.8) */
const SYSTEM_FEE_CODES = ['rent', 'electricity', 'water', 'deposit', 'other'];
/** Chỉ điện, nước dùng defaultAmount làm đơn giá — bắt buộc > 0 */
const PRICED_FEE_CODES = ['electricity', 'water'];
const feeTypeErrors = (body, code = String(body.code || '').trim().toLowerCase()) => {
  const errors = [];
  if (!String(body.name || '').trim()) errors.push({ field: 'name', message: 'Nhập tên loại phí' });
  if (!String(body.unit || '').trim()) errors.push({ field: 'unit', message: 'Nhập đơn vị tính' });
  const amount = Number(body.defaultAmount);
  if (body.defaultAmount === '' || body.defaultAmount === null || body.defaultAmount === undefined
    || Number.isNaN(amount) || amount < 0 || !Number.isInteger(amount)) {
    errors.push({ field: 'defaultAmount', message: 'Đơn giá là số nguyên không âm' });
  } else if (PRICED_FEE_CODES.includes(code) && amount <= 0) {
    errors.push({ field: 'defaultAmount', message: 'Đơn giá điện, nước phải lớn hơn 0' });
  }
  return errors;
};

export const mockFees = {
  /** Mảng sắp theo thứ tự hệ thống rồi mã; mặc định chỉ loại đang dùng, `includeInactive` lấy cả loại đã ngừng */
  getFeeTypes: async (q = {}) => {
    await delay();
    const order = (t) => { const i = SYSTEM_FEE_CODES.indexOf(t.code); return i === -1 ? 99 : i; };
    const rows = feeTypes
      .filter((t) => String(q.includeInactive) === 'true' || t.isActive)
      .map((t) => ({ ...t, isSystem: SYSTEM_FEE_CODES.includes(t.code) }))
      .sort((a, b) => order(a) - order(b) || a.code.localeCompare(b.code));
    return ok(rows);
  },
  /** { code, name, unit, defaultAmount, isRecurring } — mã chữ thường, duy nhất */
  createFeeType: async (body = {}) => {
    await delay();
    const code = String(body.code || '').trim().toLowerCase();
    const errors = feeTypeErrors(body);
    if (!code) errors.push({ field: 'code', message: 'Nhập mã loại phí' });
    else if (!/^[a-z][a-z0-9_]{1,29}$/.test(code)) errors.push({ field: 'code', message: 'Mã bắt đầu bằng chữ, gồm chữ thường, số, dấu _, 2–30 ký tự' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    if (feeTypes.some((t) => t.code === code)) fail(409, 'DUPLICATE_ENTRY', `Mã loại phí ${code} đã tồn tại`, { errors: [{ field: 'code', message: `Mã loại phí ${code} đã tồn tại` }] });
    const t = {
      id: `f-${Date.now()}`, code, name: String(body.name).trim(), unit: String(body.unit).trim(),
      defaultAmount: Number(body.defaultAmount) || 0, isRecurring: !!body.isRecurring, isActive: true,
      updatedAt: new Date().toISOString(),
    };
    feeTypes.push(t);
    return ok({ ...t, isSystem: false }, `Đã thêm loại phí ${t.name}`);
  },
  /** { name, unit, defaultAmount, isRecurring, isActive } — không đổi mã; loại hệ thống không ngừng dùng được, giữ nguyên isRecurring */
  updateFeeType: async (id, body = {}) => {
    await delay();
    const t = feeTypes.find((x) => x.id === id);
    if (!t) fail(404, 'NOT_FOUND', 'Không tìm thấy loại phí');
    const isSystem = SYSTEM_FEE_CODES.includes(t.code);
    const errors = feeTypeErrors({ ...t, ...body }, t.code);
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    if (isSystem && body.isActive === false) fail(422, 'FEE_TYPE_REQUIRED', `${t.name} là loại phí hệ thống dùng khi lập hóa đơn, không thể ngừng sử dụng`);
    ['name', 'unit'].forEach((k) => { if (body[k] !== undefined) t[k] = String(body[k]).trim(); });
    if (body.defaultAmount !== undefined) t.defaultAmount = Number(body.defaultAmount) || 0;
    if (!isSystem && typeof body.isRecurring === 'boolean') t.isRecurring = body.isRecurring;
    if (typeof body.isActive === 'boolean') t.isActive = body.isActive;
    t.updatedAt = new Date().toISOString();
    const message = body.isActive === false ? 'Đã ngừng sử dụng loại phí'
      : body.isActive === true && Object.keys(body).length === 1 ? 'Đã dùng lại loại phí' : 'Cập nhật loại phí thành công';
    return ok({ ...t, isSystem }, message);
  },
  /** ?billingPeriod=&buildingId=&roomId= — đơn giá đã chốt trên từng bản ghi (BR-52) */
  getUtilityReadings: async (q = {}) => {
    await delay();
    let rows = utilityReadings;
    if (q.billingPeriod) rows = rows.filter((u) => u.billingPeriod === q.billingPeriod);
    if (q.roomId) rows = rows.filter((u) => u.roomId === q.roomId);
    if (q.buildingId) rows = rows.filter((u) => rooms.find((r) => r.id === u.roomId)?.buildingId === q.buildingId);
    return paginate(rows.map(readingView), { limit: 100, ...q });
  },
  /** POST — { roomId, billingPeriod, electricityStart, electricityEnd, waterStart, waterEnd }; đơn giá lấy từ danh mục phí lúc nhập */
  saveUtilityReading: async (body = {}) => {
    await delay();
    const room = rooms.find((r) => r.id === body.roomId);
    if (!room) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const period = String(body.billingPeriod || '');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'billingPeriod', message: 'Kỳ không hợp lệ' }] });
    if (period > periodPlus(0)) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'billingPeriod', message: 'Chưa tới kỳ này, không nhập trước được' }] });
    const values = meterValues(body);
    if (utilityReadings.some((u) => u.roomId === room.id && u.billingPeriod === period)) {
      fail(409, 'DUPLICATE_ENTRY', `Phòng ${room.roomNumber} đã có chỉ số kỳ ${period}`, { errors: [{ field: 'roomId', message: 'Phòng đã có chỉ số kỳ này' }] });
    }
    const price = (code) => feeTypes.find((t) => t.code === code)?.defaultAmount ?? 0;
    readingIdSeq += 1;
    const u = {
      id: `u-new${readingIdSeq}`, roomId: room.id, billingPeriod: period, ...values,
      electricityUnitPrice: price('electricity'), waterUnitPrice: price('water'),
      isInvoiced: false, recordedByName: currentUser()?.fullName ?? null, recordedAt: new Date().toISOString(),
    };
    utilityReadings.push(u);
    return ok(readingView(u), 'Lưu chỉ số thành công');
  },
  /** PUT — sửa 4 chỉ số, giữ đơn giá đã chốt; khóa sau khi lập hóa đơn (BR-53) */
  updateUtilityReading: async (id, body = {}) => {
    await delay();
    const u = utilityReadings.find((x) => x.id === id);
    if (!u) fail(404, 'NOT_FOUND', 'Không tìm thấy chỉ số');
    if (u.isInvoiced) fail(422, 'READING_ALREADY_INVOICED', 'Kỳ này đã lập hóa đơn, không thể sửa chỉ số');
    Object.assign(u, meterValues(body), { recordedByName: currentUser()?.fullName ?? u.recordedByName, recordedAt: new Date().toISOString() });
    return ok(readingView(u), 'Cập nhật chỉ số thành công');
  },
  /** ?search=&status=&type=&billingPeriod=&buildingId=&studentId= — kèm summary của cả tập đã lọc (bỏ hóa đơn đã hủy) */
  getInvoices: async (q = {}) => {
    await delay();
    let rows = invoices.map(invoiceView);
    if (q.status) rows = rows.filter((i) => i.status === q.status);
    if (q.type) rows = rows.filter((i) => i.type === q.type);
    if (q.billingPeriod) rows = rows.filter((i) => i.billingPeriod === q.billingPeriod);
    if (q.studentId) rows = rows.filter((i) => i.studentId === q.studentId);
    if (q.buildingId) rows = rows.filter((i) => i.buildingId === q.buildingId);
    rows = search(rows, q.search, ['invoiceCode', 'studentCode', 'studentName', 'bedCode'])
      .sort((a, b) => String(b.issueDate).localeCompare(String(a.issueDate)) || b.invoiceCode.localeCompare(a.invoiceCode));
    const billable = rows.filter((i) => i.status !== 'cancelled');
    const sum = (list, f) => list.reduce((t, i) => t + f(i), 0);
    const overdue = billable.filter((i) => i.status === 'overdue');
    const res = paginate(rows, q);
    res.data.data.summary = {
      totalAmount: sum(billable, (i) => i.totalAmount),
      paidAmount: sum(billable, (i) => i.paidAmount),
      remainingAmount: sum(billable, (i) => i.remainingAmount),
      overdueCount: overdue.length,
      overdueAmount: sum(overdue, (i) => i.remainingAmount),
    };
    return res;
  },
  /** GET /invoices/:id — kèm hợp đồng, chỗ ở và lịch sử thanh toán (cũ → mới) */
  getInvoiceById: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    const contract = contracts.find((c) => c.id === inv.contractId);
    return ok({
      ...invoiceView(inv),
      contractCode: contract?.contractCode ?? null,
      payments: payments.filter((p) => p.invoiceId === id).sort((a, b) => String(a.paidAt).localeCompare(String(b.paidAt))),
    });
  },
  /**
   * POST /invoices — hóa đơn lẻ loại `other` cho sinh viên đang có hợp đồng (FR-46).
   * { contractId, dueDate, note?, lineItems: [{ feeTypeId, description, quantity, unitPrice }] } — amount, totalAmount do server tính (BR-41, BR-42)
   */
  createInvoice: async (body = {}) => {
    await delay();
    const c = contracts.find((x) => x.id === body.contractId);
    if (!c) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'contractId', message: 'Chọn sinh viên' }] });
    if (c.status !== 'active') fail(422, 'CONTRACT_NOT_ACTIVE', `Hợp đồng ${c.contractCode} không còn hiệu lực`);
    const errors = [];
    if (!body.dueDate) errors.push({ field: 'dueDate', message: 'Chọn hạn thanh toán' });
    else if (body.dueDate < todayPlus(0)) errors.push({ field: 'dueDate', message: 'Hạn thanh toán không được trước hôm nay' });
    const lines = Array.isArray(body.lineItems) ? body.lineItems : [];
    if (!lines.length) errors.push({ field: 'lineItems', message: 'Thêm ít nhất một khoản phí' });
    const lineItems = lines.map((l, idx) => {
      const ft = feeTypes.find((t) => t.id === l.feeTypeId);
      if (!ft || !ft.isActive || MANUAL_BLOCKED_FEE_CODES.includes(ft.code)) errors.push({ field: `lineItems.${idx}.feeTypeId`, message: 'Loại phí không dùng được cho hóa đơn lẻ' });
      if (!String(l.description || '').trim()) errors.push({ field: `lineItems.${idx}.description`, message: 'Nhập nội dung' });
      if (!(Number(l.quantity) > 0)) errors.push({ field: `lineItems.${idx}.quantity`, message: 'Số lượng phải lớn hơn 0' });
      if (!Number.isInteger(Number(l.unitPrice)) || Number(l.unitPrice) <= 0) errors.push({ field: `lineItems.${idx}.unitPrice`, message: 'Đơn giá phải lớn hơn 0' });
      const quantity = Number(l.quantity);
      const unitPrice = Number(l.unitPrice);
      return { feeTypeId: l.feeTypeId, description: String(l.description || '').trim(), quantity, unitPrice, amount: Math.round(quantity * unitPrice) };
    });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    const now = new Date();
    const inv = {
      ...nextManualInvoiceCode(),
      studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
      contractId: c.id, bedCode: c.bedCode, type: 'other', billingPeriod: null, lineItems,
      totalAmount: lineItems.reduce((t, l) => t + l.amount, 0), paidAmount: 0,
      issueDate: todayPlus(0), dueDate: body.dueDate, status: 'unpaid', note: String(body.note || '').trim() || null,
      createdAt: now.toISOString(),
    };
    invoices.push(inv);
    return ok(invoiceView(inv), `Đã tạo hóa đơn ${inv.invoiceCode}`);
  },
  /** GET /invoices/generation-preview?billingPeriod=&buildingIds= — tính trước kết quả lập hàng loạt, không ghi gì */
  previewInvoiceGeneration: async (q = {}) => {
    await delay(300);
    const period = checkGenerationPeriod(q.billingPeriod);
    return ok(runInvoiceGeneration(period, q.buildingIds || [], null, true), 'Xem trước kết quả lập hóa đơn');
  },
  /** POST /invoices/generate — { billingPeriod, buildingIds?, dueDate } (FR-47, UC-04) */
  generateInvoices: async (body = {}) => {
    await delay(700);
    if (!body.dueDate) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'dueDate', message: 'Chọn hạn thanh toán' }] });
    const period = checkGenerationPeriod(body.billingPeriod);
    const result = runInvoiceGeneration(period, body.buildingIds || [], body.dueDate, false);
    const [y, m] = period.split('-');
    return ok(result, `Đã lập ${result.created} hóa đơn${result.updated ? `, bổ sung ${result.updated} hóa đơn` : ''} cho kỳ ${Number(m)}/${y}`);
  },
  /** PATCH /invoices/:id/cancel — chỉ khi chưa có thanh toán thành công (BR-46) */
  cancelInvoice: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.status === 'cancelled') fail(422, 'INVOICE_NOT_CANCELLABLE', 'Hóa đơn đã hủy trước đó');
    if (inv.paidAmount > 0) fail(422, 'INVOICE_HAS_PAYMENT', 'Hóa đơn đã phát sinh thanh toán, không thể hủy');
    inv.status = 'cancelled';
    // Hủy hết hóa đơn tháng có tiền điện nước của một phòng → mở khóa chỉ số kỳ đó để sửa (BR-53)
    if (inv.type === 'monthly' && inv.billingPeriod) {
      const roomId = contracts.find((c) => c.id === inv.contractId)?.roomId;
      const stillBilled = invoices.some((x) => x.type === 'monthly' && x.billingPeriod === inv.billingPeriod && x.status !== 'cancelled'
        && contracts.find((c) => c.id === x.contractId)?.roomId === roomId && x.lineItems.some((l) => UTILITY_FEE_IDS.includes(l.feeTypeId)));
      const reading = utilityReadings.find((u) => u.roomId === roomId && u.billingPeriod === inv.billingPeriod);
      if (reading && !stillBilled) reading.isInvoiced = false;
    }
    return ok(invoiceView(inv), `Đã hủy hóa đơn ${inv.invoiceCode}`);
  },
};

// ---------------------------------------------------------------- payments
/**
 * Dữ liệu giả: cổng thanh toán "gửi webhook" sau `demoWebhookAt` — cộng tiền vào hóa đơn đúng một lần (BR-62).
 */
const DEMO_PAYMENT_KEY = 'mockOnlinePayments';
/** Dữ liệu giả sống trong bộ nhớ, mà cổng thanh toán lại tải lại trang → giữ giao dịch đang chờ ở sessionStorage */
const saveDemoPayment = (payment) => {
  try {
    const kept = JSON.parse(sessionStorage.getItem(DEMO_PAYMENT_KEY) || '[]');
    sessionStorage.setItem(DEMO_PAYMENT_KEY, JSON.stringify([...kept, payment].slice(-5)));
  } catch { /* chế độ riêng tư: bỏ qua, demo vẫn chạy trong một lần tải trang */ }
};
const restoreDemoPayments = () => {
  try {
    JSON.parse(sessionStorage.getItem(DEMO_PAYMENT_KEY) || '[]')
      .filter((p) => !payments.some((x) => x.transactionRef === p.transactionRef))
      .forEach((p) => payments.push({ ...p }));
  } catch { /* bỏ qua */ }
};

const applyDemoWebhooks = () => {
  restoreDemoPayments();
  payments.filter((p) => p.status === 'pending' && p.demoWebhookAt && Date.now() >= p.demoWebhookAt).forEach((p) => {
    p.status = 'success';
    p.paidAt = new Date().toISOString();
    p.gatewayTransactionId = `VNP${String(Date.now()).slice(-8)}`;
    const inv = invoices.find((i) => i.id === p.invoiceId);
    if (!inv) return;
    inv.paidAmount = payments.filter((x) => x.invoiceId === inv.id && x.type === 'payment' && x.status === 'success').reduce((t, x) => t + x.amount, 0); // BR-43
    inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';
  });
};

/** Thời điểm xếp hạng / lọc của giao dịch: đã trả thì theo paidAt, chưa thì theo lúc tạo */
const paymentTime = (p) => p.paidAt || p.createdAt || '';
const paymentDate = (p) => String(paymentTime(p)).slice(0, 10);

export const mockPayments = {
  /** ?search=&invoiceId=&studentId=&type=&method=&status=&from=&to= — mới nhất lên đầu, kèm summary của cả tập đã lọc */
  getList: async (q = {}) => {
    await delay();
    let rows = payments;
    if (q.invoiceId) rows = rows.filter((p) => p.invoiceId === q.invoiceId);
    if (q.studentId) rows = rows.filter((p) => p.studentId === q.studentId);
    if (q.type) rows = rows.filter((p) => p.type === q.type);
    if (q.method) rows = rows.filter((p) => p.method === q.method);
    if (q.status) rows = rows.filter((p) => p.status === q.status);
    if (q.from) rows = rows.filter((p) => paymentDate(p) >= q.from);
    if (q.to) rows = rows.filter((p) => paymentDate(p) <= q.to);
    rows = search(rows, q.search, ['transactionRef', 'invoiceCode', 'studentName', 'studentCode', 'bankReference', 'gatewayTransactionId'])
      .slice()
      .sort((a, b) => String(paymentTime(b)).localeCompare(String(paymentTime(a))));
    const sumOf = (f) => rows.filter(f).reduce((t, p) => t + p.amount, 0);
    const res = paginate(rows, q);
    res.data.data.summary = {
      collectedAmount: sumOf((p) => p.status === 'success' && p.type === 'payment'),
      refundedAmount: sumOf((p) => p.status === 'success' && p.type === 'refund'),
      successCount: rows.filter((p) => p.status === 'success').length,
      pendingCount: rows.filter((p) => p.status === 'pending').length,
      failedCount: rows.filter((p) => ['failed', 'expired'].includes(p.status)).length,
    };
    return res;
  },
  /** POST /payments/:id/reconcile — hỏi lại cổng thanh toán cho giao dịch treo (FR-56, BR-64) */
  reconcile: async (id) => {
    await delay(700);
    const payment = payments.find((p) => p.id === id);
    if (!payment) fail(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');
    if (payment.status !== 'pending') fail(422, 'PAYMENT_NOT_PENDING', 'Chỉ đối soát được giao dịch đang xử lý');
    if (['cash', 'bank_transfer'].includes(payment.method)) fail(422, 'PAYMENT_NOT_ONLINE', 'Giao dịch tại quầy không cần đối soát với cổng thanh toán');
    const inv = invoices.find((x) => x.id === payment.invoiceId);
    if (payment.demoReconcile === 'success') {
      payment.status = 'success';
      payment.paidAt = new Date().toISOString();
      payment.gatewayTransactionId = payment.gatewayTransactionId || `VNP${Date.now()}`;
      inv.paidAmount = payments.filter((p) => p.invoiceId === inv.id && p.type === 'payment' && p.status === 'success').reduce((t, p) => t + p.amount, 0); // BR-43
      inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : inv.paidAmount > 0 ? 'partial' : inv.status;
      return ok({ payment, invoice: withRemaining(inv) }, `Cổng thanh toán báo giao dịch ${payment.transactionRef} đã thành công — đã cập nhật hóa đơn`);
    }
    payment.status = 'expired'; // BR-64
    return ok({ payment, invoice: withRemaining(inv) }, `Giao dịch ${payment.transactionRef} đã hết hạn ở cổng thanh toán`);
  },
  /**
   * POST /payments/offline — { invoiceId, amount, method: cash|bank_transfer, paidAt, bankReference?, note? } (FR-51).
   * Chuyển khoản bắt buộc mã giao dịch ngân hàng, không trùng (tránh ghi một khoản chuyển hai lần).
   */
  recordOffline: async (body = {}) => {
    await delay();
    const inv = invoices.find((x) => x.id === body.invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.status === 'cancelled') fail(422, 'INVOICE_CANCELLED', 'Hóa đơn đã hủy, không thu tiền được');
    if (inv.status === 'paid') fail(422, 'INVOICE_ALREADY_PAID', 'Hóa đơn đã được thanh toán đủ'); // BR-45
    const errors = [];
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0) errors.push({ field: 'amount', message: 'Số tiền thu phải lớn hơn 0' });
    if (!['cash', 'bank_transfer'].includes(body.method)) errors.push({ field: 'method', message: 'Chọn hình thức thanh toán' });
    const bankReference = String(body.bankReference || '').trim().toUpperCase();
    if (body.method === 'bank_transfer' && !bankReference) errors.push({ field: 'bankReference', message: 'Nhập mã giao dịch ngân hàng' });
    if (!body.paidAt) errors.push({ field: 'paidAt', message: 'Chọn ngày thu' });
    else if (String(body.paidAt).slice(0, 10) > todayPlus(0)) errors.push({ field: 'paidAt', message: 'Ngày thu không được sau hôm nay' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
    const remaining = inv.totalAmount - inv.paidAmount;
    if (amount > remaining) fail(422, 'PAYMENT_EXCEEDS_REMAINING', `Số tiền vượt quá số còn phải trả (${remaining.toLocaleString('vi-VN')} đ)`); // BR-44
    if (bankReference && payments.some((p) => p.bankReference === bankReference && p.status === 'success')) {
      fail(409, 'DUPLICATE_ENTRY', `Mã giao dịch ${bankReference} đã được ghi nhận`, { errors: [{ field: 'bankReference', message: 'Mã giao dịch này đã được ghi nhận trước đó' }] });
    }
    const payment = {
      id: `p-${Date.now()}`, transactionRef: `PAY${Date.now()}`, invoiceId: inv.id, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
      studentId: inv.studentId, studentName: inv.studentName, amount, type: 'payment', method: body.method,
      gatewayTransactionId: null, bankReference: bankReference || null, status: 'success',
      paidAt: String(body.paidAt).length === 10 ? `${body.paidAt}T${new Date().toTimeString().slice(0, 8)}+07:00` : body.paidAt,
      note: String(body.note || '').trim() || null, recordedByName: authStorage.getUser()?.fullName ?? null,
    };
    payments.push(payment);
    // BR-43: tính lại từ các thanh toán thành công, không cộng dồn
    inv.paidAmount = payments.filter((p) => p.invoiceId === inv.id && p.type === 'payment' && p.status === 'success').reduce((t, p) => t + p.amount, 0);
    inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';
    const message = inv.status === 'paid' ? `Đã thu ${amount.toLocaleString('vi-VN')} đ — hóa đơn đã thanh toán đủ` : `Đã thu ${amount.toLocaleString('vi-VN')} đ`;
    return ok({ payment, invoice: withRemaining(inv) }, message);
  },
  /**
   * POST /payments/online/checkout — tạo giao dịch `pending` rồi trả link cổng thanh toán (FR-53).
   * Dữ liệu giả: không có cổng thật nên link quay thẳng về màn kết quả, và webhook "về" sau 5 giây
   * để thử đúng luồng hỏi lại nhiều lần của SCR-65.
   */
  checkout: async ({ invoiceId, gateway = 'vnpay' }) => {
    await delay();
    const inv = invoices.find((x) => x.id === invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    if (inv.status === 'cancelled') fail(422, 'INVOICE_CANCELLED', 'Hóa đơn đã hủy, không thanh toán được');
    if (inv.status === 'paid') fail(422, 'INVOICE_ALREADY_PAID', 'Hóa đơn đã được thanh toán đủ');
    const amount = inv.totalAmount - inv.paidAmount;
    const transactionRef = `PAY${Date.now()}`;
    const payment = {
      id: `p-online-${Date.now()}`, transactionRef,
      invoiceId: inv.id, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
      studentId: inv.studentId, studentName: inv.studentName,
      amount, type: 'payment', method: gateway, gatewayTransactionId: null, bankReference: null,
      status: 'pending', paidAt: null, createdAt: new Date().toISOString(), note: null, recordedByName: null,
      demoWebhookAt: Date.now() + 5000, // webhook giả về sau 5 giây
    };
    payments.push(payment);
    saveDemoPayment(payment);
    return ok({
      paymentId: payment.id,
      transactionRef,
      gateway,
      amount,
      redirectUrl: `${window.location.origin}/portal/payment-result?ref=${transactionRef}`,
    });
  },
  /** Chỉ có ở mock: giả lập webhook VNPay báo thành công — gọi nhiều lần vẫn chỉ ghi nhận một lần */
  simulateGatewaySuccess: async (invoiceId) => {
    await delay(100);
    const inv = invoices.find((x) => x.id === invoiceId);
    if (inv.status !== 'paid') {
      payments.push({
        id: `p-gw-${invoiceId}`, transactionRef: `PAYGW${invoiceId}`, invoiceId, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
        studentId: inv.studentId, studentName: inv.studentName, amount: inv.totalAmount - inv.paidAmount, type: 'payment',
        method: 'vnpay', gatewayTransactionId: `VNP-${invoiceId}`, status: 'success', paidAt: new Date().toISOString(), note: null,
      });
      inv.paidAmount = inv.totalAmount;
      inv.status = 'paid';
    }
    return ok({ alreadyConfirmed: payments.filter((p) => p.invoiceId === invoiceId && p.method === 'vnpay').length > 1 });
  },
};

// ---------------------------------------------------------------- dashboard
export const mockDashboard = {
  getOccupancy: async () => { await delay(); return ok(occupancyStats()); },
  getSummary: async () => {
    await delay();
    const overdue = invoices.filter((i) => i.status === 'overdue');
    const active = contracts.filter((c) => c.status === 'active');
    return ok({
      occupancy: occupancyStats().overall,
      residents: {
        activeStudents: active.length,
        activeContracts: active.length,
        expiringIn30Days: active.filter((c) => isExpiring(c)).length,
        contractsByStatus: {
          active: active.length,
          expired: contracts.filter((c) => c.status === 'expired').length,
          terminated: contracts.filter((c) => c.status === 'terminated').length,
        },
      },
      finance: {
        totalDebt: students.reduce((s, st) => s + debtOf(st.id), 0),
        overdueInvoiceCount: overdue.length,
        overdueAmount: overdue.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0),
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
      contract: c,
      roomType: { name: c.roomTypeName, pricePerMonth: c.monthlyPrice },
      includedInRoom: ROOM_AMENITIES,
      roommates,
      debtSummary: {
        totalDebt: debtOf(st.id),
        unpaidInvoiceCount: invoices.filter((i) => i.studentId === st.id && ['unpaid', 'partial', 'overdue'].includes(i.status)).length,
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
    const inv = invoices.find((x) => x.id === id);
    if (inv && inv.studentId !== me().id) { await delay(); fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này'); }
    return mockFees.getInvoiceById(id);
  },
  /** ?transactionRef= — màn Kết quả thanh toán hỏi lại giao dịch vừa tạo (SCR-65) */
  getMyPayments: async (q = {}) => {
    await delay();
    applyDemoWebhooks();
    let rows = payments.filter((p) => p.studentId === me().id);
    if (q.transactionRef) rows = rows.filter((p) => p.transactionRef === q.transactionRef);
    return ok(rows.map((p) => ({ ...p, invoice: invoices.find((i) => i.id === p.invoiceId) ? withRemaining(invoices.find((i) => i.id === p.invoiceId)) : null })));
  },

};
