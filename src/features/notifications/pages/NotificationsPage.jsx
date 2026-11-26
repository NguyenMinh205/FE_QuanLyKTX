import { useState } from 'react';
import {
  Button, Card, Table, Typography, Modal, Form, Input, App,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { notificationApi } from '../api/notification.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';

const { Text } = Typography;

/** Quản lý Bảng tin & Thông báo công khai KTX Cơ sở 1 (Manager & Staff đăng; Manager xóa) */
export default function NotificationsPage() {
  const { user } = useAuth();
  const { message, modal } = App.useApp();
  const canCreate = can(user, 'announcement:create');
  const canDelete = can(user, 'announcement:delete');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data, loading, refetch } = useApi(
    () => notificationApi.getAnnouncements({ limit: 50 }),
    [],
  );

  const handleCreate = async (values) => {
    setSaving(true);
    try {
      const res = await notificationApi.createAnnouncement({
        title: values.title.trim(),
        content: values.content.trim(),
        campus: 'cs1',
      });
      message.success(res.data.message);
      setOpen(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => modal.confirm({
    title: `Xóa bảng tin "${item.title}"?`,
    content: 'Thông báo sẽ bị gỡ khỏi Trang chủ KTX công khai và Cổng Sinh viên.',
    okText: 'Xóa bảng tin',
    okButtonProps: { danger: true },
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        const res = await notificationApi.deleteAnnouncement(item.id);
        message.success(res.data.message);
        refetch();
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
  });

  const columns = [
    {
      title: 'Tiêu đề & Nội dung', key: 'title',
      render: (_, n) => (
        <>
          <Text strong>{n.title}</Text>
          <div><Text type="secondary" style={{ fontSize: 13 }}>{n.content}</Text></div>
        </>
      ),
    },
    { title: 'Người đăng', dataIndex: 'createdByName', width: 160, render: (v) => v || '—' },
    { title: 'Thời gian', dataIndex: 'createdAt', width: 155, render: formatDateTime },
    ...(canDelete ? [{
      title: '', key: 'actions', width: 80,
      render: (_, n) => (
        <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(n)}>Xóa</Button>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Truyền thông KTX', 'Bảng tin']}
        title="Bảng tin & Thông báo KTX Cơ sở 1"
        description="Đăng tin tức, thông báo mở đợt, lịch bảo trì hiển thị công khai trên Trang chủ KTX và Chuông thông báo sinh viên."
        extra={canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Đăng bảng tin mới
          </Button>
        )}
      />

      <Card>
        <Table
          rowKey="id" columns={columns} dataSource={data || []} loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false }} scroll={{ x: 760 }}
          locale={{ emptyText: 'Chưa có bảng tin nào' }}
        />
      </Card>

      <Modal
        open={open}
        title="Đăng bảng tin KTX Cơ sở 1"
        okText="Đăng ngay"
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 12 }}>
          <Form.Item name="title" label="Tiêu đề thông báo" rules={[{ required: true, whitespace: true, message: 'Nhập tiêu đề' }]}>
            <Input maxLength={180} placeholder="VD: Thông báo mở đợt đăng ký KTX Cơ sở 1 năm học 2026–2027" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung chi tiết" rules={[{ required: true, whitespace: true, message: 'Nhập nội dung' }]} style={{ marginBottom: 0 }}>
            <Input.TextArea rows={4} maxLength={2000} showCount placeholder="Nhập nội dung đầy đủ gửi tới sinh viên..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
