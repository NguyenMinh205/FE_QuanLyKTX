# KẾ HOẠCH CHỈNH SỬA FRONTEND THEO PHIÊN BẢN TINH GỌN HaUI (v2.0)

**Lập ngày:** 09/11/2026 · **Trạng thái:** đã duyệt, D1–D5 theo khuyến nghị (09/11/2026). Đã làm M0–M10 (M10 chờ commit, 10/11/2026)
**Nguồn yêu cầu:** `D:\BE_QLKTX\docs\EDIT_DOCS_DAC_TA_YEU_CAU.md` (SRS v2.0) và `EDIT_DOCS_DATA_SCHEMA.md`. Khác với tài liệu cũ trong `docs/` thì theo hai file này. Chỗ SRS bỏ ngỏ thì theo luồng use case trong `BAO_CAO_CHUONG_2.md`.
**Bổ sung ngoài SRS:** xác nhận hoàn cọc (FR-35, BR-08), theo yêu cầu ngày 09/11/2026.
**File này phục vụ một việc:** làm xong v2 thì xoá.

---

## 1. Tóm tắt

| | Hiện tại (v1) | Sau khi sửa (v2) |
|---|---|---|
| Vai trò | admin, staff, viewer, student | admin, staff, student |
| Có tài khoản sinh viên | Tự đăng ký `/register` | Tự cấp khi đơn được duyệt: TK = MK = MSSV, buộc đổi MK lần đầu |
| Nộp đơn ở KTX | Phải đăng nhập, chọn loại phòng → phòng | Công khai, không cần tài khoản, chọn phòng **và giường** |
| Thời hạn | Chọn ngày, thu tiền từng tháng | Gói 6 hoặc 12 tháng, thu trọn gói khi duyệt |
| Phòng | Bảng `RoomType` + `Bed` riêng, 2 hạng, sức chứa 3/4/6/8 | Nhúng giá, cọc, giường vào phòng; sức chứa 4/6/8 |
| Hợp đồng | `Application` + `Residency` + `Contract` | Một `Contract` có thêm trạng thái `pending` |
| Điện nước | Chia hóa đơn theo người, cấu hình `FeeType` | **1 hóa đơn/phòng/tháng**, một bạn đại diện trả |
| Hóa đơn | 5 loại phí, 5 trạng thái, thu một phần, hủy, lập lẻ | 3 loại, 2 trạng thái (`unpaid`/`paid`), thu đủ một lần |
| Thanh toán | VNPay, webhook, đối soát treo | Tiền mặt + VietQR động, cán bộ xác nhận |
| Tiền cọc khi rời KTX | Quyết toán trừ công nợ tự động | Thanh lý xong hoàn đủ tại văn phòng, cán bộ xác nhận, có cờ `isDepositRefunded` |
| Bỏ hẳn | | Nhu yếu phẩm, Gia hạn, Yêu cầu, Viewer, Cron |

**Quy mô:** 10 route bị bỏ, 2 route mới, khoảng 4.000 dòng code màn hình bị xoá, phần lớn màn còn lại phải đổi theo model mới. `src/mocks/mockApi.js` (1.856 dòng) và `mockDb.js` (666 dòng) gần như viết lại.

**Cách làm:** BE cập nhật sau nên toàn bộ FE v2 chạy trên **dữ liệu giả** (`VITE_USE_MOCK=true`, `.env` đang để sẵn). Sau mốc M1, FE **không còn chạy đúng với BE hiện tại** cho tới khi BE theo v2. Đây là chủ đích, không phải lỗi.

---

## 2. Tác động theo màn hình

### 2.1. Bỏ

