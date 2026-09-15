/**
 * Bộ dữ liệu giả dùng chung cho toàn bộ mock API — mô hình ĐĂNG KÝ THEO PHÒNG (DATA-SCHEMA.md v1.2).
 *
 *   6 loại phòng → 2 tòa → 20 phòng → giường TỰ SINH theo sức chứa
 *   → 90 sinh viên (72 đang ở) → đơn đăng ký → hợp đồng → hóa đơn → thanh toán
 *   → 8 sản phẩm nhu yếu phẩm → đơn hàng
 *
 * Tài khoản thử (xem mockApi.js): sv001 đang ở phòng Tiêu chuẩn, có nợ · sv002 chưa có chỗ ·
 * sv003 dùng test IDOR · sv004 đang ở phòng Chất lượng cao (được cấp sẵn đệm).
 *
 * ⚠️ Chỉ dùng khi chế độ dữ liệu giả bật (src/lib/env.js).
 */

const pad = (n, len = 3) => String(n).padStart(len, '0');
const pick = (arr, i) => arr[i % arr.length];

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN_NAM = ['Văn An', 'Minh Quân', 'Hoàng Long', 'Đức Anh', 'Quốc Bảo', 'Tiến Đạt'];
const TEN_NU = ['Thị Bích', 'Ngọc Ánh', 'Thu Hà', 'Phương Linh', 'Khánh Vy', 'Minh Châu'];
const KHOA = ['Công nghệ thông tin', 'Kinh tế', 'Cơ khí', 'Điện - Điện tử'];

/** Chỉ số sinh viên dùng cho tài khoản thử */
export const DEMO_STUDENT_INDEX = { sv001: 0, sv002: 85, sv003: 2, sv004: 3 };

// ---------------------------------------------------------------- loại phòng
const BASIC = ['Giường tầng', 'Tủ cá nhân', 'Quạt trần', 'Bàn học chung'];
const PREMIUM = ['Giường tầng', 'Tủ cá nhân', 'Điều hòa', 'Bình nóng lạnh', 'WC riêng'];

export const roomTypes = [
  { id: 'rt1', tier: 'standard', capacity: 8, pricePerMonth: 250000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt2', tier: 'standard', capacity: 6, pricePerMonth: 320000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt3', tier: 'standard', capacity: 4, pricePerMonth: 450000, depositAmount: 500000, amenities: [...BASIC, 'WC riêng'] },
  { id: 'rt4', tier: 'premium', capacity: 6, pricePerMonth: 750000, depositAmount: 1000000, amenities: PREMIUM },
  { id: 'rt5', tier: 'premium', capacity: 4, pricePerMonth: 950000, depositAmount: 1000000, amenities: [...PREMIUM, 'Bàn học riêng'] },
  { id: 'rt6', tier: 'premium', capacity: 3, pricePerMonth: 1200000, depositAmount: 1000000, amenities: [...PREMIUM, 'Bàn học riêng', 'Tủ lạnh mini'] },
].map((t) => ({
  ...t,
  name: `${t.tier === 'standard' ? 'Tiêu chuẩn' : 'Chất lượng cao'} · ${t.capacity} người`,
  description: '',
  isActive: true,
}));

// ---------------------------------------------------------------- tòa nhà
export const buildings = [
  { id: 'b1', code: 'A', name: 'Tòa A', address: 'Khu KTX số 1', isActive: true },
  { id: 'b2', code: 'B', name: 'Tòa B', address: 'Khu KTX số 1', isActive: true },
];

// ---------------------------------------------------------------- phòng (10 mỗi tòa) + giường tự sinh
const ROOM_TYPE_PATTERN = ['rt2', 'rt2', 'rt3', 'rt3', 'rt5', 'rt1', 'rt4', 'rt3', 'rt6', 'rt5'];

export const rooms = [];
export const beds = [];

