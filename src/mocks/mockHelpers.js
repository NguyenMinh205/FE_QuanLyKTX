/**
 * Tiện ích dùng chung cho mọi mock API.
 * Trả về đúng envelope { code, message, data } như API.md mục 1.1
 * để khi nối backend thật không phải sửa màn hình.
 */

export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Bọc dữ liệu theo envelope thành công */
export const ok = (data, message = 'Success') => ({ data: { code: 'OK', message, data } });

/** Bọc danh sách có phân trang: { items, total, page, limit } */
export const paginate = (rows, { page = 1, limit = 20 } = {}) => {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  return ok({
    items: rows.slice((p - 1) * l, (p - 1) * l + l),
    total: rows.length,
    page: p,
    limit: l,
  });
};

/** Ném lỗi giống hệt axios để code xử lý lỗi ở màn hình chạy như thật */
export const fail = (status, code, message, extra = null) => {
  const err = new Error(message);
  err.response = { status, data: { code, message, data: extra } };
  throw err;
};

/** Lọc theo từ khóa trên nhiều trường */
export const search = (rows, keyword, fields) => {
  if (!keyword) return rows;
  const kw = String(keyword).toLowerCase().trim();
  return rows.filter((r) => fields.some((f) => String(r[f] ?? '').toLowerCase().includes(kw)));
};
