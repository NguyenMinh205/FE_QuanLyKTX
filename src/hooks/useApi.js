import { useState, useEffect, useRef, useCallback } from 'react';
import { getErrorMessage } from '../lib/axiosClient';

/**
 * Gọi API và quản lý 3 trạng thái: đang tải / có dữ liệu / lỗi.
 *
 * Envelope của backend là { code, message, data } (API.md mục 1.1).
 * Với endpoint danh sách, data có dạng { items, total, page, limit }
 * nên hook tách sẵn thành `data` (mảng items) và `meta` (phân trang).
 *
 * @param {Function} apiFunc  hàm gọi API, VD: () => studentApi.getList(filters)
 * @param {Array}    deps     mảng phụ thuộc; đổi giá trị thì tự gọi lại API
 *
 * @example
 * const { data, meta, loading, error, refetch } = useApi(
 *   () => studentApi.getList(filters),
 *   [filters]
 * );
 */
export function useApi(apiFunc, deps = []) {
  const [reloadCount, setReloadCount] = useState(0);

  // So sánh mảng phụ thuộc bằng NỘI DUNG thay vì tham chiếu, nhờ vậy nơi gọi
  // truyền thẳng object filters mà không bị gọi lại vô hạn
  const depsKey = JSON.stringify(deps);
  const requestKey = `${depsKey}|${reloadCount}`;

  const [result, setResult] = useState({ key: null, data: null, meta: null, error: null });

  const apiFuncRef = useRef(apiFunc);
  useEffect(() => {
    apiFuncRef.current = apiFunc;
  });

  useEffect(() => {
    let cancelled = false;

    apiFuncRef
      .current()
      .then((res) => {
        if (cancelled) return;
        const body = res.data.data;

        // Endpoint danh sách trả { items, total, page, limit }; endpoint chi tiết trả object
        const isList = body && typeof body === 'object' && Array.isArray(body.items);

        setResult({
          key: requestKey,
          data: isList ? body.items : body,
          meta: isList ? { total: body.total, page: body.page, limit: body.limit } : null,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setResult({ key: requestKey, data: null, meta: null, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  // Dữ liệu đang giữ chưa thuộc về lần gọi hiện tại ⇒ đang tải
  const loading = result.key !== requestKey;

  /** Gọi lại API — dùng sau khi thêm / sửa / xóa thành công */
  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return {
    data: result.data,
    meta: result.meta,
    loading,
    error: loading ? null : result.error,
    refetch,
  };
}
