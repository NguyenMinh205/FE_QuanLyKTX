# MÔ TẢ ĐỀ TÀI

**Tên đề tài:** Xây dựng hệ thống web quản lý ký túc xá Trường Đại học Công nghiệp Hà Nội
*(HaUI Dormitory Management System — HaUI DMS)*

**Học phần:** Đồ án chuyên ngành
**Nhóm thực hiện:** *(điền tên các thành viên)*
**Giảng viên hướng dẫn:** *(điền tên giảng viên)*
**Ngày lập:** 18/09/2026 · **Cập nhật:** 09/11/2026 (phiên bản tinh gọn v2.0, điều chỉnh theo góp ý của giảng viên và kết quả khảo sát)

---

## 1. Mô tả bài toán

### 1.1. Bối cảnh

Trường Đại học Công nghiệp Hà Nội (HaUI) có nhiều cơ sở đào tạo (Cơ sở 1 – Bắc Từ Liêm, Cơ sở 2 – Tây Tựu, Cơ sở 3 – Hà Nam). Hệ thống ký túc xá gồm các tòa K1, K2, K3, K4…, với các phòng 4, 6 hoặc 8 chỗ, phục vụ nhu cầu nội trú của hàng nghìn sinh viên mỗi năm học.

### 1.2. Vấn đề cần giải quyết

Qua khảo sát, nhóm xác định bốn vấn đề chính trong vận hành:

1. **Áp lực đăng ký đầu năm học.** Hàng nghìn sinh viên nộp đơn trong thời gian ngắn. Tiếp nhận bằng giấy tờ hoặc biểu mẫu trực tuyến tự do dễ gây quá tải, rác dữ liệu và mạo danh sinh viên.
2. **Xung đột phân bổ phòng, giường.** Xếp phòng thủ công hoặc kiểm tra rời rạc khiến nhiều cán bộ thao tác cùng lúc có thể xếp hai sinh viên vào một giường, hoặc xếp nhầm giới tính.
3. **Công nợ điện nước lắt nhắt.** Chia tiền điện nước thành từng hóa đơn lẻ cho mỗi sinh viên trong phòng 4–8 người dẫn đến nợ đọng, người nộp người không, cán bộ khó đối soát.
4. **Cấp tài khoản thiếu kiểm soát.** Cho phép sinh viên tự tạo tài khoản dễ dẫn đến mạo danh mã sinh viên của người khác.

### 1.3. Mục tiêu của hệ thống

**Mục tiêu tổng quát:** xây dựng ứng dụng web quản lý ký túc xá HaUI ở quy mô tinh gọn, tập trung vào đúng các nghiệp vụ thực tế: tiếp nhận đơn, xếp giường, thu tiền và trả phòng.

**Mục tiêu cụ thể:**

| # | Mục tiêu | Tiêu chí đo lường |
|---|---|---|
| 1 | Nộp đơn ở ký túc xá trực tuyến, không cần tài khoản trước | Sinh viên tự nộp đơn trên cổng công khai và tra cứu được tiến độ |
| 2 | Kiểm soát việc cấp tài khoản | Tài khoản chỉ sinh ra khi đơn được duyệt; bắt buộc đổi mật khẩu ở lần đăng nhập đầu |
| 3 | Loại bỏ trùng giường | Khóa giường bằng thao tác cập nhật nguyên tử, không có hai sinh viên cùng một giường |
| 4 | Thu tiền điện nước gọn theo phòng | Mỗi phòng một hóa đơn mỗi tháng, một bạn đại diện thanh toán cho cả phòng |
| 5 | Minh bạch công nợ và tiền cọc | Sinh viên tự xem hóa đơn, lịch sử thanh toán, biết đã nhận lại tiền cọc hay chưa |
| 6 | Cung cấp số liệu tức thời | Tỷ lệ lấp đầy theo tòa, công nợ, doanh thu hiển thị ngay trên màn hình tổng quan |

### 1.4. Phạm vi của hệ thống

**Trong phạm vi:**

