import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070a0d",
        paper: "#f4f7f3",
        fog: "#dce5df",
        brass: "#ea7a28",
        slate: "#3b4752",
        moss: "#14b8a6",
      },
      boxShadow: {
        editorial: "0 24px 70px rgba(0, 0, 0, 0.24)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
