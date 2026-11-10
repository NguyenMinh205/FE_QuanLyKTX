/**
 * Bộ dữ liệu giả dùng chung cho toàn bộ mock API — mô hình ĐĂNG KÝ THEO PHÒNG (DATA-SCHEMA.md v1.2).
 *
 *   4 tòa (2 đang dùng) → 20 phòng 4/6/8 chỗ, giá và cọc nằm trên phòng → giường TỰ SINH theo sức chứa
 *   → 90 sinh viên (72 đang ở) → đơn đăng ký → hợp đồng → hóa đơn → thanh toán
 *
 * Tài khoản thử (xem mockApi.js): sv001 đang ở phòng Tiêu chuẩn, có nợ · sv002 chưa có chỗ ·
 * sv003 dùng test IDOR · sv004 hợp đồng còn 20 ngày · sv007 đã trả phòng, chờ hoàn cọc ·
 * sv009 hợp đồng đã hết hạn nhưng chưa thanh lý, còn nợ ·
 * sv005 có đơn gần nhất bị từ chối · sv006 có đơn chờ duyệt (giường đã chọn vừa có người nhận) ·
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
export const DEMO_STUDENT_INDEX = { sv001: 0, sv002: 85, sv003: 2, sv004: 3, sv005: 73, sv006: 75, sv007: 80, sv008: 4, sv009: 9 };

// ---------------------------------------------------------------- giá mẫu theo sức chứa
const PRICE_BY_CAPACITY = { 8: 250000, 6: 320000, 4: 450000 };
const DEPOSIT_AMOUNT = 500000;

// ---------------------------------------------------------------- tòa nhà
export const buildings = [
  { id: 'b1', code: 'K1', name: 'Tòa K1', description: 'KTX Cơ sở 1', isActive: true },
  { id: 'b2', code: 'K2', name: 'Tòa K2', description: 'KTX Cơ sở 1', isActive: true },
];

// ---------------------------------------------------------------- phòng (10 mỗi tòa) + giường tự sinh
// Hai chỗ lặp là cố ý: phòng 6 chỗ cho kịch bản "giường đã có người", phòng 4 chỗ cho kịch bản "tranh chỗ" ở màn Duyệt đơn.
const CAPACITY_PATTERN = [6, 6, 4, 8, 4, 8, 6, 4, 6, 4];

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
    const capacity = CAPACITY_PATTERN[i - 1];
    const room = {
      id: `r${bi}${pad(i, 2)}`,
      buildingId: b.id,
      buildingCode: b.code,
      buildingName: b.name,
      roomNumber: `${floor}${pad(i, 2)}`,
      floor,
      gender: bi === 0 ? 'male' : 'female', // Tòa K1 nam, tòa K2 nữ
      capacity,
      pricePerMonth: PRICE_BY_CAPACITY[capacity],
      depositAmount: DEPOSIT_AMOUNT,
      status: 'active',
    };
    rooms.push(room);
    generateBeds(room);
  }
});

buildings.push({
  id: 'b3', code: 'K3', name: 'Tòa K3', description: 'KTX Cơ sở 2. Đang cải tạo, dự kiến mở lại năm học 2027-2028', isActive: false,
}, {
  id: 'b4', code: 'K4', name: 'Tòa K4', description: 'KTX Cơ sở 3. Chưa đưa vào sử dụng', isActive: false,
});

// ---------------------------------------------------------------- tiện ích tra cứu
export const bedsOf = (roomId) => beds.filter((b) => b.roomId === roomId).sort((a, b) => a.bedNumber - b.bedNumber);
/** Chỗ trống = số giường available — KHÔNG tính bằng capacity − số người ở (BR-05) */
export const availableSlots = (roomId) => bedsOf(roomId).filter((b) => b.status === 'available').length;

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

// ---------------------------------------------------------------- đơn đăng ký = hợp đồng `pending` (FR-30, FR-31)
export const contracts = [];
let contractSeq = 0;

export const TERM_MONTHS = { '6_months': 6, '12_months': 12 };

