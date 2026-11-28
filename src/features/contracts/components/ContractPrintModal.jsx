import { Modal, Button, Typography, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { CONTRACT_TERM, ROOM_TIER, GENDER } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatPhone } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';

const { Text } = Typography;

const PRINT_CSS = `@media print {
  @page { size: A4; margin: 14mm 16mm; }
  body.printing-contract * { visibility: hidden !important; }
  body.printing-contract .contract-a4-doc,
  body.printing-contract .contract-a4-doc * { visibility: visible !important; }
  body.printing-contract .contract-a4-doc {
    position: absolute; left: 0; top: 0; width: 100%;
    padding: 0 !important; border: none !important; box-shadow: none !important;
  }
}`;

const printContract = () => {
  document.body.classList.add('printing-contract');
  const cleanup = () => {
    document.body.classList.remove('printing-contract');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
};

const AMENITIES_BY_TIER = {
  high_quality: 'Wifi miễn phí, điều hòa, bình nóng lạnh, tủ cá nhân, giường gỗ / giường tầng, đệm, quạt trần, công trình phụ khép kín (>30m²).',
  standard: 'Wifi miễn phí, bình nóng lạnh, tủ cá nhân, giường tầng, quạt trần, công trình phụ khép kín (>30m²).',
};

/**
 * Mẫu chứng từ số hóa chuẩn A4 — Hợp đồng thuê chỗ ở nội trú KTX HaUI Cơ sở 1.
 * Dùng chung cho cả Cán bộ (ContractDetailDrawer) và Sinh viên (MyResidencePage).
 */
export default function ContractPrintModal({ contract, student, open, onCancel }) {
  if (!contract) return null;

  const st = student || contract.student || {};
  const room = contract.room || {};
  const tier = room.roomTier || contract.preferredRoomTier || 'standard';
  const termInfo = CONTRACT_TERM[contract.term];
  const totalInitial = (contract.totalRoomFee || 0) + (contract.depositAmount || 0);
  const signedDate = contract.startDate ? formatDate(contract.startDate) : formatDate(contract.createdAt);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={820}
      destroyOnHidden
      title={`Bản in Hợp đồng nội trú — ${contract.contractCode}`}
      footer={(
        <Space>
          <Button onClick={onCancel}>Đóng</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={printContract}>
            In / Lưu PDF (A4)
          </Button>
        </Space>
      )}
    >
      <style>{PRINT_CSS}</style>
      <div
        className="contract-a4-doc"
        style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: 6,
          padding: '28px 34px',
          color: '#0F172A',
          fontSize: 13.5,
          lineHeight: 1.65,
        }}
      >
        {/* Quốc hiệu & Cơ quan chủ quản */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              TRUNG TÂM HỖ TRỢ SINH VIÊN (KTX CS1)
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Số: <span className="mono" style={{ fontWeight: 600 }}>{contract.contractCode}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>
              Hà Nội, ngày {signedDate}
            </div>
          </div>
        </div>

        {/* Tiêu đề */}
        <div style={{ textAlign: 'center', margin: '18px 0 16px' }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.4 }}>
            HỢP ĐỒNG THUÊ CHỖ Ở NỘI TRÚ KÝ TÚC XÁ
          </div>
          <div style={{ fontSize: 12.5, color: '#475569' }}>
            (Áp dụng cho Ký túc xá Cơ sở 1 — Nhà A14, A15 · Năm học 2026–2027)
          </div>
        </div>

        {/* Bên A */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>BÊN A (BÊN CHO THUÊ): TRUNG TÂM HỖ TRỢ SINH VIÊN — ĐH CÔNG NGHIỆP HÀ NỘI</div>
          <div>Địa chỉ: Ngõ 296 / Số 298 Đường Cầu Diễn, Phường Tây Tựu, TP. Hà Nội (Văn phòng Tầng 1 nhà A14)</div>
          <div>Điện thoại hỗ trợ: <span className="mono">0964.331.300</span> · Website: https://ssc.haui.edu.vn</div>
        </div>

        {/* Bên B */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>BÊN B (SINH VIÊN NỘI TRÚ):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px' }}>
            <div>Họ và tên: <b>{st.fullName || contract.studentName || '—'}</b></div>
            <div>Mã sinh viên: <b className="mono">{st.studentCode || contract.studentCode || '—'}</b></div>
            <div>Giới tính: {GENDER[st.gender]?.label || '—'}</div>
            <div>Ngày sinh: {st.dob ? formatDate(st.dob) : '—'}</div>
            <div>Số CCCD: <span className="mono">{st.citizenId || '—'}</span></div>
            <div>Điện thoại: <span className="mono">{st.phone ? formatPhone(st.phone) : '—'}</span></div>
            <div>Khoa / Viện: {st.faculty || '—'}</div>
            <div>Lớp: {st.className || '—'}</div>
          </div>
          <div>Email: {st.email || '—'}</div>
          <div>Địa chỉ thường trú: {st.address || '—'}</div>
        </div>

        {/* Điều 1 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>Điều 1. Đối tượng hợp đồng và trang thiết bị phòng ở</div>
          <div>
            Bên A bố trí cho Bên B lưu trú tại <b>Phòng {roomLabelOf(room) || `${contract.buildingCode}-${contract.roomNumber}`}</b>{' '}
            ({room.buildingName || contract.buildingName || 'Nhà A14/A15'}, Tầng {room.floor || '—'} — KTX Cơ sở 1),{' '}
            hạng <b>{ROOM_TIER[tier]?.label || tier}</b>, tiêu chuẩn <b>{room.capacity || contract.preferredCapacity || '—'} sinh viên/phòng</b>.
          </div>
          <div>Trang thiết bị đi kèm: {AMENITIES_BY_TIER[tier] || AMENITIES_BY_TIER.standard}</div>
        </div>

        {/* Điều 2 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>Điều 2. Thời hạn lưu trú và chi phí dịch vụ</div>
          <div>
            1. Gói thời hạn: <b>{termInfo?.label || contract.term}</b> ({termInfo?.hint || ''}).{' '}
            {contract.startDate
              ? <>Hiệu lực từ ngày <b className="mono">{formatDate(contract.startDate)}</b> đến ngày <b className="mono">{formatDate(contract.endDate)}</b>.</>
              : <>Hạn hoàn tất phí giữ chỗ: <b className="mono">{formatDate(contract.paymentDeadline)}</b>.</>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px' }}>Đơn giá phòng ở</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px', textAlign: 'right' }} className="mono">
                  {formatCurrency(contract.pricePerMonth)} / tháng
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px' }}>Tiền phòng cả kỳ ({termInfo?.months || '—'} tháng)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px', textAlign: 'right', fontWeight: 600 }} className="mono">
                  {formatCurrency(contract.totalRoomFee)}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px' }}>Tiền đặt cọc tài sản (hoàn trả sau thanh lý nếu tài sản nguyên vẹn)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px', textAlign: 'right', fontWeight: 600 }} className="mono">
                  {formatCurrency(contract.depositAmount)}
                </td>
              </tr>
              <tr style={{ background: '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px', fontWeight: 700 }}>Tổng phí đầu kỳ (01 hóa đơn gộp)</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }} className="mono">
                  {formatCurrency(totalInitial)}
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            2. Tiền điện, nước sinh hoạt hàng tháng tính theo chỉ số đồng hồ thực tế của phòng và đơn giá quy định của Nhà nước; các thành viên đã Check-in cùng chia sẻ trách nhiệm thanh toán đúng hạn.
          </div>
        </div>

        {/* Điều 3 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700 }}>Điều 3. Nghĩa vụ, chuyển phòng và thanh lý hoàn cọc</div>
          <div>1. Bên B xuất trình mã QR Check-in (<Text code className="mono">{contract.checkinCode || 'Cấp sau thanh toán'}</Text>) cùng CCCD tại văn phòng trực tòa để bàn giao chìa khóa.</div>
          <div>2. Việc chuyển phòng trong kỳ chỉ áp dụng cho phòng cùng hạng, cùng sức chứa, cùng đơn giá và sau khi hoàn tất toàn bộ hóa đơn điện nước phòng hiện tại.</div>
          <div>3. Khi kết thúc hợp đồng hoặc trả phòng sớm, Bên B thanh toán đủ 100% hóa đơn cá nhân và điện nước phòng phát sinh từ tháng Check-in, bàn giao chìa khóa &amp; kiểm kê tài sản để Bên A thanh lý và lập phiếu chi hoàn cọc (khấu trừ nếu làm hư hỏng tài sản theo danh mục quy định).</div>
        </div>

        {/* Chữ ký */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, textAlign: 'center', marginTop: 22 }}>
          <div>
            <div style={{ fontWeight: 700 }}>ĐẠI DIỆN BÊN A</div>
            <div style={{ fontSize: 12, fontStyle: 'italic', marginBottom: 56 }}>(Ký tên, đóng dấu)</div>
            <div style={{ fontWeight: 600 }}>Trung tâm Hỗ trợ sinh viên HaUI</div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>BÊN B (SINH VIÊN)</div>
            <div style={{ fontSize: 12, fontStyle: 'italic', marginBottom: 56 }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ fontWeight: 600 }}>{st.fullName || contract.studentName || ''}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