/** Giống room.service.js ở backend: tạo phòng là sinh luôn đủ giường */
export const generateBeds = (room) => {
  for (let n = 1; n <= room.capacity; n++) {
    beds.push({
      id: `${room.id}-bed${n}`,
      roomId: room.id,
      bedNumber: n,
      bedCode: `${room.buildingCode}${room.roomNumber}-${pad(n, 2)}`,
      status: 'available',
      note: null,
    });
  }
};

buildings.forEach((b, bi) => {
  for (let i = 1; i <= 10; i++) {
    const floor = Math.ceil(i / 4);
    const rt = roomTypes.find((t) => t.id === ROOM_TYPE_PATTERN[i - 1]);
    const room = {
      id: `r${bi}${pad(i, 2)}`,
      buildingId: b.id,
      buildingCode: b.code,
      buildingName: b.name,
      roomTypeId: rt.id,
      roomNumber: `${floor}${pad(i, 2)}`,
      floor,
      gender: bi === 0 ? 'male' : 'female', // Tòa A nam, tòa B nữ
      capacity: rt.capacity,
      status: 'active',
    };
    rooms.push(room);
    generateBeds(room);
  }
});

// ---------------------------------------------------------------- tiện ích tra cứu
export const roomTypeOf = (roomId) => roomTypes.find((t) => t.id === rooms.find((r) => r.id === roomId)?.roomTypeId);
export const bedsOf = (roomId) => beds.filter((b) => b.roomId === roomId).sort((a, b) => a.bedNumber - b.bedNumber);
/** Chỗ trống = số giường available — KHÔNG tính bằng capacity − số người ở (BR-05) */
export const availableSlots = (roomId) => bedsOf(roomId).filter((b) => b.status === 'available').length;

/** Giống bedService.claimBedInRoom: lấy giường trống số nhỏ nhất, "nguyên tử" trong một bước JS đồng bộ */
export const claimBedInRoom = (roomId) => {
  const bed = bedsOf(roomId).find((b) => b.status === 'available');
  if (!bed) return null;
  bed.status = 'occupied';
  return bed;
};

// ---------------------------------------------------------------- sinh viên (90)
export const students = Array.from({ length: 90 }, (_, i) => {
  const isMale = i % 2 === 0;
  return {
    id: `s${pad(i + 1)}`,
    studentCode: `SV2026${pad(i + 1)}`,
    fullName: `${pick(HO, i)} ${isMale ? pick(TEN_NAM, i) : pick(TEN_NU, i)}`,
    gender: isMale ? 'male' : 'female',
    dob: `200${5 - (i % 3)}-${pad((i % 12) + 1, 2)}-${pad((i % 28) + 1, 2)}`,
    phone: `09${String(12000000 + i * 137)}`.slice(0, 10),
    email: `sv2026${pad(i + 1)}@sv.edu.vn`,
    className: `${pick(['CNTT', 'KT', 'CK', 'DT'], i)}2026${pick(['A', 'B', 'C'], i)}`,
    faculty: pick(KHOA, i),
    emergencyContact: { name: `${pick(HO, i + 1)} Văn C`, phone: '0987654321', relationship: 'Bố' },
    status: 'active',
  };
});

// ---------------------------------------------------------------- đơn đăng ký → lưu trú → hợp đồng
export const applications = [];
export const residencies = [];
export const contracts = [];

let appSeq = 0;
let contractSeq = 0;

const newApplication = (st, room, extra = {}) => {
  appSeq += 1;
  const app = {
    id: `ap${pad(appSeq)}`,
    applicationCode: `DK-2026-${pad(appSeq, 5)}`,
    studentId: st.id,
    roomTypeId: room.roomTypeId,
    requestedRoomId: room.id,
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    note: '',
    status: 'pending',
    assignedRoomId: null,
    assignedBedId: null,
    contractId: null,
    reviewNote: null,
    createdAt: `2026-08-${pad((appSeq % 27) + 1, 2)}T09:00:00+07:00`,
    ...extra,
  };
  applications.push(app);
  return app;
};