- Quản lý tòa nhà, phòng và giường; giá thuê và tiền cọc gắn trực tiếp với từng phòng.
- Quản lý hồ sơ sinh viên, nhập danh sách từ tệp Excel; quản lý tài khoản theo ba vai trò.
- Đăng ký chỗ ở: sinh viên nộp đơn công khai, chọn phòng và giường, chọn gói thuê 6 hoặc 12 tháng → cán bộ duyệt → hệ thống khóa giường, cấp tài khoản qua email và sinh hóa đơn.
- Hợp đồng theo kỳ thuê, trả phòng, thanh lý hợp đồng và xác nhận hoàn tiền cọc.
- Ghi chỉ số điện nước theo bảng lưới hoặc Excel, phát hành hóa đơn theo phòng và thông báo cho cả phòng.
- Thu tiền mặt tại văn phòng, thanh toán bằng mã VietQR động và cán bộ đối soát.
- Cổng thông tin cho sinh viên và màn hình thống kê cho ban quản lý.

**Ngoài phạm vi (đã lược bỏ để phù hợp nguồn lực và thực tế khảo sát):**

- Sinh viên tự đăng ký tài khoản; vai trò chỉ xem báo cáo.
- Gia hạn hợp đồng trực tuyến: sinh viên muốn ở tiếp thì nộp đơn mới ở kỳ sau.
- Sinh viên gửi yêu cầu trả phòng trên hệ thống: sinh viên đến văn phòng làm thủ tục.
- Tính tiền phòng theo số ngày ở thực tế, khấu trừ tiền cọc do hư hỏng tài sản.
- Thu tiền một phần, hủy hóa đơn, lập hóa đơn thủ công, danh mục phí động.
- Dịch vụ nhu yếu phẩm, cổng thanh toán trực tuyến, tác vụ nền theo lịch.
- Ứng dụng di động riêng (hệ thống là web, có hỗ trợ màn hình nhỏ); tích hợp với hệ thống đào tạo của nhà trường.

### 1.5. Đối tượng sử dụng

| Đối tượng | Vai trò trong hệ thống | Nhu cầu chính |
|---|---|---|
| Quản trị viên | Quản lý toàn hệ thống | Quản lý tài khoản, cấu hình tòa nhà và giá phòng, xem báo cáo doanh thu |
| Cán bộ ký túc xá | Nghiệp vụ hằng ngày | Duyệt đơn, chốt điện nước, thu tiền, đối soát, làm thủ tục trả phòng và hoàn cọc |
| Sinh viên nội trú | Người sử dụng dịch vụ | Xem phòng, hợp đồng, hóa đơn, thanh toán, theo dõi tiền cọc |
| Sinh viên đăng ký mới | Khách, chưa có tài khoản | Tra cứu phòng trống, nộp đơn, tra cứu tiến độ đơn |

---

## 2. Xác định yêu cầu

### 2.1. Các tác nhân của hệ thống

| Mã | Tác nhân | Mô tả | Cách có tài khoản |
|---|---|---|---|
| AC-1 | **Admin** — Quản trị viên | Toàn quyền hệ thống; quản lý tài khoản, cấu hình tòa nhà, giá phòng, xem doanh thu | Khởi tạo sẵn khi cài đặt hệ thống |
| AC-2 | **Staff** — Cán bộ KTX | Quản lý sinh viên, duyệt đơn, chốt điện nước, thu tiền, đối soát, trả phòng và hoàn cọc | Quản trị viên tạo |
| AC-3 | **Student** — Sinh viên HaUI | Xem phòng ở, hợp đồng, hóa đơn; thanh toán cá nhân và đại diện phòng | Hệ thống tự cấp qua email khi đơn được duyệt: tên đăng nhập và mật khẩu ban đầu đều là mã sinh viên |
| Guest | **Sinh viên đăng ký mới** | Tra cứu phòng trống, nộp đơn và theo dõi tiến độ đơn | Không cần tài khoản |

### 2.2. Các chức năng chính

Hệ thống được chia thành **tám nhóm chức năng**:

| Mã | Nhóm chức năng | Nội dung chính |
|---|---|---|
| M1 | Xác thực và tài khoản | Đăng nhập bằng email hoặc mã sinh viên, buộc đổi mật khẩu lần đầu, đặt lại mật khẩu, quản lý tài khoản |
| M2 | Hồ sơ sinh viên | Thêm, sửa, tìm kiếm, nhập từ Excel, vô hiệu hóa hồ sơ |
| M3 | Tòa nhà và phòng | Quản lý tòa K1–K4, phòng 4/6/8 chỗ, tự sinh giường, tra cứu phòng trống theo quy tắc ngăn xếp |
| M4 | Đăng ký và hợp đồng | Nộp đơn công khai, duyệt hoặc từ chối đơn, trả phòng, thanh lý, hoàn cọc |
| M5 | Điện nước theo phòng | Ghi chỉ số, phát hành một hóa đơn cho mỗi phòng, thông báo toàn phòng, xem lịch sử |
| M6 | Hóa đơn và thanh toán | Tiền phòng, tiền cọc, điện nước; thu tiền mặt, VietQR động, đối soát |
| M7 | Cổng sinh viên | Phòng ở, bạn cùng phòng, hợp đồng, hóa đơn, thanh toán đại diện, lịch sử thanh toán |
| M8 | Thống kê | Chỉ số tổng quan, lấp đầy theo tòa, doanh thu tiền phòng và điện nước |

