/**
 * Bộ dữ liệu giả dùng chung cho toàn bộ mock API — mô hình ĐĂNG KÝ THEO PHÒNG (DATA-SCHEMA.md v1.2).
 *
 *   6 loại phòng → 2 tòa → 20 phòng → giường TỰ SINH theo sức chứa
 *   → 90 sinh viên (72 đang ở) → đơn đăng ký → hợp đồng → hóa đơn → thanh toán
 *   → 8 sản phẩm nhu yếu phẩm → đơn hàng
 *
 * Tài khoản thử (xem mockApi.js): sv001 đang ở phòng Tiêu chuẩn, có nợ · sv002 chưa có chỗ ·
 * sv003 dùng test IDOR · sv004 đang ở phòng Chất lượng cao, hợp đồng còn 20 ngày ·
 * sv005 có đơn gần nhất bị từ chối · sv006 có đơn chờ duyệt (phòng nguyện vọng đã đầy).
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
export const DEMO_STUDENT_INDEX = { sv001: 0, sv002: 85, sv003: 2, sv004: 3, sv005: 73, sv006: 75 };

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

// 20 phòng chia cho 2 tòa đầu. Tòa C thêm SAU vòng tạo phòng: đang cải tạo, chưa có phòng, ngừng hoạt động (SCR-21)
buildings.slice(0, 2).forEach((b, bi) => {
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

buildings.push({
  id: 'b3', code: 'C', name: 'Tòa C', address: 'Khu KTX số 2', description: 'Đang cải tạo, dự kiến mở lại năm học 2027-2028', isActive: false,
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

/** "YYYY-MM-DD" của hôm nay + N ngày (theo giờ máy) — để dữ liệu "sắp hết hạn" luôn đúng dù chạy ngày nào */
export const todayPlus = (days) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
};

