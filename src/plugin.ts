import colors from 'tailwindcss/colors';
import definePlugin from './define';

const css = definePlugin(
  ({
    addBase,
    addComponents,
    addUtilities,
    addVariant,
    matchUtilities,
    matchComponents,
    matchVariant,
    theme,
    config,
  }) => {
    addBase({
      body: {
        margin: 0,
        fontFamily: theme('fontFamily.sans', 'system-ui'),
      },
    });

    addUtilities({
      '.text-shadow': {
        textShadow: '2px 2px 5px rgba(0,0,0,0.3)',
      },
      '.no-scrollbar': {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
      },
    });

    addComponents({
      '.btn': {
        padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
        borderRadius: theme('borderRadius.md'),
        fontWeight: '600',
      },
      '.btn-primary': {
        backgroundColor: colors.blue[600],
        color: 'white',
      },
    });

    addVariant('supports-grid', '@supports (display: grid)');

    matchUtilities(
      {
        m: (value) => ({
          margin: `--value(${value}, [length])`,
        }),
      },
      {
        values: theme('spacing'),
        supportsNegativeValues: true,
        type: 'length',
      },
    );

    matchUtilities(
      {
        rotate: (value) => ({
          transform: `rotate(--value(${value}, angle))`,
        }),
      },
      {
        type: ['angle', 'integer'],
      },
    );

    /*
    matchComponents(
      {
        card: (color) => ({
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.lg'),
          backgroundColor: color,
          boxShadow: theme('boxShadow.lg'),
        }),
      },
      {
        values: {
          primary: 'white',
          secondary: colors.gray[100],
          danger: colors.red[50],
        },
      },
    );
    */

    matchVariant(
      'hover-bg',
      (value) => `&:hover { background-color: ${value}; }`,
      {
        values: {
          primary: colors.blue[500],
          danger: colors.red[500],
        },
      },
    );

    matchVariant('supports', (value) => `@supports (${value})`, {
      values: {
        grid: '(display: grid)',
        backdrop: '(backdrop-filter: blur(1px))',
      },
    });

    matchUtilities(
      {
        m: (value, { modifier }) => ({
          margin: modifier ? `${value}/${modifier}` : value,
        }),
      },
      {
        values: theme('spacing'),
        supportsNegativeValues: true,
        type: 'length',
      },
    );

    matchUtilities(
      {
        opacity: (value, { modifier }) => ({
          opacity: modifier ? `calc(${value} * ${modifier})` : value,
        }),
      },
      {
        values: {
          DEFAULT: '1',
          50: '0.5',
          __BARE_VALUE__: (utility) => {
            // Exemple : `.opacity-[0.33]` → `0.33`
            if (/^\d*\.?\d+$/.test(utility.value)) return utility.value;
            return undefined;
          },
        },
        type: ['percentage', 'number'],
      },
    );

    matchUtilities(
      {
        border: (value, { modifier }) => ({
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: value,
          ...(modifier === 'dashed' ? { borderStyle: 'dashed' } : {}),
        }),
      },
      {
        values: theme('colors'),
        modifiers: {
          dashed: 'string',
          dotted: 'string',
        },
        type: 'color',
      },
    );

    /*
    matchComponents(
      {
        card: (value, { modifier }) => ({
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.lg'),
          backgroundColor: value,
          boxShadow:
            modifier === 'hover'
              ? theme('boxShadow.xl')
              : theme('boxShadow.md'),
        }),
      },
      {
        values: {
          white: '#fff',
          gray: colors.gray[100],
          blue: colors.blue[50],
        },
        modifiers: {
          hover: 'string',
        },
      },
    );
    */

    matchVariant(
      'state',
      (value, { modifier }) => {
        let base = `&:${value}`;
        if (modifier) base += `.${modifier}`;
        return base;
      },
      {
        values: {
          hover: 'hover',
          focus: 'focus',
          active: 'active',
        },
        sort: (a, b) => {
          const order = ['hover', 'focus', 'active'];
          return (
            order.indexOf(a.value as string) - order.indexOf(b.value as string)
          );
        },
      },
    );

    matchVariant(
      'motion',
      (value) => [
        `@media (prefers-reduced-motion: ${value})`,
        `@supports (animation: ${value})`,
      ],
      {
        values: {
          safe: 'reduce',
          fancy: 'no-preference',
        },
      },
    );

    const darkMode = config('darkMode', 'media');
    console.log('Dark mode configured as:', darkMode);
  },
  {
    prefix: 'tw',
    important: true,
    darkMode: 'class',
    theme: {
      extend: {
        spacing: {
          72: '18rem',
          84: '21rem',
          96: '24rem',
        },
        borderRadius: {
          xl: '1.25rem',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        boxShadow: {
          lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
        },
      },
    },
  },
);

console.log(css);
