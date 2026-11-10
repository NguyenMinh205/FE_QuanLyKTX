/**
 * Một nguồn màu cho cả app (M10b, 10/11/2026). Antd đọc `antdTheme`; style nội dòng dùng biến CSS cùng tên trong index.css
 * (`var(--brand)`…), biểu đồ recharts dùng hằng số ở đây vì thuộc tính SVG không đọc được var().
 *
 * ⚠️ Mọi màu chữ đã đo tương phản WCAG AA (≥ 4.5:1 trên nền trắng). Đổi màu thì đo lại:
 *   BRAND #1263D6 — chữ trắng trên nền xanh 5.55:1, chữ xanh trên nền trắng 5.55:1 (#1677FF cũ chỉ 4.1:1)
 *   TEXT_TERTIARY #5B6474 5.97:1 (#8C8C8C cũ 3.4:1) · SUCCESS_TEXT #2F7D0B 5.17:1 · WARNING_TEXT #9A5B00 5.43:1
 */
export const BRAND = '#1263D6';
export const BRAND_SOFT = '#EAF1FC';
export const TEXT_SECONDARY = '#4B5563';
export const TEXT_TERTIARY = '#5B6474';
export const TEXT_PLACEHOLDER = '#6B7280';
export const SUCCESS_TEXT = '#2F7D0B';
export const WARNING_TEXT = '#9A5B00';
export const DANGER_TEXT = '#CF1322';
export const LAYOUT_BG = '#F4F6F9';

export const antdTheme = {
  token: {
    colorPrimary: BRAND,
    colorLink: BRAND,
    colorInfo: BRAND,
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    // Chữ trạng thái (Text type="success|warning|danger", lỗi form) — màu nền giữ nguyên ở trên, chỉ chữ đậm lại cho đủ AA
    colorSuccessText: SUCCESS_TEXT,
    colorWarningText: WARNING_TEXT,
    colorErrorText: DANGER_TEXT,
    colorTextSecondary: TEXT_SECONDARY,
    colorTextTertiary: TEXT_TERTIARY,
    colorTextPlaceholder: TEXT_PLACEHOLDER,
    colorBgLayout: LAYOUT_BG,
    colorBorderSecondary: '#EBEEF2',
    borderRadius: 8,
    borderRadiusSM: 6,
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    // antd mặc định có kiểu "nảy" (back easing) — đổi sang giảm tốc mượt, chuyển động ngắn chỉ để báo trạng thái
    motionEaseOutBack: 'cubic-bezier(0.22, 1, 0.36, 1)',
    motionEaseInBack: 'cubic-bezier(0.64, 0, 0.78, 0)',
    motionDurationMid: '0.18s',
    motionDurationSlow: '0.24s',
  },
  components: {
    Layout: { headerBg: '#FFFFFF', siderBg: '#FFFFFF', bodyBg: LAYOUT_BG },
    Menu: { itemSelectedBg: BRAND_SOFT, itemSelectedColor: BRAND, itemBorderRadius: 8 },
    Table: { headerBg: '#F7F8FA', headerColor: TEXT_SECONDARY, rowHoverBg: '#F7F9FC' },
    Card: { headerFontSize: 15 },
    Tabs: { itemColor: TEXT_SECONDARY },
  },
};
