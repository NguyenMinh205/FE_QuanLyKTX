/**
 * Toàn bộ endpoint giả, gom theo module giống `modules/` của backend.
 * Mỗi hàm tương ứng một endpoint trong API.md v1.2 và ném ĐÚNG mã lỗi nghiệp vụ.
 */
import { delay, ok, paginate, fail, search } from './mockHelpers';
import { authStorage } from '../lib/authStorage';
import {
  DEMO_STUDENT_INDEX, roomTypes, buildings, rooms, beds, students, applications, residencies, contracts,
  feeTypes, utilityReadings, invoices, payments,
  roomTypeOf, bedsOf, availableSlots, generateBeds, approveApplication,
  occupancyStats, debtOf, demoRaceRoomIds, simulateRivalApproval, todayPlus, periodPlus,
} from './mockDb';

// ---------------------------------------------------------------- tiện ích
const activeContractOf = (studentId) => contracts.find((c) => c.studentId === studentId && c.status === 'active');
const withRemaining = (inv) => ({ ...inv, remainingAmount: inv.totalAmount - inv.paidAmount });

const roomView = (r) => {
  const bs = bedsOf(r.id);
  const rt = roomTypeOf(r.id);
  return {
    ...r,
    roomTypeName: rt.name, tier: rt.tier, pricePerMonth: rt.pricePerMonth,
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
    if (activeContractOf(id) || applications.some((a) => a.studentId === id && a.status === 'pending')) {
      fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đang có hợp đồng hiệu lực hoặc đơn đăng ký chờ duyệt, không thể vô hiệu hóa');
    }
    if (debtOf(id) > 0) fail(422, 'STUDENT_HAS_DEBT', 'Sinh viên còn công nợ chưa thanh toán');
    const s = students.find((x) => x.id === id);
    s.status = 'inactive';
    return ok(s, 'Đã vô hiệu hóa sinh viên');
  },
};

