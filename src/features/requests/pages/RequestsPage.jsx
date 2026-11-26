import { useState } from 'react';
import {
  Button, Card, Select, Segmented, Typography, Space, Modal, Form, Input, Alert, Tag, Badge, App,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { requestApi } from '../api/request.api';
import { applyApi } from '../../apply/api/apply.api';
import {
  REQUEST_TYPE_OPTIONS, REPAIR_CATEGORY, REQUEST_STATUS, ROOM_TIER,
} from '../../../constants/statuses';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatDateTime } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import StatusTag from '../../../components/StatusTag';

const { Text } = Typography;

const TERMINAL = new Set(['completed', 'rejected', 'cancelled']);
const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'completed', 'rejected'];
const STATUS_LABELS = {
  all: 'Tất cả',
  pending: 'Chờ tiếp nhận',
  in_progress: 'Đang xử lý',
  completed: 'Hoàn tất',
  rejected: 'Từ chối',
};

/** Xử lý Phiếu yêu cầu SV (Manager & Staff; Riêng duyệt chuyển phòng nguyên tử chỉ Manager!) */
export default function RequestsPage() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const canApproveTransfer = can(user, 'request:approveTransfer');

  const [filters, setFilters] = useState({
    page: 1, limit: 20, search: '', status: 'all', type: undefined,
  });
  const [handling, setHandling] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data, meta, loading, error, refetch } = useApi(
    () => requestApi.getList({
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      type: filters.type,
    }),
    [filters],
  );
  const summary = meta?.summary;

  const nextStatus = Form.useWatch('status', form);
  const isTransferApprove = handling?.type === 'transfer' && ['approved', 'completed'].includes(nextStatus);

  const { data: targetRooms } = useApi(
    () => (handling && handling.type === 'transfer' && handling.room
      ? applyApi.getAvailableRooms({ campus: handling.room.campus, gender: handling.student?.gender, limit: 100 })
      : Promise.resolve({ data: { data: { items: [] } } })),
    [handling?.id],
  );

  const openHandle = (reqItem) => {
    setHandling(reqItem);
    form.setFieldsValue({
      status: reqItem.status === 'pending' ? 'in_progress' : 'completed',
      targetRoomId: reqItem.targetRoom?.id || undefined,
      handlerNote: reqItem.handlerNote || '',
    });
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await requestApi.updateStatus(handling.id, {
        status: values.status,
        handlerNote: values.handlerNote?.trim() || '',
        ...(isTransferApprove && values.targetRoomId ? { targetRoomId: values.targetRoomId } : {}),
      });
      message.success(res.data.message);
      setHandling(null);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const statusOptionsFor = (r) => {
    if (!r) return [];
    const opts = [
      { value: 'in_progress', label: 'Đang xử lý' },
      { value: 'approved', label: r.type === 'transfer' ? 'Phê duyệt & Chuyển phòng ngay (Manager)' : 'Phê duyệt', disabled: r.type === 'transfer' && !canApproveTransfer },
      { value: 'completed', label: r.type === 'transfer' ? 'Hoàn tất chuyển phòng (Manager)' : 'Hoàn tất xử lý', disabled: r.type === 'transfer' && !canApproveTransfer },
      { value: 'rejected', label: 'Từ chối yêu cầu' },
    ];
    return opts;
  };

  const columns = [
    {
      title: 'Mã phiếu', dataIndex: 'requestCode', width: 150, fixed: 'left',
      render: (v, r) => <><div><Text code>{v}</Text></div><Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(r.createdAt)}</Text></>,
    },
    {
      title: 'Sinh viên / Phòng', key: 'student', width: 190,
      render: (_, r) => (
        <>
          <Text strong>{r.student?.fullName}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.student?.studentCode} · Phòng {roomLabelOf(r.room)}</Text></div>
        </>
      ),
    },
    {
      title: 'Loại phiếu', dataIndex: 'type', width: 175,
      render: (v, r) => (
        <>
          <StatusTag type="requestType" value={v} />
          {r.repairCategory && <div><Text type="secondary" style={{ fontSize: 12 }}>{REPAIR_CATEGORY[r.repairCategory]?.label}</Text></div>}
          {r.targetRoom && <div><Tag color="blue" style={{ marginTop: 4 }}>→ Phòng {roomLabelOf(r.targetRoom)}</Tag></div>}
        </>
      ),
    },
    {
      title: 'Nội dung & Phản hồi', key: 'desc', width: 320,
      render: (_, r) => (
        <>
          <Text strong>{r.title}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text></div>
          {r.handlerNote && <div style={{ marginTop: 4 }}><Text style={{ fontSize: 12, color: 'var(--brand)' }}>Ghi chú KTX: {r.handlerNote}</Text></div>}
        </>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 135, render: (v) => <StatusTag type="request" value={v} /> },
    {
      title: 'Thao tác', key: 'actions', width: 110, fixed: 'right',
      render: (_, r) => (!TERMINAL.has(r.status) ? (
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openHandle(r)}>Xử lý</Button>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>{r.handledByName || REQUEST_STATUS[r.status]?.label}</Text>
      )),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Vận hành KTX', 'Phiếu yêu cầu SV']}
        title="Xử lý Phiếu yêu cầu Sinh viên"
        description="Tiếp nhận báo hỏng sửa chữa, đăng ký trả phòng và phê duyệt chuyển phòng nguyên tử (chỉ Trưởng ban KTX)."
      />

      <Card>
        <Segmented
          style={{ marginBottom: 16 }}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))}
          options={STATUS_FILTERS.map((s) => ({
            value: s,
            label: (
              <Space size={6}>
                <span>{STATUS_LABELS[s]}</span>
                {summary && (s === 'pending'
                  ? <Badge count={summary.pending ?? 0} showZero size="small" color={summary.pending ? '#FF4D4F' : '#D9D9D9'} />
                  : <Text type="secondary" style={{ fontSize: 12 }}>({s === 'all' ? summary.total ?? 0 : summary[s] ?? 0})</Text>)}
              </Space>
            ),
          }))}
        />

        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm mã phiếu, MSSV, họ tên, tiêu đề..."
          unit="phiếu"
          scrollX={1120}
          extraFilters={(
            <Select
              allowClear placeholder="Loại yêu cầu" style={{ width: 175 }}
              value={filters.type} options={REQUEST_TYPE_OPTIONS}
              onChange={(v) => setFilters((f) => ({ ...f, type: v, page: 1 }))}
            />
          )}
        />
      </Card>

      <Modal
        open={!!handling}
        title={handling ? `Xử lý phiếu ${handling.requestCode}` : ''}
        okText="Cập nhật trạng thái"
        cancelText="Đóng"
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setHandling(null)}
        destroyOnHidden
        width={580}
      >
        {handling && (
          <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 12 }}>
            <Alert
              type="info" showIcon style={{ marginBottom: 14 }}
              title={`${handling.student?.fullName} (${handling.student?.studentCode}) — Phòng ${roomLabelOf(handling.room)}`}
              description={<><b>{handling.title}:</b> {handling.description}</>}
            />

            {handling.type === 'transfer' && !canApproveTransfer && (
              <Alert
                type="warning" showIcon style={{ marginBottom: 14 }}
                title="Quyền duyệt chuyển phòng thuộc Trưởng ban KTX (Manager)"
                description="Cán bộ quản sinh chỉ có thể chuyển Đang xử lý hoặc Từ chối phiếu chuyển phòng."
              />
            )}

            <Form.Item name="status" label="Trạng thái mới" rules={[{ required: true }]}>
              <Select options={statusOptionsFor(handling)} />
            </Form.Item>

            {isTransferApprove && (
              <Form.Item
                name="targetRoomId" label="Phòng đích chuyển sang (tự động khóa chỗ mới & nhả chỗ cũ)"
                rules={[{ required: true, message: 'Chọn phòng đích còn chỗ trống' }]}
              >
                <Select
                  placeholder="Chọn phòng đích"
                  options={(targetRooms || [])
                    .filter((r) => r.id !== handling.room?.id)
                    .map((r) => ({
                      value: r.id,
                      label: `Phòng ${roomLabelOf(r)} (${r.buildingName}) · Tầng ${r.floor} · ${ROOM_TIER[r.roomTier]?.label || ''} · Còn ${r.availableSlots} chỗ`,
                    }))}
                />
              </Form.Item>
            )}

            <Form.Item name="handlerNote" label="Phản hồi gửi tới Sinh viên (bắn vào Chuông thông báo)">
              <Input.TextArea rows={3} maxLength={500} placeholder="Ghi rõ kết quả xử lý, lịch sửa chữa hoặc lý do từ chối..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