/** Giống applicationService.approve: gán giường → Residency → Contract. Trả null nếu phòng hết chỗ */
export const approveApplication = (app, room, { startDate = app.startDate } = {}) => {
  const bed = claimBedInRoom(room.id);
  if (!bed) return null;
  const st = students.find((s) => s.id === app.studentId);
  const rt = roomTypes.find((t) => t.id === room.roomTypeId);

  contractSeq += 1;
  const residency = {
    id: `res${pad(contractSeq)}`, studentId: st.id, bedId: bed.id, applicationId: app.id,
    startDate, endDate: null, status: 'active',
  };
  residencies.push(residency);

  const contract = {
    id: `c${pad(contractSeq)}`,
    contractCode: `HD-2026-${pad(contractSeq, 5)}`,
    applicationId: app.id,
    residencyId: residency.id,
    studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
    bedId: bed.id, bedCode: bed.bedCode,
    roomId: room.id, roomNumber: room.roomNumber, buildingName: room.buildingName,
    roomTypeId: rt.id, roomTypeName: rt.name,
    startDate, endDate: app.endDate,
    monthlyPrice: rt.pricePerMonth,     // chốt giá lúc duyệt (BR-27)
    depositAmount: rt.depositAmount,
    depositRefunded: 0,
    status: 'active',
    terms: 'Sinh viên tuân thủ nội quy ký túc xá.',
  };
  contracts.push(contract);

  Object.assign(app, {
    status: 'approved', assignedRoomId: room.id, assignedBedId: bed.id, contractId: contract.id,
    reviewedAt: '2026-08-30T10:00:00+07:00',
  });
  return { bed, residency, contract };
};

// Số chỗ để trống của từng phòng theo thứ tự trong tòa — để sơ đồ tầng có đủ mức: đầy, còn 1, còn nhiều, trống hẳn
const FREE_SLOTS_PATTERN = [0, 1, 2, 0, 3, 1, 2, 0, 1, 4];
const targetOf = Object.fromEntries(rooms.map((r) => {
  const idx = Number(r.id.slice(-2)) - 1;
  return [r.id, Math.max(0, r.capacity - FREE_SLOTS_PATTERN[idx % FREE_SLOTS_PATTERN.length])];
}));
const occupiedCount = (roomId) => bedsOf(roomId).filter((b) => b.status === 'occupied').length;

// 70 sinh viên đầu được xếp phòng (35 nam tòa A, 35 nữ tòa B — đúng tổng chỗ mục tiêu); sv004 cố ý vào phòng Chất lượng cao
const PLACED = 70;
students.slice(0, PLACED).forEach((st, i) => {
  const wantPremium = i === DEMO_STUDENT_INDEX.sv004;
  const fits = (r) => r.gender === st.gender && occupiedCount(r.id) < targetOf[r.id];
  const room = (wantPremium && rooms.find((r) => fits(r) && roomTypeOf(r.id).tier === 'premium'))
    || rooms.find(fits)
    || rooms.find((r) => r.gender === st.gender && availableSlots(r.id) > 0);
  const app = newApplication(st, room);
  approveApplication(app, room);
});

// vài hợp đồng sắp hết hạn
contracts.filter((_, i) => i % 7 === 6).forEach((c) => { c.endDate = '2026-12-10'; });

// 2 giường trống chuyển bảo trì (không đụng giường có người)
[rooms[1], rooms[12]].forEach((r) => {
  const bed = [...bedsOf(r.id)].reverse().find((b) => b.status === 'available');
  if (bed) { bed.status = 'maintenance'; bed.note = 'Hỏng khung giường, chờ sửa'; }
});

// Đơn chờ duyệt, bị từ chối, đã hủy — sv002 (index 85) KHÔNG có đơn nào để test trang chủ "chưa có chỗ"
const roomFor = (st, typeId) => rooms.find((r) => r.gender === st.gender && r.roomTypeId === typeId && availableSlots(r.id) > 0)
  || rooms.find((r) => r.gender === st.gender && availableSlots(r.id) > 0);
