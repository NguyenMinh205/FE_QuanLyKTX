import { Card, Table, Typography, Alert } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { formatCurrency } from '../../../utils/formatter';
import { periodLabel } from '../../fees/utils/readingSheet';

const { Text } = Typography;

const num = (v) => Number(v).toLocaleString('vi-VN');

/** Điện nước 12 tháng gần nhất của phòng đang ở (FR-42) — chỉ các tháng đã chốt, để tự so tháng này với tháng trước */
export default function RoomUtilityHistoryCard() {
  const { data, loading, error } = useApi(() => portalApi.getMyRoomUtilityHistory({ limit: 12 }), []);

  const columns = [
    { title: 'Tháng', dataIndex: 'monthYear', width: 120, render: (v) => <Text strong>{periodLabel(v)}</Text> },
    { title: 'Điện', key: 'e', width: 120, align: 'right', render: (_, r) => `${num(r.electricity.usage)} kWh` },
    { title: 'Nước', key: 'w', width: 100, align: 'right', render: (_, r) => `${num(r.water.usage)} m³` },
    { title: 'Cả phòng', dataIndex: 'totalAmount', width: 130, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    {
      title: 'Tham khảo mỗi người', key: 'per', width: 170, align: 'right',
      render: (_, r) => <Text type="secondary">≈ {formatCurrency(r.perStudentAmount)} <span style={{ fontSize: 12 }}>({r.occupantsCount} người)</span></Text>,
    },
  ];

  return (
    <Card
      title={<span><ThunderboltOutlined style={{ color: '#1677FF' }} /> Điện nước của phòng</span>}
      style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}
    >
      {error
        ? <Alert type="error" showIcon title={error} style={{ margin: 16 }} />
        : (
          <Table
            rowKey="id" size="middle" columns={columns} dataSource={data || []} loading={loading} pagination={false}
            scroll={{ x: 640 }} locale={{ emptyText: 'Phòng chưa có tháng nào được chốt' }}
          />
        )}
    </Card>
  );
}