/** "YYYY-MM-DD" của hôm nay + N ngày (theo giờ máy) — để dữ liệu "sắp hết hạn" luôn đúng dù chạy ngày nào */
export const todayPlus = (days) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
};

/** "2026-09-01" + 6 tháng → "2027-03-01" */
/** "YYYY-MM-DD" (hoặc ISO) + N ngày → "YYYY-MM-DD" */
export const plusDays = (date, days) => {
  const [y, m, d] = String(date).slice(0, 10).split('-').map(Number);
  const t = new Date(y, m - 1, d + days);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1, 2)}-${pad(t.getDate(), 2)}`;
};

export const plusMonths = (date, months) => {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(y, m - 1 + months, d);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1, 2)}-${pad(t.getDate(), 2)}`;
};

/** Giường đang có một đơn chờ duyệt khác giữ (UC-01 nhánh 6a) */
export const pendingOn = (roomId, bedNumber, exceptId = null) => contracts.some((c) => c.status === 'pending'
  && c.roomId === roomId && c.bedNumber === bedNumber && c.id !== exceptId);
/** Giường còn nhận đơn: trống và chưa bị đơn nào giữ */
export const selectableBeds = (roomId) => bedsOf(roomId).filter((b) => b.status === 'available' && !pendingOn(roomId, b.bedNumber));
const firstSelectable = (room) => selectableBeds(room.id)[0]?.bedNumber;

/** Nộp đơn: hợp đồng `pending`, CHƯA khóa giường, chưa có ngày ở (BR-05: khóa lúc duyệt) */
export const newApplication = (st, room, bedNumber, extra = {}) => {
  contractSeq += 1;
  const c = {
    id: `c${pad(contractSeq)}`,
    contractCode: `HD-2026-${pad(contractSeq, 4)}`,
    studentId: st.id, studentCode: st.studentCode, studentName: st.fullName,
    roomId: room.id, roomNumber: room.roomNumber, buildingName: room.buildingName, bedNumber,
    term: '12_months', status: 'pending',
    pricePerMonth: room.pricePerMonth, depositAmount: room.depositAmount, totalRoomFee: 0,
    startDate: null, endDate: null,
    rejectionReason: null, approvedByName: null, reviewedAt: null, terminatedAt: null,
    isDepositRefunded: false, depositRefundedAt: null, depositRefundedByName: null,
    createdAt: `2026-08-${pad((contractSeq % 27) + 1, 2)}T09:00:00+07:00`,
    ...extra,
  };
  c.totalRoomFee = c.pricePerMonth * TERM_MONTHS[c.term];
  contracts.push(c);
  return c;
};

/**
 * Giống contractService.approve: khóa ĐÚNG giường đã chọn trong một bước kiểm-tra-và-ghi (BR-05),
 * chốt giá theo phòng, tính ngày theo gói thuê. Trả null nếu giường không còn trống.
 */
export const approveContract = (c, {
  roomId = c.roomId, bedNumber = c.bedNumber, startDate = todayPlus(0),
  reviewedAt = new Date().toISOString(), approvedByName = 'Lê Thị Nhân Viên',
} = {}) => {
  const room = rooms.find((r) => r.id === roomId);
  const bed = room && bedsOf(room.id).find((b) => b.bedNumber === bedNumber);
  if (!bed || bed.status !== 'available') return null;
  bed.status = 'occupied';
  const months = TERM_MONTHS[c.term];
  Object.assign(c, {
    status: 'active', roomId: room.id, roomNumber: room.roomNumber, buildingName: room.buildingName, bedNumber,
    pricePerMonth: room.pricePerMonth, depositAmount: room.depositAmount, totalRoomFee: room.pricePerMonth * months,
    startDate, endDate: plusMonths(startDate, months), reviewedAt, approvedByName,
    bedId: bed.id, // giường đang giữ — thanh lý trả đúng giường này
  });
  return { bed, contract: c };
};

