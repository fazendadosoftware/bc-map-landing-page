const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Axiforma-Regular', ...defaultTheme.fontFamily.sans],
        'extra-bold': ['Axiforma-ExtraBold', ...defaultTheme.fontFamily.sans],
        axiformabold: ['Axiforma-Bold', ...defaultTheme.fontFamily.sans]
      },
      fontSize: {
        tiny: '0.6rem',
        '13px': '13px'
      },
      padding: {
        '12px': '12px',
        '24px': '24px'
      },
      borderRadius: {
        DEFAULT: '3px'
      },
      colors: {
        leanix: {
          blue: '#166bff',
          gray: {
            dropdown: '#8995AF',
            light: '#ededed',
            lighter: '#AAB8CD',
            dark: '#4D5C7D',
            darkest: '#222F4B'
          }
        }
      },
      minHeight: {
        coltitle: '70px'
      },
      animation: {
        bouncehorizontal: 'bouncehorizontal 2s ease-in-out infinite'
      },
      keyframes: {
        bouncehorizontal: {
          '0%, 100%': { transform: 'translateX(-15%)' },
          '50%': { transform: 'translateX(0)' }
        }
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['last'],
      borderRadius: ['last'],
      padding: ['first'],
      backgroundColor: ['first']
    }
  },
  plugins: []
}
