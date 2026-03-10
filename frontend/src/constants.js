export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const RARITY_COLORS = {
  common: "#a0a0a0",
  uncommon: "#7ecfb0",
  rare: "#c8a84b",
  mythic: "#e8834a",
  special: "#c77dff",
  bonus: "#ff6b9d",
};

export const COLOR_SYMBOLS = {
  avg_price_white: { symbol: "W", color: "#f9f6e8", label: "White" },
  avg_price_blue: { symbol: "U", color: "#6ab0e0", label: "Blue" },
  avg_price_black: { symbol: "B", color: "#c084c0", label: "Black" },
  avg_price_red: { symbol: "R", color: "#e07060", label: "Red" },
  avg_price_green: { symbol: "G", color: "#60b870", label: "Green" },
  avg_price_multicolor: { symbol: "M", color: "#c8a84b", label: "Multi" },
  avg_price_colorless: { symbol: "C", color: "#a0b0c0", label: "Colorless" },
};
