/** @type {import('tailwindcss').Config} */
export const content = [
  './src/components/**/*.{vue,js,ts,jsx,tsx}',
  './src/**/*.{vue,js,ts,jsx,tsx}',
];
export const darkMode = 'class';
export const theme = {
  extend: {
    colors: {
      gold: {
        50: '#F2E9DE',
        100: '#F8F0E5',
        200: '#EADBC8',
        300: '#DEC6AC',
        400: '#AE9A82',
        500: '#756e64',
        600: '#5e5850',
        700: '#46423c',
        800: '#32302e',
        900: '#2f2c28'
      },
    },
  },
};
export const plugins = [];

