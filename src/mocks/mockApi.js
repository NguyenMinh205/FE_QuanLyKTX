/**
 * Toàn bộ endpoint giả, gom theo module giống `modules/` của backend.
 * Mỗi hàm tương ứng một endpoint trong API.md v1.2 và ném ĐÚNG mã lỗi nghiệp vụ.
 */
import { delay, ok, paginate, fail, search } from './mockHelpers';
import { authStorage } from '../lib/authStorage';
import {
  DEMO_STUDENT_INDEX, roomTypes, buildings, rooms, beds, students, applications, residencies, contracts,
  feeTypes, utilityReadings, invoices, payments, requests, supplyItems, supplyOrders,
  roomTypeOf, bedsOf, availableSlots, generateBeds, approveApplication, createSupplyOrder,
  occupancyStats, debtOf,
} from './mockDb';

// ---------------------------------------------------------------- tiện ích
const activeContractOf = (studentId) => contracts.find((c) => c.studentId === studentId && c.status === 'active');
const includedSupplyNames = (roomTypeId) => supplyItems.filter((it) => it.includedInRoomTypes.includes(roomTypeId)).map((it) => it.name);
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

/** Hóa đơn supplies được trả đủ ⇒ đơn hàng sang ready, đúng một lần (BR-95) */
const markSupplyOrderReady = (invoiceId) => {
  const order = supplyOrders.find((o) => o.invoiceId === invoiceId && o.status === 'pending_payment');
  if (order) order.status = 'ready';
};

const cancelSupplyOrder = (order, reason) => {
  const inv = invoices.find((i) => i.id === order.invoiceId);
  if (order.status !== 'pending_payment' || inv.paidAmount > 0) {
    fail(422, 'ORDER_NOT_CANCELLABLE', 'Đơn hàng đã thanh toán, không thể hủy');
  }
  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  order.cancelReason = reason || null;
  inv.status = 'cancelled';
};

// ---------------------------------------------------------------- auth
const account = (email, password, role, fullName, studentIndex = null, mustChangePassword = false) => ({
  email, password, role, mustChangePassword,
  id: `u-${email.split('@')[0]}`,
  fullName: studentIndex === null ? fullName : students[studentIndex].fullName,
  studentId: studentIndex === null ? null : students[studentIndex].id,
});