// Hợp đồng sắp hết hạn (BR-29): 10 hợp đồng còn 3 → 30 ngày tính từ lúc chạy
contracts.filter((_, i) => i % 7 === 6).forEach((c, k) => { c.endDate = todayPlus(3 + ((k * 3) % 28)); });
// sv004: hợp đồng còn 20 ngày — để trang chủ sinh viên hiện thẻ "sắp hết hạn"
{
  const c = contracts.find((x) => x.studentId === students[DEMO_STUDENT_INDEX.sv004].id);
  if (c) c.endDate = todayPlus(20);
}

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
  { id: 'f1', code: 'rent', name: 'Tiền phòng', unit: 'tháng', defaultAmount: 0, isRecurring: true, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  { id: 'f2', code: 'electricity', name: 'Tiền điện', unit: 'kWh', defaultAmount: 2500, isRecurring: true, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  { id: 'f3', code: 'water', name: 'Tiền nước', unit: 'm3', defaultAmount: 12000, isRecurring: true, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  { id: 'f4', code: 'deposit', name: 'Tiền đặt cọc', unit: 'lần', defaultAmount: 0, isRecurring: false, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  { id: 'f6', code: 'supplies', name: 'Nhu yếu phẩm', unit: 'đơn', defaultAmount: 0, isRecurring: false, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  { id: 'f5', code: 'other', name: 'Phí khác', unit: 'lần', defaultAmount: 0, isRecurring: false, isActive: true, updatedAt: '2026-08-01T08:00:00+07:00' },
  // loại phí tự thêm — minh họa FR-45 (1 đang dùng, 1 đã ngừng)
  { id: 'f7', code: 'lost_key', name: 'Làm mất chìa khóa', unit: 'chiếc', defaultAmount: 50000, isRecurring: false, isActive: true, updatedAt: '2026-08-20T09:30:00+07:00' },
  { id: 'f8', code: 'internet', name: 'Internet phòng', unit: 'tháng', defaultAmount: 30000, isRecurring: true, isActive: false, updatedAt: '2026-06-15T14:00:00+07:00' },
];

// ---------------------------------------------------------------- chỉ số điện nước
/** Kỳ "YYYY-MM" lệch `months` tháng so với tháng hiện tại */
export const periodPlus = (months) => {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}`;
};

/**
 * Chỉ số điện nước (FR-59): kỳ trước đủ 20 phòng, đã lập hóa đơn · kỳ này Tòa A nhập xong,
 * Tòa B mới nhập 5 phòng đầu (phòng trống không cần nhập). Chỉ số đầu kỳ này = cuối kỳ trước (BR-51).
 */
export const utilityReadings = [];
let readingSeq = 0;
const pushReading = (room, billingPeriod, e, w, extra) => {
  readingSeq += 1;
  const reading = {
    id: `u${pad(readingSeq)}`, roomId: room.id, billingPeriod,
    electricityStart: e[0], electricityEnd: e[1], waterStart: w[0], waterEnd: w[1],
    electricityUnitPrice: 2500, waterUnitPrice: 12000,
    isInvoiced: false, recordedByName: 'Lê Thị Nhân Viên', recordedAt: null, ...extra,
  };
  utilityReadings.push(reading);
  return reading;
};
rooms.forEach((room, idx) => {
  const occ = beds.filter((b) => b.roomId === room.id && b.status === 'occupied').length;
  const eStart = 1000 + idx * 85;
  const wStart = 60 + idx * 7;
  const ePrev = eStart + (occ ? occ * 20 + (idx % 4) * 5 : 0);
  const wPrev = wStart + (occ ? occ * 3 + (idx % 3) : 0);
  pushReading(room, periodPlus(-1), [eStart, ePrev], [wStart, wPrev], { isInvoiced: true, recordedAt: `${periodPlus(0)}-01T09:00:00+07:00` });
  const enteredThisPeriod = room.buildingId === 'b1' || Number(room.id.slice(1)) <= 105;
  if (occ && enteredThisPeriod) {
    pushReading(room, periodPlus(0), [ePrev, ePrev + occ * 22 + (idx % 5) * 4], [wPrev, wPrev + occ * 3 + (idx % 2)], { recordedAt: `${todayPlus(-1)}T16:30:00+07:00` });
  }
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
// Ngày gửi/ngày trả tính theo ngày máy chạy để "còn N ngày", "gửi hôm qua" luôn hợp lý.
export const requests = [];
let reqSeq = 0;
export const newRequest = (c, type, extra = {}) => {
  reqSeq += 1;
  const r = {
    id: `rq${pad(reqSeq)}`,
    requestCode: `YC-2026-${pad(reqSeq, 5)}`,
    studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
    contractId: c.id, contractCode: c.contractCode, bedCode: c.bedCode,
    type, reason: '', requestedEndDate: null,
    status: 'pending', reviewNote: null, reviewedAt: null,
    renewal: null, settlement: null,
    createdAt: `${todayPlus(-1)}T08:30:00+07:00`,
    ...extra,
  };
  requests.push(r);
  return r;
};

// Chờ xử lý — mỗi yêu cầu là một tình huống nghiệp vụ
// sv001: gia hạn, còn nợ
newRequest(contracts[0], 'renewal', {
  reason: 'Em tiếp tục học năm sau, muốn giữ chỗ hiện tại', requestedEndDate: '2027-12-31', createdAt: `${todayPlus(-3)}T09:10:00+07:00`,
});
// trả phòng, nợ nhỏ hơn cọc → hoàn tiền
newRequest(contracts[1], 'checkout', {
  reason: 'Em chuyển ra ở cùng gia đình', requestedEndDate: todayPlus(10), createdAt: `${todayPlus(-2)}T14:32:00+07:00`,
});
// gia hạn, không nợ
newRequest(contracts[2], 'renewal', {
  reason: 'Gia hạn thêm một học kỳ', requestedEndDate: '2027-12-31', createdAt: `${todayPlus(-2)}T10:05:00+07:00`,
});
// trả phòng, nợ vượt cọc + có đơn nhu yếu phẩm đã trả tiền nhưng chưa nhận
newRequest(contracts[4], 'checkout', {
  reason: 'Em đi thực tập ở tỉnh khác', requestedEndDate: todayPlus(7), createdAt: `${todayPlus(-1)}T16:20:00+07:00`,
});
// trả phòng khi hợp đồng sắp hết hạn, có đơn nhu yếu phẩm CHƯA thanh toán (sẽ tự hủy, không trừ cọc — BR-97)
newRequest(contracts[6], 'checkout', {
  reason: 'Hết hợp đồng, em không ở tiếp', requestedEndDate: todayPlus(2), createdAt: `${todayPlus(0)}T07:45:00+07:00`,
});

// sv001 từng gửi rồi tự hủy một yêu cầu trả phòng — để màn "Yêu cầu của tôi" có lịch sử
newRequest(contracts[0], 'checkout', {
  reason: 'Em định chuyển ra ngoài nhưng đổi ý', requestedEndDate: todayPlus(40), status: 'cancelled',
  createdAt: `${todayPlus(-12)}T20:15:00+07:00`,
});

// Đã xử lý
{
  const c = contracts[5];
  newRequest(c, 'renewal', {
    reason: 'Em học thêm năm cuối', requestedEndDate: '2027-12-31', status: 'approved',
    createdAt: `${todayPlus(-22)}T09:00:00+07:00`, reviewedAt: `${todayPlus(-20)}T10:00:00+07:00`,
    renewal: { previousEndDate: c.endDate, newEndDate: '2027-12-31', extraMonths: 6 },
  });
  c.endDate = '2027-12-31';
}
newRequest(contracts[8], 'renewal', {
  reason: 'Em muốn ở thêm 2 năm', requestedEndDate: '2028-06-30', status: 'rejected',
  reviewNote: 'Chỉ gia hạn tối đa đến hết năm học tiếp theo, vui lòng gửi lại',
  createdAt: `${todayPlus(-15)}T11:00:00+07:00`, reviewedAt: `${todayPlus(-14)}T15:30:00+07:00`,
});

// ---------------------------------------------------------------- hợp đồng năm trước (đã hết hạn / đã chấm dứt)
// Sinh viên 80, 82, 84 (nam) từng ở tòa A năm học 2025-2026 — hiện không còn chỗ ở. Giường của họ đã được trả lại.
let pastSeq = 0;
const seedPastContract = (st, room, { startDate, endDate, status, terminatedAt = null, terminationReason = null }) => {
  const rt = roomTypes.find((t) => t.id === room.roomTypeId);
  const bed = bedsOf(room.id)[pastSeq % room.capacity];
  pastSeq += 1;
  const app = newApplication(st, room, {
    applicationCode: `DK-${startDate.slice(0, 4)}-${pad(pastSeq, 5)}`,
    startDate, endDate, status: 'approved', assignedRoomId: room.id, assignedBedId: bed.id,
    createdAt: `${startDate.slice(0, 4)}-08-10T09:00:00+07:00`, reviewedAt: `${startDate.slice(0, 4)}-08-15T10:00:00+07:00`,
  });
  const closedAt = terminatedAt || endDate;
  const residency = {
    id: `res-old${pad(pastSeq)}`, studentId: st.id, bedId: bed.id, applicationId: app.id,
    startDate, endDate: closedAt, status: 'closed',
  };
  residencies.push(residency);
  const contract = {
    id: `c-old${pad(pastSeq)}`,
    contractCode: `HD-2025-${pad(pastSeq, 5)}`,
    applicationId: app.id, residencyId: residency.id,
    studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
    bedId: bed.id, bedCode: bed.bedCode,
    roomId: room.id, roomNumber: room.roomNumber, buildingName: room.buildingName,
    roomTypeId: rt.id, roomTypeName: rt.name,
    startDate, endDate,
    monthlyPrice: rt.pricePerMonth - 20000, // giá năm trước — chứng minh giá đã chốt không đổi theo loại phòng (BR-27)
    depositAmount: rt.depositAmount, depositRefunded: rt.depositAmount,
    status, terminatedAt, terminationReason,
    terms: 'Sinh viên tuân thủ nội quy ký túc xá.',
  };
  contracts.push(contract);
  Object.assign(app, { contractId: contract.id });
  invoices.push({
    ...nextInvoiceCode('202508'),
    studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
    contractId: contract.id, bedCode: bed.bedCode,
    type: 'deposit', billingPeriod: null,
    lineItems: [{ feeTypeId: 'f4', description: 'Tiền đặt cọc', quantity: 1, unitPrice: rt.depositAmount, amount: rt.depositAmount }],
    totalAmount: rt.depositAmount, paidAmount: rt.depositAmount,
    issueDate: `${startDate.slice(0, 4)}-08-15`, dueDate: `${startDate.slice(0, 4)}-08-22`, status: 'paid',
  });
};
seedPastContract(students[80], rooms[0], { startDate: '2025-09-01', endDate: '2026-06-30', status: 'expired' });
seedPastContract(students[82], rooms[2], { startDate: '2025-09-01', endDate: '2026-06-30', status: 'expired' });
seedPastContract(students[84], rooms[3], {
  startDate: '2025-09-01', endDate: '2026-06-30', status: 'terminated',
  terminatedAt: '2026-01-15', terminationReason: 'Sinh viên chuyển trường, đã bàn giao phòng và thu hồi chìa khóa',
});
// Yêu cầu trả phòng đã duyệt của hợp đồng trên — có sẵn bảng quyết toán để xem ở tab "Đã duyệt"
newRequest(contracts.find((c) => c.contractCode === 'HD-2025-00003'), 'checkout', {
  requestCode: 'YC-2026-00000', reason: 'Em chuyển trường', requestedEndDate: '2026-01-15', status: 'approved',
  createdAt: '2026-01-08T09:00:00+07:00', reviewedAt: '2026-01-15T16:00:00+07:00',
  settlement: {
    checkoutDate: '2026-01-15', outstandingDebt: 0, proratedRent: 0, depositAmount: 500000,
    refundAmount: 500000, studentStillOwes: 0, refundMethod: 'cash', settlementInvoiceId: null, cancelledSupplyOrders: 0,
  },
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
    // Chỉ tòa đang hoạt động — giống backend (dashboard, sơ đồ lấp đầy)
    byBuilding: buildings.filter((b) => b.isActive).map((b) => {
      const ids = rooms.filter((r) => r.buildingId === b.id).map((r) => r.id);
      return { buildingName: b.name, ...summarize(beds.filter((x) => ids.includes(x.roomId))) };
    }),
  };
};