// Số chỗ để trống của từng phòng theo thứ tự trong tòa — để sơ đồ tầng có đủ mức: đầy, còn 1, còn nhiều, trống hẳn
const FREE_SLOTS_PATTERN = [0, 1, 2, 0, 3, 1, 2, 0, 1, 4];
const targetOf = Object.fromEntries(rooms.map((r) => {
  const idx = Number(r.id.slice(-2)) - 1;
  return [r.id, Math.max(0, r.capacity - FREE_SLOTS_PATTERN[idx % FREE_SLOTS_PATTERN.length])];
}));
const occupiedCount = (roomId) => bedsOf(roomId).filter((b) => b.status === 'occupied').length;

// 70 sinh viên đầu đã được duyệt (35 nam tòa K1, 35 nữ tòa K2), một phần ba thuê gói 6 tháng
const PLACED = 70;
students.slice(0, PLACED).forEach((st, i) => {
  const fits = (r) => r.gender === st.gender && occupiedCount(r.id) < targetOf[r.id];
  const room = rooms.find(fits)
    || rooms.find((r) => r.gender === st.gender && availableSlots(r.id) > 0);
  const c = newApplication(st, room, firstSelectable(room), { term: i % 3 === 0 ? '6_months' : '12_months' });
  approveContract(c, { startDate: '2026-09-01', reviewedAt: '2026-08-30T10:00:00+07:00' });
});

// Hợp đồng sắp hết hạn (BR-29): 10 hợp đồng còn 3 → 30 ngày tính từ lúc chạy
contracts.filter((_, i) => i % 7 === 6).forEach((c, k) => { c.endDate = todayPlus(3 + ((k * 3) % 28)); });
// sv004: hợp đồng còn 20 ngày — để trang chủ sinh viên hiện thẻ "sắp hết hạn"
{
  const c = contracts.find((x) => x.studentId === students[DEMO_STUDENT_INDEX.sv004].id);
  if (c) c.endDate = todayPlus(20);
}
// Hai hợp đồng đã quá ngày kết thúc 5 ngày nhưng chưa thanh lý — `expired` suy ra lúc đọc, vẫn giữ giường.
// sv009 (index 9) còn nợ hóa đơn tháng → thanh lý bị chặn (BR-04); index 10 đã trả hết → thanh lý được.
[9, 10].forEach((i) => {
  const c = contracts[i];
  c.endDate = todayPlus(-5);
  c.startDate = plusMonths(c.endDate, -TERM_MONTHS[c.term]);
});

// 2 giường trống chuyển bảo trì (không đụng giường có người)
[rooms[1], rooms[12]].forEach((r) => {
  const bed = [...bedsOf(r.id)].reverse().find((b) => b.status === 'available');
  if (bed) { bed.status = 'maintenance'; bed.note = 'Hỏng khung giường, chờ sửa'; }
});

// ---- Đơn chờ duyệt, bị từ chối — sv002 (index 85) KHÔNG có đơn nào để test trang chủ "chưa có chỗ"
const roomFor = (st, capacity) => rooms.find((r) => r.gender === st.gender && r.capacity === capacity && selectableBeds(r.id).length > 0)
  || rooms.find((r) => r.gender === st.gender && selectableBeds(r.id).length > 0);
[70, 71, 72].forEach((idx, k) => {
  const room = roomFor(students[idx], [6, 4, 4][k]);
  newApplication(students[idx], room, firstSelectable(room), {
    term: k === 1 ? '6_months' : '12_months', createdAt: `2026-11-0${k + 1}T14:0${k}:00+07:00`,
  });
});
{ // sv005: đơn gần nhất bị từ chối
  const room = roomFor(students[73], 8);
  newApplication(students[73], room, firstSelectable(room), {
    status: 'rejected', rejectionReason: 'Hồ sơ còn thiếu giấy xác nhận sinh viên',
    createdAt: '2026-09-01T08:00:00+07:00', reviewedAt: '2026-09-02T09:30:00+07:00', approvedByName: 'Lê Thị Nhân Viên',
  });
}

