/**
 * Hệ thống màu & thiết kế chuẩn HaUI hiện đại — tông xanh nhẹ thanh lịch, chia khối rõ ràng.
 * - Màu chủ đạo: Xanh dương hiện đại (#2563EB) hòa hợp logo chính thức HaUI (#153C88 / #21409A)
 * - Phân tách khối: Nền canvas xám-xanh nhẹ (#F1F5F9), vùng nhấn xanh nhạt (#EFF6FF), card trắng (#FFFFFF) viền sắc nét (#E2E8F0)
 * - Kiểu chữ: Be Vietnam Pro (tối ưu dấu tiếng Việt) + JetBrains Mono (mã số & số tiền)
 */
export const BRAND = '#2563EB';
export const BRAND_HOVER = '#1D4ED8';
export const BRAND_DEEP = '#153C88';
export const BRAND_SOFT = '#EFF6FF';
export const BRAND_BORDER = '#BFDBFE';
export const ACCENT = '#DE2737';
export const INK = '#0F172A';
export const TEXT_SECONDARY = '#475569';
export const TEXT_TERTIARY = '#64748B';
export const TEXT_PLACEHOLDER = '#94A3B8';
export const SUCCESS_TEXT = '#15803D';
export const WARNING_TEXT = '#B45309';
export const DANGER_TEXT = '#DC2626';
export const LAYOUT_BG = '#F1F5F9';
export const LINE = '#E2E8F0';

export const antdTheme = {
  token: {
    colorPrimary: BRAND,
    colorLink: BRAND,
    colorLinkHover: BRAND_HOVER,
    colorInfo: BRAND,
    colorSuccess: '#16A34A',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorText: INK,
    colorTextHeading: INK,
    colorSuccessText: SUCCESS_TEXT,
    colorWarningText: WARNING_TEXT,
    colorErrorText: DANGER_TEXT,
    colorTextSecondary: TEXT_SECONDARY,
    colorTextTertiary: TEXT_TERTIARY,
    colorTextPlaceholder: TEXT_PLACEHOLDER,
    colorBgLayout: LAYOUT_BG,
    colorBorder: '#CBD5E1',
    colorBorderSecondary: LINE,
    borderRadius: 8,
    borderRadiusSM: 6,
    borderRadiusLG: 10,
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    motionEaseOutBack: 'cubic-bezier(0.22, 1, 0.36, 1)',
    motionEaseInBack: 'cubic-bezier(0.64, 0, 0.78, 0)',
    motionDurationMid: '0.16s',
    motionDurationSlow: '0.22s',
  },
  components: {
    Layout: { headerBg: '#FFFFFF', siderBg: '#FFFFFF', bodyBg: LAYOUT_BG },
    Button: { primaryShadow: '0 1px 2px rgba(37, 99, 235, 0.18)', defaultShadow: 'none', dangerShadow: 'none', fontWeight: 500 },
    Menu: { itemSelectedBg: BRAND_SOFT, itemSelectedColor: BRAND_HOVER, itemBorderRadius: 6, itemColor: '#334155' },
    Table: { headerBg: '#F8FAFC', headerColor: TEXT_SECONDARY, rowHoverBg: '#F8FAFC', borderColor: LINE },
    Card: { headerFontSize: 15, headerHeight: 48, borderRadiusLG: 10 },
    Tabs: { itemColor: TEXT_SECONDARY, itemSelectedColor: BRAND, inkBarColor: BRAND, titleFontSize: 14 },
    Segmented: { trackBg: '#E2E8F0', itemSelectedBg: '#FFFFFF', itemColor: TEXT_SECONDARY, itemSelectedColor: INK },
    Input: { activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.14)' },
    Select: { optionSelectedBg: BRAND_SOFT },
  },
};
