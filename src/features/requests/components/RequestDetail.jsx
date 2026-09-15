import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Tag, Typography, Skeleton, Alert, Radio, Checkbox, Space, App,
} from 'antd';
import {
  LogoutOutlined, SyncOutlined, WalletOutlined, FileDoneOutlined, CheckCircleFilled, CloseCircleOutlined,
  ExclamationCircleFilled, InfoCircleOutlined, CalendarOutlined, ExportOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { requestApi } from '../api/request.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { GENDER, REQUEST_TYPE, REQUEST_STATUS } from '../../../constants/statuses';
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '../../../utils/formatter';
import { initialsOf } from '../../applications/utils/applicationView';
import SettlementBreakdown from './SettlementBreakdown';
import RejectRequestModal from './RejectRequestModal';
import {
  REFUND_METHODS, bedTextOf, daysFromToday, extraMonthsOf, periodText, roomOfBedCode,
} from '../utils/requestView';

const { Text, Title } = Typography;

function CardHead({ icon, bg = '#E6F4FF', title, sub, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
        <div>
          <Text strong style={{ fontSize: 16 }}>{title}</Text>
          {sub && <div><Text type="secondary" style={{ fontSize: 13 }}>{sub}</Text></div>}
        </div>
      </div>
      {extra}
    </div>
  );
}

function Box({ label, children }) {
  return (
    <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '10px 12px' }}>
      <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
      <div style={{ marginTop: 2 }}>{children}</div>
    </div>
  );
}

function CheckRow({ ok, title, hint, tag, action }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 8,
      background: ok ? '#F6FFED' : '#FFFBE6', border: `1px solid ${ok ? '#D9F7BE' : '#FFE58F'}`,
    }}>
      {ok
        ? <CheckCircleFilled style={{ fontSize: 20, color: '#52C41A' }} />
        : <ExclamationCircleFilled style={{ fontSize: 20, color: '#FAAD14' }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong>{title}</Text>
        {hint && <div><Text type="secondary" style={{ fontSize: 12 }}>{hint}</Text></div>}
      </div>
      {action || (tag && <Tag color={ok ? 'success' : 'warning'} style={{ margin: 0 }}>{tag}</Tag>)}
    </div>
  );
}

/**
 * Khung chi tiết yêu cầu gia hạn / trả phòng — SCR-41.
 * Viewer không gọi được GET /requests/:id (API.md mục 9) → chỉ hiện thông tin có sẵn trong danh sách.
 */