| Route / phần | Vì sao | Mốc |
|---|---|---|
| `/register`, `RegisterPage` | FR-02 cấm tự đăng ký | M1 |
| `/admin/supplies`, `/portal/shop`, `/portal/my-orders`, `features/supplies` | Không còn trong SRS | M1 |
| `/admin/requests`, `/portal/my-requests`, `features/requests`, `SettlementBreakdown` | Không còn gia hạn, không có collection `requests` | M1 |
| `features/residencies` | Gộp vào Contract | M1 |
| `/admin/room-types`, `RoomTypeCard`, `RoomTypeFormDrawer` | Bỏ RoomType | M3 |
| `/portal/apply`, `CreateApplicationModal` | Thay bằng form công khai, SRS không có lập đơn hộ | M4 |
| `/admin/fee-types`, `FeeTypeFormModal` | Bỏ FeeType | M6 |
| `CreateInvoiceModal`, `GenerateInvoicesModal`, nút Hủy hóa đơn, thu một phần | Hóa đơn chỉ sinh từ duyệt đơn và chốt điện nước | M7 |
| `/portal/payment-result`, `paymentApi.checkout`, `reconcile` | Bỏ VNPay | M8 |

### 2.2. Giữ và sửa

| Màn | Đổi gì | FR | Mốc |
|---|---|---|---|
| Đăng nhập | Ô "Email hoặc MSSV" , nhận diện HaUI | 01 | M2 |
| Đăng nhập | Nút "Đăng ký ở KTX", "Tra cứu đơn" (làm cùng trang đích, nếu làm sớm sẽ thành link hỏng) | 30, 33 | M4 |
| Đổi mật khẩu | Cơ chế buộc đổi đã có ở `RoleRoute`. Thêm gợi ý "mật khẩu hiện tại là MSSV", chặn mật khẩu mới trùng MSSV (UC-04) | 05 | M2 |
| Tài khoản | Chỉ tạo admin/staff, bỏ nhánh liên kết sinh viên | 06, 07 | M2 |
| Tòa nhà | Bỏ `address`, kiểm thống kê theo tòa | 20, 21 | M3 |
| Phòng | Form: sức chứa 4/6/8 + giá + cọc. Trạng thái `active/maintenance`. Lọc theo giới tính, sức chứa. Bỏ hạng phòng | 22, 24, 25 | M3 |
| Duyệt đơn | Đọc `/contracts?status=pending`, duyệt theo phòng + giường SV đã chọn, xử lý 409 | 31, 32, 33 | M4 |
| Hợp đồng | Kỳ 6/12 tháng, tiền trọn gói. Bỏ gia hạn, sửa điều khoản, sắp hết hạn, quyết toán. Thanh lý kiểm BR-04, áp dụng cho cả hợp đồng `active` và `expired`. Thêm trạng thái và xác nhận hoàn cọc | 31, 34, 35 | M5 |
| Trang chủ SV, Chỗ ở | Bỏ mua sắm, gia hạn, đồ cấp sẵn, loại phòng. Thêm hợp đồng đã kết thúc → link đăng ký lại, lịch sử hợp đồng hiện đã/chưa nhận cọc | 35, 60, 61 | M5 |
| Chỉ số điện nước | Đã là bảng lưới, số cũ tự điền. Đổi model, nhập đơn giá, thêm nút **Chốt & Phát hành**, lịch sử theo phòng | 40, 41, 42 | M6 |
| Hóa đơn (DS + chi tiết) | 3 loại, 2 trạng thái, tách nhóm cá nhân / theo phòng, trường `amount` | 50, 51 | M7 |
| Ghi nhận thanh toán | Thu đủ, `cash`/`vietqr`, chọn người đại diện với hóa đơn phòng | 52, 54 | M7 |
| Thanh toán | Bỏ trạng thái và đối soát treo | 54 | M7 |
| Hóa đơn của tôi | 2 nhóm, mã VietQR, trạng thái "Đã thanh toán bởi…" | 62, 53 | M8 |
| Dashboard | KPI mới, lấp đầy theo tòa, thêm doanh thu | 70, 71, 72 | M9 |
| Sinh viên | Lọc khoa, cột có tài khoản, chi tiết, đặt lại MK, import | 10–14, 06 | M10 |

### 2.3. Làm mới

