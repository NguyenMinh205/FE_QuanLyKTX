import { useState, useEffect } from 'react';

/** Hoãn cập nhật giá trị cho tới khi người dùng ngừng gõ (mặc định 400ms) */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