const ACCOUNTS = [
  account('admin@dorm.local', 'Admin@123', 'admin', 'Nguyễn Văn Quản Trị'),
  account('staff@dorm.local', 'Staff@123', 'staff', 'Lê Thị Nhân Viên'),
  account('viewer@dorm.local', 'Viewer@123', 'viewer', 'Trần Văn Người Xem'),
  account('sv001@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv001),
  account('sv002@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv002),
  account('sv003@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv003),
  account('sv004@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv004),
  // Mật khẩu tạm do ban quản lý cấp — đăng nhập xong bị buộc đổi mật khẩu (BR-85)
  account('doimk@dorm.local', 'Tam@12345', 'staff', 'Phạm Văn Mới Vào', null, true),
];

export const mockAuth = {
  login: async ({ email, password }) => {
    await delay(400);
    const found = ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!found) fail(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác');
    return ok({
      token: `mock-token-${found.id}`,
      expiresIn: 604800,
      user: {
        id: found.id, email: found.email, fullName: found.fullName,
        role: found.role, studentId: found.studentId, mustChangePassword: found.mustChangePassword,
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
    Object.assign(acc, { password: newPassword, mustChangePassword: false });
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
      const c = activeContractOf(s.id);
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
  getBuildings: async () => {
    await delay();
    const stats = occupancyStats();
    return ok(buildings.map((b) => ({ ...b, stats: stats.byBuilding.find((x) => x.buildingName === b.name) })));
  },

  getRoomTypes: async (q = {}) => {
    await delay();
    let rows = roomTypes;
    if (q.tier) rows = rows.filter((t) => t.tier === q.tier);
    if (q.isActive !== undefined) rows = rows.filter((t) => String(t.isActive) === String(q.isActive));
    const items = rows.map((t) => {
      const base = { ...t, includedSupplies: includedSupplyNames(t.id) };
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
    return ok({ ...roomView(r), amenities: rt.amenities, includedSupplies: includedSupplyNames(rt.id), beds: bedList });
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
  if (availableSlots(room.id) === 0) fail(409, 'ROOM_FULL', `Phòng ${room.buildingCode}${room.roomNumber} vừa hết chỗ. Vui lòng chọn phòng khác`);
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
    if (!result) fail(409, 'ROOM_FULL', `Phòng ${room.buildingCode}${room.roomNumber} vừa hết chỗ. Vui lòng chọn phòng khác cùng loại`);
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

// ---------------------------------------------------------------- residencies
export const mockResidencies = {
  getList: async (q = {}) => {
    await delay();
    const items = residencies.map((r) => {
      const st = students.find((s) => s.id === r.studentId);
      const c = contracts.find((x) => x.residencyId === r.id);
      return { ...r, studentCode: st?.studentCode, studentName: st?.fullName, bedCode: c?.bedCode, buildingName: c?.buildingName, roomNumber: c?.roomNumber, contractCode: c?.contractCode };
    });
    return paginate(search(items, q.search, ['studentCode', 'studentName', 'bedCode']), q);
  },
};

// ---------------------------------------------------------------- contracts
export const mockContracts = {
  getList: async (q = {}) => {
    await delay();
    let rows = contracts;
    if (q.status) rows = rows.filter((c) => c.status === q.status);
    if (q.roomTypeId) rows = rows.filter((c) => c.roomTypeId === q.roomTypeId);
    if (q.expiringInDays) {
      const limit = new Date('2026-11-10');
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
    return ok({ ...c, totalDebt: debtOf(c.studentId), invoices: invoices.filter((i) => i.contractId === id).map(withRemaining) });
  },
  update: async (id, { terms }) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c) fail(404, 'NOT_FOUND', 'Không tìm thấy hợp đồng');
    c.terms = terms;
    return ok(c, 'Cập nhật điều khoản thành công');
  },
  terminate: async (id, { reason } = {}) => {
    await delay();
    const c = contracts.find((x) => x.id === id);
    if (!c || c.status !== 'active') fail(422, 'CONTRACT_NOT_ACTIVE', 'Hợp đồng không ở trạng thái hiệu lực');
    Object.assign(c, { status: 'terminated', terminationReason: reason || null });
    const bed = beds.find((b) => b.id === c.bedId);
    if (bed) bed.status = 'available';
    const res = residencies.find((r) => r.id === c.residencyId);
    if (res) res.status = 'closed';
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
    if (Number(body.electricityEnd) < Number(body.electricityStart) || Number(body.waterEnd) < Number(body.waterStart)) {
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
    return paginate(rows.map(withRemaining), q);
  },
  getInvoiceById: async (id) => {
    await delay();
    const inv = invoices.find((x) => x.id === id);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    const order = supplyOrders.find((o) => o.invoiceId === id);
    return ok({ ...withRemaining(inv), payments: payments.filter((p) => p.invoiceId === id), supplyOrder: order ? { id: order.id, orderCode: order.orderCode, status: order.status } : null });
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
  recordOffline: async ({ invoiceId, amount, method = 'cash' }) => {
    await delay();
    const inv = invoices.find((x) => x.id === invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.status === 'paid') fail(422, 'INVOICE_ALREADY_PAID', 'Hóa đơn đã được thanh toán đủ');
    if (Number(amount) > inv.totalAmount - inv.paidAmount) fail(422, 'PAYMENT_EXCEEDS_REMAINING', 'Số tiền thanh toán vượt quá số còn nợ');
    inv.paidAmount += Number(amount);
    inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';
    payments.push({
      id: `p-${Date.now()}`, transactionRef: `PAY${Date.now()}`, invoiceId: inv.id, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
      studentId: inv.studentId, studentName: inv.studentName, amount: Number(amount), type: 'payment', method,
      gatewayTransactionId: null, status: 'success', paidAt: new Date().toISOString(), note: null,
    });
    if (inv.status === 'paid' && inv.type === 'supplies') markSupplyOrderReady(inv.id); // BR-95
    return ok({ invoice: withRemaining(inv) }, 'Ghi nhận thanh toán thành công');
  },
  checkout: async ({ invoiceId, gateway = 'vnpay' }) => {
    await delay();
    const inv = invoices.find((x) => x.id === invoiceId);
    if (!inv) fail(404, 'NOT_FOUND', 'Không tìm thấy hóa đơn');
    if (inv.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    return ok({
      paymentId: 'p999', transactionRef: `PAY${Date.now()}`,
      redirectUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock=1&invoice=${invoiceId}&gateway=${gateway}`,
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
    if (inv.type === 'supplies') markSupplyOrderReady(inv.id);
    return ok({ alreadyConfirmed: payments.filter((p) => p.invoiceId === invoiceId && p.method === 'vnpay').length > 1 });
  },
};

// ---------------------------------------------------------------- requests
export const mockRequests = {
  getList: async (q = {}) => {
    await delay();
    let rows = requests;
    if (q.status) rows = rows.filter((r) => r.status === q.status);
    if (q.type) rows = rows.filter((r) => r.type === q.type);
    return paginate(rows.map((r) => ({ ...r, outstandingDebt: debtOf(r.studentId) })), q);
  },
  getById: async (id) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu');
    const c = contracts.find((x) => x.id === r.contractId);
    const unpaidOrders = supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'pending_payment');
    const unpaidOrderIds = new Set(unpaidOrders.map((o) => o.invoiceId));
    // Công nợ hiển thị đã LOẠI đơn nhu yếu phẩm chưa thanh toán — chúng sẽ bị hủy khi duyệt (BR-97)
    const debt = invoices
      .filter((i) => i.studentId === r.studentId && ['unpaid', 'partial', 'overdue'].includes(i.status) && !unpaidOrderIds.has(i.id))
      .reduce((s, i) => s + i.totalAmount - i.paidAmount, 0);
    return ok({
      ...r, contract: c, outstandingDebt: debt, depositAmount: c.depositAmount,
      unpaidSupplyOrders: unpaidOrders.length,
      readySupplyOrders: supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'ready').length,
    });
  },
  approve: async (id, { forceConfirm } = {}) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r || r.status !== 'pending') fail(422, 'VALIDATION_ERROR', 'Yêu cầu đã được xử lý');
    const c = contracts.find((x) => x.id === r.contractId);

    if (r.type === 'renewal') {
      c.endDate = r.requestedEndDate;
      r.status = 'approved';
      return ok({ request: r, settlement: null }, 'Duyệt gia hạn thành công');
    }

    // checkout: kiểm tra nợ (không tính đơn nhu yếu phẩm chưa trả)
    const pendingOrders = supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'pending_payment');
    const pendingInvoiceIds = new Set(pendingOrders.map((o) => o.invoiceId));
    const debtExcludingOrders = invoices
      .filter((i) => i.studentId === r.studentId && ['unpaid', 'partial', 'overdue'].includes(i.status) && !pendingInvoiceIds.has(i.id))
      .reduce((s, i) => s + i.totalAmount - i.paidAmount, 0);
    if (debtExcludingOrders > 0 && !forceConfirm) {
      fail(422, 'STUDENT_HAS_DEBT', `Sinh viên còn nợ ${debtExcludingOrders.toLocaleString('vi-VN')} đ. Xác nhận vẫn duyệt?`,
        { outstandingDebt: debtExcludingOrders });
    }

    pendingOrders.forEach((o) => cancelSupplyOrder(o, 'Tự hủy khi duyệt trả phòng')); // BR-97 — trước khi chốt nợ
    const outstandingDebt = debtOf(r.studentId);
    const refund = c.depositAmount - outstandingDebt;

    Object.assign(c, { status: 'terminated', depositRefunded: Math.max(0, refund) });
    const bed = beds.find((b) => b.id === c.bedId);
    if (bed) bed.status = 'available';
    const res = residencies.find((x) => x.id === c.residencyId);
    if (res) Object.assign(res, { status: 'closed', endDate: new Date().toISOString() });
    r.status = 'approved';

    return ok({
      request: r,
      settlement: {
        outstandingDebt, depositAmount: c.depositAmount,
        refundAmount: Math.max(0, refund), studentStillOwes: Math.max(0, -refund),
        cancelledSupplyOrders: pendingOrders.length,
      },
    }, 'Duyệt trả phòng thành công');
  },
  reject: async (id, { reviewNote } = {}) => {
    await delay();
    if (!reviewNote?.trim()) {
      fail(400, 'VALIDATION_ERROR', 'Vui lòng nhập lý do từ chối', { errors: [{ field: 'reviewNote', message: 'Vui lòng nhập lý do từ chối' }] });
    }
    const r = requests.find((x) => x.id === id);
    Object.assign(r, { status: 'rejected', reviewNote });
    return ok(r, 'Đã từ chối yêu cầu');
  },
};

// ---------------------------------------------------------------- supplies (quản trị)
export const mockSupplies = {
  getItems: async (q = {}) => {
    await delay();
    let rows = supplyItems;
    if (q.category) rows = rows.filter((it) => it.category === q.category);
    if (q.isActive !== undefined) rows = rows.filter((it) => String(it.isActive) === String(q.isActive));
    const items = rows.map((it) => ({ ...it, includedRoomTypeNames: it.includedInRoomTypes.map((id) => roomTypes.find((t) => t.id === id)?.name) }));
    return paginate(search(items, q.search, ['name']), q);
  },
  createItem: async (body) => {
    await delay();
    const it = { id: `si${supplyItems.length + 1}`, includedInRoomTypes: [], imageUrl: null, description: '', isActive: true, ...body, price: Number(body.price) };
    supplyItems.push(it);
    return ok(it, 'Thêm sản phẩm thành công');
  },
  updateItem: async (id, body) => {
    await delay();
    const it = supplyItems.find((x) => x.id === id);
    if (!it) fail(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm');
    Object.assign(it, body);
    return ok(it, 'Cập nhật sản phẩm thành công');
  },
  getOrders: async (q = {}) => {
    await delay();
    let rows = [...supplyOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (q.status) rows = rows.filter((o) => o.status === q.status);
    rows = search(rows, q.search, ['orderCode', 'studentCode', 'studentName']);
    const page = paginate(rows, q).data.data;
    const today = new Date().toISOString().slice(0, 10);
    return ok({
      ...page,
      summary: {
        pendingPayment: supplyOrders.filter((o) => o.status === 'pending_payment').length,
        ready: supplyOrders.filter((o) => o.status === 'ready').length,
        deliveredToday: supplyOrders.filter((o) => o.status === 'delivered' && o.deliveredAt?.startsWith(today)).length,
      },
    });
  },
  getOrderById: async (id) => {
    await delay();
    const o = supplyOrders.find((x) => x.id === id);
    if (!o) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
    return ok({ ...o, invoice: withRemaining(invoices.find((i) => i.id === o.invoiceId)) });
  },
  deliver: async (id) => {
    await delay();
    const o = supplyOrders.find((x) => x.id === id);
    if (!o) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
    if (o.status !== 'ready') fail(422, 'INVALID_ORDER_STATUS', 'Chỉ giao được đơn đang chờ nhận hàng');
    Object.assign(o, { status: 'delivered', deliveredAt: new Date().toISOString() });
    return ok(o, 'Đã xác nhận giao hàng');
  },
  cancel: async (id, { cancelReason } = {}) => {
    await delay();
    const o = supplyOrders.find((x) => x.id === id);
    if (!o) fail(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
    cancelSupplyOrder(o, cancelReason);
    return ok(o, 'Đã hủy đơn hàng');
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
        expiringIn30Days: active.filter((c) => c.endDate < '2026-12-15').length,
      },
      finance: {
        totalDebt: students.reduce((s, st) => s + debtOf(st.id), 0),
        overdueInvoiceCount: overdue.length,
        overdueAmount: overdue.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0),
      },
      pendingRequests: {
        renewal: requests.filter((r) => r.status === 'pending' && r.type === 'renewal').length,
        checkout: requests.filter((r) => r.status === 'pending' && r.type === 'checkout').length,
      },
      pendingApplications: applications.filter((a) => a.status === 'pending').length,
      supplyOrdersReady: supplyOrders.filter((o) => o.status === 'ready').length,
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
      includedInRoom: [...rt.amenities, ...includedSupplyNames(rt.id)],
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
  getMyPayments: async () => { await delay(); return ok(payments.filter((p) => p.studentId === me().id)); },

  getMyRequests: async () => { await delay(); return ok(requests.filter((r) => r.studentId === me().id)); },
  createRequest: async (body) => {
    await delay();
    const st = me();
    const c = activeContractOf(st.id);
    if (!c) fail(422, 'CONTRACT_NOT_ACTIVE', 'Bạn chưa có hợp đồng đang hiệu lực');
    if (requests.some((r) => r.studentId === st.id && r.type === body.type && r.status === 'pending')) {
      fail(409, 'DUPLICATE_PENDING_REQUEST', 'Bạn đã có một yêu cầu cùng loại đang chờ xử lý');
    }
    const r = {
      id: `rq-${Date.now()}`, studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
      contractId: c.id, contractCode: c.contractCode, bedCode: c.bedCode, status: 'pending', reviewNote: null,
      createdAt: new Date().toISOString(), ...body,
    };
    requests.push(r);
    return ok(r, 'Gửi yêu cầu thành công');
  },
  cancelRequest: async (id) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r || r.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    if (r.status !== 'pending') fail(422, 'VALIDATION_ERROR', 'Chỉ hủy được yêu cầu đang chờ xử lý');
    r.status = 'cancelled';
    return ok(r, 'Đã hủy yêu cầu');
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

  // ---- nhu yếu phẩm
  getSupplyItems: async () => {
    await delay();
    const c = activeContractOf(me().id);
    if (!c) fail(422, 'CONTRACT_NOT_ACTIVE', 'Bạn cần có chỗ ở để mua nhu yếu phẩm');
    const rt = roomTypes.find((t) => t.id === c.roomTypeId);
    return ok({
      roomType: { name: rt.name },
      roomNumber: c.roomNumber,
      includedInRoom: [...rt.amenities, ...includedSupplyNames(rt.id)],
      items: supplyItems.filter((it) => it.isActive && !it.includedInRoomTypes.includes(rt.id)),
    });
  },
  getMyOrders: async (q = {}) => {
    await delay();
    let rows = supplyOrders.filter((o) => o.studentId === me().id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (q.status) rows = rows.filter((o) => o.status === q.status);
    return paginate(rows, q);
  },
  createOrder: async ({ items = [] } = {}) => {
    await delay();
    const st = me();
    const c = activeContractOf(st.id);
    if (!c) fail(422, 'CONTRACT_NOT_ACTIVE', 'Bạn chưa có hợp đồng đang hiệu lực');
    if (!items.length) fail(400, 'VALIDATION_ERROR', 'Giỏ hàng đang trống');
    // Chỉ đọc supplyItemId + quantity — mọi trường giá client gửi lên đều bị bỏ qua (BR-92)
    const lines = items.map(({ supplyItemId, quantity }) => {
      const it = supplyItems.find((x) => x.id === supplyItemId);
      if (!it) fail(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm');
      if (!it.isActive) fail(422, 'SUPPLY_ITEM_INACTIVE', `Sản phẩm ${it.name} đã ngừng bán`);
      if (it.includedInRoomTypes.includes(c.roomTypeId)) fail(422, 'SUPPLY_ALREADY_INCLUDED', `${it.name} đã được cấp sẵn trong phòng của bạn`);
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 5) fail(400, 'VALIDATION_ERROR', 'Số lượng mỗi sản phẩm từ 1 đến 5');
      return { supplyItemId, quantity: qty };
    });
    const order = createSupplyOrder(st, c, lines, { date: new Date().toISOString().slice(0, 10) });
    const inv = invoices.find((i) => i.id === order.invoiceId);
    return ok({
      id: order.id, orderCode: order.orderCode, status: order.status, totalAmount: order.totalAmount,
      invoice: { id: inv.id, invoiceCode: inv.invoiceCode, type: inv.type, totalAmount: inv.totalAmount, dueDate: inv.dueDate },
    }, 'Đặt hàng thành công');
  },
  cancelOrder: async (id) => {
    await delay();
    const o = supplyOrders.find((x) => x.id === id);
    if (!o || o.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này');
    cancelSupplyOrder(o, 'Sinh viên tự hủy');
    return ok(o, 'Đã hủy đơn hàng');
  },
};
