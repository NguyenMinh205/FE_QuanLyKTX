import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Tabs } from 'antd';
import { ShoppingOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import PageHeader from '../../../components/PageHeader';
import SupplyOrdersTab from '../components/SupplyOrdersTab';
import SupplyItemsTab from '../components/SupplyItemsTab';

/** SCR-71 Nhu yếu phẩm — tab Đơn hàng + tab Danh mục sản phẩm (FR-100, FR-104, FR-105, FR-107) */
export default function SuppliesPage() {
  const { user } = useAuth();
  const canManageOrders = can(user, 'supplyOrder:deliver');
  const canManageItems = can(user, 'supply:manage');
  const canRecordPayment = can(user, 'payment:record');

  // Mở từ nơi khác: ?tab=items · ?status=ready (Dashboard "đơn chờ nhận")
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'items' ? 'items' : 'orders');
  const initialStatus = searchParams.get('status') || undefined;

  return (
    <>
      <PageHeader
        breadcrumb={['Nhu yếu phẩm']}
        title="Nhu yếu phẩm"
        description="Đơn hàng sinh viên đặt và danh mục sản phẩm bán tại ký túc xá"
      />
      <Card styles={{ body: { paddingTop: 12 } }}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          destroyOnHidden
          items={[
            {
              key: 'orders',
              label: <span><ShoppingOutlined /> Đơn hàng</span>,
              children: <SupplyOrdersTab canManage={canManageOrders} canRecordPayment={canRecordPayment} initialStatus={initialStatus} />,
            },
            {
              key: 'items',
              label: <span><AppstoreOutlined /> Danh mục sản phẩm</span>,
              children: <SupplyItemsTab canManage={canManageItems} />,
            },
          ]}
        />
      </Card>
    </>
  );
}
