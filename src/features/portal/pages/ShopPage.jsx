import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, InputNumber, Alert, Skeleton, Segmented, Empty, App,
} from 'antd';
import {
  PictureOutlined, GiftOutlined, PlusOutlined, ShoppingOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { portalApi } from '../api/portal.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { SUPPLY_CATEGORY } from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import CartCard from '../components/shop/CartCard';
import { MAX_QTY, cartTotal, clearCart, loadCart, quantityOf, saveCart, setQuantity } from '../utils/cart';

const { Text } = Typography;

/** SCR-67 Mua sắm — cửa hàng + giỏ hàng trên cùng một màn (FR-101, FR-102) */
export default function ShopPage() {
  const navigate = useNavigate();
  const { modal, notification } = App.useApp();
  const [category, setCategory] = useState('all');
  const [lines, setLines] = useState(loadCart);
  const [placing, setPlacing] = useState(false);

  // portal/supply-items trả { roomType, roomNumber, includedInRoom, items } — useApi coi `items` là danh sách
  const { data: items, meta, loading, error, refetch } = useApi(() => portalApi.getSupplyItems(), []);
  const shop = meta || {};
  const products = items || [];

  const changeQty = (supplyItemId, quantity) => setLines((prev) => saveCart(setQuantity(prev, supplyItemId, quantity)));
  const emptyCart = () => setLines(clearCart());
  const total = cartTotal(lines, products);

  const shown = category === 'all' ? products : products.filter((p) => p.category === category);
  const categories = [...new Set(products.map((p) => p.category))];

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // Chỉ gửi mã sản phẩm + số lượng; giá do server chốt (BR-92)
      const res = await portalApi.createOrder({ items: lines.map((l) => ({ supplyItemId: l.supplyItemId, quantity: l.quantity })) });
      const order = res.data.data;
      emptyCart();
      notification.success({
        title: `Đặt hàng thành công — đơn ${order.orderCode}`,
        description: `Hóa đơn ${order.invoice?.invoiceCode} ${formatCurrency(order.totalAmount)}, hạn thanh toán ${order.invoice?.dueDate?.split('-').reverse().join('/')}.`,
        duration: 8,
        actions: (
          <Button type="primary" size="small" onClick={() => navigate(`/portal/my-invoices?invoice=${order.invoice?.id}`)}>
            Thanh toán ngay
          </Button>
        ),
      });
      refetch();
    } catch (err) {
      const code = getErrorCode(err);
      // Sản phẩm vừa ngừng bán hoặc đã được cấp sẵn → bỏ khỏi giỏ rồi tải lại cửa hàng
      if (['SUPPLY_ITEM_INACTIVE', 'SUPPLY_ALREADY_INCLUDED'].includes(code)) {
        const message = getErrorMessage(err);
        const stale = products.find((p) => message.includes(p.name));
        if (stale) changeQty(stale.id, 0);
        modal.warning({ title: 'Giỏ hàng cần cập nhật', content: message });
        refetch();
      } else {
        modal.warning({ title: 'Chưa đặt được hàng', content: getErrorMessage(err) });
      }
    } finally {
      setPlacing(false);
    }
  };

  const header = <PageHeader breadcrumb={['Mua sắm']} title="Mua sắm nhu yếu phẩm" description="Đặt đồ dùng, thanh toán online rồi nhận tại văn phòng ban quản lý" />;

  if (error) {
    const noContract = error.includes('chỗ ở') || error.includes('hợp đồng');
    return (
      <>
        {header}
        <Card>
          <Empty
            description={(
              <div>
                <Text strong style={{ fontSize: 16 }}>{noContract ? 'Bạn cần có chỗ ở để mua nhu yếu phẩm' : 'Không mở được cửa hàng'}</Text>
                <div><Text type="secondary">{error}</Text></div>
              </div>
            )}
          >
            {noContract && <Button type="primary" onClick={() => navigate('/portal/apply')}>Đăng ký chỗ ở</Button>}
          </Empty>
        </Card>
      </>
    );
  }
  if (loading && !items) return <>{header}<Card><Skeleton active paragraph={{ rows: 6 }} /></Card></>;

  return (
    <>
      {header}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <Text strong>Phòng {shop.roomNumber} · {shop.roomType?.name}</Text>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary"><GiftOutlined /> Phòng đã được cấp sẵn: </Text>
              {(shop.includedInRoom || []).map((x) => <Tag key={x} style={{ margin: '0 4px 4px 0' }}>{x}</Tag>)}
            </div>
          </div>
          <Button icon={<ShoppingOutlined />} onClick={() => navigate('/portal/my-orders')}>Đơn hàng của tôi</Button>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>Những món đã cấp sẵn không hiện trong cửa hàng vì phòng bạn đã có.</Text>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={17}>
          <Segmented
            style={{ marginBottom: 16 }}
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: `Tất cả (${products.length})` },
              ...categories.map((c) => ({ value: c, label: `${SUPPLY_CATEGORY[c]?.label ?? c} (${products.filter((p) => p.category === c).length})` })),
            ]}
          />
          {shown.length === 0 ? (
            <Card><Empty description="Không có sản phẩm nào trong nhóm này" /></Card>
          ) : (
            <Row gutter={[16, 16]}>
              {shown.map((item) => {
                const qty = quantityOf(lines, item.id);
                return (
                  <Col xs={12} md={8} xl={6} key={item.id}>
                    <Card
                      styles={{ body: { padding: 12 } }}
                      cover={item.imageUrl
                        ? <img alt={item.name} src={item.imageUrl} style={{ height: 120, objectFit: 'cover' }} />
                        : <div style={{ height: 120, background: '#FAFAFA', display: 'grid', placeItems: 'center', color: '#BFBFBF', fontSize: 26 }}><PictureOutlined /></div>}
                    >
                      <Text strong style={{ display: 'block', minHeight: 44 }}>{item.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{SUPPLY_CATEGORY[item.category]?.label} · {item.unit}</Text>
                      <div style={{ margin: '8px 0' }}><Text strong style={{ fontSize: 16, color: '#1677FF' }}>{formatCurrency(item.price)}</Text></div>
                      {qty === 0 ? (
                        <Button block icon={<PlusOutlined />} onClick={() => changeQty(item.id, 1)} aria-label={`Thêm ${item.name} vào giỏ`}>Thêm vào giỏ</Button>
                      ) : (
                        <InputNumber
                          style={{ width: '100%' }}
                          aria-label={`Số lượng ${item.name}`}
                          min={0} max={MAX_QTY} value={qty}
                          onChange={(v) => changeQty(item.id, v)}
                          prefix={<Text type="secondary" style={{ fontSize: 12 }}>SL</Text>}
                        />
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
          <Alert
            type="info" showIcon style={{ marginTop: 16 }}
            title={`Mỗi sản phẩm đặt tối đa ${MAX_QTY} cái mỗi đơn`}
            description="Giỏ hàng chỉ lưu trong phiên làm việc này. Số tiền cuối cùng do ký túc xá tính theo bảng giá hiện hành."
          />
        </Col>

        <Col xs={24} lg={7}>
          <CartCard
            lines={lines}
            items={products}
            total={total}
            placing={placing}
            onChangeQty={changeQty}
            onClear={emptyCart}
            onSubmit={placeOrder}
          />
        </Col>
      </Row>
    </>
  );
}
