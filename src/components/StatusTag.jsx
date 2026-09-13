import { Tag } from 'antd';
import {
  APPLICATION_STATUS, CONTRACT_STATUS, RESIDENCY_STATUS, INVOICE_STATUS, INVOICE_TYPE,
  BED_STATUS, PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE, SUPPLY_ORDER_STATUS, ROOM_TIER,
} from '../constants/statuses';

const MAP = {
  application: APPLICATION_STATUS,
  contract: CONTRACT_STATUS,
  residency: RESIDENCY_STATUS,
  invoice: INVOICE_STATUS,
  invoiceType: INVOICE_TYPE,
  bed: BED_STATUS,
  payment: PAYMENT_STATUS,
  request: REQUEST_STATUS,
  requestType: REQUEST_TYPE,
  supplyOrder: SUPPLY_ORDER_STATUS,
  roomTier: ROOM_TIER,
};

/**
 * Thẻ trạng thái thống nhất toàn hệ thống.
 * @example <StatusTag type="application" value="pending" />
 * (nhận cả `status` để tương thích code cũ)
 */
export default function StatusTag({ type, value, status }) {
  const key = value ?? status;
  const item = MAP[type]?.[key];
  if (!item) return <Tag>{key || '—'}</Tag>;
  return <Tag color={item.color}>{item.label}</Tag>;
}
