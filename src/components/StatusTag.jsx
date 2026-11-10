import { Tag } from 'antd';
import {
  CONTRACT_STATUS, INVOICE_STATUS, INVOICE_TYPE, BED_STATUS, ROOM_STATUS,
} from '../constants/statuses';

const MAP = {
  contract: CONTRACT_STATUS,
  invoice: INVOICE_STATUS,
  invoiceType: INVOICE_TYPE,
  bed: BED_STATUS,
  roomStatus: ROOM_STATUS,
};

/**
 * Thẻ trạng thái thống nhất toàn hệ thống.
 * @example <StatusTag type="contract" value="pending" />
 * (nhận cả `status` để tương thích code cũ)
 */
export default function StatusTag({ type, value, status }) {
  const key = value ?? status;
  const item = MAP[type]?.[key];
  if (!item) return <Tag>{key || '—'}</Tag>;
  return <Tag color={item.color}>{item.label}</Tag>;
}
