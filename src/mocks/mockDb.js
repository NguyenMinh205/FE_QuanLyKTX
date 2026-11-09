/**
 * Bộ dữ liệu giả dùng chung cho toàn bộ mock API — mô hình ĐĂNG KÝ THEO PHÒNG (DATA-SCHEMA.md v1.2).
 *
 *   6 loại phòng → 2 tòa → 20 phòng → giường TỰ SINH theo sức chứa
 *   → 90 sinh viên (72 đang ở) → đơn đăng ký → hợp đồng → hóa đơn → thanh toán
 *
 * Tài khoản thử (xem mockApi.js): sv001 đang ở phòng Tiêu chuẩn, có nợ · sv002 chưa có chỗ ·
 * sv003 dùng test IDOR · sv004 đang ở phòng Chất lượng cao, hợp đồng còn 20 ngày ·
 * sv005 có đơn gần nhất bị từ chối · sv006 có đơn chờ duyệt (phòng nguyện vọng đã đầy) ·
 * sv008 vừa được cấp tài khoản, mật khẩu là MSSV, phải đổi ở lần đăng nhập đầu.
 *
 * ⚠️ Chỉ dùng khi chế độ dữ liệu giả bật (src/lib/env.js).
 */

const pad = (n, len = 3) => String(n).padStart(len, '0');
const pick = (arr, i) => arr[i % arr.length];

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN_NAM = ['Văn An', 'Minh Quân', 'Hoàng Long', 'Đức Anh', 'Quốc Bảo', 'Tiến Đạt'];
const TEN_NU = ['Thị Bích', 'Ngọc Ánh', 'Thu Hà', 'Phương Linh', 'Khánh Vy', 'Minh Châu'];
/** [Khoa/Viện, tiền tố lớp] — dữ liệu minh họa */
const KHOA = [
  ['Công nghệ thông tin', 'KTPM'], ['Kinh tế', 'QTKD'], ['Cơ khí', 'CKCT'], ['Điện', 'KTD'],
  ['Điện tử', 'KTDT'], ['Du lịch', 'QTDL'], ['Ngoại ngữ', 'NNA'],
];

/** Chỉ số sinh viên dùng cho tài khoản thử */
// sv007: sinh viên từng ở năm trước, hiện không còn chỗ — dùng để xem lịch sử lưu trú (FR-39)
export const DEMO_STUDENT_INDEX = { sv001: 0, sv002: 85, sv003: 2, sv004: 3, sv005: 73, sv006: 75, sv007: 80, sv008: 4 };

// ---------------------------------------------------------------- loại phòng
/**
 * Tiện nghi cơ bản: MỌI phòng đều có, không phân biệt hạng.
 * Phòng chất lượng cao được cấp thêm đệm — đệm là nhu yếu phẩm nên nằm ở
 * `includedInRoomTypes` của SupplyItem, không phải `amenities` (DATA-SCHEMA 3.13).
 */
const BASIC = ['Giường tầng', 'Bàn học chung', 'Tủ cá nhân', 'WC riêng', 'Bình nóng lạnh', 'Quạt trần'];
/** Phòng 3 người hạng cao dùng giường đơn thay giường tầng */
const BASIC_GIUONG_DON = BASIC.map((a) => (a === 'Giường tầng' ? 'Giường đơn' : a));

export const roomTypes = [
  { id: 'rt1', tier: 'standard', capacity: 8, pricePerMonth: 250000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt2', tier: 'standard', capacity: 6, pricePerMonth: 320000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt3', tier: 'standard', capacity: 4, pricePerMonth: 450000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt7', tier: 'standard', capacity: 3, pricePerMonth: 600000, depositAmount: 500000, amenities: BASIC },
  { id: 'rt8', tier: 'premium', capacity: 8, pricePerMonth: 550000, depositAmount: 1000000, amenities: BASIC },
  { id: 'rt4', tier: 'premium', capacity: 6, pricePerMonth: 750000, depositAmount: 1000000, amenities: BASIC },
  { id: 'rt5', tier: 'premium', capacity: 4, pricePerMonth: 950000, depositAmount: 1000000, amenities: [...BASIC, 'Bàn học riêng'] },
  { id: 'rt6', tier: 'premium', capacity: 3, pricePerMonth: 1200000, depositAmount: 1000000, amenities: [...BASIC_GIUONG_DON, 'Bàn học riêng', 'Tủ lạnh mini'] },
].map((t) => ({
  ...t,
  name: `${t.tier === 'standard' ? 'Tiêu chuẩn' : 'Chất lượng cao'} · ${t.capacity} người`,
  description: '',
  isActive: true,
}));

// ---------------------------------------------------------------- tòa nhà
export const buildings = [
  { id: 'b1', code: 'K1', name: 'Tòa K1', address: 'KTX Cơ sở 1', isActive: true },
  { id: 'b2', code: 'K2', name: 'Tòa K2', address: 'KTX Cơ sở 1', isActive: true },
];

// ---------------------------------------------------------------- phòng (10 mỗi tòa) + giường tự sinh
// Mỗi tòa có đủ 8 loại phòng. Hai chỗ lặp (rt2, rt5) là cố ý:
// rt2 cho kịch bản "phòng nguyện vọng đã đầy", rt5 cho kịch bản "tranh chỗ" ở màn Duyệt đơn.
const ROOM_TYPE_PATTERN = ['rt2', 'rt2', 'rt3', 'rt8', 'rt5', 'rt1', 'rt4', 'rt7', 'rt6', 'rt5'];

export const rooms = [];
export const beds = [];

/** Giống room.service.js ở backend: tạo phòng là sinh luôn đủ giường */
export const generateBeds = (room) => {
  for (let n = 1; n <= room.capacity; n++) {
    beds.push({
      id: `${room.id}-bed${n}`,
      roomId: room.id,
      bedNumber: n,
      bedCode: `${room.buildingCode}-${room.roomNumber}-${pad(n, 2)}`,
      status: 'available',
      note: null,
    });
  }
};

// 20 phòng chia cho 2 tòa đầu. Tòa K3, K4 thêm SAU vòng tạo phòng: đang cải tạo, chưa có phòng, ngừng hoạt động (SCR-21)
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
      gender: bi === 0 ? 'male' : 'female', // Tòa K1 nam, tòa K2 nữ
      capacity: rt.capacity,
      status: 'active',
    };
    rooms.push(room);
    generateBeds(room);
  }
});

