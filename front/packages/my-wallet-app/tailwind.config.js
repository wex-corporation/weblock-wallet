// tailwind.config.js
module.exports = {
  content: [
    './index.html', // Tailwind가 적용될 HTML 파일
    './src/**/*.{js,ts,jsx,tsx}' // Tailwind가 적용될 React 컴포넌트들
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
