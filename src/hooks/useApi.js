import { useState, useEffect, useRef, useCallback } from 'react';
import { getErrorMessage } from '../api/axiosClient';

/**
 * Gọi API và quản lý 3 trạng thái: đang tải / có dữ liệu / lỗi.
 * Thay cho TanStack Query (docs/14 mục 4.1).
 *
 * @param {Function} apiFunc  hàm gọi API, ví dụ: () => studentApi.getList(filters)
 * @param {Array}    deps     mảng phụ thuộc; đổi giá trị thì tự gọi lại API
 *
 * @example
 * const { data, meta, loading, error, refetch } = useApi(
 *   () => studentApi.getList(filters),
 *   [filters]
 * );
 */
export function useApi(apiFunc, deps = []) {
  // Đếm số lần bấm refetch — tăng lên là kích hoạt gọi lại API
  const [reloadCount, setReloadCount] = useState(0);

  // So sánh mảng phụ thuộc bằng NỘI DUNG thay vì bằng tham chiếu, nhờ vậy nơi gọi
  // truyền thẳng object filters mà không bị gọi lại vô hạn
  const depsKey = JSON.stringify(deps);

  // "Mã của lần gọi hiện tại" — đổi khi filters đổi hoặc khi refetch
  const requestKey = `${depsKey}|${reloadCount}`;

  // result.key cho biết dữ liệu đang giữ thuộc về lần gọi nào
  const [result, setResult] = useState({ key: null, data: null, meta: null, error: null });

  // Luôn giữ phiên bản mới nhất của apiFunc mà không phải đưa nó vào mảng phụ thuộc
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
        setResult({
          key: requestKey,
          data: res.data.data,
          meta: res.data.meta ?? null,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          data: null,
          meta: null,
          error: getErrorMessage(err),
        });
      });

    // Huỷ cập nhật state nếu component đã bị gỡ khỏi màn hình
    // hoặc nếu người dùng đổi bộ lọc trước khi request cũ kịp về
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  // Dữ liệu đang giữ chưa thuộc về lần gọi hiện tại ⇒ đang tải.
  // Tính ra như thế này thay vì lưu vào state để tránh render thừa.
  const loading = result.key !== requestKey;

  /** Gọi lại API — dùng sau khi thêm / sửa / xóa thành công */
  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return {
    // Giữ nguyên dữ liệu cũ trong lúc tải lại để bảng không bị nháy trắng
    data: result.data,
    meta: result.meta,
    loading,
    error: loading ? null : result.error,
    refetch,
  };
}