[70, 71, 72].forEach((idx, k) => {
  newApplication(students[idx], roomFor(students[idx], ['rt2', 'rt3', 'rt5'][k]), {
    note: k === 0 ? 'Em muốn ở gần bạn cùng lớp' : '',
    createdAt: `2026-11-0${k + 1}T14:0${k}:00+07:00`,
  });
});
// Hai tình huống xung đột chỗ cho màn Duyệt đơn (SCR-31) — đều là sinh viên nữ, tòa B, đơn nộp sớm nên nằm đầu hàng đợi
const femaleRooms = rooms.filter((r) => r.gender === 'female' && r.status === 'active');
const hasAlternative = (room) => femaleRooms.some((r) => r.id !== room.id && r.roomTypeId === room.roomTypeId && availableSlots(r.id) > 0);
// (1) Phòng nguyện vọng đã đầy từ trước (BR-34: nộp đơn không giữ chỗ) → màn hình cảnh báo ngay khi mở đơn
const fullRoom = femaleRooms.find((r) => availableSlots(r.id) === 0 && hasAlternative(r));
if (fullRoom) {
  newApplication(students[75], fullRoom, { note: 'Em muốn ở cùng phòng với chị khóa trên', createdAt: '2026-10-28T08:15:00+07:00' });
}
// (2) Phòng còn đúng 1 chỗ, có 2 đơn cùng nhắm. Đơn của students[77] mang cờ `demoRaceWith`: lúc bấm duyệt, mock
//     giả lập một cán bộ khác vừa duyệt đơn students[79] trước → giường cuối bị lấy → trả 409 ROOM_FULL.
//     Chọn phòng có loại còn một phòng khác dư chỗ (để duyệt lại được), xếp thêm sinh viên cho tới khi còn 1 chỗ
const raceRoom = femaleRooms.find((r) => availableSlots(r.id) >= 2
  && femaleRooms.some((o) => o.id !== r.id && o.roomTypeId === r.roomTypeId && availableSlots(o.id) >= 2));
if (raceRoom) {
  [81, 83, 87].forEach((idx) => {
    if (availableSlots(raceRoom.id) > 1) approveApplication(newApplication(students[idx], raceRoom), raceRoom);
  });
  const racer = newApplication(students[79], raceRoom, { createdAt: '2026-10-30T16:40:00+07:00' });
  newApplication(students[77], raceRoom, { createdAt: '2026-10-29T10:05:00+07:00', demoRaceWith: racer.id });
}

/**
 * Tranh chỗ ở cổng sinh viên (SCR-62): khi sinh viên nộp đơn vào phòng thuộc tập này mà phòng chỉ còn 1 chỗ,
 * mock giả lập một sinh viên khác vừa được duyệt vào đúng giường cuối → trả 409 ROOM_FULL. Chỉ có trong dữ liệu giả.
 */
export const demoRaceRoomIds = new Set(raceRoom ? [raceRoom.id] : []);
export const simulateRivalApproval = (room) => {
  const reserved = new Set(Object.values(DEMO_STUDENT_INDEX).map((i) => students[i].id));
  const rival = students.find((s) => s.gender === room.gender && !reserved.has(s.id)
    && !applications.some((a) => a.studentId === s.id));
  if (rival) approveApplication(newApplication(rival, room, { createdAt: new Date().toISOString() }), room);
};

newApplication(students[73], roomFor(students[73], 'rt1'), { status: 'rejected', reviewNote: 'Hồ sơ còn thiếu giấy xác nhận sinh viên', reviewedAt: '2026-09-02T09:30:00+07:00' });
newApplication(students[74], roomFor(students[74], 'rt2'), { status: 'cancelled' });

