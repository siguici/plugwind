import { extendAPI, type Plugin, type PluginAPI } from './index';
import type { Css, CssInJs, CssStmts, UserConfig } from './types';
import {
  camelToSnake,
  getData,
  mergeRules,
  NAMESPACE_MAP,
  normalizeTheme,
  replaceInCssStmt,
  valueOptions,
} from './utils';

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
      const _options = valueOptions(options);
      const supportsNegativeValues = options?.supportsNegativeValues;
      for (const [selector, value] of Object.entries(utilities)) {
        let rules = value('<value>', { modifier: '<modifier>' });
        for (const mod of _options.modifiers) {
          rules = replaceInCssStmt(rules, '<modifier>', mod);
        }
        let positiveRules: (CssInJs | CssInJs[])[] = [];
        let negativeRules: (CssInJs | CssInJs[])[] = [];
        for (const val of _options.values) {
          positiveRules.push(replaceInCssStmt(rules, '<value>', val));
          if (supportsNegativeValues) {
            negativeRules.push(
              replaceInCssStmt(rules, '<value>', `calc(${val} * -1)`),
            );
          }
        }
        stmts.push({
          [`@utility ${selector}-*`]:
            positiveRules.length > 0 ? mergeRules(positiveRules) : rules,
        });
        if (supportsNegativeValues && negativeRules.length > 0) {
          stmts.push({
            [`@utility -${selector}-*`]: mergeRules(negativeRules),
          });
        }
      }
    },
    matchVariant(name, value, options?) {
      let stmt = value('<value>', {
        modifier: options?.sort ? '@slot' : null,
      });

      const values = options?.values ?? {};
      const variants = Array.isArray(stmt) ? stmt : [stmt];

      for (const [k, v] of Object.entries(values)) {
        for (const variant of variants) {
          stmts.push(
            `@custom-variant ${k} (${variant.replace('<value>', String(v))});`,
          );
        }
      }

      if (!options?.values || Object.keys(options.values).length === 0) {
        for (const variant of variants) {
          stmts.push(`@custom-variant ${name} (${variant});`);
        }
      }
    },
    prefix(className) {
      const prefix = config?.prefix ?? '';
      return `${prefix}${className}`;
    },
    theme(path, defaultValue?) {
      if (!path) return defaultValue ?? '';

      const root = path.split('.')[0];
      const ns = NAMESPACE_MAP[root];

      if (ns) {
        return `--value(${ns})`;
      }

      const themeRoot = config?.theme?.[root] ?? config?.theme?.extend?.[root];

      if (themeRoot !== undefined) {
        return `--value(--${camelToSnake(root)}-*)`;
      }

      if (defaultValue) {
        return defaultValue;
      }

      return '';
    },
  }));
  plugin(api);
  return stmts;
}

export default function (plugin: Plugin, config?: UserConfig): Css {
  return renderCss(definePlugin(plugin, config));
}