| Màn / phần | FR | Mốc |
|---|---|---|
| `/apply`: form công khai 3 bước (thông tin → phòng & giường → gói thuê) | 23, 30 | M4 |
| `/apply/status`: tra cứu đơn bằng MSSV + email | 33 | M4 |
| Tab "Chờ hoàn cọc" và nút xác nhận đã hoàn cọc ở màn Hợp đồng | 35 | M5 |
| Lịch sử điện nước một phòng (cán bộ) | 42 | M6 |
| Khối VietQR, chuông thông báo, lịch sử thanh toán và lịch sử điện nước phòng mình của SV (`getMyPayments` hiện chỉ màn kết quả VNPay dùng) | 42, 53, 62, 63 | M8 |
| Thống kê doanh thu theo tháng | 72 | M9 |
| Chi tiết sinh viên (hiện chỉ có bảng) | 11 | M10 |
| Excel: import sinh viên, xuất/nhập chỉ số | 12b, 40 | M10 |

---

## 3. Chỗ SRS chưa rõ và cách xử lý

Ngày 09/11/2026: cả năm mục áp dụng theo khuyến nghị. Các phương án còn lại giữ để biết lý do, không đề xuất lại trừ khi được nhắc.

**D1. Sinh viên xin trả phòng thế nào?** Sơ đồ SRS có UC14 cho Student nhưng không có FR. *Đổi khuyến nghị so với bản đầu:* UC-07 trong báo cáo chương 2 ghi rõ "Sinh viên đến văn phòng KTX xin làm thủ tục trả phòng", và thủ tục đó vốn có kiểm kê tài sản, thu hồi chìa khóa.
- **A (khuyến nghị):** không có thao tác online. SV lên văn phòng, cán bộ thanh lý; Cổng SV ghi một dòng hướng dẫn. Khớp báo cáo, ít việc nhất.
- B: thêm trường `checkoutRequestedAt` và nút "Xin trả phòng" trên Cổng SV. Tiện hơn nhưng phải sửa lại UC-07 và SRS.

**D2. Đơn bị từ chối mang trạng thái gì?** Enum chỉ có `pending/active/expired/terminated`, FR-33 không nói.
- **A (khuyến nghị):** thêm `rejected`. Lọc và thống kê sạch, tra cứu đơn hiển thị đúng.
- B: dùng `terminated` + `rejectionReason`. Đúng enum hiện tại nhưng trộn đơn bị từ chối với hợp đồng đã chấm dứt.

**D3. Chuông thông báo Portal (FR-41) lấy dữ liệu từ đâu?** Schema không có collection thông báo.
- **A (khuyến nghị):** suy ra từ hóa đơn điện nước chưa trả của phòng mình. Không thêm bảng, BE không phải làm gì thêm.
- B: thêm collection `notifications`. Đúng nghĩa hơn, có đã đọc/chưa đọc, nhưng thêm việc cho BE.

**D4. Đơn giá điện nước nằm ở đâu?** Bỏ FeeType nhưng schema chỉ lưu đơn giá trong từng bản ghi chỉ số, không có nơi cấu hình.
- **A (khuyến nghị):** 2 ô đơn giá ở đầu bảng lưới, tự điền theo kỳ trước, lưu vào từng bản ghi.
- B: thêm collection `settings` kèm màn cấu hình. Thêm một bảng và một màn trái mục tiêu tinh gọn.

**D5. Ai là "người đại diện đã nộp" khi trả bằng VietQR?** FR-62 cần hiển thị tên, nhưng chuyển khoản không cho biết ai quét mã.
- **A (khuyến nghị):** cán bộ chọn thành viên phòng trong modal xác nhận, áp dụng cho cả tiền mặt lẫn VietQR.
- B: SV bấm "Tôi đã chuyển khoản". Tự động hơn nhưng thêm một trạng thái chờ mà schema không có.

**Đã có đáp án trong báo cáo chương 2, không cần quyết — hai đơn cùng chọn một giường:**
- Lúc nộp đơn (UC-01 nhánh 6a): giường đã có đơn chờ duyệt hiện "Đã có người đăng ký", không chọn được. Bị người khác chọn trước trong lúc đang điền form thì báo lỗi và quay lại bước chọn giường.
- Lúc duyệt (UC-02 nhánh 4a): vẫn trùng thì nhận `409 BED_ALREADY_OCCUPIED`, cán bộ chọn giường khác ngay ở màn duyệt, tận dụng phần chọn phòng thay thế đang có.