// Hai tình huống xung đột giường cho màn Duyệt đơn (SCR-31) — đều là sinh viên nữ, tòa K2, đơn nộp sớm nên nằm đầu hàng đợi
const femaleRooms = rooms.filter((r) => r.gender === 'female' && r.status === 'active');
// (1) sv006: giường đã chọn có người nhận sau khi nộp đơn → mở đơn thấy cảnh báo ngay, cán bộ chọn giường khác
const fullRoom = femaleRooms.find((r) => availableSlots(r.id) === 0);
if (fullRoom) {
  newApplication(students[75], fullRoom, bedsOf(fullRoom.id)[0].bedNumber, { createdAt: '2026-10-28T08:15:00+07:00' });
}
// (2) Đơn của students[77] mang cờ `demoRace`: lúc bấm duyệt, mock giả lập một cán bộ khác vừa xếp người vào đúng
//     giường đó → 409 BED_ALREADY_OCCUPIED (UC-02 nhánh 4a). Xếp thêm người cho tới khi phòng còn 2 giường nhận đơn,
//     đơn này giữ một giường → phòng còn đúng 1 giường cho kịch bản tranh chỗ ở form công khai.
const raceRoom = femaleRooms.find((r) => selectableBeds(r.id).length >= 3);
if (raceRoom) {
  [81, 83, 87].forEach((idx) => {
    if (selectableBeds(raceRoom.id).length > 2) {
      approveContract(newApplication(students[idx], raceRoom, firstSelectable(raceRoom)), { startDate: '2026-09-01', reviewedAt: '2026-08-30T10:00:00+07:00' });
    }
  });
  newApplication(students[77], raceRoom, firstSelectable(raceRoom), { createdAt: '2026-10-29T10:05:00+07:00', demoRace: true });
}

/**
 * Tranh chỗ ở form công khai: nộp đơn vào giường nhận đơn CUỐI CÙNG của phòng thuộc tập này thì mock giả lập
 * một sinh viên khác vừa nộp trước vào đúng giường đó → 409 BED_ALREADY_REQUESTED. Chỉ có trong dữ liệu giả.
 */
export const demoRaceRoomIds = new Set(raceRoom ? [raceRoom.id] : []);
/** Một sinh viên chưa có hợp đồng nào, không thuộc tài khoản thử — làm "người tranh chỗ" */
export const rivalStudentFor = (gender) => {
  const reserved = new Set(Object.values(DEMO_STUDENT_INDEX).map((i) => students[i].id));
  return students.find((s) => s.gender === gender && !reserved.has(s.id) && !contracts.some((c) => c.studentId === s.id));
};

