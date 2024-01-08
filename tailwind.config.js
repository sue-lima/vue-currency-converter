/** @type {import('tailwindcss').Config} */
export const content = [
  './src/components/**/*.{vue,js,ts,jsx,tsx}',
  './src/**/*.{vue,js,ts,jsx,tsx}',
];
export const theme = {
  extend: {
    colors: {
      gold: {
        50: '#fefcfa',
        100: '#f2e9de',
        200: '#F8F0E5',
        300: '#EADBC8',
        400: '#DAC0A3',
      },
    },
  },
};
export const plugins = [];