---

## 4. Mặc định sẽ áp dụng (sai thì báo)

- Sơ đồ UC chỉ vẽ Admin với UC1/2/8, nhưng RBAC §5 cho Admin làm mọi nghiệp vụ: **theo RBAC**.
- Staff xem doanh thu: sơ đồ UC8 nói có, RBAC nói "xem lấp đầy": **theo RBAC**. FR-72 chỉ Admin, KPI FR-70 cả hai cùng thấy.
- FR-06 nói Staff "không được reset Admin", RBAC ghi "cho SV": **Staff chỉ reset sinh viên**, nút đặt ở màn Sinh viên vì Staff không vào được màn Tài khoản.
- Duyệt đơn và Hợp đồng **giữ hai màn riêng**, cùng gọi `/contracts`. Ít sửa giao diện nhất, giữ được số đếm việc chờ trên menu.
- Danh sách phòng sắp theo tầng → số phòng, phòng đầu gắn nhãn "Gợi ý", **không ép** chọn phòng đầu (FR-30 cho SV chọn; BR-07 và FR-23 ghi lửng).
- Hết khái niệm "quá hạn": hạn nộp đã qua chỉ hiện chữ đỏ cạnh ngày, không phải trạng thái.
- Bỏ nút bảo trì từng giường (không có FR); bảo trì ở cấp phòng qua FR-25.
- **Hoàn cọc (FR-35, BR-08):** chỉ khi hợp đồng đã `terminated`. Hợp đồng `expired` mà SV không ở tiếp thì cán bộ thanh lý trước rồi mới hoàn. BR-04 đã bảo đảm hết nợ nên hoàn đủ `depositAmount`, không nhập số tiền. Hư hỏng tài sản xử lý ngoài hệ thống. Xác nhận **một chiều** (có hộp thoại hỏi lại) vì liên quan tiền. Không tạo `Payment` nên không tính vào doanh thu. Staff và Admin đều làm được.
- SV cũ quay lại ở tiếp: không có gia hạn nên nộp lại form công khai bằng MSSV cũ.
- Excel: **FE đọc file rồi gửi JSON**, BE không phải xử lý upload. Dùng `exceljs`, chỉ tải khi bấm nút để không phình bundle.
- Email là việc của BE. Bản giả chỉ báo "đã gửi email tới …".

---

## 5. Các mốc

Mỗi mốc một nhánh, tách từ nhánh của mốc liền trước vì `develop` chưa nhận các nhánh v2. App vẫn chạy được khi xong mốc. AI kiểm bằng lint, build và bấm thử e2e trên dữ liệu giả, rồi thêm mục vào `docs/15-CHECKLIST-NGHIEM-THU-FE.md`. Cỡ việc là ước lượng tương đối.

### M0. Chuẩn bị · Nhỏ
- **Bản v1 đầy đủ:** giữ ở nhánh `backup/v1-full`, phòng khi giảng viên đổi ý.
- **AI:** viết lại `docs/API.md` thành hợp đồng v2 (danh sách ở §6). Mock và màn hình sau này bám theo file này, BE cũng dùng nó để cập nhật.
- **Thử:** đọc `docs/API.md`.

### M1. Cắt phần không còn dùng · Vừa · `feature/v2-trim-scope`
- **AI:** bỏ Viewer (`roles.js`, `permission.js`, Dashboard, form tài khoản), đăng ký tự do, Nhu yếu phẩm, Yêu cầu, Gia hạn, mọi liên kết tới chúng (menu, `ResidentHome`, `MyResidencePage`, hàng đợi Dashboard), mock tương ứng.
- **Thử:** đăng nhập admin và sinh viên, menu không còn các mục đã bỏ, các màn còn lại vẫn mở được, `/register` ra trang 404.