// ---------------------------------------------------------------- chỉ số điện nước (API.md §7)
/** Kỳ "YYYY-MM" lệch `months` tháng so với tháng hiện tại */
export const periodPlus = (months) => {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}`;
};

/** Đơn giá mẫu — không có danh mục giá (D4): đơn giá nằm trên từng bản ghi, lưới tự điền theo kỳ trước */
export const SEED_UNIT_PRICES = { electricity: 3000, water: 15000 };

/** Người đang ở phòng = hợp đồng còn giữ giường (gồm cả hợp đồng quá hạn chưa thanh lý), xếp theo MSSV */
export const residentsOf = (roomId) => contracts
  .filter((c) => c.roomId === roomId && c.status === 'active')
  .sort((a, b) => a.studentCode.localeCompare(b.studentCode));

/** Một khối điện hoặc nước của bản ghi: tiêu thụ và thành tiền tính từ chỉ số + đơn giá */
export const meterOf = (oldIndex, newIndex, unitPrice) => ({
  oldIndex, newIndex, usage: newIndex - oldIndex, unitPrice, amount: (newIndex - oldIndex) * unitPrice,
});

/**
 * Bản ghi chỉ số một phòng một tháng. `occupantsCount`, `perStudentAmount` chỉ chốt lúc phát hành (BR-03, chỉ để tham khảo).
 */
export const utilityReadings = [];
let readingSeq = 0;
export const newReading = (roomId, monthYear, electricity, water, extra = {}) => {
  readingSeq += 1;
  const r = {
    id: `u${pad(readingSeq)}`, roomId, monthYear, electricity, water,
    totalAmount: electricity.amount + water.amount, occupantsCount: null, perStudentAmount: null,
    isBilled: false, recordedByName: 'Lê Thị Nhân Viên', recordedAt: null, ...extra,
  };
  utilityReadings.push(r);
  return r;
};

/**
 * Chỉ số mẫu: 2 tháng trước đã chốt (có hóa đơn), tháng này Tòa K1 nhập xong, Tòa K2 mới nhập 5 phòng đầu.
 * Chỉ phòng có người mới có bản ghi — phòng trống không ghi (FR-41 bỏ qua phòng trống).
 * Chỉ số cũ của tháng sau = chỉ số mới của tháng trước (BR-51).
 */
const SEED_MONTHS = [-2, -1, 0];
rooms.forEach((room, idx) => {
  const occ = beds.filter((b) => b.roomId === room.id && b.status === 'occupied').length;
  if (!occ) return;
  let e = 1000 + idx * 85;
  let w = 60 + idx * 7;
  SEED_MONTHS.forEach((offset) => {
    if (offset === 0 && !(room.buildingId === 'b1' || Number(room.id.slice(1)) <= 105)) return;
    const eUse = occ * 20 + (idx % 4) * 5 + (offset + 2) * 3;
    const wUse = occ * 3 + (idx % 3);
    newReading(
      room.id, periodPlus(offset),
      meterOf(e, e + eUse, SEED_UNIT_PRICES.electricity), meterOf(w, w + wUse, SEED_UNIT_PRICES.water),
      { isBilled: offset < 0, recordedAt: offset < 0 ? `${periodPlus(offset + 1)}-01T09:00:00+07:00` : `${todayPlus(-1)}T16:30:00+07:00` },
    );
    e += eUse;
    w += wUse;
  });
});

// ---------------------------------------------------------------- hóa đơn + phiếu thu (API.md §8)
/**
 * Hóa đơn chỉ sinh từ duyệt đơn (cọc, tiền phòng cả kỳ) và chốt điện nước (cả phòng). Không lập tay, không hủy,
 * không thu một phần: `unpaid` → `paid` một lần, đủ `amount`.
 * Bản ghi lưu id thô (`studentId`, `roomId`, `payerStudentId`); mockApi dựng StudentRef/RoomRef khi trả ra.
 */
export const invoices = [];
/** Phiếu thu — mỗi hóa đơn đúng một phiếu, là biên lai của lần thu đó (UC-06) */
export const payments = [];
let invSeq = 0;
let paySeq = 0;
const STAFF_NAME = 'Lê Thị Nhân Viên';

/** Hai hóa đơn cá nhân lúc duyệt đơn (FR-32): `deposit` và `room_semester`, hạn 7 ngày */
export const issuePersonalInvoice = (c, type, { issuedAt = new Date().toISOString(), dueDate = todayPlus(7) } = {}) => {
  invSeq += 1;
  const room = rooms.find((r) => r.id === c.roomId);
  const amount = type === 'deposit' ? c.depositAmount : c.totalRoomFee;
  const description = type === 'deposit'
    ? `Tiền đặt cọc - ${c.contractCode}`
    : `Tiền phòng ${room.buildingCode}-${room.roomNumber} - ${TERM_MONTHS[c.term]} tháng (${c.contractCode})`;
  const inv = {
    id: `i${pad(invSeq, 4)}`, invoiceCode: `INV-${String(issuedAt).slice(0, 4)}-${pad(invSeq, 4)}`,
    type, scope: 'personal', amount, description,
    studentId: c.studentId, roomId: c.roomId, contractId: c.id, utilityReadingId: null, monthYear: null,
    createdAt: issuedAt, dueDate, status: 'unpaid', paidAt: null, payerStudentId: null,
  };
  invoices.push(inv);
  return inv;
};

/**
 * Thu đủ một hóa đơn → phiếu thu (FR-52 tiền mặt, FR-54 VietQR). Dùng chung cho dữ liệu mẫu và mock API.
 * Hóa đơn phòng: `payerStudentId` là bạn đại diện nộp cho cả phòng (BR-03, D5).
 */
export const collectInvoice = (inv, {
  payerStudentId, method = 'cash', transactionCode = null, note = '', paidAt = new Date().toISOString(), collectedByName = STAFF_NAME,
}) => {
  paySeq += 1;
  const payment = {
    id: `p${pad(paySeq, 4)}`, paymentCode: `PAY-${String(paidAt).slice(0, 4)}-${pad(paySeq, 4)}`,
    invoiceId: inv.id, amount: inv.amount, method, transactionCode, note, paidAt, collectedByName, payerStudentId,
  };
  payments.push(payment);
  Object.assign(inv, { status: 'paid', paidAt, payerStudentId });
  return payment;
};

/** Mã giao dịch ngân hàng mẫu cho VietQR — tiền mặt thì không có */
const seedPay = (inv, payerStudentId, k, paidAt) => collectInvoice(inv, {
  payerStudentId, paidAt,
  method: k % 3 === 0 ? 'cash' : 'vietqr',
  transactionCode: k % 3 === 0 ? null : (k % 2 ? `FT26${pad(250000 + k * 37, 7)}` : null), // VietQR được để trống mã (FR-54 "nếu cần")
  note: k % 3 === 0 ? 'Nộp tại văn phòng' : '',
});

// Hợp đồng đang ở: cọc đã nộp hết; tiền phòng cả kỳ còn một số bạn chưa nộp (sv001, sv009 nằm trong số này)
contracts.filter((c) => c.status === 'active').forEach((c, k) => {
  const idx = contracts.indexOf(c);
  const opts = { issuedAt: c.reviewedAt, dueDate: plusDays(c.reviewedAt, 7) };
  const deposit = issuePersonalInvoice(c, 'deposit', opts);
  const roomFee = issuePersonalInvoice(c, 'room_semester', opts);
  const paidAt = `${plusDays(c.reviewedAt, 1 + (k % 5))}T09:${pad((k * 7) % 60, 2)}:00+07:00`;
  seedPay(deposit, c.studentId, k, paidAt);
  // ⚠️ idx 10 (HĐ-2026-0011) phải hết nợ: M5 dùng nó để thử thanh lý thành công
  if (!(idx === 0 || idx === 9 || idx % 6 === 5)) seedPay(roomFee, c.studentId, k + 1, paidAt);
});

// ---------------------------------------------------------------- hóa đơn điện nước của phòng (FR-41)
const monthText = (monthYear) => { const [y, m] = monthYear.split('-'); return `Tháng ${Number(m)}/${y}`; };

/**
 * Chốt một bản ghi: khóa, ghi số người + tiền mỗi người tại thời điểm chốt, sinh MỘT hóa đơn cho cả phòng.
 * Mã có mã tòa để phòng cùng số ở hai tòa không trùng (API.md §7). Trả hóa đơn vừa tạo.
 */
export const billReading = (reading, { issuedAt = new Date().toISOString(), dueDate = todayPlus(7) } = {}) => {
  const room = rooms.find((r) => r.id === reading.roomId);
  const residents = residentsOf(room.id);
  Object.assign(reading, {
    isBilled: true, occupantsCount: residents.length,
    perStudentAmount: Math.round(reading.totalAmount / residents.length),
  });
  const inv = {
    id: `i-util-${reading.id}`, invoiceCode: `INV-UTIL-${room.buildingCode}-${room.roomNumber}-${reading.monthYear.replace('-', '')}`,
    type: 'utility', scope: 'room', amount: reading.totalAmount,
    description: `Tiền điện nước Phòng ${room.roomNumber} - ${monthText(reading.monthYear)} (${residents.length} người)`,
    studentId: null, roomId: room.id, contractId: null, utilityReadingId: reading.id, monthYear: reading.monthYear,
    createdAt: issuedAt, dueDate, status: 'unpaid', paidAt: null, payerStudentId: null,
  };
  invoices.push(inv);
  return inv;
};

// Hai tháng trước đã chốt: tháng xa nhất trả hết, tháng gần nhất còn vài phòng chưa trả. Bạn MSSV nhỏ nhất đại diện nộp
utilityReadings.filter((r) => r.isBilled).forEach((r, k) => {
  const older = r.monthYear < periodPlus(-1);
  const issued = `${older ? periodPlus(-1) : periodPlus(0)}-01`; // chốt ngày 1 của tháng kế tiếp
  const inv = billReading(r, { issuedAt: `${issued}T08:00:00+07:00`, dueDate: `${issued.slice(0, 8)}08` });
  const roomIdx = rooms.findIndex((x) => x.id === r.roomId);
  if (older || roomIdx % 4 !== 3) {
    seedPay(inv, residentsOf(r.roomId)[0].studentId, k, `${issued.slice(0, 8)}0${(k % 5) + 2}T10:00:00+07:00`);
  }
});

// ---------------------------------------------------------------- công nợ
/** Nợ cá nhân = hóa đơn cá nhân chưa trả. Hóa đơn điện nước thuộc cả phòng, không cộng vào nợ riêng ai */
export const debtOf = (studentId) => invoices
  .filter((inv) => inv.studentId === studentId && inv.status === 'unpaid')
  .reduce((sum, inv) => sum + inv.amount, 0);

// ---------------------------------------------------------------- hợp đồng năm trước (đã thanh lý)
// Sinh viên 80, 82, 84 (nam) từng ở tòa K1 năm học 2025-2026 — đã trả phòng, giường đã trả lại.
// 82 đã nhận lại cọc; 80 (sv007) và 84 chưa → nằm ở tab "Chờ hoàn cọc" (FR-35).
let pastSeq = 0;
const seedPastContract = (st, room, { startDate, endDate, terminatedAt, refundedAt = null }) => {
  const bed = bedsOf(room.id)[pastSeq % room.capacity];
  pastSeq += 1;
  const c = newApplication(st, room, bed.bedNumber, {
    contractCode: `HD-2025-${pad(pastSeq, 4)}`, createdAt: `${startDate.slice(0, 4)}-08-10T09:00:00+07:00`,
  });
  Object.assign(c, {
    status: 'terminated', startDate, endDate, terminatedAt,
    isDepositRefunded: !!refundedAt, depositRefundedAt: refundedAt, depositRefundedByName: refundedAt ? 'Lê Thị Nhân Viên' : null,
    reviewedAt: `${startDate.slice(0, 4)}-08-15T10:00:00+07:00`, approvedByName: 'Lê Thị Nhân Viên',
    pricePerMonth: room.pricePerMonth - 20000, // giá năm trước — hợp đồng giữ giá đã chốt (BR-27)
    bedId: bed.id,
  });
  c.totalRoomFee = c.pricePerMonth * TERM_MONTHS[c.term];
  // Năm trước nộp đủ cả cọc lẫn tiền phòng (BR-04 mới cho thanh lý)
  const opts = { issuedAt: c.reviewedAt, dueDate: plusDays(c.reviewedAt, 7) };
  const paidAt = `${plusDays(c.reviewedAt, 2)}T09:30:00+07:00`;
  collectInvoice(issuePersonalInvoice(c, 'deposit', opts), { payerStudentId: st.id, paidAt });
  collectInvoice(issuePersonalInvoice(c, 'room_semester', opts), { payerStudentId: st.id, paidAt });
};
seedPastContract(students[80], rooms[0], { startDate: '2025-09-01', endDate: '2026-06-30', terminatedAt: '2026-06-30' });
seedPastContract(students[82], rooms[2], {
  startDate: '2025-09-01', endDate: '2026-06-30', terminatedAt: '2026-06-30', refundedAt: '2026-07-02T10:15:00+07:00',
});
seedPastContract(students[84], rooms[3], { startDate: '2025-09-01', endDate: '2026-06-30', terminatedAt: '2026-01-15' });

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
