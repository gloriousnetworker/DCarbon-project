// postcss.config.js
const { nextui } = require('@nextui-org/react');

module.exports = {
  plugins: [
    // Add PostCSS plugins here
    'tailwindcss', // Tailwind CSS plugin
    'autoprefixer', // Autoprefixer plugin
    nextui(), // NextUI plugin
  ],
};