// ---------------------------------------------------------------- danh mục phí
export const feeTypes = [
  { id: 'f1', code: 'rent', name: 'Tiền phòng', unit: 'tháng', defaultAmount: 0, isRecurring: true, isActive: true },
  { id: 'f2', code: 'electricity', name: 'Tiền điện', unit: 'kWh', defaultAmount: 2500, isRecurring: true, isActive: true },
  { id: 'f3', code: 'water', name: 'Tiền nước', unit: 'm3', defaultAmount: 12000, isRecurring: true, isActive: true },
  { id: 'f4', code: 'deposit', name: 'Tiền đặt cọc', unit: 'lần', defaultAmount: 0, isRecurring: false, isActive: true },
  { id: 'f6', code: 'supplies', name: 'Nhu yếu phẩm', unit: 'đơn', defaultAmount: 0, isRecurring: false, isActive: true },
  { id: 'f5', code: 'other', name: 'Phí khác', unit: 'lần', defaultAmount: 0, isRecurring: false, isActive: true },
];

// ---------------------------------------------------------------- chỉ số điện nước
const occupiedRoomIds = [...new Set(residencies.map((r) => beds.find((b) => b.id === r.bedId).roomId))];

export const utilityReadings = occupiedRoomIds.map((roomId, i) => {
  const room = rooms.find((r) => r.id === roomId);
  const eStart = 1200 + i * 30;
  const wStart = 80 + i * 5;
  return {
    id: `u${pad(i + 1)}`,
    roomId, roomNumber: room.roomNumber, buildingName: room.buildingName,
    billingPeriod: '2026-10',
    electricityStart: eStart, electricityEnd: eStart + 300 + (i % 5) * 20,
    waterStart: wStart, waterEnd: wStart + 40 + (i % 4) * 3,
    electricityUnitPrice: 2500, waterUnitPrice: 12000,
    isInvoiced: i < occupiedRoomIds.length - 2,
  };
});

// ---------------------------------------------------------------- hóa đơn cọc + tháng
export const invoices = [];
let invSeq = 0;
const nextInvoiceCode = (period) => { invSeq += 1; return { id: `i${pad(invSeq)}`, invoiceCode: `INV-${period}-${pad(invSeq, 5)}` }; };

contracts.forEach((c, i) => {
  invoices.push({
    ...nextInvoiceCode('202609'),
    studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
    contractId: c.id, bedCode: c.bedCode,
    type: 'deposit', billingPeriod: null,
    lineItems: [{ feeTypeId: 'f4', description: 'Tiền đặt cọc', quantity: 1, unitPrice: c.depositAmount, amount: c.depositAmount }],
    totalAmount: c.depositAmount, paidAmount: c.depositAmount,
    issueDate: '2026-08-30', dueDate: '2026-09-08', status: 'paid',
  });

  const rent = c.monthlyPrice;
  const elec = 150000 + (i % 4) * 12500;
  const water = 96000 + (i % 3) * 12000;
  const total = rent + elec + water;
  const cycle = i % 4; // 0 chưa trả · 1 một phần · 2 đã trả · 3 quá hạn
  const paid = cycle === 1 ? Math.floor(total / 2) : cycle === 2 ? total : 0;
  const status = ['unpaid', 'partial', 'paid', 'overdue'][cycle];

  invoices.push({
    ...nextInvoiceCode('202610'),
    studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
    contractId: c.id, bedCode: c.bedCode,
    type: 'monthly', billingPeriod: '2026-10',
    lineItems: [
      { feeTypeId: 'f1', description: 'Tiền phòng tháng 10/2026', quantity: 1, unitPrice: rent, amount: rent },
      { feeTypeId: 'f2', description: `Tiền điện tháng 10/2026 (${elec / 2500} kWh)`, quantity: elec / 2500, unitPrice: 2500, amount: elec },
      { feeTypeId: 'f3', description: `Tiền nước tháng 10/2026 (${water / 12000} m³)`, quantity: water / 12000, unitPrice: 12000, amount: water },
    ],
    totalAmount: total, paidAmount: paid,
    issueDate: '2026-11-01', dueDate: cycle === 3 ? '2026-11-05' : '2026-11-10', status,
  });
});