// ---------------------------------------------------------------- rooms: tòa nhà, loại phòng, phòng, giường
export const mockRooms = {
  /** Mặc định chỉ tòa đang hoạt động (giống backend); màn Tòa nhà gửi includeInactive=true */
  getBuildings: async (q = {}) => {
    await delay();
    const list = String(q.includeInactive) === 'true' ? buildings : buildings.filter((b) => b.isActive);
    return ok([...list].sort((a, b) => a.code.localeCompare(b.code)).map((b) => {
      const roomIds = rooms.filter((r) => r.buildingId === b.id && r.status !== 'inactive').map((r) => r.id);
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
  /** { code, name, address?, description? } — mã duy nhất, viết hoa (BR-01) */
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
      address: String(body.address || '').trim(), description: String(body.description || '').trim(), isActive: true,
    };
    buildings.push(b);
    return ok(b, `Đã thêm tòa nhà ${name}`);
  },
  /** { name, address, description, isActive } — không đổi mã; không ngừng hoạt động khi còn người ở */
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
    ['name', 'address', 'description'].forEach((k) => { if (body[k] !== undefined) b[k] = String(body[k]).trim(); });
    if (typeof body.isActive === 'boolean') b.isActive = body.isActive;
    const message = body.isActive === false ? 'Đã ngừng hoạt động tòa nhà' : body.isActive === true && Object.keys(body).length === 1 ? 'Đã kích hoạt lại tòa nhà' : 'Cập nhật tòa nhà thành công';
    return ok(b, message);
  },

  getRoomTypes: async (q = {}) => {
    await delay();
    let rows = roomTypes;
    if (q.tier) rows = rows.filter((t) => t.tier === q.tier);
    if (q.isActive !== undefined) rows = rows.filter((t) => String(t.isActive) === String(q.isActive));
    const items = rows.map((t) => {
      const base = { ...t, includedSupplies: [] };
      if (String(q.withAvailability) !== 'true') return base;
      // student: chỉ đếm phòng khớp giới tính của chính mình
      const ofType = rooms.filter((r) => r.roomTypeId === t.id && r.status === 'active' && (!q.forGender || r.gender === q.forGender));
      return { ...base, roomCount: ofType.length, availableSlots: ofType.reduce((s, r) => s + availableSlots(r.id), 0) };
    });
    return paginate(items, { page: 1, limit: 100, ...q });
  },
  createRoomType: async (body) => {
    await delay();
    if (roomTypes.some((t) => t.tier === body.tier && Number(t.capacity) === Number(body.capacity))) {
      fail(409, 'DUPLICATE_ENTRY', 'Loại phòng này đã tồn tại');
    }
    const t = {
      id: `rt${roomTypes.length + 1}`, amenities: [], description: '', isActive: true, ...body,
      capacity: Number(body.capacity),
      name: `${body.tier === 'standard' ? 'Tiêu chuẩn' : 'Chất lượng cao'} · ${body.capacity} người`,
    };
    roomTypes.push(t);
    return ok(t, 'Thêm loại phòng thành công');
  },
  updateRoomType: async (id, body) => {
    await delay();
    const t = roomTypes.find((x) => x.id === id);
    if (!t) fail(404, 'NOT_FOUND', 'Không tìm thấy loại phòng');
    const shapeChanged = (body.tier && body.tier !== t.tier) || (body.capacity && Number(body.capacity) !== t.capacity);
    if (shapeChanged && rooms.some((r) => r.roomTypeId === id)) {
      fail(422, 'ROOM_TYPE_IN_USE', 'Loại phòng đang được sử dụng, không thể đổi hạng hoặc sức chứa');
    }
    Object.assign(t, body);
    return ok(t, 'Cập nhật loại phòng thành công');
  },

  getRooms: async (q = {}) => {
    await delay();
    let rows = rooms.map(roomView);
    if (q.buildingId) rows = rows.filter((r) => r.buildingId === q.buildingId);
    if (q.roomTypeId) rows = rows.filter((r) => r.roomTypeId === q.roomTypeId);
    if (q.floor) rows = rows.filter((r) => r.floor === Number(q.floor));
    if (q.gender) rows = rows.filter((r) => r.gender === q.gender);
    if (q.availability === 'has_slot') rows = rows.filter((r) => r.availableSlots > 0);
    if (q.availability === 'full') rows = rows.filter((r) => r.availableSlots === 0);
    if (q.availability === 'has_maintenance') rows = rows.filter((r) => r.maintenanceBeds > 0);
    return paginate(search(rows, q.search, ['roomNumber', 'buildingName']), { limit: 100, ...q });
  },
  /** GET /rooms/available — với student, gender lấy từ hồ sơ; tham số gender client gửi bị bỏ qua */
  getAvailableRooms: async (q = {}, { asStudent = false } = {}) => {
    await delay();
    const gender = asStudent ? me().gender : q.gender;
    let rows = rooms.filter((r) => r.status === 'active' && availableSlots(r.id) > 0).map(roomView);
    if (gender) rows = rows.filter((r) => r.gender === gender);
    if (q.roomTypeId) rows = rows.filter((r) => r.roomTypeId === q.roomTypeId);
    if (q.buildingId) rows = rows.filter((r) => r.buildingId === q.buildingId);
    return paginate(rows, { limit: 100, ...q });
  },
  getRoomById: async (id) => {
    await delay();
    const r = rooms.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const rt = roomTypeOf(id);
    const bedList = bedsOf(id).map((b) => {
      const c = contracts.find((x) => x.bedId === b.id && x.status === 'active');
      const st = c && students.find((s) => s.id === c.studentId);
      return { ...b, occupant: c ? { studentCode: c.studentCode, studentName: c.studentName, className: st?.className ?? null } : null };
    });
    return ok({ ...roomView(r), amenities: rt.amenities, includedSupplies: [], beds: bedList });
  },
  createRoom: async (body) => {
    await delay();
    const rt = roomTypes.find((t) => t.id === body.roomTypeId);
    const b = buildings.find((x) => x.id === body.buildingId);
    if (!rt || !b) fail(400, 'VALIDATION_ERROR', 'Thiếu tòa nhà hoặc loại phòng');
    if (!body.gender) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'gender', message: 'Vui lòng chọn giới tính phòng' }] });
    }
    if (rooms.some((r) => r.buildingId === b.id && r.roomNumber === body.roomNumber)) {
      fail(409, 'DUPLICATE_ENTRY', 'Số phòng đã tồn tại trong tòa nhà',
        { errors: [{ field: 'roomNumber', message: 'Số phòng đã tồn tại trong tòa nhà' }] });
    }
    const room = {
      id: `r-new-${rooms.length + 1}`, buildingId: b.id, buildingCode: b.code, buildingName: b.name,
      roomTypeId: rt.id, roomNumber: body.roomNumber, floor: Number(body.floor), gender: body.gender,
      capacity: rt.capacity, status: 'active',
    };
    rooms.push(room);
    generateBeds(room);
    return ok({ id: room.id, roomNumber: room.roomNumber, capacity: room.capacity, bedsCreated: rt.capacity },
      `Đã tạo phòng ${room.roomNumber} với ${rt.capacity} giường`);
  },
  updateRoom: async (id, body) => {
    await delay();
    const r = rooms.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    const occupied = bedsOf(id).some((b) => b.status === 'occupied');
    const typeChanged = body.roomTypeId && body.roomTypeId !== r.roomTypeId;
    const genderChanged = body.gender && body.gender !== r.gender;
    if (occupied && (typeChanged || genderChanged)) {
      fail(422, 'ROOM_HAS_OCCUPANTS', 'Phòng đang có người ở, không thể đổi loại phòng hoặc giới tính');
    }
    if (occupied && body.status === 'inactive') {
      fail(422, 'ROOM_HAS_OCCUPANTS', 'Phòng đang có người ở, không thể ngừng hoạt động');
    }
    if (body.roomNumber && body.roomNumber !== r.roomNumber
        && rooms.some((x) => x.id !== id && x.buildingId === r.buildingId && x.roomNumber === body.roomNumber)) {
      fail(409, 'DUPLICATE_ENTRY', 'Số phòng đã tồn tại trong tòa nhà',
        { errors: [{ field: 'roomNumber', message: 'Số phòng đã tồn tại trong tòa nhà' }] });
    }
    if (typeChanged) {
      // Phòng trống đổi loại: xóa giường cũ, sinh lại theo sức chứa mới (DATA-SCHEMA §3.4)
      const rt = roomTypes.find((t) => t.id === body.roomTypeId);
      for (let i = beds.length - 1; i >= 0; i -= 1) if (beds[i].roomId === id) beds.splice(i, 1);
      Object.assign(r, { roomTypeId: rt.id, capacity: rt.capacity });
      generateBeds(r);
    }
    Object.assign(r, {
      roomNumber: body.roomNumber ?? r.roomNumber,
      floor: body.floor !== undefined ? Number(body.floor) : r.floor,
      gender: body.gender ?? r.gender,
      status: body.status ?? r.status,
    });
    return ok(roomView(r), 'Cập nhật phòng thành công');
  },
  /** Body { status, note? } — chỉ bật/tắt bảo trì, không bao giờ gán người vào giường */
  setBedStatus: async (id, { status, note } = {}) => {
    await delay();
    const b = beds.find((x) => x.id === id);
    if (!b) fail(404, 'NOT_FOUND', 'Không tìm thấy giường');
    if (b.status === 'occupied') fail(422, 'BED_OCCUPIED', 'Giường đang có người ở, không thể chuyển bảo trì');
    if (!['available', 'maintenance'].includes(status)) fail(400, 'VALIDATION_ERROR', 'Trạng thái giường không hợp lệ');
    Object.assign(b, { status, note: status === 'maintenance' ? (note || null) : null });
    return ok(b, status === 'maintenance' ? 'Đã chuyển giường sang bảo trì' : 'Đã mở lại giường');
  },
};