### 2.3. Yêu cầu chức năng

Nhóm đặc tả **40 yêu cầu chức năng** có mã truy vết (FR-01 → FR-72), kèm một yêu cầu mở rộng tùy chọn (FR-54b: tự động gạch nợ qua webhook ngân hàng). Các yêu cầu tiêu biểu:

| Mã | Yêu cầu chức năng tiêu biểu |
|---|---|
| FR-01 | Đăng nhập bằng email hoặc mã sinh viên; tài khoản đang dùng mật khẩu khởi tạo bị chuyển sang đổi mật khẩu trước khi làm việc |
| FR-02 | Không cho tự đăng ký tài khoản; tài khoản sinh viên chỉ được tạo khi đơn được duyệt |
| FR-06 | Admin hoặc Staff đặt lại mật khẩu tạm; Staff không được đặt lại cho Admin |
| FR-12b | Nhập danh sách sinh viên từ Excel, báo cáo số dòng thành công và các dòng lỗi |
| FR-23 | Phòng trống lọc theo giới tính, sắp theo tầng thấp trước, số phòng nhỏ trước |
| FR-24 | Tạo phòng thì hệ thống tự sinh đủ số giường theo sức chứa |
| FR-30 | Sinh viên chưa có tài khoản nộp đơn công khai, chọn phòng, giường và gói thuê 6 hoặc 12 tháng |
| FR-32 | Duyệt đơn: khóa giường, kích hoạt hợp đồng, cấp tài khoản qua email, sinh hai hóa đơn (tiền cọc, tiền phòng trọn gói) |
| FR-33 | Từ chối đơn kèm lý do, gửi email thông báo; sinh viên tra cứu tiến độ bằng mã sinh viên và email |
| FR-34 | Thanh lý hợp đồng khi sinh viên và phòng không còn nợ; giải phóng giường |
| FR-35 | Xác nhận đã hoàn tiền cọc khi sinh viên rời ký túc xá; sinh viên xem được trạng thái đã nhận cọc hay chưa |
| FR-40 | Nhập chỉ số điện nước theo bảng lưới của cả tòa, hoặc xuất và nhập lại bằng Excel |
| FR-41 | Chốt và phát hành một hóa đơn điện nước cho mỗi phòng, thông báo tới mọi thành viên kèm mức chia bình quân |
| FR-52 | Cán bộ xác nhận thu tiền mặt tại văn phòng |
| FR-53 | Sinh mã VietQR động, khóa đúng số tiền và nội dung chuyển khoản |
| FR-54 | Cán bộ đối soát tài khoản ngân hàng và xác nhận hóa đơn đã thanh toán |
| FR-62 | Bất kỳ thành viên nào trong phòng cũng có thể đại diện thanh toán hóa đơn điện nước của phòng |
| FR-70 | Màn hình tổng quan: giường, sinh viên nội trú, đơn chờ duyệt, tổng công nợ |
| FR-72 | Thống kê doanh thu theo tháng, tách tiền phòng và tiền điện nước (chỉ Quản trị viên) |

Các **quy tắc nghiệp vụ** làm cơ sở lập trình và kiểm thử:

- **BR-01.** Phòng nam chỉ nhận sinh viên nam, phòng nữ chỉ nhận sinh viên nữ; hệ thống tự lọc và chặn khi lệch giới tính.
- **BR-02.** Tiền phòng thu trọn gói một lần khi duyệt: 6 tháng hoặc 12 tháng.
- **BR-03.** Mỗi phòng một hóa đơn điện nước mỗi tháng, không chia lẻ. Mức bình quân mỗi người chỉ là gợi ý để các bạn tự thu với nhau.
- **BR-04.** Chỉ thanh lý hợp đồng khi không còn hóa đơn chưa thanh toán, gồm hóa đơn cá nhân và hóa đơn điện nước của phòng.
- **BR-05.** Khóa giường bằng một thao tác cập nhật nguyên tử có điều kiện giường còn trống, không dùng luồng đọc rồi ghi.
- **BR-06.** Tài khoản sinh viên chỉ sinh ra khi duyệt đơn; tên đăng nhập và mật khẩu ban đầu là mã sinh viên; bắt buộc đổi mật khẩu lần đầu.
- **BR-07.** Phòng trống được ưu tiên theo ngăn xếp: tầng thấp trước, số phòng nhỏ trước.
- **BR-08.** Chỉ xác nhận hoàn cọc với hợp đồng đã thanh lý, mỗi hợp đồng một lần. Vì BR-04 đã bảo đảm sinh viên hết nợ, số tiền hoàn bằng đúng tiền cọc đã nộp. Hoàn cọc thực hiện tại văn phòng, không tính vào doanh thu.

