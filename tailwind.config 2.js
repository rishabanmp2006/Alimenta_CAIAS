/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': 'var(--color-surface)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-tertiary': 'var(--color-surface-tertiary)',
        'border': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'safe': 'var(--color-safe)',
        'safe-bg': 'var(--color-safe-bg)',
        'safe-light': 'var(--color-safe-light)',
        'risky': 'var(--color-risky)',
        'risky-bg': 'var(--color-risky-bg)',
        'risky-light': 'var(--color-risky-light)',
        'avoid': 'var(--color-avoid)',
        'avoid-bg': 'var(--color-avoid-bg)',
        'avoid-light': 'var(--color-avoid-light)',
        'accent': 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
    },
  },
  plugins: [],
}
