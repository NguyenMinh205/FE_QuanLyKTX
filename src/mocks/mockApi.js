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
  occupancyStats, debtOf, demoRaceRoomIds, simulateRivalApproval, todayPlus, newRequest,
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
  account('sv005@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv005),
  account('sv006@dorm.local', 'Student@123', 'student', null, DEMO_STUDENT_INDEX.sv006),
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
/** Hợp đồng còn hiệu lực và hết hạn trong N ngày tới (BR-29) */
const isExpiring = (c, days = 30) => c.status === 'active' && c.endDate >= todayPlus(0) && c.endDate <= todayPlus(days);

const REQUEST_STATUS_TEXT = { pending: 'đang chờ xử lý', approved: 'đã duyệt', rejected: 'bị từ chối', cancelled: 'đã hủy' };

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
    const contractRequests = requests.filter((r) => r.contractId === id);

    // Lịch sử hợp đồng — mới nhất lên đầu
    const history = [
      app && { at: app.createdAt, type: 'application_submitted', title: 'Nộp đơn đăng ký', description: `Đơn ${app.applicationCode}` },
      app?.reviewedAt && {
        at: app.reviewedAt, type: 'application_approved', title: 'Duyệt đơn, tạo hợp đồng',
        description: `Xếp giường ${c.bedCode} · tạo hóa đơn tiền cọc và tiền phòng tháng đầu`,
      },
      ...contractRequests.map((r) => ({
        at: r.createdAt,
        type: `request_${r.type}`,
        title: `${r.type === 'renewal' ? 'Yêu cầu gia hạn' : 'Yêu cầu trả phòng'} ${REQUEST_STATUS_TEXT[r.status] ?? r.status}`,
        description: r.type === 'renewal' ? `Đề nghị gia hạn tới ${r.requestedEndDate.split('-').reverse().join('/')}` : r.reason,
      })),
      c.status === 'terminated' && { at: c.terminatedAt, type: 'terminated', title: 'Chấm dứt hợp đồng', description: c.terminationReason },
      c.status === 'expired' && { at: c.endDate, type: 'expired', title: 'Hết hạn hợp đồng', description: 'Hệ thống tự chuyển trạng thái và trả giường' },
    ].filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));

    return ok({
      ...contractView(c),
      student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender, className: st.className, phone: st.phone },
      depositStatus: depositInvoice?.status ?? null,
      invoices: contractInvoices,
      pendingRequests: contractRequests.filter((r) => r.status === 'pending')
        .map((r) => ({ id: r.id, type: r.type, createdAt: r.createdAt, requestedEndDate: r.requestedEndDate })),
      unpaidSupplyOrders: supplyOrders.filter((o) => o.studentId === c.studentId && o.status === 'pending_payment').length,
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
  /** { reason, terminationDate } — hủy đơn nhu yếu phẩm chưa trả (BR-97), trả giường, đóng lưu trú, quyết toán cọc */
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

    const pendingOrders = supplyOrders.filter((o) => o.studentId === c.studentId && o.status === 'pending_payment');
    pendingOrders.forEach((o) => cancelSupplyOrder(o, 'Tự hủy khi chấm dứt hợp đồng'));
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
        cancelledSupplyOrders: pendingOrders.length,
      },
    }, 'Đã chấm dứt hợp đồng');
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
const OPEN_INVOICE = ['unpaid', 'partial', 'overdue'];
const pad2 = (n) => String(n).padStart(2, '0');

/** Công nợ đã LOẠI hóa đơn của đơn nhu yếu phẩm chưa thanh toán — các đơn đó bị hủy khi duyệt trả phòng (BR-97) */
const settleableDebtOf = (studentId) => {
  const pendingOrderInvoiceIds = new Set(supplyOrders
    .filter((o) => o.studentId === studentId && o.status === 'pending_payment').map((o) => o.invoiceId));
  const open = invoices.filter((i) => i.studentId === studentId && OPEN_INVOICE.includes(i.status) && !pendingOrderInvoiceIds.has(i.id));
  return { invoices: open, total: open.reduce((s, i) => s + i.totalAmount - i.paidAmount, 0) };
};

/**
 * Tiền phòng kỳ dở theo ngày ở thực tế (BR-31) = giá tháng / số ngày trong tháng × số ngày ở.
 * Tháng trả phòng đã có hóa đơn tiền phòng thì không tính thêm (mock đơn giản hóa — backend chốt con số cuối).
 */
const proratedRentOf = (contract, checkoutDate) => {
  const [y, m, d] = checkoutDate.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const period = `${y}-${pad2(m)}`;
  const billed = invoices.some((i) => i.contractId === contract.id && i.type === 'monthly' && i.billingPeriod === period && i.status !== 'cancelled');
  return {
    period, daysInMonth, days: billed ? 0 : d, alreadyBilled: billed,
    amount: billed ? 0 : Math.round((contract.monthlyPrice / daysInMonth) * d),
  };
};

