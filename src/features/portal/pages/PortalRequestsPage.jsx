import { useState } from 'react';
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
import { formatDateTime } from '../../../utils/formatter';
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
  const curRoom = residence?.contract?.room;

  const { data: targetRooms } = useApi(
    () => (open && reqType === 'transfer' && curRoom
      ? applyApi.getAvailableRooms({ campus: curRoom.campus, gender: curRoom.gender, limit: 100 })
      : Promise.resolve({ data: { data: { items: [] } } })),
    [open, reqType, curRoom?.campus, curRoom?.gender],
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldsValue({ type: 'repair', repairCategory: 'electric' }); setOpen(true); }}>
            Gửi yêu cầu mới
          </Button>
        )}
      />

      {residence && !residence.hasResidence && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Bạn cần có hợp đồng đang hiệu lực để gửi yêu cầu mới." />
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
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: 'repair', repairCategory: 'electric' }} style={{ marginTop: 12 }}>
          <Form.Item name="type" label="Loại yêu cầu" rules={[{ required: true }]}>
            <Radio.Group optionType="button" buttonStyle="solid" options={REQUEST_TYPE_OPTIONS} />
          </Form.Item>

          {reqType === 'repair' && (
            <Form.Item name="repairCategory" label="Hạng mục sự cố" rules={[{ required: true }]}>
              <Select options={REPAIR_CATEGORY_OPTIONS} />
            </Form.Item>
          )}

          {reqType === 'transfer' && (
            <Form.Item
              name="targetRoomId" label="Phòng muốn chuyển sang (cùng cơ sở & giới tính)"
              extra="Yêu cầu chuyển phòng sẽ do Trưởng ban KTX phê duyệt và tự động chuyển chỗ."
            >
              <Select
                allowClear
                placeholder="Chọn phòng còn trống (hoặc để trống cho Ban quản lý sắp xếp)"
                options={(targetRooms || [])
                  .filter((r) => r.id !== curRoom?.id)
                  .map((r) => ({
                    value: r.id,
                    label: `Phòng ${roomLabelOf(r)} (${r.buildingName}) · Tầng ${r.floor} · ${ROOM_TIER[r.roomTier]?.label || ''} · Còn ${r.availableSlots} chỗ`,
                  }))}
              />
            </Form.Item>
          )}

          {reqType === 'checkout' && (
            <Alert
              type="info" showIcon style={{ marginBottom: 14 }}
              title="Lưu ý trước khi trả phòng"
              description="Cần thanh toán sạch 100% hóa đơn cá nhân và điện nước phòng trước khi cán bộ nghiệm thu thanh lý & hoàn cọc."
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