buildings.push({
  id: 'b3', code: 'K3', name: 'Tòa K3', address: 'KTX Cơ sở 2', description: 'Đang cải tạo, dự kiến mở lại năm học 2027-2028', isActive: false,
}, {
  id: 'b4', code: 'K4', name: 'Tòa K4', address: 'KTX Cơ sở 3', description: 'Chưa đưa vào sử dụng', isActive: false,
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
    studentCode: `20216${pad(i + 1, 5)}`,
    fullName: `${pick(HO, i)} ${isMale ? pick(TEN_NAM, i) : pick(TEN_NU, i)}`,
    gender: isMale ? 'male' : 'female',
    dob: `200${5 - (i % 3)}-${pad((i % 12) + 1, 2)}-${pad((i % 28) + 1, 2)}`,
    phone: `09${String(12000000 + i * 137)}`.slice(0, 10),
    email: `sv20216${pad(i + 1, 5)}@sv.edu.vn`,
    className: `${pick(KHOA, i)[1]}0${(i % 3) + 1}-K16`,
    faculty: pick(KHOA, i)[0],
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
 * Chỉ số điện nước (FR-59): kỳ trước đủ 20 phòng, đã lập hóa đơn · kỳ này Tòa K1 nhập xong,
 * Tòa K2 mới nhập 5 phòng đầu (phòng trống không cần nhập). Chỉ số đầu kỳ này = cuối kỳ trước (BR-51).
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

/** Số người đang ở cùng phòng — tiền điện nước chia đều cho ngần này người */
const roommateCount = (c) => contracts.filter((x) => x.roomId === c.roomId && x.status === 'active').length || 1;

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
      { feeTypeId: 'f2', description: `Tiền điện tháng 10/2026 (${elec / 2500} kWh, chia đều ${roommateCount(c)} người)`, quantity: elec / 2500, unitPrice: 2500, amount: elec },
      { feeTypeId: 'f3', description: `Tiền nước tháng 10/2026 (${water / 12000} m³, chia đều ${roommateCount(c)} người)`, quantity: water / 12000, unitPrice: 12000, amount: water },
    ],
    totalAmount: total, paidAmount: paid,
    issueDate: '2026-11-01', dueDate: cycle === 3 ? '2026-11-05' : '2026-11-10', status,
  });
});

// Hóa đơn tháng đầu sinh lúc duyệt đơn (BR-25) — mới có tiền phòng, đã trả. Lập hàng loạt kỳ này sẽ
// BỔ SUNG điện nước vào 3 hóa đơn này thay vì bỏ qua sinh viên (BR-48)
const firstMonthPeriod = periodPlus(0);
contracts
  .filter((c, i) => i >= 20 && c.status === 'active' && rooms.find((r) => r.id === c.roomId)?.buildingId === 'b1')
  .slice(0, 3)
  .forEach((c) => {
    const [y, m] = firstMonthPeriod.split('-');
    invoices.push({
      ...nextInvoiceCode(`${y}${m}`),
      studentId: c.studentId, studentCode: c.studentCode, studentName: c.studentName,
      contractId: c.id, bedCode: c.bedCode,
      type: 'monthly', billingPeriod: firstMonthPeriod,
      lineItems: [{ feeTypeId: 'f1', description: `Tiền phòng tháng ${Number(m)}/${y}`, quantity: 1, unitPrice: c.monthlyPrice, amount: c.monthlyPrice }],
      totalAmount: c.monthlyPrice, paidAmount: c.monthlyPrice,
      issueDate: `${firstMonthPeriod}-01`, dueDate: `${firstMonthPeriod}-08`, status: 'paid',
    });
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
    recordedByName: online ? null : 'Lê Thị Nhân Viên', bankReference: null,
  });
});

// Giao dịch online chưa xong: 1 đang xử lý đối soát được, 1 đang xử lý quá 15 phút (BR-64), 1 thất bại
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
invoices.filter((inv) => ['unpaid', 'overdue'].includes(inv.status)).slice(0, 3).forEach((inv, i) => {
  paySeq += 1;
  payments.push({
    id: `p${pad(paySeq)}`,
    transactionRef: `PAY2026110${pad(paySeq, 4)}`,
    invoiceId: inv.id, invoiceCode: inv.invoiceCode, invoiceType: inv.type,
    studentId: inv.studentId, studentName: inv.studentName,
    amount: inv.totalAmount - inv.paidAmount, type: 'payment',
    method: i === 2 ? 'zalopay' : 'vnpay',
    gatewayTransactionId: i === 0 ? `VNP${pad(90000 + paySeq, 6)}` : null,
    bankReference: null,
    status: i === 2 ? 'failed' : 'pending',
    paidAt: null, createdAt: minutesAgo(i === 1 ? 40 : 6),
    note: i === 2 ? 'Sinh viên hủy ở cổng thanh toán' : null,
    recordedByName: null,
    // chỉ có trong dữ liệu giả: kết quả khi bấm "Đối soát lại"
    demoReconcile: i === 0 ? 'success' : 'expired',
  });
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
