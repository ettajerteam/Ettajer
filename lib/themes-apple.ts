/** Apple-inspired Themes surface tokens */
export const themesApple = {
  blue: "#0071E3",
  blueHover: "#005FCC",
  bg: "#F5F5F7",
  white: "#FFFFFF",
  text: "#1D1D1F",
  textSecondary: "#6E6E73",
  border: "#E5E5E7",
  radiusCard: "18px",
  radiusBtn: "12px",
  radiusPreview: "20px",
  shadowPreview:
    "0 22px 70px -28px rgba(0,0,0,0.28), 0 8px 24px -12px rgba(0,0,0,0.12)",
  shadowPhone:
    "0 28px 60px -20px rgba(0,0,0,0.45), 0 10px 24px -10px rgba(0,0,0,0.2)",
  font: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif",
} as const;

export const themesPrimaryBtn =
  "inline-flex h-11 items-center justify-center rounded-[12px] bg-[#0071E3] px-5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#005FCC] active:scale-[0.98]";

export const themesSecondaryBtn =
  "inline-flex h-11 items-center justify-center rounded-[12px] border border-[#E5E5E7] bg-white px-5 text-[14px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:bg-[#F5F5F7] active:scale-[0.98]";

export const themesTextBtn =
  "inline-flex h-11 items-center justify-center rounded-[12px] px-3 text-[14px] font-medium text-[#6E6E73] transition-colors duration-200 hover:text-[#1D1D1F]";
