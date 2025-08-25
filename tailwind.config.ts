import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nahr: {
          'blue-primary': '#005073',
          'blue-primary-hover': '#01648e',
          'blue-secondary': '#48A9A6',
          'blue-secondary-hover': '#5dc2bf',
          'red-danger': '#C1292E',
        },
      },
    },
  },
  plugins: [],
};
export default config;