const KEY = 'portalCart';

export const MAX_QTY = 5; // BR-91: mỗi sản phẩm 1–5 cái

/** Giỏ hàng chỉ sống trong phiên làm việc — không có API giỏ hàng (docs/08 mục 6.13) */
export const loadCart = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((l) => l?.supplyItemId && l.quantity > 0) : [];
  } catch {
    return [];
  }
};

export const saveCart = (lines) => {
  try { sessionStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* chế độ riêng tư: giỏ vẫn chạy trong bộ nhớ */ }
  return lines;
};

export const clearCart = () => saveCart([]);

/** Đặt số lượng cho một sản phẩm; 0 = bỏ khỏi giỏ */
export const setQuantity = (lines, supplyItemId, quantity) => {
  const qty = Math.max(0, Math.min(MAX_QTY, Number(quantity) || 0));
  const rest = lines.filter((l) => l.supplyItemId !== supplyItemId);
  return qty === 0 ? rest : [...rest, { supplyItemId, quantity: qty }];
};

export const quantityOf = (lines, supplyItemId) => lines.find((l) => l.supplyItemId === supplyItemId)?.quantity ?? 0;

/** Tổng tiền chỉ để hiển thị — server tính lại theo giá hiện hành (BR-92) */
export const cartTotal = (lines, items) => lines.reduce((sum, l) => {
  const item = items.find((i) => i.id === l.supplyItemId);
  return sum + (item ? item.price * l.quantity : 0);
}, 0);
