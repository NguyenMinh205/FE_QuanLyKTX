import { Tag } from 'antd';
import {
  CONTRACT_STATUS, RESIDENCY_STATUS, INVOICE_STATUS,
  BED_STATUS, PAYMENT_STATUS, REQUEST_STATUS,
} from '../constants/statuses';

const MAP = {
  contract: CONTRACT_STATUS,
  residency: RESIDENCY_STATUS,
  invoice: INVOICE_STATUS,
  bed: BED_STATUS,
  payment: PAYMENT_STATUS,
  request: REQUEST_STATUS,
};

/**
 * Thẻ trạng thái thống nhất toàn hệ thống.
 * @example <StatusTag type="contract" status="active" />
 */
export default function StatusTag({ type, status }) {
  const item = MAP[type]?.[status];
  if (!item) return <Tag>{status || '—'}</Tag>;
  return <Tag color={item.color}>{item.label}</Tag>;
}
