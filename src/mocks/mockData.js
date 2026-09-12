/**
 * Dữ liệu giả để frontend chạy được khi backend chưa xong (docs/14 mục 4.4).
 * Bật/tắt bằng VITE_USE_MOCK trong file .env
 *
 * ⚠️ BẮT BUỘC: cấu trúc trả về phải giống hệt backend thật ({ success, data, meta })
 * để khi nối API thật không phải sửa lại màn hình.
 */

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const wrap = (data, meta = null) => ({ data: { success: true, data, meta } });

// ----------------------------------------------------------- tài khoản mẫu
const MOCK_ACCOUNTS = [
  { username: 'admin@ktx.edu.vn',  password: 'Admin@123',   id: 1, fullName: 'Nguyễn Văn Quản Trị', role: 'ADMIN',   studentId: null },
  { username: 'staff@ktx.edu.vn',  password: 'Staff@123',   id: 2, fullName: 'Lê Thị Nhân Viên',    role: 'STAFF',   studentId: null },
  { username: 'viewer@ktx.edu.vn', password: 'Viewer@123',  id: 3, fullName: 'Trần Văn Người Xem',  role: 'VIEWER',  studentId: null },
  { username: 'SV2024001',         password: 'Student@123', id: 4, fullName: 'Trần Thị B',          role: 'STUDENT', studentId: 12 },
];

export const mockLogin = async ({ username, password }) => {
  await delay(400);
  const found = MOCK_ACCOUNTS.find((a) => a.username === username && a.password === password);

  if (!found) {
    // Giả lập đúng dạng lỗi của axios để code xử lý lỗi chạy như thật
    const error = new Error('Đăng nhập thất bại');
    error.response = {
      status: 401,
      data: { success: false, message: 'Email hoặc mật khẩu không đúng', errorCode: 'INVALID_CREDENTIALS' },
    };
    throw error;
  }

  return wrap({
    token: 'mock-token-' + found.role.toLowerCase(),
    expiresIn: 604800,
    user: {
      id: found.id,
      email: found.username,
      fullName: found.fullName,
      role: found.role,
      studentId: found.studentId,
      mustChangePassword: false,
    },
  });
};

// ----------------------------------------------------------- sinh viên mẫu
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN_NAM = ['Văn An', 'Minh Quân', 'Hoàng Long', 'Đức Anh', 'Quốc Bảo', 'Tiến Đạt'];
const TEN_NU = ['Thị Bình', 'Ngọc Ánh', 'Thu Hà', 'Phương Linh', 'Khánh Vy', 'Minh Châu'];
const KHOA = ['Công nghệ thông tin', 'Kinh tế', 'Cơ khí', 'Điện - Điện tử'];

export const MOCK_STUDENTS = Array.from({ length: 47 }, (_, i) => {
  const isMale = i % 2 === 0;
  const ho = HO[i % HO.length];
  const ten = isMale ? TEN_NAM[i % TEN_NAM.length] : TEN_NU[i % TEN_NU.length];
  const dangO = i % 3 !== 0;

  return {
    id: i + 1,
    studentCode: `SV2024${String(i + 1).padStart(3, '0')}`,
    fullName: `${ho} ${ten}`,
    gender: isMale ? 'MALE' : 'FEMALE',
    dateOfBirth: `200${5 - (i % 3)}-0${(i % 9) + 1}-1${i % 9}`,
    phone: `09${String(10000000 + i * 137).slice(0, 8)}`,
    email: `sv2024${String(i + 1).padStart(3, '0')}@sv.edu.vn`,
    className: `${['CNTT', 'KT', 'CK', 'DT'][i % 4]}2024${['A', 'B', 'C'][i % 3]}`,
    faculty: KHOA[i % KHOA.length],
    isActive: true,
    residence: dangO
      ? {
          buildingCode: isMale ? 'B1' : 'B2',
          roomNumber: String(301 + (i % 12)),
          bedLabel: `A${(i % 8) + 1}`,
          contractCode: `HD-2026-${String(i + 1).padStart(5, '0')}`,
          endDate: '2027-06-30',
        }
      : null,
    totalDebt: dangO && i % 4 === 0 ? 646000 : 0,
  };
});

export const mockStudentList = async (params = {}) => {
  await delay();
  const { page = 1, limit = 20, search = '', gender, faculty } = params;

  let rows = [...MOCK_STUDENTS];

  if (search) {
    const kw = search.toLowerCase().trim();
    rows = rows.filter(
      (s) =>
        s.fullName.toLowerCase().includes(kw) ||
        s.studentCode.toLowerCase().includes(kw) ||
        (s.phone || '').includes(kw),
    );
  }
  if (gender) rows = rows.filter((s) => s.gender === gender);
  if (faculty) rows = rows.filter((s) => s.faculty === faculty);

  const total = rows.length;
  const start = (page - 1) * limit;

  return wrap(rows.slice(start, start + limit), {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
};

// ----------------------------------------------------------- dashboard mẫu
export const mockDashboardSummary = async () => {
  await delay();
  return wrap({
    facility: {
      totalBuildings: 3, totalRooms: 60, totalBeds: 420,
      occupiedBeds: 358, reservedBeds: 5, availableBeds: 45, maintenanceBeds: 12,
      occupancyRate: 87.75,
    },
    residents: { activeStudents: 358, activeContracts: 358, pendingContracts: 5, expiringIn30Days: 23 },
    finance: { totalDebt: 48620000, overdueInvoiceCount: 27, overdueAmount: 12480000 },
    pendingTasks: { pendingApplications: 5, pendingExtendRequests: 3, pendingCheckoutRequests: 2 },
  });
};