### M2. Đăng nhập, tài khoản, nhận diện · Nhỏ · `feature/v2-auth-accounts`
- **AI:** đăng nhập Email/MSSV, form tài khoản chỉ admin/staff, tiêu đề và thông tin HaUI, dữ liệu giả tòa K1–K4, khoa HaUI, MSSV 10 số.
- **Bạn:** đưa thông tin thật cho `SUPPORT_CONTACT` (văn phòng, hotline), nếu chưa có thì giữ mẫu.
- **Thử:** đăng nhập bằng MSSV của tài khoản buộc đổi MK → bị chuyển sang đổi mật khẩu; sai mật khẩu báo đúng lỗi.

### M3. Tòa nhà và phòng · Vừa · `feature/v2-rooms`
- **AI:** model phòng nhúng giường, viết lại form và bộ lọc, sửa `RoomTile`, `RoomDetailPanel`, `roomStatus.js`, xoá màn Loại phòng. Sửa lỗi có từ v1 ở màn Tòa nhà: cột đầu không có `width` nên tên tòa bị ngắt từng chữ theo chiều dọc ở màn 1366px. Mock tạm giữ `getRoomTypes` suy ra từ phòng để màn Đăng ký/Duyệt cũ không gãy, hết M4 thì xoá.
- **Thử:** tạo phòng 6 chỗ → có 6 giường; phòng đang có người không đổi được giới tính, sức chứa; chỉ chọn được 4/6/8.

### M4. Nộp đơn online và duyệt đơn · Lớn · `feature/v2-online-application`
- **AI:** hai nút "Đăng ký ở KTX", "Tra cứu đơn" ở màn đăng nhập; `/apply` 3 bước, chọn giới tính → lọc phòng → chọn giường, gói 6/12 tháng tính sẵn tổng tiền; `/apply/status`; chuyển màn Duyệt đơn sang contract; duyệt sinh 2 hóa đơn và tài khoản; từ chối kèm lý do; xử lý trùng giường theo §3.
- **Thử:** mở `/apply` khi chưa đăng nhập, nộp đơn → tra cứu thấy "Chờ duyệt" → staff duyệt → đăng nhập bằng MSSV/MSSV → buộc đổi MK. Đơn thứ hai không chọn được giường đã có đơn chờ; nộp trùng MSSV đang có đơn thì báo lỗi.

### M5. Hợp đồng và trả phòng · Vừa · `feature/v2-contracts-checkout`
- **AI:** màn Hợp đồng theo model mới, thanh lý chặn khi còn nợ (BR-04), hướng dẫn trả phòng theo D1, `MyResidencePage` và `ResidentHome`, `NoResidenceHome` thu gọn còn lịch sử + link đăng ký lại. Sửa lỗi có từ v1: `ResidentHome` tràn ngang ở màn 390px (cột `display: grid` bị bảng hóa đơn `scroll.x=600` kéo rộng, cần `gridTemplateColumns: 'minmax(0, 1fr)'`). Hoàn cọc: tab "Chờ hoàn cọc" (`status=terminated`, `isDepositRefunded=false`), cột trạng thái cọc, nút "Xác nhận đã hoàn cọc" trong drawer, hiển thị người và ngày xác nhận, quyền mới `contract:refundDeposit`; SV thấy "Đã nhận lại cọc ngày …" hoặc "Chưa nhận, đến văn phòng KTX".
- **Thử:** SV còn nợ → thanh lý bị chặn và nêu lý do; hết nợ → giường trống lại, hợp đồng `terminated`, xuất hiện ở tab Chờ hoàn cọc. Bấm xác nhận → rời khỏi tab, không bấm lại được; đăng nhập SV đó thấy đã nhận cọc. Hợp đồng chưa thanh lý không có nút này.

### M6. Chốt điện nước theo phòng · Vừa · `feature/v2-utility-billing`
- **AI:** model chỉ số mới, ô đơn giá (D4), Chốt & Phát hành theo tòa + tháng, khóa sau khi chốt, bỏ phòng không có người, lịch sử theo phòng, xoá Danh mục loại phí. **Kéo từ M7 lên (10/11/2026):** xoá Lập hóa đơn hàng loạt và Tạo hóa đơn lẻ, vì cả hai chạy trên model chỉ số cũ và danh mục loại phí nên gãy ngay khi đổi model. Hóa đơn điện nước mới mang thêm trường kiểu cũ (`totalAmount`, `paidAmount`, `lineItems`) để màn Hóa đơn hiện được tới M7; hóa đơn tháng kiểu cũ trong dữ liệu giả chỉ còn tiền phòng để không tính điện nước hai lần.
- **Thử:** nhập chỉ số một tòa → Chốt → mỗi phòng đúng 1 hóa đơn, không sửa được nữa. Màn Hóa đơn có thể hiển thị chưa đẹp cho tới hết M7.