// ---------------------------------------------------------------- applications (đơn đăng ký)
const applicationView = (a) => {
  const st = students.find((s) => s.id === a.studentId);
  const rt = roomTypes.find((t) => t.id === a.roomTypeId);
  const room = rooms.find((r) => r.id === a.requestedRoomId);
  const assignedRoom = a.assignedRoomId && rooms.find((r) => r.id === a.assignedRoomId);
  const contract = a.contractId && contracts.find((c) => c.id === a.contractId);
  const { demoRaceWith, ...fields } = a; // eslint-disable-line no-unused-vars -- cờ nội bộ của mock, không trả ra
  return {
    ...fields,
    student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender, className: st.className, phone: st.phone, totalDebt: debtOf(st.id) },
    roomType: { id: rt.id, name: rt.name, tier: rt.tier, capacity: rt.capacity, pricePerMonth: rt.pricePerMonth, depositAmount: rt.depositAmount },
    requestedRoom: {
      id: room.id, roomNumber: room.roomNumber, buildingName: room.buildingName, buildingCode: room.buildingCode,
      floor: room.floor, availableSlots: availableSlots(room.id),
    },
    // Chỉ có khi đơn đã duyệt
    assigned: assignedRoom ? {
      roomId: assignedRoom.id, roomNumber: assignedRoom.roomNumber, buildingName: assignedRoom.buildingName,
      buildingCode: assignedRoom.buildingCode, bedCode: contract?.bedCode ?? null,
    } : null,
    contractCode: contract?.contractCode ?? null,
    estimatedInvoices: { deposit: rt.depositAmount, firstMonth: rt.pricePerMonth, total: rt.depositAmount + rt.pricePerMonth },
  };
};