/** Số tháng gia hạn, làm tròn lên; cuối tháng → cuối tháng tính tròn tháng (30/06 → 31/12 = 6) */
const monthsExtra = (from, to) => {
  const a = new Date(from); const b = new Date(to);
  const lastDay = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate();
  const partial = b.getDate() > a.getDate() && !(lastDay(a) && lastDay(b));
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (partial ? 1 : 0));
};

const requestView = (r) => {
  const c = contracts.find((x) => x.id === r.contractId);
  const room = c && rooms.find((x) => x.id === c.roomId);
  return {
    ...r,
    roomNumber: c?.roomNumber, buildingName: c?.buildingName, buildingCode: room?.buildingCode,
    contractEndDate: r.renewal?.previousEndDate ?? c?.endDate,
    outstandingDebt: settleableDebtOf(r.studentId).total,
  };
};

export const mockRequests = {
  getList: async (q = {}) => {
    await delay();
    const byStatus = q.status ? requests.filter((r) => r.status === q.status) : requests;
    let rows = q.type ? byStatus.filter((r) => r.type === q.type) : byStatus;
    rows = search(rows.map(requestView), q.search, ['studentName', 'studentCode', 'contractCode', 'bedCode', 'requestCode']);
    // Mới nhất lên đầu (theo bản vẽ); đã xử lý thì xử lý gần nhất lên đầu
    rows.sort((a, b) => String(b.reviewedAt || b.createdAt).localeCompare(String(a.reviewedAt || a.createdAt)));
    const res = paginate(rows, q);
    res.data.data.summary = {
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      // Theo loại, trong trạng thái đang lọc
      byType: { all: byStatus.length, renewal: byStatus.filter((r) => r.type === 'renewal').length, checkout: byStatus.filter((r) => r.type === 'checkout').length },
    };
    return res;
  },
  getById: async (id) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu');
    const c = contracts.find((x) => x.id === r.contractId);
    const st = students.find((s) => s.id === r.studentId);
    const debt = settleableDebtOf(r.studentId);
    const unpaidOrders = supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'pending_payment');
    const readyOrders = supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'ready');

    const detail = {
      ...requestView(r),
      student: { id: st.id, studentCode: st.studentCode, fullName: st.fullName, gender: st.gender, className: st.className, phone: st.phone },
      contract: {
        id: c.id, contractCode: c.contractCode, status: c.status, startDate: c.startDate, endDate: c.endDate,
        monthlyPrice: c.monthlyPrice, depositAmount: c.depositAmount, bedCode: c.bedCode, roomTypeName: c.roomTypeName, buildingName: c.buildingName,
      },
      depositAmount: c.depositAmount,
      outstandingDebt: debt.total,
      unpaidInvoices: debt.invoices.map((i) => ({
        id: i.id, invoiceCode: i.invoiceCode, type: i.type, billingPeriod: i.billingPeriod, dueDate: i.dueDate, remainingAmount: i.totalAmount - i.paidAmount,
      })),
      unpaidSupplyOrders: unpaidOrders.length,
      readySupplyOrders: readyOrders.length,
    };

    if (r.type === 'renewal' && r.status === 'pending') {
      detail.renewalPreview = { currentEndDate: c.endDate, requestedEndDate: r.requestedEndDate, extraMonths: monthsExtra(c.endDate, r.requestedEndDate) };
    }
    if (r.type === 'checkout' && r.status === 'pending') {
      const rent = proratedRentOf(c, r.requestedEndDate);
      const net = c.depositAmount - debt.total - rent.amount;
      const room = rooms.find((x) => x.id === c.roomId);
      const periods = [...new Set(utilityReadings.map((u) => u.billingPeriod))].sort();
      const latestPeriod = periods[periods.length - 1];
      detail.settlementPreview = {
        checkoutDate: r.requestedEndDate,
        depositAmount: c.depositAmount, outstandingDebt: debt.total,
        proratedRent: rent.amount, proratedDays: rent.days, daysInMonth: rent.daysInMonth, proratedPeriod: rent.period,
        refundAmount: Math.max(0, net), studentStillOwes: Math.max(0, -net), cancelledSupplyOrders: unpaidOrders.length,
      };
      detail.checklist = {
        utilityPeriod: latestPeriod,
        utilityReadingRecorded: utilityReadings.some((u) => u.roomId === room?.id && u.billingPeriod === latestPeriod),
        readySupplyOrders: readyOrders.length,
      };
    }
    return ok(detail);
  },
  /** renewal: {} · checkout: { actualCheckoutDate?, refundMethod?: 'cash' | 'bank_transfer', forceConfirm? } */
  approve: async (id, { forceConfirm, actualCheckoutDate, refundMethod = 'cash' } = {}) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu');
    if (r.status !== 'pending') fail(422, 'REQUEST_NOT_PENDING', 'Yêu cầu đã được xử lý');
    const c = contracts.find((x) => x.id === r.contractId);
    if (!c || c.status !== 'active') fail(422, 'CONTRACT_NOT_ACTIVE', 'Hợp đồng không ở trạng thái hiệu lực');
    const reviewedAt = new Date().toISOString();

    if (r.type === 'renewal') {
      if (!r.requestedEndDate || r.requestedEndDate <= c.endDate) {
        fail(422, 'VALIDATION_ERROR', 'Ngày gia hạn phải sau ngày kết thúc hiện tại của hợp đồng'); // BR-72
      }
      const renewal = { previousEndDate: c.endDate, newEndDate: r.requestedEndDate, extraMonths: monthsExtra(c.endDate, r.requestedEndDate) };
      c.endDate = r.requestedEndDate;
      Object.assign(r, { status: 'approved', reviewedAt, renewal });
      return ok({ request: { id: r.id, status: r.status }, renewal, settlement: null }, 'Duyệt gia hạn thành công');
    }

    // ---- trả phòng
    const checkoutDate = actualCheckoutDate || r.requestedEndDate || todayPlus(0);
    if (checkoutDate < c.startDate || checkoutDate > c.endDate) {
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'actualCheckoutDate', message: 'Ngày trả phòng phải nằm trong thời hạn hợp đồng' }] });
    }
    const before = settleableDebtOf(r.studentId);
    if (before.total > 0 && !forceConfirm) {
      fail(422, 'STUDENT_HAS_DEBT', `Sinh viên còn nợ ${before.total.toLocaleString('vi-VN')} đ. Xác nhận vẫn duyệt?`, { outstandingDebt: before.total });
    }

    const pendingOrders = supplyOrders.filter((o) => o.studentId === r.studentId && o.status === 'pending_payment');
    pendingOrders.forEach((o) => cancelSupplyOrder(o, 'Tự hủy khi duyệt trả phòng')); // BR-97 — trước khi chốt nợ
    const debt = settleableDebtOf(r.studentId);
    const rent = proratedRentOf(c, checkoutDate);
    const net = c.depositAmount - debt.total - rent.amount;
    const refundAmount = Math.max(0, net);
    const studentStillOwes = Math.max(0, -net);

    // Hóa đơn quyết toán (BR-76): cấn trừ cọc với nợ cũ + tiền phòng kỳ dở. Nợ cũ coi như đã được cọc thanh toán.
    const [y, m] = rent.period.split('-');
    const settlementInvoice = {
      id: `i-settle-${r.id}`, invoiceCode: `INV-${rent.period.replace('-', '')}-QT${r.id.toUpperCase()}`,
      studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
      contractId: c.id, bedCode: c.bedCode, type: 'settlement', billingPeriod: null,
      lineItems: [
        ...(rent.amount ? [{ feeTypeId: 'f1', description: `Tiền phòng tháng ${Number(m)}/${y} (${rent.days}/${rent.daysInMonth} ngày)`, quantity: 1, unitPrice: rent.amount, amount: rent.amount }] : []),
        ...(debt.total ? [{ feeTypeId: 'f5', description: `Công nợ chưa thanh toán (${debt.invoices.length} hóa đơn)`, quantity: 1, unitPrice: debt.total, amount: debt.total }] : []),
        { feeTypeId: 'f4', description: 'Khấu trừ tiền cọc', quantity: 1, unitPrice: -c.depositAmount, amount: -c.depositAmount },
      ],
      totalAmount: studentStillOwes, paidAmount: 0,
      issueDate: todayPlus(0), dueDate: todayPlus(7), status: studentStillOwes > 0 ? 'unpaid' : 'paid',
    };
    debt.invoices.forEach((i) => Object.assign(i, { paidAmount: i.totalAmount, status: 'paid' }));
    invoices.push(settlementInvoice);
    if (refundAmount > 0) { // BR-77 — lưu vết đã hoàn cọc
      payments.push({
        id: `p-refund-${r.id}`, transactionRef: `REFUND-${r.requestCode}`,
        invoiceId: settlementInvoice.id, invoiceCode: settlementInvoice.invoiceCode, invoiceType: 'settlement',
        studentId: c.studentId, studentName: c.studentName,
        amount: refundAmount, type: 'refund', method: refundMethod, gatewayTransactionId: null,
        status: 'success', paidAt: reviewedAt, note: `Hoàn cọc khi trả phòng ${c.contractCode}`,
      });
    }

    Object.assign(c, {
      status: 'terminated', terminatedAt: checkoutDate, terminationReason: `Trả phòng theo yêu cầu ${r.requestCode}`, depositRefunded: refundAmount,
    });
    const bed = beds.find((b) => b.id === c.bedId);
    if (bed) bed.status = 'available';
    const residency = residencies.find((x) => x.id === c.residencyId);
    if (residency) Object.assign(residency, { status: 'closed', endDate: checkoutDate });
    // Yêu cầu khác của hợp đồng không còn ý nghĩa
    requests.filter((x) => x.contractId === c.id && x.id !== r.id && x.status === 'pending').forEach((x) => { x.status = 'cancelled'; });

    const settlement = {
      checkoutDate, outstandingDebt: debt.total, proratedRent: rent.amount, depositAmount: c.depositAmount,
      refundAmount, studentStillOwes, refundMethod: refundAmount > 0 ? refundMethod : null,
      settlementInvoiceId: settlementInvoice.id, cancelledSupplyOrders: pendingOrders.length,
    };
    Object.assign(r, { status: 'approved', reviewedAt, settlement });
    return ok({ request: { id: r.id, status: r.status }, settlement }, 'Duyệt trả phòng thành công');
  },
  reject: async (id, { reviewNote } = {}) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r) fail(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu');
    if (r.status !== 'pending') fail(422, 'REQUEST_NOT_PENDING', 'Yêu cầu đã được xử lý');
    if (!reviewNote || !reviewNote.trim()) { // BR-78
      fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: [{ field: 'reviewNote', message: 'Nhập lý do từ chối' }] });
    }
    Object.assign(r, { status: 'rejected', reviewNote: reviewNote.trim(), reviewedAt: new Date().toISOString() });
    return ok({ id: r.id, status: r.status }, 'Đã từ chối yêu cầu');
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

  /** Yêu cầu của chính sinh viên — mới nhất lên đầu */
  getMyRequests: async () => {
    await delay();
    return ok(requests.filter((r) => r.studentId === me().id)
      .map(({ studentId, ...rest }) => rest) // eslint-disable-line no-unused-vars -- không trả id nội bộ
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
  },
  /** { type: 'renewal' | 'checkout', requestedEndDate, reason } */
  createRequest: async (body = {}) => {
    await delay();
    const st = me();
    const c = activeContractOf(st.id);
    if (!c) fail(422, 'CONTRACT_NOT_ACTIVE', 'Bạn chưa có hợp đồng đang hiệu lực');
    if (!['renewal', 'checkout'].includes(body.type)) fail(400, 'VALIDATION_ERROR', 'Loại yêu cầu không hợp lệ');
    if (requests.some((r) => r.studentId === st.id && r.type === body.type && r.status === 'pending')) {
      fail(409, 'DUPLICATE_PENDING_REQUEST', 'Bạn đã có một yêu cầu cùng loại đang chờ xử lý'); // BR-71
    }
    const errors = [];
    const date = body.requestedEndDate;
    if (!date) errors.push({ field: 'requestedEndDate', message: body.type === 'renewal' ? 'Chọn ngày kết thúc mới' : 'Chọn ngày dự kiến trả phòng' });
    else if (body.type === 'renewal' && date <= c.endDate) {
      errors.push({ field: 'requestedEndDate', message: 'Ngày kết thúc mới phải sau ngày kết thúc hiện tại của hợp đồng' }); // BR-72
    } else if (body.type === 'checkout' && (date < todayPlus(0) || date > c.endDate)) {
      errors.push({ field: 'requestedEndDate', message: 'Ngày trả phòng phải từ hôm nay đến hết hạn hợp đồng' });
    }
    if (body.type === 'checkout' && !(body.reason || '').trim()) errors.push({ field: 'reason', message: 'Nhập lý do trả phòng' });
    if (errors.length) fail(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });

    const r = newRequest(c, body.type, {
      reason: (body.reason || '').trim(), requestedEndDate: date, createdAt: new Date().toISOString(),
    });
    return ok(r, body.type === 'renewal' ? 'Đã gửi yêu cầu gia hạn' : 'Đã gửi yêu cầu trả phòng');
  },
  cancelRequest: async (id) => {
    await delay();
    const r = requests.find((x) => x.id === id);
    if (!r || r.studentId !== me().id) fail(403, 'FORBIDDEN', 'Bạn không có quyền truy cập dữ liệu này'); // BR-79
    if (r.status !== 'pending') fail(422, 'REQUEST_NOT_PENDING', 'Yêu cầu đã được xử lý, không thể hủy');
    r.status = 'cancelled';
    return ok({ id: r.id, status: r.status }, 'Đã hủy yêu cầu');
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
