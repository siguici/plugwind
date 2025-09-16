import { extendAPI, type Plugin, type PluginAPI, type RuleSet } from './index';
import type tailwindColors from 'tailwindcss/colors';

type Css = string;
type CssStmt = Css | Css[] | CssInJs | CssInJs[];
type CssInJs = {
  [key: string]: CssStmt;
};
type CssStmts = CssStmt[];

type PluginUtils = {
  theme: (keypath: string, defaultValue?: any) => any;
  colors: typeof tailwindColors;
};

type ResolvableTo<T> = T | ((utils: PluginUtils) => T);
type ThemeValue = ResolvableTo<Record<string, unknown>> | null | undefined;
type ThemeConfig = Record<string, ThemeValue> & {
  extend?: Record<string, ThemeValue>;
};
type ContentFile =
  | string
  | {
      raw: string;
      extension?: string;
    };
type DarkModeStrategy =
  | false
  | 'media'
  | 'class'
  | ['class', string]
  | 'selector'
  | ['selector', string]
  | ['variant', string | string[]];
interface UserConfig {
  presets?: UserConfig[];
  theme?: ThemeConfig;
  plugins?: Plugin[];
}
interface UserConfig {
  content?:
    | ContentFile[]
    | {
        relative?: boolean;
        files: ContentFile[];
      };
}
interface UserConfig {
  darkMode?: DarkModeStrategy;
}
interface UserConfig {
  prefix?: string;
}
interface UserConfig {
  blocklist?: string[];
}
interface UserConfig {
  important?: boolean | string;
}
interface UserConfig {
  future?: 'all' | Record<string, boolean>;
}
type NamedUtilityValue = {
  kind: 'named';
  /**
   * ```
   * bg-red-500
   *    ^^^^^^^
   *
   * w-1/2
   *   ^
   * ```
   */
  value: string;
  /**
   * ```
   * w-1/2
   *   ^^^
   * ```
   */
  fraction: string | null;
};

function camelToSnake(str: string, sep = '-'): string {
  return str.replace(/([A-Z])/g, `${sep}$1`).toLowerCase();
}

function getData(path: string | undefined, data: any, defaultValue: any): any {
  if (path === undefined) return defaultValue;

  if (data[path] !== undefined) return data[path];

  const value = path.split('.').reduce((acc, key) => acc[key], data);

  return value ?? defaultValue;
}

function normalizeValue(value: any): any {
  if (typeof value === 'function') {
    return value();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue).join(', ');
  }

  return value;
}

function normalizeTheme(config: ThemeConfig): Record<string, any> {
  const base: Record<string, any> = {};
  const extensions: Record<string, any> = {};

  for (let [key, value] of Object.entries(config)) {
    if (key === 'extend') {
      Object.assign(extensions, value);
    } else {
      base[key] = value;
    }
  }

  for (let [key, value] of Object.entries(extensions)) {
    if (typeof base[key] === 'object' && base[key] !== null) {
      base[key] = {
        ...base[key],
        ...value,
      };
    } else {
      base[key] = value;
    }
  }

  const theme: Record<string, any> = {};
  for (let [key, value] of Object.entries(base)) {
    const prefix = `--${camelToSnake(key, '-')}`;
    if (typeof value === 'object' && value) {
      for (let [subkey, subvalue] of Object.entries(value)) {
        theme[`${prefix}-${camelToSnake(subkey, '-')}`] =
          normalizeValue(subvalue);
      }
    } else {
      theme[prefix] = normalizeValue(value);
    }
  }

  return theme;
}

export function renderCss(stmts: CssStmts): Css {
  return JSON.stringify(stmts, undefined, 4);
}

export function definePlugin(plugin: Plugin, config?: UserConfig): CssStmts {
  let stmts: CssStmts = [];
  if (config?.prefix || config?.important) {
    let head = '@import "tailwindcss"';
    if (config?.important) head += ' important';
    if (config?.prefix) head += ` prefix(${config.prefix})`;
    head += ';';
    stmts.push(head);
  }
  if (config?.theme) {
    stmts.push({ '@theme': normalizeTheme(config.theme) });
  }
  let prefix = config?.prefix || '';
  const api: PluginAPI = extendAPI(() => ({
    addVariant(name, variant) {
      if (typeof variant === 'string') {
        stmts.push(`@custom-variant ${name} (${variant});`);
      } else if (Array.isArray(variant)) {
        stmts.push(`@custom-variant ${name} (${variant.join(', ')});`);
      } else {
        stmts.push({ [`@custom-variant ${name}`]: { ...variant } });
      }
    },
    addBase(base) {
      const _base: CssInJs = {};
      for (let [selector, rules] of Object.entries(base)) {
        if (typeof rules === 'object' && rules) {
          const _rules: CssInJs = {};
          for (const [property, value] of Object.entries(rules)) {
            _rules[camelToSnake(property)] = value;
          }
          rules = _rules;
        }
        _base[selector] = rules;
      }
      stmts.push({ [`@layer base`]: _base });
    },
    addComponents(components, options?) {
      const _components: CssInJs = {};
      for (let [selector, rules] of Object.entries(components)) {
        if (typeof rules === 'object' && rules) {
          const _rules: CssInJs = {};
          for (const [property, value] of Object.entries(rules)) {
            _rules[camelToSnake(property)] = value;
          }
          rules = _rules;
        }
        _components[selector] = rules;
      }
      stmts.push({ [`@layer components`]: _components });
    },
    addUtilities(utilities, options?) {
      for (let [selector, rules] of Object.entries(utilities)) {
        if (selector.startsWith('.')) {
          selector = selector.substring(1);
        }
        if (typeof rules === 'object' && rules) {
          const _rules: CssInJs = {};
          for (const [property, value] of Object.entries(rules)) {
            _rules[camelToSnake(property)] = value;
          }
          rules = _rules;
        }
        stmts.push({ [`@utility ${selector}`]: rules });
      }
    },
    config(path, defaultValue) {
      return getData(path, config, defaultValue);
    },
    matchComponents(utilities, options?) {
      throw new Error('`matchComponents` is not implemented yet');
    },
    matchUtilities(utilities, options?) {
      throw new Error('`matchUtilities` is not implemented yet');
    },
    matchVariant(name, value, options?) {
      const _value = value('<value>', {
        modifier: '<modifier>',
      });
      if (options?.values) {
        for (const [k, v] of Object.entries(options.values)) {
          if (Array.isArray(_value)) {
            for (const _v of _value) {
              stmts.push(`@custom-variant ${k} (${_v.replace('<value>', v)});`);
            }
          } else {
            stmts.push(
              `@custom-variant ${k} (${_value.replace('<value>', v)});`,
            );
          }
        }
      }
    },
    prefix(className) {
      return (prefix = className || prefix);
    },
    theme(path, defaultValue?) {
      return `--value(${camelToSnake(path).replace('.', '-')}-*${defaultValue ? `, ${defaultValue}` : ''})`;
    },
  }));
  plugin(api);
  return stmts;
}

export default function (plugin: Plugin, config?: UserConfig): Css {
  return renderCss(definePlugin(plugin, config));
}
