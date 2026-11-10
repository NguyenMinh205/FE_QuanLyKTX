import { Drawer, Table, Tag, Typography, Alert } from 'antd';
import { useApi } from '../../../../hooks/useApi';
import { feeApi } from '../../api/fee.api';
import { formatCurrency } from '../../../../utils/formatter';
import { periodLabel } from '../../utils/readingSheet';

const { Text } = Typography;

const num = (v) => Number(v).toLocaleString('vi-VN');

/** Lịch sử điện nước 12 tháng gần nhất của một phòng (FR-42) — để so tháng này có bất thường không */
export default function RoomUtilityHistoryDrawer({ room, roomLabel, onClose }) {
  const { data, loading, error } = useApi(
    () => (room ? feeApi.getUtilityHistory({ roomId: room.id, limit: 12 }) : Promise.resolve({ data: { data: null } })),
    [room?.id],
  );

  const meter = (m, unit) => (
    <>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>{num(m.oldIndex)} → {num(m.newIndex)}</div>
      <Text type="secondary" style={{ fontSize: 12 }}>{num(m.usage)} {unit} × {num(m.unitPrice)}</Text>
    </>
  );

  const columns = [
    { title: 'Tháng', dataIndex: 'monthYear', width: 120, render: (v) => <Text strong>{periodLabel(v)}</Text> },
    { title: 'Điện', key: 'e', width: 150, render: (_, r) => meter(r.electricity, 'kWh') },
    { title: 'Nước', key: 'w', width: 130, render: (_, r) => meter(r.water, 'm³') },
    {
      title: 'Cả phòng', dataIndex: 'totalAmount', width: 130, align: 'right',
      render: (v, r) => (
        <>
          <Text strong>{formatCurrency(v)}</Text>
          {r.perStudentAmount !== null && r.perStudentAmount !== undefined && (
            <div><Text type="secondary" style={{ fontSize: 12 }}>{r.occupantsCount} người · ≈ {formatCurrency(r.perStudentAmount)}</Text></div>
          )}
        </>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'isBilled', width: 120,
      render: (v) => (v ? <Tag color="purple" style={{ margin: 0 }}>Đã phát hành</Tag> : <Tag color="success" style={{ margin: 0 }}>Chưa chốt</Tag>),
    },
  ];

  return (
    <Drawer open={!!room} onClose={onClose} size={680} destroyOnHidden title={`Lịch sử điện nước phòng ${roomLabel ?? ''}`}>
      {error && <Alert type="error" showIcon title={error} />}
      {!error && (
        <Table
          rowKey="id" size="small" columns={columns} dataSource={data || []} loading={loading} pagination={false}
          scroll={{ x: 650 }} locale={{ emptyText: 'Phòng này chưa có chỉ số nào' }}
        />
      )}
    </Drawer>
  );
}
