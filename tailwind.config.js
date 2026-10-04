const { tokens } = require('jiti')(process.cwd())('./src/theme/tokens.ts');

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { ...tokens.colors.light, dark: tokens.colors.dark },
      borderRadius: tokens.radius,
      spacing: tokens.layout,
      fontFamily: { inter: ['Inter'], nunito: ['Nunito'] },
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography).map(([name, token]) => [
          name,
          [
            `${token.fontSize}px`,
            {
              lineHeight: `${token.lineHeight}px`,
              letterSpacing: `${token.letterSpacing}px`,
            },
          ],
        ]),
      ),
    },
  },
};