### 2.4. Yêu cầu phi chức năng

Nhóm đặc tả **11 yêu cầu phi chức năng**, tiêu biểu:

| Loại | Yêu cầu |
|---|---|
| Hiệu năng | 95% yêu cầu tra cứu phòng trống và hóa đơn phản hồi dưới 1 giây; tổng hợp báo cáo dưới 3 giây |
| Khả năng chịu tải | Tối thiểu 500 sinh viên nộp đơn đồng thời trong ngày đầu mở cổng |
| Toàn vẹn dữ liệu | Không xếp hai sinh viên vào cùng một giường; chỉ số điện nước mới luôn lớn hơn hoặc bằng chỉ số cũ |
| Bảo mật | Mật khẩu băm bằng bcrypt; xác thực bằng JSON Web Token hạn 7 ngày; phân quyền theo ba vai trò ở phía máy chủ |
| Bảo mật | Sinh viên chỉ truy cập được dữ liệu của mình và của phòng mình; bạn cùng phòng chỉ hiện họ tên và mã sinh viên |
| Độ sẵn sàng | Hoạt động liên tục tối thiểu 99,5% trong kỳ đăng ký và vận hành |
| Khả dụng | Giao diện hiển thị tốt trên máy tính, máy tính bảng và điện thoại |
| Ngôn ngữ | Toàn bộ giao diện, thông báo lỗi và email bằng tiếng Việt |

### 2.5. Danh sách màn hình

| Khu vực | Màn hình |
|---|---|
| Công khai (3) | Đăng nhập · Nộp đơn đăng ký · Tra cứu tiến độ đơn |
| Quản trị (11) | Tổng quan · Sinh viên · Tòa nhà · Phòng · Duyệt đơn · Hợp đồng · Chỉ số điện nước · Hóa đơn · Chi tiết hóa đơn · Thanh toán · Tài khoản (chỉ Quản trị viên) |
| Cổng sinh viên (4) | Trang chủ · Chỗ ở và hợp đồng · Hóa đơn của tôi · Hồ sơ cá nhân |
| Dùng chung (1) | Đổi mật khẩu |

---

## 3. Mô hình hóa hệ thống

### 3.1. Biểu đồ Use Case

Biểu đồ tổng quát gồm ba tác nhân người dùng và nhóm khách, với 14 use case; có biểu đồ phân rã cho Quản trị viên, Cán bộ và Sinh viên. Nhóm đặc tả chi tiết **mười use case cốt lõi** (tiền điều kiện, luồng chính, luồng rẽ nhánh, hậu điều kiện):

| Mã | Use case | Tác nhân chính |
|---|---|---|
| UC-01 | Nộp đơn đăng ký ký túc xá trực tuyến | Sinh viên đăng ký mới |
| UC-02 | Duyệt đơn, khóa giường, cấp tài khoản và sinh hóa đơn | Staff |
| UC-03 | Chốt số điện nước, thông báo toàn phòng | Staff |
| UC-04 | Đăng nhập và bắt buộc đổi mật khẩu lần đầu | Student |
| UC-05 | Thanh toán hóa đơn bằng VietQR | Student |
| UC-06 | Thu tiền mặt tại văn phòng và gạch nợ | Staff, Student |
| UC-07 | Trả phòng, thanh lý hợp đồng và xác nhận hoàn cọc | Staff, Student |
| UC-08 | Quản lý tòa nhà, tạo phòng tự sinh giường | Admin, Staff |
| UC-09 | Quản lý hồ sơ sinh viên, nhập từ Excel | Admin, Staff |
| UC-10 | Thống kê lấp đầy và doanh thu | Admin, Staff |

### 3.2. Biểu đồ Activity

Dùng cho bốn quy trình nghiệp vụ chính:

