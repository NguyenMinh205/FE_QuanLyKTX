import { Card, Typography, Button, Empty, Divider, Alert } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../../utils/formatter';

const { Text } = Typography;

/** Giỏ hàng cố định bên phải màn Mua sắm (SCR-67) */
export default function CartCard({ lines, items, total, placing, onChangeQty, onClear, onSubmit }) {
  const rows = lines
    .map((l) => ({ line: l, item: items.find((i) => i.id === l.supplyItemId) }))
    .filter((r) => r.item);

  return (
    <Card
      title={<span><ShoppingCartOutlined style={{ color: '#1677FF' }} /> Giỏ hàng {rows.length > 0 && <Text type="secondary">({rows.length} món)</Text>}</span>}
      extra={rows.length > 0 && <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={onClear}>Xóa giỏ</Button>}
      style={{ position: 'sticky', top: 16 }}
    >
      {rows.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa chọn món nào" />
      ) : (
        <>
          {rows.map(({ line, item }) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ minWidth: 0 }}>
                <Text>{item.name}</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(item.price)} × {line.quantity}</Text></div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Text strong>{formatCurrency(item.price * line.quantity)}</Text>
                <div>
                  <Button type="link" size="small" danger onClick={() => onChangeQty(item.id, 0)} aria-label={`Bỏ ${item.name} khỏi giỏ`}>Bỏ</Button>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <Text strong>Tổng cộng</Text>
            <Text strong style={{ fontSize: 20, color: '#1677FF' }}>{formatCurrency(total)}</Text>
          </div>

          <Alert
            type="info" showIcon icon={<ShopOutlined />}
            title="Nhận hàng tại văn phòng ban quản lý"
            description="Thanh toán hóa đơn trong 3 ngày, sau đó mang thẻ sinh viên đến văn phòng nhận hàng."
          />

          <Divider style={{ margin: '12px 0' }} />
          <Button type="primary" size="large" block loading={placing} onClick={onSubmit}>Đặt hàng</Button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Đặt hàng xong hệ thống tạo một hóa đơn riêng để bạn thanh toán.</Text>
          </div>
        </>
      )}
    </Card>
  );
}
