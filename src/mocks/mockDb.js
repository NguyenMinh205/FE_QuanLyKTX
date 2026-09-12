/**
 * Bộ dữ liệu giả dùng chung cho toàn bộ mock API.
 *
 * Dữ liệu được sinh ra có quan hệ nhất quán với nhau:
 *   2 tòa nhà → 20 phòng → 80 giường → 40 sinh viên → 28 hợp đồng → hóa đơn → thanh toán
 *
 * Nhờ vậy giao diện trông giống hệ thống thật: số giường đã ở khớp với số hợp đồng,
 * công nợ khớp với hóa đơn chưa trả, tỷ lệ lấp đầy tính ra đúng.
 *
 * ⚠️ Chỉ dùng khi VITE_USE_MOCK=true. Khi backend xong thì file này không được nạp nữa.
 */

// ---------------------------------------------------------------- tiện ích
const pad = (n, len = 3) => String(n).padStart(len, '0');
const pick = (arr, i) => arr[i % arr.length];

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN_NAM = ['Văn An', 'Minh Quân', 'Hoàng Long', 'Đức Anh', 'Quốc Bảo', 'Tiến Đạt'];
const TEN_NU = ['Thị Bình', 'Ngọc Ánh', 'Thu Hà', 'Phương Linh', 'Khánh Vy', 'Minh Châu'];
const KHOA = ['Công nghệ thông tin', 'Kinh tế', 'Cơ khí', 'Điện - Điện tử'];

// ---------------------------------------------------------------- tòa nhà
export const buildings = [
  { id: 'b1', code: 'A', name: 'Tòa A', address: 'Khu KTX số 1', isActive: true },
  { id: 'b2', code: 'B', name: 'Tòa B', address: 'Khu KTX số 1', isActive: true },
];

// ---------------------------------------------------------------- phòng (10 mỗi tòa)
export const rooms = [];
buildings.forEach((b, bi) => {
  for (let i = 1; i <= 10; i++) {
    const floor = Math.ceil(i / 4);
    rooms.push({
      id: `r${bi}${pad(i, 2)}`,
      buildingId: b.id,
      buildingName: b.name,
      roomNumber: `${floor}${pad(i, 2)}`,
      gender: bi === 0 ? 'male' : 'female', // Tòa A nam, tòa B nữ
      capacity: 4,
      pricePerBed: bi === 0 ? 400000 : 450000,
      status: 'active',
    });
  }
});

// ---------------------------------------------------------------- giường (4 mỗi phòng = 80)
export const beds = [];
rooms.forEach((r) => {
  for (let i = 1; i <= r.capacity; i++) {
    beds.push({
      id: `${r.id}-bed${i}`,
      roomId: r.id,
      roomNumber: r.roomNumber,
      buildingName: r.buildingName,
      gender: r.gender,
      pricePerBed: r.pricePerBed,
      bedCode: `${r.buildingName.slice(-1)}-${r.roomNumber}-${pad(i, 2)}`,
      status: 'available', // sẽ đổi bên dưới khi gán hợp đồng
      note: null,
    });
  }
});

// 3 giường cuối cho vào bảo trì
beds.slice(-3).forEach((b) => {
  b.status = 'maintenance';
  b.note = 'Hỏng khung giường, chờ sửa';
});

// ---------------------------------------------------------------- sinh viên (40)
export const students = Array.from({ length: 40 }, (_, i) => {
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
    emergencyContact: {
      name: `${pick(HO, i + 1)} Văn C`,
      phone: '0987654321',
      relationship: 'Bố',
    },
    status: 'active',
  };
});

// ---------------------------------------------------------------- hợp đồng + lưu trú
// 28 sinh viên đầu tiên được xếp giường, khớp giới tính phòng
export const residencies = [];
export const contracts = [];