- **Nộp đơn, duyệt đơn và cấp tài khoản:** kèm nhánh từ chối đơn và nhánh giường vừa có người nhận.
- **Đăng nhập và đổi mật khẩu lần đầu.**
- **Chốt điện nước và thanh toán đại diện phòng:** kèm nhánh chỉ số mới nhỏ hơn chỉ số cũ.
- **Trả phòng và hoàn cọc:** sinh viên hết kỳ ở hoặc xin trả phòng → cán bộ kiểm tra công nợ → (còn nợ thì yêu cầu thanh toán trước) → kiểm kê tài sản, thu hồi chìa khóa → giải phóng giường, hợp đồng chuyển sang đã thanh lý → hoàn tiền cọc tại văn phòng → cán bộ xác nhận đã hoàn cọc. Hợp đồng đã hết hạn mà sinh viên không ở tiếp cũng đi qua các bước này.

### 3.3. Biểu đồ Sequence

- **Duyệt đơn:** giao diện → máy chủ → cơ sở dữ liệu, làm rõ bước khóa giường nguyên tử, cấp tài khoản, gửi email và sinh hai hóa đơn.
- **Thanh toán VietQR:** sinh viên → hệ thống sinh mã → ứng dụng ngân hàng → cán bộ đối soát và xác nhận → cập nhật hóa đơn.
- **Chốt điện nước:** cán bộ nhập chỉ số → máy chủ tính tiền → phát hành hóa đơn phòng → thông báo cho các thành viên.

---

## 4. Thiết kế cơ sở dữ liệu

### 4.1. Các thực thể chính

So với thiết kế ban đầu, nhóm rút gọn còn **8 thực thể**: giường và giá nhúng vào phòng, đơn đăng ký và lưu trú gộp vào hợp đồng, bỏ danh mục phí động.

| Nhóm | Thực thể | Vai trò |
|---|---|---|
| Người dùng | `User`, `Student` | Tài khoản đăng nhập và hồ sơ sinh viên |
| Cơ sở vật chất | `Building`, `Room` | Tòa nhà; phòng kèm sức chứa, giá thuê, tiền cọc và danh sách giường nhúng |
| Lưu trú | `Contract` | Đơn đăng ký và hợp đồng theo kỳ 6 hoặc 12 tháng, kèm trạng thái hoàn cọc |
| Tài chính | `UtilityReading`, `Invoice`, `Payment` | Chỉ số điện nước, hóa đơn, giao dịch thanh toán |

Trạng thái hợp đồng: chờ duyệt (`pending`), đang hiệu lực (`active`), hết hạn (`expired`), đã thanh lý (`terminated`), bị từ chối (`rejected`). Hóa đơn có ba loại (tiền phòng cả kỳ, tiền cọc, điện nước) và hai trạng thái (chưa thanh toán, đã thanh toán).

### 4.2. Quan hệ giữa các thực thể

| Quan hệ | Ý nghĩa |
|---|---|
| `Building` 1 — N `Room` | Một tòa nhà có nhiều phòng |
| `User` 1 — 1 `Student` | Mỗi hồ sơ sinh viên liên kết tối đa một tài khoản; hồ sơ mới nộp đơn chưa có tài khoản |
| `Student` 1 — N `Contract` | Một sinh viên có thể có nhiều hợp đồng qua các kỳ |
| `Room` 1 — N `Contract` | Mỗi hợp đồng gắn với một phòng và một số giường cụ thể |
| `Contract` 1 — N `Invoice` | Mỗi hợp đồng sinh hóa đơn tiền cọc và tiền phòng |
| `Room` 1 — N `UtilityReading` | Mỗi phòng có một bản ghi chỉ số cho mỗi tháng |
| `UtilityReading` 1 — 1 `Invoice` | Mỗi bản ghi chỉ số phát hành một hóa đơn điện nước của phòng |
| `Invoice` 1 — N `Payment` | Giao dịch thanh toán của hóa đơn, ghi hình thức tiền mặt hoặc VietQR |

### 4.3. Khóa, ràng buộc và trường đáng chú ý

