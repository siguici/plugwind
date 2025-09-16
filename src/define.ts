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
    const theme: Record<string, any> = {};
    for (let [key, value] of Object.entries(config.theme)) {
      key = `--${camelToSnake(key, '-')}`;
      if (typeof value === 'object' && value) {
        for (let [subkey, subvalue] of Object.entries(value)) {
          theme[`${key}-${camelToSnake(subkey, '-')}`] = subvalue;
        }
      } else {
        theme[key] = value;
      }
    }
    stmts.push({ '@theme': theme });
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
      stmts.push({ [`@layer base`]: base });
    },
    addComponents(utilities, options?) {
      stmts.push({ [`@layer components`]: utilities });
    },
    addUtilities(utilities, options?) {
      for (const [selector, rule] of Object.entries(utilities)) {
        stmts.push({ [`@utility ${selector}`]: rule });
      }
    },
    config(path, defaultValue) {
      return getData(path, config, defaultValue);
    },
    matchComponents(utilities, options?) {},
    matchUtilities(utilities, options?) {},
    matchVariant(name, value, options?) {},
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
