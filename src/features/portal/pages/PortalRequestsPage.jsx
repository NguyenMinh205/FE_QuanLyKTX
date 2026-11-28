import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Card, Table, Typography, Modal, Form, Radio, Select, Input, Alert, App, Tag,
} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { applyApi } from '../../apply/api/apply.api';
import {
  REQUEST_TYPE_OPTIONS, REPAIR_CATEGORY, REPAIR_CATEGORY_OPTIONS, ROOM_TIER,
} from '../../../constants/statuses';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { formatCurrency, formatDateTime } from '../../../utils/formatter';
import { roomLabelOf } from '../../rooms/utils/roomStatus';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';

const { Text } = Typography;

/** Cổng Sinh viên: Gửi & theo dõi Phiếu Báo hỏng / Xin chuyển phòng / Trả phòng */
export default function PortalRequestsPage() {
  const { message, modal } = App.useApp();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: residence } = useApi(() => portalApi.getMyResidence(), []);
  const { data: requests, loading, error, refetch } = useApi(() => portalApi.getRequests({ limit: 100 }), []);

  const reqType = Form.useWatch('type', form) || 'repair';
  const curContract = residence?.contract;
  const curRoom = curContract?.room;
  const isCheckedIn = Boolean(curContract?.checkedInAt);
  const isExpired = curContract?.status === 'expired';
  const personalDebt = residence?.debtSummary?.totalDebt || 0;
  const roomUtilityDebt = residence?.debtSummary?.roomUtilityDebt || 0;
  const totalBlockingDebt = personalDebt + roomUtilityDebt;

  const blockedSubmitReason = (() => {
    if (reqType === 'repair' && !isCheckedIn) {
      return 'Bạn cần hoàn tất QR Check-in nhận phòng tại văn phòng KTX trước khi gửi phiếu báo hỏng.';
    }
    if (reqType === 'transfer') {
      if (!isCheckedIn) return 'Bạn cần hoàn tất QR Check-in nhận phòng tại văn phòng KTX trước khi xin chuyển phòng.';
      if (isExpired) return 'Hợp đồng đã hết hạn, không thể xin chuyển phòng. Vui lòng trả phòng hoặc đăng ký kỳ mới.';
      if (totalBlockingDebt > 0) {
        return `Bạn hoặc phòng hiện tại còn ${formatCurrency(totalBlockingDebt)} hóa đơn chưa thanh toán. Vui lòng thanh toán sạch trước khi xin chuyển phòng.`;
      }
    }
    return null;
  })();

  const { data: targetRooms } = useApi(
    () => (open && reqType === 'transfer' && curRoom && !blockedSubmitReason
      ? applyApi.getAvailableRooms({
        campus: curRoom.campus,
        gender: curRoom.gender,
        roomTier: curRoom.roomTier,
        capacity: curRoom.capacity,
        limit: 100,
      })
      : Promise.resolve({ data: { data: { items: [] } } })),
    [open, reqType, curRoom?.campus, curRoom?.gender, curRoom?.roomTier, curRoom?.capacity, blockedSubmitReason],
  );

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        type: values.type,
        title: values.title.trim(),
        description: values.description.trim(),
        ...(values.type === 'repair' ? { repairCategory: values.repairCategory } : {}),
        ...(values.type === 'transfer' && values.targetRoomId ? { targetRoomId: values.targetRoomId } : {}),
      };
      const res = await portalApi.createRequest(payload);
      message.success(res.data.message);
      setOpen(false);
      form.resetFields();
      refetch();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = (r) => modal.confirm({
    title: `Hủy phiếu yêu cầu ${r.requestCode}?`,
    okText: 'Hủy phiếu',
    okButtonProps: { danger: true },
    cancelText: 'Đóng',
    onOk: async () => {
      try {
        const res = await portalApi.cancelRequest(r.id);
        message.success(res.data.message);
        refetch();
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
  });

  const columns = [
    {
      title: 'Mã phiếu', dataIndex: 'requestCode', width: 164,
      render: (v, r) => (
        <>
          <div><Text code className="mono" style={{ whiteSpace: 'nowrap' }}>{v}</Text></div>
          <Text type="secondary" className="mono" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</Text>
        </>
      ),
    },
    {
      title: 'Loại yêu cầu', dataIndex: 'type', width: 170,
      render: (v, r) => (
        <>
          <StatusTag type="requestType" value={v} />
          {r.repairCategory && <div><Text type="secondary" style={{ fontSize: 12 }}>{REPAIR_CATEGORY[r.repairCategory]?.label}</Text></div>}
          {r.targetRoom && <div><Text type="secondary" style={{ fontSize: 12 }}>Đích: Phòng {roomLabelOf(r.targetRoom)}</Text></div>}
        </>
      ),
    },
    {
      title: 'Nội dung', key: 'content',
      render: (_, r) => (
        <>
          <Text strong>{r.title}</Text>
          <div><Text type="secondary" style={{ fontSize: 13 }}>{r.description}</Text></div>
          {r.handlerNote && (
            <div style={{ marginTop: 4 }}>
              <Tag color="blue" style={{ margin: 0 }}>Phản hồi KTX: {r.handlerNote}</Tag>
            </div>
          )}
        </>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (v) => <StatusTag type="request" value={v} /> },
    {
      title: '', key: 'actions', width: 95,
      render: (_, r) => r.status === 'pending' && (
        <Button size="small" type="link" danger icon={<CloseCircleOutlined />} onClick={() => confirmCancel(r)}>Hủy</Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Cổng Sinh viên', 'Phiếu yêu cầu']}
        title="Phiếu yêu cầu trực tuyến"
        description="Gửi yêu cầu báo hỏng thiết bị, xin chuyển phòng cùng cơ sở hoặc đăng ký trả phòng."
        extra={residence?.hasResidence && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.setFieldsValue({ type: isCheckedIn ? 'repair' : 'checkout', repairCategory: 'electric' });
              setOpen(true);
            }}
          >
            Gửi yêu cầu mới
          </Button>
        )}
      />

      {residence && !residence.hasResidence && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Bạn cần có hợp đồng đang hiệu lực để gửi yêu cầu mới." />
      )}
      {residence?.hasResidence && !isCheckedIn && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="Bạn chưa làm thủ tục QR Check-in nhận phòng"
          description="Phiếu báo hỏng và xin chuyển phòng sẽ mở ngay sau khi cán bộ quét mã QR Check-in bàn giao chìa khóa. Nếu bạn muốn rút phòng trước khi nhận phòng, có thể gửi phiếu Đăng ký trả phòng."
        />
      )}
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id" columns={columns} dataSource={requests || []} loading={loading}
          pagination={false} scroll={{ x: 800 }} locale={{ emptyText: 'Bạn chưa gửi phiếu yêu cầu nào' }}
        />
      </Card>

      <Modal
        open={open}
        title="Gửi phiếu yêu cầu tới Ban quản lý KTX"
        okText="Gửi yêu cầu"
        okButtonProps={{ disabled: Boolean(blockedSubmitReason) }}
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: isCheckedIn ? 'repair' : 'checkout', repairCategory: 'electric' }} style={{ marginTop: 12 }}>
          <Form.Item name="type" label="Loại yêu cầu" rules={[{ required: true }]}>
            <Radio.Group optionType="button" buttonStyle="solid" options={REQUEST_TYPE_OPTIONS} />
          </Form.Item>

          {blockedSubmitReason && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 14 }}
              title="Chưa đủ điều kiện gửi loại yêu cầu này"
              description={(
                <>
                  <div>{blockedSubmitReason}</div>
                  {totalBlockingDebt > 0 && reqType === 'transfer' && (
                    <div style={{ marginTop: 4 }}><Link to="/portal/my-invoices">Mở Hóa đơn &amp; thanh toán ngay →</Link></div>
                  )}
                </>
              )}
            />
          )}

          {reqType === 'repair' && !blockedSubmitReason && (
            <Form.Item name="repairCategory" label="Hạng mục sự cố" rules={[{ required: true }]}>
              <Select options={REPAIR_CATEGORY_OPTIONS} />
            </Form.Item>
          )}

          {reqType === 'transfer' && !blockedSubmitReason && (
            <Form.Item
              name="targetRoomId"
              label="Phòng muốn chuyển sang (cùng hạng, sức chứa & giới tính)"
              extra="Trong cùng kỳ hợp đồng chỉ chuyển phòng cùng hạng và cùng đơn giá. Trưởng ban KTX sẽ phê duyệt và chuyển chỗ nguyên tử."
            >
              <Select
                allowClear
                placeholder="Chọn phòng cùng hạng còn trống (hoặc để trống cho Ban quản lý sắp xếp)"
                options={(targetRooms || [])
                  .filter((r) => (
                    r.id !== curRoom?.id
                    && (curRoom?.pricePerMonth == null || Number(r.pricePerMonth) === Number(curRoom.pricePerMonth))
                  ))
                  .map((r) => ({
                    value: r.id,
                    label: `Phòng ${roomLabelOf(r)} (${r.buildingName}) · Tầng ${r.floor} · ${ROOM_TIER[r.roomTier]?.label || ''} ${r.capacity} người · Còn ${r.availableSlots} chỗ`,
                  }))}
              />
            </Form.Item>
          )}

          {reqType === 'checkout' && (
            <Alert
              type={totalBlockingDebt > 0 ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 14 }}
              title={totalBlockingDebt > 0
                ? `Còn ${formatCurrency(totalBlockingDebt)} hóa đơn chưa thanh toán`
                : 'Lưu ý trước khi trả phòng'}
              description={totalBlockingDebt > 0
                ? (
                  <>
                    Bạn vẫn có thể đặt lịch trả phòng, nhưng bắt buộc thanh toán sạch 100% hóa đơn cá nhân và điện nước phòng trước khi cán bộ thanh lý &amp; hoàn cọc.{' '}
                    <Link to="/portal/my-invoices">Xem hóa đơn →</Link>
                  </>
                )
                : 'Cán bộ sẽ tiếp nhận lịch kiểm kê tài sản. Khi thanh lý hợp đồng hoàn tất, phiếu này sẽ tự động đóng và chuyển sang bước quyết toán hoàn cọc.'}
            />
          )}

          <Form.Item name="title" label="Tiêu đề ngắn gọn" rules={[{ required: true, whitespace: true, message: 'Nhập tiêu đề' }]}>
            <Input
              maxLength={150}
              placeholder={reqType === 'repair' ? 'VD: Hỏng bóng đèn trần nhà tắm' : reqType === 'transfer' ? 'VD: Xin chuyển xuống phòng tầng 1' : 'VD: Đăng ký trả phòng cuối tháng'}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, whitespace: true, message: 'Nhập mô tả chi tiết' }]} style={{ marginBottom: 0 }}>
            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Ghi rõ tình trạng, lý do và thời gian thuận tiện liên hệ..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
