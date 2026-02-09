import relumePreset from "@relume_io/relume-tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [relumePreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
