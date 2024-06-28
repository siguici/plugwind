# [🧩 PlugWind](https://jsr.io/@siguici/plugwind)

[PlugWind](https://jsr.io/@siguici/plugwind) makes it easy to create TailwindCSS plugins.

## 🚀 Installation

You can install [`PlugWind`](https://github.com/siguici/plugwind) from [`NPM`](https://npmjs.com/package/plugwind.js) or [`JSR`](https://jsr.io/@siguici/plugwind):

- Using `npm`:

  From [`NPM`](https://npmjs.com/package/plugwind.js):

  ```bash
  npm install plugwind.js
  ```

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  npx jsr add @siguici/plugwind
  ```

- Using `Yarn`:

  From [`NPM`](https://npmjs.com/package/plugwind.js):

  ```bash
  yarn add plugwind.js
  ```

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  yarn dlx jsr add @siguici/plugwind
  ```

- Using `PNPM`:

  From [`NPM`](https://npmjs.com/package/plugwind.js):

  ```bash
  pnpm add plugwind.js
  ```

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  pnpm dlx jsr add @siguici/plugwind
  ```

- Using `Bun`:

  From [`NPM`](https://npmjs.com/package/plugwind.js):

  ```bash
  bun install plugwind.js
  ```

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  bunx jsr add @siguici/plugwind
  ```

- Using `Deno`:

  From [`NPM`](https://npmjs.com/package/plugwind.js):

  ```bash
  deno install npm:plugwind.js
  ```

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  deno add @siguici/plugwind
  ```

  Without install:

  ```typescript
  import plugwind.js from 'jsr:@siguici/plugwind';
  ```

## 💡 Usage

- Import from `node_modules`:

  ```javascript
  import plug from 'plugwind.js';
  ```

- Import without install (using `Deno`):

  ```javascript
  import plug from 'jsr:@siguici/plugwind';
  ```

- Use the `plug` function to define a plugin:

  ```typescript
  export default plug(({ plugin }) => {
    plugin
      .addBase(base)
      .addDark(className, lightRule, darkRule)
      .addVar(varName, varValue, varPrefix = 'tw'))
      .addComponent(className, rule)
      .addComponents(components)
      .addUtility(className, style)
      .addUtilities(utilities)
      .addVariant(variants);
  });
  ```

- Use the `plug.with` method to define a plugin with options:

  ```typescript
  export default plug.with<{ prefix?: string }>(({ plugin, options }) => {
    plugin.addVar(name, $value, options.prefix ?? 'tw');
  });
  ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md file](./LICENSE.md) for details.