let contractSeq = 0;
students.slice(0, 28).forEach((st) => {
  const bed = beds.find((b) => b.status === 'available' && b.gender === st.gender);
  if (!bed) return;

  contractSeq += 1;
  bed.status = 'occupied';

  const room = rooms.find((r) => r.id === bed.roomId);
  const resId = `res${pad(contractSeq)}`;

  residencies.push({
    id: resId,
    studentId: st.id,
    bedId: bed.id,
    startDate: '2026-09-01',
    endDate: null,
    status: 'active',
  });

  // 2 hợp đồng cuối để trạng thái pending (chưa kích hoạt)
  const isPending = contractSeq > 26;

  contracts.push({
    id: `c${pad(contractSeq)}`,
    contractCode: `HD-2026-${pad(contractSeq, 5)}`,
    residencyId: resId,
    studentId: st.id,
    studentCode: st.studentCode,
    studentName: st.fullName,
    bedId: bed.id,
    bedCode: bed.bedCode,
    buildingName: bed.buildingName,
    roomNumber: bed.roomNumber,
    startDate: '2026-09-01',
    endDate: contractSeq % 7 === 0 ? '2026-10-15' : '2027-06-30', // vài cái sắp hết hạn
    monthlyPrice: room.pricePerBed,
    depositAmount: 500000,
    depositRefunded: 0,
    status: isPending ? 'pending' : 'active',
    terms: 'Sinh viên tuân thủ nội quy ký túc xá.',
  });
});

// ---------------------------------------------------------------- danh mục phí
export const feeTypes = [
  { id: 'f1', code: 'rent', name: 'Tiền phòng', unit: 'tháng', defaultAmount: 400000, isRecurring: true, isActive: true },
  { id: 'f2', code: 'electricity', name: 'Tiền điện', unit: 'kWh', defaultAmount: 2500, isRecurring: true, isActive: true },
  { id: 'f3', code: 'water', name: 'Tiền nước', unit: 'm3', defaultAmount: 12000, isRecurring: true, isActive: true },
  { id: 'f4', code: 'deposit', name: 'Tiền đặt cọc', unit: 'lần', defaultAmount: 500000, isRecurring: false, isActive: true },
  { id: 'f5', code: 'other', name: 'Phí khác', unit: 'lần', defaultAmount: 0, isRecurring: false, isActive: true },
];

// ---------------------------------------------------------------- chỉ số điện nước
// Chỉ nhập cho các phòng có người ở
const occupiedRoomIds = [...new Set(beds.filter((b) => b.status === 'occupied').map((b) => b.roomId))];

export const utilityReadings = occupiedRoomIds.map((roomId, i) => {
  const room = rooms.find((r) => r.id === roomId);
  const eStart = 1200 + i * 30;
  const wStart = 80 + i * 5;
  return {
    id: `u${pad(i + 1)}`,
    roomId,
    roomNumber: room.roomNumber,
    buildingName: room.buildingName,
    billingPeriod: '2026-10',
    electricityStart: eStart,
    electricityEnd: eStart + 300 + (i % 5) * 20,
    waterStart: wStart,
    waterEnd: wStart + 40 + (i % 4) * 3,
    electricityUnitPrice: 2500,
    waterUnitPrice: 12000,
    isInvoiced: i < occupiedRoomIds.length - 2, // 2 phòng cuối chưa lập hóa đơn
  };
});

// ---------------------------------------------------------------- hóa đơn
export const invoices = [];
let invSeq = 0;

contracts
  .filter((c) => c.status === 'active')
  .forEach((c, i) => {
    invSeq += 1;

    // Hóa đơn tiền cọc — đã thanh toán hết
    invoices.push({
      id: `i${pad(invSeq)}`,
      invoiceCode: `INV-202609-${pad(invSeq, 5)}`,
      studentId: c.studentId,
      studentCode: c.studentCode,
      studentName: c.studentName,
      contractId: c.id,
      bedCode: c.bedCode,
      type: 'deposit',
      billingPeriod: null,
      lineItems: [
        { feeTypeId: 'f4', description: 'Tiền đặt cọc', quantity: 1, unitPrice: 500000, amount: 500000 },
      ],
      totalAmount: 500000,
      paidAmount: 500000,
      issueDate: '2026-09-01',
      dueDate: '2026-09-08',
      status: 'paid',
    });

    // Hóa đơn tháng 10 — trạng thái xoay vòng để giao diện có đủ màu
    invSeq += 1;
    const rent = c.monthlyPrice;
    const elec = 150000 + (i % 4) * 12500;
    const water = 96000 + (i % 3) * 12000;
    const total = rent + elec + water;

    const cycle = i % 4; // 0 chưa trả · 1 trả một phần · 2 đã trả đủ · 3 quá hạn
    const paid = cycle === 1 ? Math.floor(total / 2) : cycle === 2 ? total : 0;
    const status = cycle === 1 ? 'partial' : cycle === 2 ? 'paid' : cycle === 3 ? 'overdue' : 'unpaid';

    invoices.push({
      id: `i${pad(invSeq)}`,
      invoiceCode: `INV-202610-${pad(invSeq, 5)}`,
      studentId: c.studentId,
      studentCode: c.studentCode,
      studentName: c.studentName,
      contractId: c.id,
      bedCode: c.bedCode,
      type: 'monthly',
      billingPeriod: '2026-10',
      lineItems: [
        { feeTypeId: 'f1', description: 'Tiền phòng tháng 10/2026', quantity: 1, unitPrice: rent, amount: rent },
        { feeTypeId: 'f2', description: `Tiền điện tháng 10/2026 (${elec / 2500} kWh)`, quantity: elec / 2500, unitPrice: 2500, amount: elec },
        { feeTypeId: 'f3', description: `Tiền nước tháng 10/2026 (${water / 12000} m³)`, quantity: water / 12000, unitPrice: 12000, amount: water },
      ],
      totalAmount: total,
      paidAmount: paid,
      issueDate: '2026-11-01',
      dueDate: cycle === 3 ? '2026-11-05' : '2026-11-10',
      status,
    });
  });