### M7. Hóa đơn và thanh toán phía cán bộ · Vừa · `feature/v2-invoices-payments`
- **AI:** danh sách và chi tiết theo model mới, modal xác nhận thu (D5), hiển thị biên lai sau khi thu (UC-06: mã phiếu, số tiền, người thu, thời gian), màn Thanh toán rút gọn, xoá hủy và thu một phần (lập lẻ, lập hàng loạt đã xoá ở M6). Bỏ hẳn loại hóa đơn `monthly` trong dữ liệu giả và các trường kiểu cũ trên hóa đơn điện nước. **Đã làm (10/11/2026):** mock trả đúng model §8; cổng SV đọc qua lớp chuyển đổi tạm `toLegacyInvoice` trong `portal.api.js` và luồng VNPay thử tách riêng trong mock — **M8 xoá cả hai**. Hợp đồng trong dữ liệu giả không còn `bedCode`, `monthlyPrice`.
- **Thử:** thu tiền mặt hóa đơn phòng, chọn người nộp → `paid`, chi tiết hiện đúng tên; xác nhận VietQR có ô mã giao dịch, được để trống (FR-54 ghi "nếu cần").

### M8. Cổng SV: hóa đơn và VietQR · Vừa · `feature/v2-portal-vietqr`
- **AI:** 2 nhóm hóa đơn, ảnh QR đúng số tiền và nội dung FR-53, trạng thái đại diện đã nộp, chuông (D3), lịch sử thanh toán, lịch sử điện nước phòng mình, xoá VNPay. **Đã làm (10/11/2026):** xoá lớp chuyển đổi tạm của M7 và luồng VNPay thử; `debtSummary` chỉ tính nợ cá nhân, hóa đơn phòng đọc riêng qua `scope=room`. Tài khoản nhận tiền trong mock là số mẫu (`VIETQR_ACCOUNT` trong `mockApi.js`).
- **Bạn:** đưa mã ngân hàng, số tài khoản, tên tài khoản nếu muốn quét thử bằng app thật.
- **Thử:** quét QR bằng app ngân hàng thấy đúng số tiền và nội dung. Không chuyển tiền thật.

### M9. Dashboard · Nhỏ · `feature/v2-dashboard`
- **AI:** KPI FR-70, lấp đầy theo tòa, doanh thu tháng tách tiền phòng/điện nước, ẩn doanh thu với Staff. Thẻ và bảng "Hợp đồng sắp hết hạn" đang gọi `GET /contracts?expiringInDays=` — tham số này đã bỏ ở API v2 (§13): lấy số từ `/dashboard/summary`, bảng thì lọc phía FE hoặc bỏ. Từ M5 link "Xem danh sách" tạm trỏ tab Đang hiệu lực (tab này xếp theo ngày bắt đầu, chưa đưa hợp đồng sắp hết hạn lên đầu). **Đã làm (10/11/2026), theo khuyến nghị:** bỏ hẳn thẻ và bảng "sắp hết hạn" khỏi Dashboard — FR-70 không có mục này, màn Hợp đồng đã ghi "còn N ngày". Bỏ luôn thẻ "Hóa đơn quá hạn" (v2 không có trạng thái quá hạn) và khối "Cần xử lý" (trùng thẻ Đơn chờ duyệt). Staff không gọi API doanh thu; Lấp đầy theo tòa thêm bảng số.
- **Thử:** so số trên thẻ với dữ liệu giả; đăng nhập Staff không thấy doanh thu.