// ---------------------------------------------------------------- nhu yếu phẩm
export const supplyItems = [
  { id: 'si1', name: 'Đệm mút 90x190cm', category: 'bedding', unit: 'cái', price: 350000, includedInRoomTypes: ['rt4', 'rt5', 'rt6'], isActive: true },
  { id: 'si2', name: 'Vỏ đệm 90x190cm', category: 'bedding', unit: 'cái', price: 120000, includedInRoomTypes: [], isActive: true },
  { id: 'si3', name: 'Gối bông', category: 'bedding', unit: 'cái', price: 80000, includedInRoomTypes: [], isActive: true },
  { id: 'si4', name: 'Vỏ gối', category: 'bedding', unit: 'cái', price: 40000, includedInRoomTypes: [], isActive: true },
  { id: 'si5', name: 'Chăn mỏng', category: 'bedding', unit: 'cái', price: 180000, includedInRoomTypes: [], isActive: true },
  { id: 'si6', name: 'Màn chống muỗi', category: 'personal', unit: 'cái', price: 90000, includedInRoomTypes: [], isActive: true },
  { id: 'si7', name: 'Móc treo quần áo (bộ 10)', category: 'personal', unit: 'bộ', price: 25000, includedInRoomTypes: [], isActive: true },
  { id: 'si8', name: 'Ổ cắm điện', category: 'electrical', unit: 'cái', price: 60000, includedInRoomTypes: [], isActive: false },
].map((it) => ({ ...it, imageUrl: null, description: '' }));

export const supplyOrders = [];
let orderSeq = 0;

/** Giống supplyOrderService.create: giá lấy từ danh mục, sinh 1 hóa đơn supplies */
export const createSupplyOrder = (student, contract, lines, { status = 'pending_payment', date = '2026-11-08' } = {}) => {
  orderSeq += 1;
  const items = lines.map(({ supplyItemId, quantity }) => {
    const it = supplyItems.find((x) => x.id === supplyItemId);
    return { supplyItemId, name: it.name, unitPrice: it.price, quantity, amount: it.price * quantity };
  });
  const totalAmount = items.reduce((s, x) => s + x.amount, 0);
  const paid = ['ready', 'delivered'].includes(status);
  const cancelled = status === 'cancelled';
  const due = new Date(date); due.setDate(due.getDate() + 3);

  const inv = {
    ...nextInvoiceCode('202611'),
    studentId: student.id, studentCode: student.studentCode, studentName: student.fullName,
    contractId: contract.id, bedCode: contract.bedCode,
    type: 'supplies', billingPeriod: null,
    lineItems: items.map((x) => ({ feeTypeId: 'f6', description: x.name, quantity: x.quantity, unitPrice: x.unitPrice, amount: x.amount })),
    totalAmount, paidAmount: paid ? totalAmount : 0,
    issueDate: date, dueDate: due.toISOString().slice(0, 10),
    status: cancelled ? 'cancelled' : paid ? 'paid' : 'unpaid',
  };
  invoices.push(inv);

  const order = {
    id: `so${pad(orderSeq)}`,
    orderCode: `DH-2026-${pad(orderSeq, 5)}`,
    studentId: student.id, studentCode: student.studentCode, studentName: student.fullName,
    contractId: contract.id, roomNumber: contract.roomNumber, buildingName: contract.buildingName,
    items, totalAmount, invoiceId: inv.id, status,
    createdAt: `${date}T09:30:00+07:00`,
    deliveredAt: status === 'delivered' ? `${date}T16:00:00+07:00` : null,
    cancelledAt: cancelled ? `${date}T18:00:00+07:00` : null,
    cancelReason: cancelled ? 'Sinh viên đổi ý' : null,
  };
  supplyOrders.push(order);
  return order;
};