export default function RequestDetail({ request: listItem, canReview, onProcessed }) {
  const navigate = useNavigate();
  const { modal, message, notification } = App.useApp();
  const [assetsChecked, setAssetsChecked] = useState(false);
  const [refundMethod, setRefundMethod] = useState('cash');
  const [approving, setApproving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: detail, loading, error } = useApi(
    () => (canReview ? requestApi.getById(listItem.id) : Promise.resolve({ data: { data: null } })),
    [listItem.id, canReview],
  );
  const r = detail || listItem;
  const isCheckout = r.type === 'checkout';
  const isPending = r.status === 'pending';
  const preview = detail?.settlementPreview;
  const checklist = detail?.checklist;

  // ---------------- duyệt
  const showSettlementResult = (s, title) => modal.success({
    title, width: 520, okText: 'Đóng',
    content: (
      <div style={{ marginTop: 8 }}>
        <SettlementBreakdown s={s} final />
        {s.refundMethod && <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Hình thức hoàn: {REFUND_METHODS.find((m) => m.value === s.refundMethod)?.label} — đã ghi nhận phiếu hoàn tiền.</Text>}
        {s.cancelledSupplyOrders > 0 && <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>Đã tự hủy {s.cancelledSupplyOrders} đơn nhu yếu phẩm chưa thanh toán.</Text>}
      </div>
    ),
  });

  const callApprove = async (forceConfirm = false) => {
    setApproving(true);
    setActionError(null);
    try {
      const body = isCheckout ? { refundMethod, ...(forceConfirm ? { forceConfirm: true } : {}) } : {};
      const res = await requestApi.approve(r.id, body);
      const data = res.data.data;
      if (isCheckout) {
        showSettlementResult(data.settlement, `Đã duyệt trả phòng của ${r.studentName}`);
      } else {
        notification.success({
          title: `Đã gia hạn hợp đồng ${r.contractCode}`,
          description: `Tới ${formatDate(data.renewal?.newEndDate)} (+${data.renewal?.extraMonths} tháng)`,
          duration: 6,
        });
      }
      onProcessed();
    } catch (err) {
      const code = getErrorCode(err);
      if (code === 'STUDENT_HAS_DEBT') {
        // BR-75: xác nhận lần hai rồi gửi lại với forceConfirm
        const amount = err.response?.data?.data?.outstandingDebt;
        modal.confirm({
          title: `Sinh viên còn nợ ${formatCurrency(amount)}. Vẫn duyệt?`,
          icon: <ExclamationCircleFilled style={{ color: '#FF4D4F' }} />,
          content: 'Công nợ sẽ được trừ vào tiền cọc. Phần còn thiếu (nếu có) được lập thành hóa đơn quyết toán cho sinh viên.',
          okText: 'Vẫn duyệt trả phòng', okButtonProps: { danger: true }, cancelText: 'Xem lại',
          onOk: () => callApprove(true),
        });
      } else if (code === 'REQUEST_NOT_PENDING') {
        message.warning(getErrorMessage(err));
        onProcessed();
      } else {
        setActionError(getErrorMessage(err));
      }
    } finally {
      setApproving(false);
    }
  };

  const startApprove = () => {
    // Còn nợ → gọi thẳng API, modal STUDENT_HAS_DEBT chính là bước xác nhận (tránh hỏi hai lần)
    if (isCheckout && detail?.outstandingDebt > 0) { callApprove(false); return; }
    modal.confirm({
      title: isCheckout ? `Duyệt trả phòng cho ${r.studentName}?` : `Duyệt gia hạn hợp đồng ${r.contractCode}?`,
      icon: <CheckCircleOutlined style={{ color: '#1677FF' }} />,
      content: isCheckout
        ? `Hợp đồng chấm dứt, giường ${bedTextOf(r.bedCode)} trả về trống. Hoàn ${formatCurrency(preview?.refundAmount)} bằng ${REFUND_METHODS.find((m) => m.value === refundMethod)?.label.toLowerCase()}.`
        : `Hợp đồng kéo dài tới ${formatDate(r.requestedEndDate)}. Hóa đơn tiền phòng các kỳ gia hạn được tạo theo lịch lập hóa đơn hằng tháng.`,
      okText: 'Duyệt', cancelText: 'Hủy',
      onOk: () => callApprove(false),
    });
  };

  // ---------------- hiển thị
  if (canReview && error) return <Card><Alert type="error" showIcon title={error} /></Card>;
  if (canReview && loading && !detail) return <Card><Skeleton active avatar paragraph={{ rows: 10 }} /></Card>;

  const student = detail?.student;
  const contract = detail?.contract;
  const currentEnd = detail?.renewalPreview?.currentEndDate ?? r.renewal?.previousEndDate ?? r.contractEndDate;
  const extraMonths = extraMonthsOf(currentEnd, r.requestedEndDate);
  const checkoutIn = isCheckout && r.requestedEndDate ? daysFromToday(r.requestedEndDate) : null;
  const doneCount = checklist ? [checklist.utilityReadingRecorded, checklist.readySupplyOrders === 0, assetsChecked].filter(Boolean).length : 0;

  let approveLabel = 'Duyệt gia hạn';
  if (isCheckout) {
    if (preview?.refundAmount > 0) approveLabel = `Duyệt và hoàn ${formatCurrency(preview.refundAmount)}`;
    else if (preview?.studentStillOwes > 0) approveLabel = `Duyệt và lập hóa đơn ${formatCurrency(preview.studentStillOwes)}`;
    else approveLabel = 'Duyệt trả phòng';
  }
  const approveDisabled = isCheckout && !assetsChecked;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* ---------- Sinh viên ---------- */}
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#E6F4FF', color: '#1677FF', fontSize: 20, fontWeight: 600, display: 'grid', placeItems: 'center' }}>
            {initialsOf(r.studentName)}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Space size={8} wrap>
              <Title level={4} style={{ margin: 0 }}>{r.studentName}</Title>
              {student?.gender && <Tag style={{ margin: 0 }}>{GENDER[student.gender]?.label}</Tag>}
              {student?.className && <Tag style={{ margin: 0 }}>{student.className}</Tag>}
            </Space>
            <div>
              <Text type="secondary">
                Mã SV: <Text>{r.studentCode}</Text>
                {student?.phone && <> · SĐT: <Text>{formatPhone(student.phone)}</Text></>}
                {' · '}Phòng: <Text>{roomOfBedCode(r.bedCode)} ({r.buildingName})</Text>
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- Thông tin yêu cầu ---------- */}
      <Card>
        <CardHead
          icon={isCheckout ? <LogoutOutlined style={{ color: '#722ED1', fontSize: 18 }} /> : <SyncOutlined style={{ color: '#1677FF', fontSize: 18 }} />}
          bg={isCheckout ? '#F9F0FF' : '#E6F4FF'}
          title={isCheckout ? 'Thông tin yêu cầu trả phòng' : 'Thông tin yêu cầu gia hạn'}
          sub={`${r.requestCode ? `Mã ${r.requestCode} · ` : ''}Gửi lúc ${formatDateTime(r.createdAt)}`}
          extra={(
            <Space size={6}>
              <Tag color={REQUEST_TYPE[r.type]?.color} style={{ margin: 0 }}>{REQUEST_TYPE[r.type]?.label}</Tag>
              {!isPending && <Tag color={REQUEST_STATUS[r.status]?.color} style={{ margin: 0 }}>{REQUEST_STATUS[r.status]?.label}</Tag>}
            </Space>
          )}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <Box label="Hợp đồng lưu trú">
            <a onClick={() => navigate(`/admin/contracts?search=${encodeURIComponent(r.contractCode)}`)} style={{ fontWeight: 500 }}>
              {r.contractCode} <ExportOutlined />
            </a>
          </Box>
          <Box label="Phòng / vị trí giường">
            <Text strong>{bedTextOf(r.bedCode)}</Text>{contract?.roomTypeName && <Text type="secondary"> ({contract.roomTypeName})</Text>}
          </Box>
          {isCheckout ? (
            <>
              <Box label="Ngày dự kiến bàn giao phòng">
                <Text strong style={{ fontSize: 16 }}><CalendarOutlined style={{ color: '#1677FF' }} /> {formatDate(r.requestedEndDate)}</Text>
                {isPending && checkoutIn !== null && (
                  <Text type="secondary"> ({checkoutIn >= 0 ? `còn ${checkoutIn} ngày` : `đã qua ${-checkoutIn} ngày`})</Text>
                )}
              </Box>
              <Box label="Thời hạn hợp đồng gốc">
                <Text strong>{formatDate(contract?.startDate)} → {formatDate(contract?.endDate ?? r.contractEndDate)}</Text>
              </Box>
            </>
          ) : (
            <>
              <Box label="Ngày kết thúc hiện tại → ngày đề nghị">
                <Text strong style={{ fontSize: 16 }}>{formatDate(currentEnd)} → {formatDate(r.requestedEndDate)}</Text>
              </Box>
              <Box label="Thời gian gia hạn thêm">
                <Text strong style={{ fontSize: 16, color: '#1677FF' }}>+{extraMonths} tháng</Text>
                {contract?.monthlyPrice && <Text type="secondary"> · {formatCurrency(contract.monthlyPrice)}/tháng</Text>}
              </Box>
            </>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Lý do của sinh viên:</Text>
          <div style={{ marginTop: 6, padding: '10px 14px', background: '#FAFAFA', borderLeft: '3px solid #D9D9D9', borderRadius: 4 }}>
            <Text italic>“{r.reason || '—'}”</Text>
          </div>
        </div>
      </Card>

      {!canReview && (
        <Alert type="info" showIcon title="Chi tiết công nợ, quyết toán và thao tác duyệt chỉ dành cho quản trị viên và nhân viên." />
      )}

      {/* ---------- Gia hạn chờ duyệt ---------- */}
      {canReview && !isCheckout && isPending && detail && (
        <Card>
          <CardHead icon={<FileDoneOutlined style={{ color: '#1677FF', fontSize: 18 }} />} title="Sau khi duyệt gia hạn" />
          <div style={{ display: 'grid', gap: 8 }}>
            <Text><CheckCircleFilled style={{ color: '#52C41A' }} /> Hợp đồng {r.contractCode} kéo dài tới <b>{formatDate(r.requestedEndDate)}</b> (+{extraMonths} tháng).</Text>
            <Text><CheckCircleFilled style={{ color: '#52C41A' }} /> Tiền phòng các kỳ gia hạn được lập hóa đơn theo tháng, giá giữ nguyên {formatCurrency(contract?.monthlyPrice)}/tháng.</Text>
            <Text><CheckCircleFilled style={{ color: '#52C41A' }} /> Không thu thêm tiền cọc.</Text>
          </div>
          {detail.outstandingDebt > 0 && (
            <Alert
              style={{ marginTop: 16 }} type="warning" showIcon
              title={`Sinh viên đang nợ ${formatCurrency(detail.outstandingDebt)} (${detail.unpaidInvoices.length} hóa đơn)`}
              description="Công nợ không chặn việc gia hạn. Có thể nhắc sinh viên thanh toán trước khi duyệt."
            />
          )}
        </Card>
      )}

      {/* ---------- Trả phòng chờ duyệt: quyết toán ---------- */}
      {canReview && isCheckout && isPending && preview && (
        <Card>
          <CardHead
            icon={<WalletOutlined style={{ color: preview.studentStillOwes > 0 ? '#CF1322' : '#389E0D', fontSize: 18 }} />}
            bg={preview.studentStillOwes > 0 ? '#FFF1F0' : '#F6FFED'}
            title="Quyết toán tiền cọc"
            sub="Tạm tính theo ngày dự kiến bàn giao — số chốt hiện ngay sau khi duyệt"
            extra={preview.studentStillOwes > 0
              ? <Tag color="error" style={{ margin: 0 }}>Công nợ vượt tiền cọc</Tag>
              : <Tag color="success" style={{ margin: 0 }}>Hoàn cọc</Tag>}
          />
          <SettlementBreakdown s={preview} unpaidInvoices={detail.unpaidInvoices} />
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 12 }}>
            <InfoCircleOutlined /> Đơn nhu yếu phẩm chưa thanh toán sẽ tự hủy, không trừ vào tiền cọc
            {preview.cancelledSupplyOrders > 0 ? ` (${preview.cancelledSupplyOrders} đơn).` : ' (hiện không có đơn nào).'}
          </Text>
          {preview.refundAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <Text strong>Hình thức hoàn tiền:</Text>
              <Radio.Group options={REFUND_METHODS} value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} disabled={approving} />
            </div>
          )}
        </Card>
      )}

      {/* ---------- Trả phòng chờ duyệt: kiểm tra ---------- */}
      {canReview && isCheckout && isPending && checklist && (
        <Card>
          <CardHead
            icon={<FileDoneOutlined style={{ color: '#595959', fontSize: 18 }} />} bg="#F5F5F5"
            title="Kiểm tra trước khi duyệt"
            sub="Điều kiện bàn giao phòng"
            extra={<Tag color={doneCount === 3 ? 'success' : 'default'} style={{ margin: 0 }}>{doneCount}/3 điều kiện</Tag>}
          />
          <div style={{ display: 'grid', gap: 8 }}>
            <CheckRow
              ok={checklist.utilityReadingRecorded}
              title={checklist.utilityReadingRecorded
                ? `Đã có chỉ số điện nước tháng ${periodText(checklist.utilityPeriod)}`
                : `Chưa có chỉ số điện nước tháng ${periodText(checklist.utilityPeriod)}`}
              hint={checklist.utilityReadingRecorded ? null : 'Nên nhập chỉ số trước khi duyệt để tiền điện nước kỳ cuối được tính vào công nợ'}
              tag={checklist.utilityReadingRecorded ? 'Đã chốt' : null}
              action={!checklist.utilityReadingRecorded && <Button size="small" onClick={() => navigate('/admin/utility-readings')}>Nhập chỉ số</Button>}
            />
            <CheckRow
              ok={checklist.readySupplyOrders === 0}
              title={checklist.readySupplyOrders === 0
                ? 'Không có đơn nhu yếu phẩm chờ nhận'
                : `Còn ${checklist.readySupplyOrders} đơn nhu yếu phẩm đã thanh toán chưa giao`}
              hint={checklist.readySupplyOrders === 0 ? null : 'Giao hàng cho sinh viên trước khi duyệt — đơn đã thanh toán không bị hủy'}
              tag={checklist.readySupplyOrders === 0 ? 'Không tồn đọng' : null}
              action={checklist.readySupplyOrders > 0 && <Button size="small" onClick={() => navigate('/admin/supplies')}>Xem đơn</Button>}
            />
            <label style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
              background: assetsChecked ? '#F0F7FF' : '#fff', border: `1px solid ${assetsChecked ? '#91CAFF' : '#D9D9D9'}`,
            }}>
              <Checkbox checked={assetsChecked} onChange={(e) => setAssetsChecked(e.target.checked)} style={{ marginTop: 2 }} />
              <div>
                <Text strong>Đã kiểm tra tài sản phòng và thu hồi chìa khóa</Text>
                {!assetsChecked && <div><Text type="danger" style={{ fontSize: 12 }}>* Bắt buộc kiểm tra thực tế tại phòng trước khi duyệt</Text></div>}
              </div>
            </label>
          </div>
        </Card>
      )}

      {/* ---------- Đã xử lý ---------- */}
      {!isPending && (
        <Card>
          <CardHead
            icon={<FileDoneOutlined style={{ color: '#1677FF', fontSize: 18 }} />}
            title="Kết quả xử lý"
            sub={r.reviewedAt ? `Xử lý lúc ${formatDateTime(r.reviewedAt)}` : null}
            extra={<Tag color={REQUEST_STATUS[r.status]?.color} style={{ margin: 0 }}>{REQUEST_STATUS[r.status]?.label}</Tag>}
          />
          {r.status === 'approved' && !isCheckout && r.renewal && (
            <Text>Đã gia hạn hợp đồng từ <b>{formatDate(r.renewal.previousEndDate)}</b> tới <b>{formatDate(r.renewal.newEndDate)}</b> (+{r.renewal.extraMonths} tháng).</Text>
          )}
          {r.status === 'approved' && isCheckout && r.settlement && (
            <>
              <SettlementBreakdown s={r.settlement} final />
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Trả phòng ngày {formatDate(r.settlement.checkoutDate)}
                {r.settlement.refundMethod ? ` · hoàn bằng ${REFUND_METHODS.find((m) => m.value === r.settlement.refundMethod)?.label.toLowerCase()}` : ''}
              </Text>
            </>
          )}
          {r.status === 'rejected' && <Alert type="error" showIcon title="Lý do từ chối" description={r.reviewNote || '—'} />}
          {r.status === 'cancelled' && <Alert type="info" showIcon title="Yêu cầu đã hủy (sinh viên tự hủy hoặc hợp đồng đã kết thúc)" />}
        </Card>
      )}

      {/* ---------- Thanh hành động ---------- */}
      {canReview && isPending && detail && (
        <Card style={{ position: 'sticky', bottom: 0, zIndex: 2, boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '12px 16px' } }}>
          {actionError && <Alert type="error" showIcon closable title={actionError} onClose={() => setActionError(null)} style={{ marginBottom: 12 }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Text type={approveDisabled ? 'warning' : 'secondary'} style={{ flex: 1, minWidth: 220 }}>
              <InfoCircleOutlined /> {isCheckout
                ? (approveDisabled ? 'Xác nhận đã kiểm tra tài sản để bật nút duyệt.' : `Duyệt sẽ trả giường ${bedTextOf(r.bedCode)} về trống và chấm dứt hợp đồng.`)
                : `Duyệt sẽ kéo dài hợp đồng tới ${formatDate(r.requestedEndDate)}.`}
            </Text>
            <Space wrap>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setRejectOpen(true)} disabled={approving}>Từ chối</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={startApprove} loading={approving} disabled={approveDisabled}>
                {approveLabel}
              </Button>
            </Space>
          </div>
        </Card>
      )}

      <RejectRequestModal
        request={r}
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onRejected={() => { setRejectOpen(false); onProcessed(); }}
      />
    </div>
  );
}
