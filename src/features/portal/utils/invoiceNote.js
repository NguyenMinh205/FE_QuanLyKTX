import { formatCurrency } from '../../../utils/formatter';

/** "Tiền điện tháng 9/2026 (56 kWh, chia đều 2 người)" → { main, sub } */
export const splitLineDescription = (text) => {
  const m = String(text || '').match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return m ? { main: m[1], sub: m[2] } : { main: text || '—', sub: null };
};

/**
 * Giải thích tiền điện nước cho sinh viên: phần của bạn = tiền cả phòng ÷ số người.
 * Suy ra từ mô tả dòng phí "(56 kWh, chia đều 2 người)" — backend chốt con số, đây chỉ là câu giải thích.
 */
export const utilityNotesOf = (lineItems = []) => lineItems
  .map((l) => {
    const m = String(l.description || '').match(/\(([\d.,]+)\s*(kWh|m³|m3)[^,]*,\s*chia đều (\d+) người\)/i);
    if (!m) return null;
    const [, usage, unit, people] = m;
    const roomTotal = l.amount * Number(people);
    const kind = /kwh/i.test(unit) ? 'điện' : 'nước';
    return `Tiền ${kind}: phòng dùng ${usage} ${unit} hết ${formatCurrency(roomTotal)}, chia đều ${people} người → phần của bạn ${formatCurrency(l.amount)}.`;
  })
  .filter(Boolean);