### M10. Sinh viên và Excel · Vừa · `feature/v2-students-excel`
- **AI:** bộ lọc và cột mới, drawer chi tiết (FR-11), đặt lại MK, import sinh viên có báo cáo dòng lỗi, xuất/nhập chỉ số.
- **Thử:** tải mẫu → điền 1 dòng đúng, 1 dòng trùng MSSV → báo 1 thành công, 1 lỗi đúng dòng.
- **Đã làm (10/11/2026):** thêm thư viện `exceljs@4.4.0`, tải động nên tách chunk riêng (~930 kB, chỉ tải khi bấm nút Excel). Nhập chỉ số từ Excel chỉ điền vào lưới, cán bộ xem rồi bấm Lưu; file mang mã tòa + tháng ở dòng 1 để chặn nạp nhầm. MSSV khi thêm/sửa/nhập phải đúng 10 chữ số. `npm audit` báo `uuid` (vừa, qua exceljs) và `follow-redirects` (cao, qua axios có từ trước) — chưa xử lý.

### M10b. Làm đẹp giao diện · Vừa · `feature/v2-ui-polish`
- **Quyết định (10/11/2026):** làm sau M10, trước M11 (phương án A) — làm đẹp khi các màn đã ổn định, khỏi làm lại.
- **AI:** rà toàn bộ màn bằng skill cài riêng trong project (Impeccable chế độ app quản trị, TasteSkill redesign/minimalist). Giữ Ant Design và quy tắc UI của bạn: hiệu ứng đứng yên, mỗi lúc chỉ một thứ chuyển động; không thêm thư viện animation, font hay bộ icon mới. Kiểm ở 1366px và 390px.
- **Thử:** so ảnh trước/sau từng màn; e2e M1–M10 vẫn đạt.

### M11. Rà soát và bàn giao BE · Nhỏ · `docs/v2-acceptance`
- **AI:** thử trọn luồng theo 3 vai trò, xoá code và mock thừa, cập nhật `docs/15`, `16`, `17`, thêm ghi chú đầu `docs/README.md` rằng tài liệu 01–14 mô tả v1.
- **Bạn:** nghiệm thu theo checklist.

---

## 6. Hợp đồng API v2

Bản đầy đủ ở [`docs/API.md`](API.md) (v2.0, xong M0 ngày 09/11/2026), bảng dưới chỉ là tóm tắt. SRS chỉ nêu tên vài endpoint, phần còn lại FE đề xuất.

| Nhóm | Endpoint | Ghi chú |
|---|---|---|
| Auth | `POST /auth/login` | Body đổi thành `{ identifier, password }` |
| Công khai | `GET /public/rooms/available?gender=` | Đã sắp theo tầng → số phòng, kèm giường trống |
| | `POST /contracts/register-online` | Tên có trong SRS |
| | `GET /public/applications/status?studentCode=&email=` | FR-33 |
| Sinh viên | `POST /students/import` | Body JSON các dòng, trả `{ success, errors[] }` |
| Phòng | `GET/POST/PUT /rooms` | Bỏ `/beds/:id/status`, `/room-types` |
| Hợp đồng | `GET /contracts?status=` | Gộp cả đơn chờ duyệt |
| | `PATCH /contracts/:id/approve` · `/reject` · `/terminate` | Approve nhận `{ roomId?, bedNumber? }` để đổi giường khi trùng |
| | `PATCH /contracts/:id/deposit-refund` | FR-35. Lỗi `CONTRACT_NOT_TERMINATED`, `DEPOSIT_ALREADY_REFUNDED`. `GET /contracts` nhận thêm `isDepositRefunded` |
| Điện nước | `POST /utility-readings/bulk` | `{ buildingId, monthYear, electricityUnitPrice, waterUnitPrice, rows[] }` |
| | `POST /utility-readings/publish` | `{ buildingId, monthYear }` |
| Thanh toán | `POST /payments/cash` · `POST /payments/vietqr/confirm` | `{ invoiceId, payerStudentId?, transactionCode?, note? }`. `/payments/cash` là tên trong UC-06 |
| Portal | `GET /portal/my-invoices?scope=personal\|room` | |
| | `GET /portal/my-invoices/:id/vietqr` | BE trả `{ bankBin, accountNumber, accountName, amount, transferContent }` |
| Dashboard | `GET /dashboard/summary` · `/occupancy` · `/revenue` | Revenue chỉ Admin |