/** Kiểm tra dùng chung khi nộp đơn (sinh viên hoặc staff lập hộ) */
const validateNewApplication = (st, room) => {
  if (!st || !room) fail(404, 'NOT_FOUND', 'Không tìm thấy sinh viên hoặc phòng');
  if (activeContractOf(st.id)) fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đã có hợp đồng đang hiệu lực');
  if (applications.some((a) => a.studentId === st.id && a.status === 'pending')) {
    fail(409, 'DUPLICATE_PENDING_APPLICATION', 'Sinh viên đã có một đơn đăng ký đang chờ duyệt');
  }
  if (room.gender !== st.gender) fail(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${room.gender === 'male' ? 'nam' : 'nữ'}`);
  if (availableSlots(room.id) === 0) fail(409, 'ROOM_FULL', `Phòng ${room.buildingCode}-${room.roomNumber} vừa hết chỗ. Vui lòng chọn phòng khác`);
};

const submitApplication = (st, { roomId, startDate, endDate, note }) => {
  const room = rooms.find((r) => r.id === roomId);
  validateNewApplication(st, room);
  const a = {
    id: `ap${applications.length + 1}-${Date.now()}`,
    applicationCode: `DK-2026-${String(applications.length + 1).padStart(5, '0')}`,
    studentId: st.id, roomTypeId: room.roomTypeId, requestedRoomId: room.id,
    startDate: startDate || '2026-12-01', endDate: endDate || '2027-06-30', note: note || '',
    status: 'pending', assignedRoomId: null, assignedBedId: null, contractId: null, reviewNote: null,
    createdAt: new Date().toISOString(),
  };
  applications.push(a); // KHÔNG giữ chỗ (BR-34)
  return a;
};

export const mockApplications = {
  getList: async (q = {}) => {
    await delay();
    let rows = applications;
    if (q.status) rows = rows.filter((a) => a.status === q.status);
    if (q.roomTypeId) rows = rows.filter((a) => a.roomTypeId === q.roomTypeId);
    // Hàng chờ: đơn cũ nhất lên đầu. Đơn đã xử lý: xử lý gần nhất lên đầu
    const sorted = q.status && q.status !== 'pending'
      ? [...rows].sort((a, b) => (b.reviewedAt || b.createdAt).localeCompare(a.reviewedAt || a.createdAt))
      : [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const items = sorted.map(applicationView).map((x) => ({
      ...x, studentCode: x.student.studentCode, studentName: x.student.fullName, requestedRoomNumber: x.requestedRoom.roomNumber,
    }));
    const res = paginate(search(items, q.search, ['applicationCode', 'studentCode', 'studentName', 'requestedRoomNumber']), q);
    // Số đơn theo trạng thái cho các tab — không phụ thuộc bộ lọc status
    const count = (st) => applications.filter((a) => a.status === st).length;
    res.data.data.summary = { pending: count('pending'), approved: count('approved'), rejected: count('rejected') };
    return res;
  },
  getById: async (id) => {
    await delay();
    const a = applications.find((x) => x.id === id);
    if (!a) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn đăng ký');
    const room = rooms.find((r) => r.id === a.requestedRoomId);
    const bedList = bedsOf(room.id).map((b) => {
      const c = contracts.find((x) => x.bedId === b.id && x.status === 'active');
      return { bedNumber: b.bedNumber, status: b.status, occupantName: c?.studentName || null };
    });
    const view = applicationView(a);
    return ok({ ...view, requestedRoom: { ...view.requestedRoom, beds: bedList } });
  },
  create: async (body) => {
    await delay();
    const st = students.find((s) => s.id === body.studentId);
    return ok(applicationView(submitApplication(st, body)), 'Đã lập đơn đăng ký');
  },
  approve: async (id, { roomId } = {}) => {
    await delay();
    const a = applications.find((x) => x.id === id);
    if (!a) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn đăng ký');
    if (a.status !== 'pending') fail(422, 'APPLICATION_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
    const st = students.find((s) => s.id === a.studentId);
    if (activeContractOf(st.id)) fail(422, 'STUDENT_HAS_ACTIVE_CONTRACT', 'Sinh viên đã có hợp đồng đang hiệu lực');

    const room = rooms.find((r) => r.id === (roomId || a.requestedRoomId));
    if (!room) fail(404, 'NOT_FOUND', 'Không tìm thấy phòng');
    if (room.roomTypeId !== a.roomTypeId) fail(422, 'ROOM_TYPE_MISMATCH', 'Chỉ được đổi sang phòng cùng loại với đơn đăng ký');
    if (room.gender !== st.gender) fail(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${room.gender === 'male' ? 'nam' : 'nữ'}`);

    // Giả lập duyệt đồng thời: cán bộ khác vừa duyệt đơn cùng nhắm giường cuối (chỉ có trong dữ liệu giả)
    const racer = a.demoRaceWith && applications.find((x) => x.id === a.demoRaceWith && x.status === 'pending');
    if (racer && racer.requestedRoomId === room.id) approveApplication(racer, room);

    const result = approveApplication(a, room, { startDate: a.startDate });
    if (!result) fail(409, 'ROOM_FULL', `Phòng ${room.buildingCode}-${room.roomNumber} vừa hết chỗ. Vui lòng chọn phòng khác cùng loại`);
    const { bed, contract } = result;
    a.reviewedAt = new Date().toISOString();

    const due = '2026-12-08';
    const mk = (type, amount, description) => {
      const inv = {
        id: `i-${type}-${contract.id}`, invoiceCode: `INV-202612-${contract.id.toUpperCase()}${type === 'deposit' ? 'D' : 'M'}`,
        studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
        contractId: contract.id, bedCode: bed.bedCode,
        type, billingPeriod: type === 'monthly' ? '2026-12' : null,
        lineItems: [{ feeTypeId: type === 'deposit' ? 'f4' : 'f1', description, quantity: 1, unitPrice: amount, amount }],
        totalAmount: amount, paidAmount: 0, issueDate: '2026-12-01', dueDate: due, status: 'unpaid',
      };
      invoices.push(inv);
      return inv;
    };
    const created = [
      mk('deposit', contract.depositAmount, 'Tiền đặt cọc'),
      mk('monthly', contract.monthlyPrice, 'Tiền phòng tháng 12/2026'),
    ];
    return ok({
      application: { id: a.id, status: a.status },
      assigned: { roomNumber: room.roomNumber, buildingName: room.buildingName, buildingCode: room.buildingCode, bedCode: bed.bedCode },
      contract,
      invoices: created,
    }, 'Đã duyệt và xếp phòng');
  },
  reject: async (id, { reviewNote } = {}) => {
    await delay();
    if (!reviewNote || reviewNote.trim().length < 10) {
      fail(400, 'VALIDATION_ERROR', 'Lý do từ chối tối thiểu 10 ký tự',
        { errors: [{ field: 'reviewNote', message: 'Lý do từ chối tối thiểu 10 ký tự' }] });
    }
    const a = applications.find((x) => x.id === id);
    if (a.status !== 'pending') fail(422, 'APPLICATION_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
    Object.assign(a, { status: 'rejected', reviewNote: reviewNote.trim(), reviewedAt: new Date().toISOString() });
    return ok(a, 'Đã từ chối đơn đăng ký');
  },
};

