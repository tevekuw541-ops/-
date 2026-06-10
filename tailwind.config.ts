import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        chalk: "#f7f2df",
        board: "#173d36",
        ink: "#18221f",
        mint: "#8ee6c9",
        yolk: "#ffd166",
        coral: "#ff7a59"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(24,34,31,0.14)"
      }
    }
  },
  plugins: []
} satisfies Config;