### Điểm cần báo nhóm BE (lỗi trong tài liệu mới)

1. `EDIT_DOCS_DATA_SCHEMA` §4.3 sinh mã `INV-UTIL-${roomNumber}-…` **không có mã tòa**: phòng 302 của K1 và K2 cùng tháng sẽ trùng unique index, lần chốt thứ hai lỗi. Dùng dạng `INV-UTIL-K1-302-202610` như FR-41.
2. Cũng đoạn đó `occupants.length || 1`: phòng trống vẫn sinh hóa đơn mà không ai trả. FE sẽ không gửi phòng trống, BE nên chặn thêm.
3. `users` không có `studentCode`, trong khi FR-01 đăng nhập bằng MSSV và FR-32 yêu cầu lưu. UC-02 trong báo cáo lại gọi là `username`.
4. FR-51 cần danh sách thành viên trên hóa đơn phòng nhưng `invoices` không lưu. Thành viên đổi sau khi chốt thì danh sách cũ mất.
5. Bỏ Cron nhưng vẫn có trạng thái `expired`: cần tính khi đọc, hoặc có cơ chế cập nhật.
6. Tài liệu ghi "7 collection" nhưng liệt kê 8. `isBilled` còn mô tả "hóa đơn cá nhân" của bản cũ.
7. Nội dung chuyển khoản FR-53 có dấu `-` trong mã hóa đơn thì app ngân hàng có thể lược bỏ, nên bỏ dấu khi sinh nội dung nếu làm webhook sau này (FE đang làm vậy ở `transferNoteOf`).
8. **Thêm vào Contract:** `isDepositRefunded` (Boolean, mặc định `false`), `depositRefundedAt` (Date), `depositRefundedBy` (ref `User`). SRS, schema, Quy trình 4 và UC-07 của báo cáo cần bổ sung FR-35, BR-08.
9. SV đã được duyệt rồi bỏ không ở, chưa đóng tiền: BR-04 chặn thanh lý mà hóa đơn không hủy được, giường bị giữ mãi. Cần quy định cách xử lý.
10. Báo cáo chương 2 kết luận "30 FR, 10 NFR" nhưng bảng thực tế có 39 FR (chưa tính FR-54b) và 11 NFR.
11. **Ở tiếp kỳ sau:** không có gia hạn, và UC-01 3a chặn nộp đơn khi SV còn hợp đồng `active` (kể cả đã quá hạn, chưa thanh lý). Nên SV muốn ở tiếp phải trả phòng (thanh lý) rồi mới nộp đơn mới, và giường cũ có thể bị người khác đăng ký mất trong lúc đó. FE (M5) ghi đúng như vậy trong thông báo; cần giảng viên xác nhận đây là ý đồ.

---

## 7. Rủi ro và điều chưa kiểm

- `docs/MO-TA-DE-TAI.md` đã viết lại theo v2 ngày 09/11/2026, khớp với D1–D5 ở §3.
- **Giữa các mốc:** màn chưa tới lượt có thể hiển thị thiếu do mock đã đổi, chỉ nghiệm thu màn của mốc đó.
- **Tài liệu `docs/01`–`14`, `PRD`, `DATA-SCHEMA`** không viết lại trong kế hoạch này, chỉ gắn ghi chú ở M11.
- **Ảnh VietQR** dùng dịch vụ `img.vietqr.io`, cần mạng và chưa thử.
- **Đã kiểm khi lập kế hoạch (09/11/2026):** `npm run lint` và `npm run build` sạch trên bản hiện tại. Đã đọc route, phân quyền, lớp API, và các màn Login, Apply, Chỉ số, Ghi nhận thanh toán, Sinh viên, Phòng, Dashboard, Chỗ ở.
- **Chưa kiểm:** chưa chạy thử giao diện; `BuildingsPage`, `ProfilePage`, `ContractDetailDrawer` mới đọc lướt, chi tiết sửa sẽ chốt khi tới mốc.