// ---------------------------------------------------------------- contracts
/** Hợp đồng còn hiệu lực và hết hạn trong N ngày tới (BR-29) */
const isExpiring = (c, days = 30) => c.status === 'active' && c.endDate >= todayPlus(0) && c.endDate <= todayPlus(days);

const contractView = (c) => {
  const room = rooms.find((r) => r.id === c.roomId);
  return {
    ...c,
    buildingId: room?.buildingId,
    buildingCode: room?.buildingCode,
    tier: roomTypes.find((t) => t.id === c.roomTypeId)?.tier,
    isExpiring: isExpiring(c),
    totalDebt: debtOf(c.studentId),
  };
};

export const mockContracts = {
  getList: async (q = {}) => {
    await delay();
    let rows = contracts.map(contractView);
    if (q.status) rows = rows.filter((c) => c.status === q.status);
    if (q.expiringInDays) rows = rows.filter((c) => isExpiring(c, Number(q.expiringInDays)));
    if (q.buildingId) rows = rows.filter((c) => c.buildingId === q.buildingId);
    if (q.roomTypeId) rows = rows.filter((c) => c.roomTypeId === q.roomTypeId);
    rows = search(rows, q.search, ['contractCode', 'studentCode', 'studentName', 'bedCode']);
    // Sắp hết hạn: gần hết hạn nhất lên đầu · còn lại: bắt đầu gần nhất lên đầu
    rows = q.expiringInDays
      ? rows.sort((a, b) => a.endDate.localeCompare(b.endDate))
      : rows.sort((a, b) => b.startDate.localeCompare(a.startDate) || a.contractCode.localeCompare(b.contractCode));
    const res = paginate(rows, q);
    // Số hợp đồng theo tab — không phụ thuộc bộ lọc
    res.data.data.summary = {
      all: contracts.length,
      active: contracts.filter((c) => c.status === 'active').length,
      expiring: contracts.filter((c) => isExpiring(c)).length,
      expired: contracts.filter((c) => c.status === 'expired').length,
      terminated: contracts.filter((c) => c.status === 'terminated').length,
    };
    return res;
  },
  getById: async (id) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    const st = students.find((s) => s.id === c.studentId);
    const app = applications.find((a) => a.id === c.applicationId);
    const contractInvoices = invoices.filter((i) => i.contractId === id).map(withRemaining)
      .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
    const depositInvoice = contractInvoices.find((i) => i.type === 'deposit');

    // Lịch sử hợp đồng — mới nhất lên đầu
    const history = [
      app && { at: app.createdAt, type: 'application_submitted', title: 'Nộp đơn đăng ký', description: `Đơn ${app.applicationCode}` },
      app?.reviewedAt && {
        at: app.reviewedAt, type: 'application_approved', title: 'Duyệt đơn, tạo hợp đồng',
        description: `Xếp giường ${c.bedCode} · tạo hóa đơn tiền cọc và tiền phòng tháng đầu`,
      },
      c.status === 'terminated' && { at: c.terminatedAt, type: 'terminated', title: 'Chấm dứt hợp đồng', description: c.terminationReason },
      c.status === 'expired' && { at: c.endDate, type: 'expired', title: 'Hết hạn hợp đồng', description: 'Hệ thống tự chuyển trạng thái và trả giường' },
    ].filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));

    return ok({
      ...contractView(c),
      student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender, className: st.className, phone: st.phone },
      depositStatus: depositInvoice?.status ?? null,
      invoices: contractInvoices,
      history,
    });
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
    const residency = residencies.find((r) => r.id === c.residencyId);
    if (residency) Object.assign(residency, { status: 'closed', endDate: date });

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
      pendingApplications: applications.filter((a) => a.status === 'pending').length,
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
    const rt = roomTypes.find((t) => t.id === c.roomTypeId);
    const roommates = contracts
      .filter((x) => x.roomId === c.roomId && x.status === 'active' && x.studentId !== st.id)
      .map((x) => ({ studentCode: x.studentCode, fullName: x.studentName })); // chỉ họ tên + MSSV
    return ok({
      hasResidence: true,
      contract: c,
      roomType: { id: rt.id, name: rt.name, tier: rt.tier, pricePerMonth: rt.pricePerMonth },
      includedInRoom: rt.amenities,
      roommates,
      debtSummary: {
        totalDebt: debtOf(st.id),
        unpaidInvoiceCount: invoices.filter((i) => i.studentId === st.id && ['unpaid', 'partial', 'overdue'].includes(i.status)).length,
      },
    });
  },
  getMyContracts: async () => { await delay(); return ok(contracts.filter((c) => c.studentId === me().id)); },
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

  // ---- đơn đăng ký
  getRoomTypes: async (q = {}) => mockRooms.getRoomTypes({ ...q, isActive: true, withAvailability: true, forGender: me().gender }),
  getAvailableRooms: async (q = {}) => mockRooms.getAvailableRooms(q, { asStudent: true }),
  getMyApplications: async () => {
    await delay();
    return ok(applications.filter((a) => a.studentId === me().id).map(applicationView).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  createApplication: async (body) => {
    await delay();
    const target = rooms.find((r) => r.id === body.roomId);
    if (target && demoRaceRoomIds.has(target.id) && availableSlots(target.id) === 1) simulateRivalApproval(target);
    const a = submitApplication(me(), body); // studentId lấy từ phiên, không từ body
    const v = applicationView(a);
    return ok({ id: a.id, applicationCode: a.applicationCode, status: a.status, estimatedInvoices: v.estimatedInvoices },
      'Nộp đơn thành công. Ban quản lý sẽ duyệt trong 1–2 ngày làm việc');
  },
  cancelApplication: async (id) => {
    await delay();
    const a = applications.find((x) => x.id === id);
    if (!a || a.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    if (a.status !== 'pending') fail(422, 'APPLICATION_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
    a.status = 'cancelled';
    return ok(a, 'Đã hủy đơn đăng ký');
  },
};
