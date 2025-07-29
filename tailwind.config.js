import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(accent-color)',
        default: 'var(--text-color)',
        muted: 'var(--aw-color-text-muted)',
        background: 'var(--background-color)',
        text: 'var(--aw-color-text-default)',
        'card-background': 'var(--aw-color-card-background)',

        'card-border': 'var(card-border)',

        'text-secondary': '#b0b0c0',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        mono: ['"VT323"', ...defaultTheme.fontFamily.mono],
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      dropShadow: {
        primary: '3px 3px 0 var(--primary-color)',
        accent: '4px 4px 0 var(--accent-color)',
        'accent-sm': '2px 2px 0 var(--accent-color)',
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
