/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        raga: {
          bg:       '#0f0f13',
          surface:  '#1a1a24',
          card:     '#22222f',
          border:   '#2e2e3e',
          accent:   '#7c6fcd',
          'accent-light': '#9d92db',
          muted:    '#6b6b80',
          text:     '#e8e8f0',
          'text-secondary': '#9898a8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
