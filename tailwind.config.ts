import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF7A00',
          600: '#e56e00',
          700: '#cc6200',
          800: '#b35600',
          900: '#994a00',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF7A00',
          600: '#e56e00',
          700: '#cc6200',
          800: '#b35600',
          900: '#994a00',
        },
        brand: {
          black: '#000000',
          orange: '#FF7A00',
          white: '#FFFFFF',
          lightGray: '#F2F2F2',
          mediumGray: '#CCCCCC',
          darkGray: '#545454',
        },
      },
      fontFamily: {
        arabic: ['Dubai', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