- **Ràng buộc duy nhất:** mã sinh viên, email tài khoản, mã hợp đồng, mã hóa đơn, mã phiếu thu; cặp (tòa nhà, số phòng); cặp (phòng, tháng ghi chỉ số).
- **Ràng buộc nghiệp vụ:** giới tính phòng và sức chứa không đổi được khi phòng đang có người ở; giá thuê và tiền cọc được sao chép vào hợp đồng tại thời điểm ký.
- **Theo dõi hoàn cọc trên `Contract`:** `isDepositRefunded` (đã hoàn cọc chưa, mặc định chưa), `depositRefundedAt` (thời điểm hoàn), `depositRefundedBy` (cán bộ xác nhận).
- **Quy ước tiền:** mọi trường tiền lưu số nguyên, đơn vị đồng.

Nhóm sử dụng cơ sở dữ liệu MongoDB. Trong báo cáo, mô hình thực thể – quan hệ được trình bày ở dạng biểu đồ ERD kèm mô tả từng bảng và các ràng buộc nêu trên.

---

## 5. Công nghệ sử dụng

| Thành phần | Công nghệ | Lý do lựa chọn |
|---|---|---|
| Giao diện người dùng | React, Vite, thư viện giao diện Ant Design | Có sẵn bảng biểu và biểu mẫu chuẩn cho ứng dụng quản lý |
| Máy chủ ứng dụng | Node.js, Express, kiến trúc Modular Monolith | Cùng ngôn ngữ JavaScript với giao diện, phù hợp nhóm 5 người |
| Cơ sở dữ liệu | MongoDB kết hợp thư viện Mongoose | Giường nhúng trong phòng, cập nhật có điều kiện nguyên tử phù hợp bài toán khóa giường |
| Xác thực | JSON Web Token, bcrypt | Phù hợp kiến trúc tách rời giao diện và máy chủ |
| Thanh toán | Mã VietQR động | Sinh viên dùng ứng dụng ngân hàng sẵn có, không cần tích hợp cổng thanh toán |
| Thông báo | Email, thông báo trên cổng sinh viên | Gửi tài khoản, kết quả duyệt đơn và tiền điện nước |
| Quản lý mã nguồn | Git, GitHub | Làm việc nhóm theo nhánh, xem lại lịch sử thay đổi |

Toàn bộ mã nguồn do nhóm tự xây dựng; các thành viên nắm được vai trò của từng thành phần và giải thích được luồng xử lý chính của chương trình.

---

## 6. Kế hoạch kiểm thử

| Loại kiểm thử | Cách làm |
|---|---|
| Kiểm thử chức năng theo test case | Bộ test case cho nộp đơn, duyệt đơn và cấp tài khoản, đổi mật khẩu lần đầu, chốt điện nước, thu tiền, VietQR, trả phòng và hoàn cọc |
| Kiểm thử quy tắc nghiệp vụ | Mỗi quy tắc BR-01 → BR-08 có ít nhất một test case, ví dụ: duyệt hai đơn vào cùng một giường, thanh lý khi phòng còn nợ điện nước, xác nhận hoàn cọc khi hợp đồng chưa thanh lý |
| Kiểm thử phân quyền | Đăng nhập lần lượt ba vai trò và khách, kiểm tra từng đối tượng chỉ thấy và làm được đúng phần việc |
| Kiểm thử tích hợp | Chạy trọn các luồng chính từ giao diện xuống cơ sở dữ liệu trên một cơ sở dữ liệu thử nghiệm riêng |
| Kiểm thử chấp nhận | Biên bản nghiệm thu theo từng màn hình, ghi nhận lỗi phát hiện và kết quả xử lý |

---

## 7. Kết quả dự kiến

Khi hoàn thành, nhóm sẽ bàn giao:

1. Hệ thống web chạy được với đầy đủ tám nhóm chức năng, gồm cổng công khai, khu quản trị và cổng sinh viên (19 màn hình).
2. Bộ tài liệu phân tích – thiết kế: đặc tả yêu cầu, quy trình nghiệp vụ, biểu đồ UML, thiết kế cơ sở dữ liệu, đặc tả API.
3. Bộ test case và biên bản kiểm thử.
4. Báo cáo đồ án và bài trình bày bảo vệ.

---

## 8. Phân công dự kiến

| Thành viên | Phụ trách chính |
|---|---|
| *(tên)* | Phân tích yêu cầu, biểu đồ UML, thiết kế cơ sở dữ liệu |
| *(tên)* | Lập trình phía máy chủ: API, nghiệp vụ, cơ sở dữ liệu |
| *(tên)* | Lập trình phía giao diện: khu quản trị và cổng sinh viên |
| *(tên)* | Kiểm thử, viết báo cáo, chuẩn bị bảo vệ |

*(Nhóm điều chỉnh bảng này theo thực tế phân công.)*