/** Tổng công nợ của một sinh viên — dùng chung ở nhiều màn hình */
export const debtOf = (studentId) =>
  invoices
    .filter((inv) => inv.studentId === studentId && ['unpaid', 'partial', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

// ---------------------------------------------------------------- thanh toán
export const payments = [];
let paySeq = 0;

invoices
  .filter((inv) => inv.paidAmount > 0)
  .forEach((inv, i) => {
    paySeq += 1;
    const online = i % 3 !== 0;
    payments.push({
      id: `p${pad(paySeq)}`,
      transactionRef: `PAY2026110${pad(paySeq, 4)}`,
      invoiceId: inv.id,
      invoiceCode: inv.invoiceCode,
      studentId: inv.studentId,
      studentName: inv.studentName,
      amount: inv.paidAmount,
      type: 'payment',
      method: online ? (i % 2 ? 'vnpay' : 'zalopay') : 'cash',
      gatewayTransactionId: online ? `VNP${pad(80000 + paySeq, 6)}` : null,
      status: 'success',
      paidAt: `2026-11-0${(i % 8) + 1}T10:${pad((i * 7) % 60, 2)}:00+07:00`,
      note: online ? null : 'Thu tiền mặt tại văn phòng',
    });
  });

// ---------------------------------------------------------------- yêu cầu
export const requests = contracts.slice(0, 6).map((c, i) => {
  const type = i % 2 === 0 ? 'renewal' : 'checkout';
  const status = i < 3 ? 'pending' : i === 3 ? 'approved' : i === 4 ? 'rejected' : 'pending';
  return {
    id: `rq${pad(i + 1)}`,
    studentId: c.studentId,
    studentCode: c.studentCode,
    studentName: c.studentName,
    contractId: c.id,
    contractCode: c.contractCode,
    bedCode: c.bedCode,
    type,
    reason: type === 'renewal' ? 'Em tiếp tục học kỳ sau' : 'Em chuyển ra ngoài ở cùng gia đình',
    requestedEndDate: type === 'renewal' ? '2027-12-31' : '2026-12-15',
    status,
    reviewNote: status === 'rejected' ? 'Hồ sơ chưa đủ điều kiện gia hạn' : null,
    outstandingDebt: debtOf(c.studentId),
    createdAt: `2026-11-0${i + 1}T08:00:00+07:00`,
  };
});

// ---------------------------------------------------------------- thống kê dashboard
export const occupancyStats = () => {
  const total = beds.length;
  const occupied = beds.filter((b) => b.status === 'occupied').length;
  const maintenance = beds.filter((b) => b.status === 'maintenance').length;
  const available = total - occupied - maintenance;

  return {
    overall: {
      total,
      occupied,
      available,
      maintenance,
      rate: Number((occupied / (total - maintenance)).toFixed(3)),
    },
    byBuilding: buildings.map((b) => {
      const ids = rooms.filter((r) => r.buildingId === b.id).map((r) => r.id);
      const bs = beds.filter((x) => ids.includes(x.roomId));
      const occ = bs.filter((x) => x.status === 'occupied').length;
      const mnt = bs.filter((x) => x.status === 'maintenance').length;
      return {
        buildingName: b.name,
        total: bs.length,
        occupied: occ,
        available: bs.length - occ - mnt,
        maintenance: mnt,
        rate: Number((occ / (bs.length - mnt)).toFixed(3)),
      };
    }),
  };
};
