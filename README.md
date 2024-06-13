# [🧩 PlugWind](https://jsr.io/@siguici/plugwind)

[PlugWind](https://jsr.io/@siguici/plugwind) makes it easy to create TailwindCSS plugins.

## 🚀 Installation

You can install [`PlugWind`](https://plugwind.js.org) from [`NPM`](https://npmjs.com/package/plugwind) or [`JSR`](https://jsr.io/@siguici/plugwind):

- Using `npm`:

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  npx jsr add @siguici/plugwind
  ```

- Using `Yarn`:

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  yarn dlx jsr add @siguici/plugwind
  ```

- Using `PNPM`:

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  pnpm dlx jsr add @siguici/plugwind
  ```

- Using `Bun`:

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  bunx jsr add @siguici/plugwind
  ```

- Using `Deno`:

  From [`JSR`](https://jsr.io/@siguici/plugwind):

  ```bash
  deno add @siguici/plugwind
  ```

  Without install:

  ```typescript
  import plugwind from 'jsr:@siguici/plugwind';
  ```

## 💡 Usage

- Import from `node_modules`:

  ```javascript
  import { plug } from 'plugwind';
  ```

- Import without install (using `Deno`):

  ```javascript
  import { plug } from 'jsr:@siguici/plugwind';
  ```

- Use the `plug` function to define a plugin:

  ```typescript
  export default plug(({ plugin }) => {
    plugin
      .addBase($base)
      .addVar($varName, $varValue, $varPrefix = 'tw'))
      .addComponents($components)
      .addUtilities($utilities);
  });
  ```

- Use the `plug.with` method to define a plugin with options:

  ```typescript
  export default plug.with<{ prefix?: string }>(({ plugin, options }) => {
    plugin
      .addBase($base)
      .addVar($varName, $varValue, options.prefix ?? 'tw')
      .addComponents($components)
      .addUtilities($utilities);
  });
  ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md file](./LICENSE.md) for details.