const contractOf = (studentId) => contracts.find((c) => c.studentId === studentId && c.status === 'active');
const sv001 = students[DEMO_STUDENT_INDEX.sv001];
createSupplyOrder(sv001, contractOf(sv001.id), [{ supplyItemId: 'si6', quantity: 1 }, { supplyItemId: 'si3', quantity: 1 }], { status: 'delivered', date: '2026-09-02' });
createSupplyOrder(sv001, contractOf(sv001.id), [{ supplyItemId: 'si5', quantity: 1 }], { status: 'ready', date: '2026-11-05' });
createSupplyOrder(sv001, contractOf(sv001.id), [{ supplyItemId: 'si2', quantity: 1 }, { supplyItemId: 'si4', quantity: 1 }], { status: 'pending_payment', date: '2026-11-09' });
[4, 6, 8, 10].forEach((idx, k) => {
  const st = students[idx];
  createSupplyOrder(st, contractOf(st.id), [{ supplyItemId: ['si1', 'si2', 'si7', 'si5'][k], quantity: 1 }],
    { status: ['ready', 'pending_payment', 'cancelled', 'delivered'][k], date: `2026-11-0${k + 3}` });
});

// ---------------------------------------------------------------- công nợ
export const debtOf = (studentId) =>
  invoices
    .filter((inv) => inv.studentId === studentId && ['unpaid', 'partial', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

// ---------------------------------------------------------------- thanh toán
export const payments = [];
let paySeq = 0;

invoices.filter((inv) => inv.paidAmount > 0).forEach((inv, i) => {
  paySeq += 1;
  const online = i % 3 !== 0;
  payments.push({
    id: `p${pad(paySeq)}`,
    transactionRef: `PAY2026110${pad(paySeq, 4)}`,
    invoiceId: inv.id, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
    studentId: inv.studentId, studentName: inv.studentName,
    amount: inv.paidAmount, type: 'payment',
    method: online ? 'vnpay' : 'cash',
    gatewayTransactionId: online ? `VNP${pad(80000 + paySeq, 6)}` : null,
    status: 'success',
    paidAt: `2026-11-0${(i % 8) + 1}T10:${pad((i * 7) % 60, 2)}:00+07:00`,
    note: online ? null : 'Thu tiền mặt tại văn phòng',
  });
});

// ---------------------------------------------------------------- yêu cầu gia hạn / trả phòng
export const requests = contracts.slice(0, 6).map((c, i) => {
  const type = i % 2 === 0 ? 'renewal' : 'checkout';
  const status = i < 3 ? 'pending' : i === 3 ? 'approved' : i === 4 ? 'rejected' : 'pending';
  return {
    id: `rq${pad(i + 1)}`,
    studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
    contractId: c.id, contractCode: c.contractCode, bedCode: c.bedCode,
    type,
    reason: type === 'renewal' ? 'Em tiếp tục học kỳ sau' : 'Em chuyển ra ngoài ở cùng gia đình',
    requestedEndDate: type === 'renewal' ? '2027-12-31' : '2026-12-15',
    status,
    reviewNote: status === 'rejected' ? 'Hồ sơ chưa đủ điều kiện gia hạn' : null,
    createdAt: `2026-11-0${i + 1}T08:00:00+07:00`,
  };
});

// ---------------------------------------------------------------- thống kê dashboard
export const occupancyStats = () => {
  const count = (list, status) => list.filter((b) => b.status === status).length;
  const summarize = (list) => {
    const total = list.length;
    const occupied = count(list, 'occupied');
    const maintenance = count(list, 'maintenance');
    return {
      total, occupied, available: count(list, 'available'), maintenance,
      rate: Number((occupied / (total - maintenance)).toFixed(3)),
    };
  };
  return {
    overall: summarize(beds),
    byBuilding: buildings.map((b) => {
      const ids = rooms.filter((r) => r.buildingId === b.id).map((r) => r.id);
      return { buildingName: b.name, ...summarize(beds.filter((x) => ids.includes(x.roomId))) };
    }),
  };
};
