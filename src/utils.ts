import type { CssInJs, CssRule, NamedUtilityValue, ThemeConfig } from './types';

export const NAMESPACE_MAP: Record<string, string> = {
  colors: '--color-*',
  color: '--color-*', // Small semantic fallback
  fontFamily: '--font-*',
  font: '--font-*',
  fontSize: '--text-*',
  text: '--text-*',
  fontWeight: '--font-weight-*',
  letterSpacing: '--tracking-*',
  tracking: '--tracking-*',
  lineHeight: '--leading-*',
  leading: '--leading-*',
  screens: '--breakpoint-*',
  screen: '--breakpoint-*',
  container: '--container-*',
  maxWidth: '--container-*',
  spacing: '--spacing-*',
  width: '--spacing-*',
  height: '--spacing-*',
  inset: '--spacing-*',
  borderRadius: '--radius-*',
  radius: '--radius-*',
  boxShadow: '--shadow-*',
  shadow: '--shadow-*',
  insetShadow: '--inset-shadow-*',
  dropShadow: '--drop-shadow-*',
  drop: '--drop-shadow-*',
  blur: '--blur-*',
  perspective: '--perspective-*',
  aspectRatio: '--aspect-*',
  aspect: '--aspect-*',
  transitionTimingFunction: '--ease-*',
  ease: '--ease-*',
  animation: '--animate-*',
  animate: '--animate-*',
};

export function camelToSnake(str: string, sep = '-'): string {
  return str.replace(/([A-Z])/g, `${sep}$1`).toLowerCase();
}

export function getData(
  path: string | undefined,
  data: any,
  defaultValue: any,
): any {
  if (path === undefined) return defaultValue;

  if (data[path] !== undefined) return data[path];

  const value = path.split('.').reduce((acc, key) => acc[key], data);

  return value ?? defaultValue;
}

export function normalizeValue(value: any): any {
  if (typeof value === 'function') {
    return value();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue).join(', ');
  }

  return value;
}

export function normalizeTheme(config: ThemeConfig): Record<string, any> {
  const base: Record<string, any> = {};
  const extensions: Record<string, any> = {};

  for (const [key, value] of Object.entries(config)) {
    if (key === 'extend') {
      Object.assign(extensions, value);
    } else {
      base[key] = value;
    }
  }

  for (const [key, value] of Object.entries(extensions)) {
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
  for (const [key, value] of Object.entries(base)) {
    const prefix = `--${camelToSnake(key, '-')}`;
    if (typeof value === 'object' && value) {
      for (const [subkey, subvalue] of Object.entries(value)) {
        theme[`${prefix}-${camelToSnake(subkey, '-')}`] =
          normalizeValue(subvalue);
      }
    } else {
      theme[prefix] = normalizeValue(value);
    }
  }

  return theme;
}

export function valueOptions(
  options?: Partial<{
    type: string | string[];
    values: Record<string, string> & {
      __BARE_VALUE__?: (value: NamedUtilityValue) => string | undefined;
    };
    modifiers: 'any' | Record<string, string>;
  }>,
): {
  values: string[];
  modifiers: string[];
} {
  const types: string[] = [];
  if (options?.type) {
    types.push(
      ...(Array.isArray(options.type) ? options.type : [options.type]),
    );
  }

  const values: string[] = [];
  if (options?.values) {
    const literals: string[] = [];
    for (const [key, val] of Object.entries(options.values)) {
      let _val = '';
      if (typeof val === 'function') {
        const bare = val({
          kind: 'named',
          value: '<value>',
          fraction: '<fraction>',
        });
        if (bare) {
          _val = bare;
        }
      }
      if (key === '__BARE_VALUE__') {
        const vals = types;
        if (_val.includes('<fraction>')) {
          vals.push('ratio', '[radio]');
        }
        if (vals.length > 0) {
          _val = _val.replace('<value>', `--value(${vals.join(', ')})`);
        }
      }
      if (!_val.startsWith('--value')) {
        _val = `--value(${_val})`;
      }
      if (_val.startsWith('--value(')) {
        values.push(_val);
      } else {
        literals.push(key);
      }
    }
    if (literals.length > 0) {
      values.push(
        `--value(${[...types, ...literals.map((l) => `"${l}"`)].join(', ')})`,
      );
    }
  }

  const modifiers: string[] = [];
  if (options?.modifiers) {
    if (options.modifiers === 'any') {
      modifiers.push('--modifer([*])');
    } else {
      for (let [mod, typ] of Object.entries(options.modifiers)) {
        if (mod in NAMESPACE_MAP) {
          mod = NAMESPACE_MAP[mod];
        }
        modifiers.push(`--modifer(${[mod, `[${typ}]`, '[*]'].join(', ')})`);
      }
    }
  }

  return {
    values,
    modifiers,
  };
}

export function replaceInCssRule<T extends CssRule>(
  rule: T,
  from: string,
  to: string,
): T {
  if (typeof rule === 'string') {
    return rule.replace(from, to) as T;
  }
  if (Array.isArray(rule)) {
    return rule.map((item) => replaceInCssRule(item, from, to)) as T;
  }
  const _rule: CssInJs = {};
  for (const [key, value] of Object.entries(rule)) {
    _rule[key] = replaceInCssRule(value, from, to);
  }
  return _rule as T;
}

export function mergeRules(
  rules: (CssInJs | CssInJs[])[],
): CssInJs | CssInJs[] {
  if (rules.length === 0) return {};
  if (rules.length === 1) return rules[0];
  return Object.assign({}, ...rules.flat());
}
export type Css = string;
export type CssRule = Css | Css[] | CssInJs | CssInJs[];
export type CssInJs = {
  [key: string]: CssRule;
};

export function deepMergeCss(...rules: CssInJs[]): CssInJs {
  const result: CssInJs = {};

  for (const rule of rules) {
    for (const key in rule) {
      const oldVal = result[key];
      const newVal = rule[key];

      if (oldVal !== undefined) {
        result[key] = mergeCssRule(oldVal, newVal);
      } else {
        result[key] = newVal;
      }
    }
  }

  return result;
}

function mergeCssRule(a: CssRule, b: CssRule): CssRule {
  if (a === b) {
    return a;
  }

  // string + string
  if (isCssString(a) && isCssString(b)) {
    return a === b ? a : [a, b];
  }

  // string + string[]
  if (isCssString(a) && isStringArray(b)) {
    return b.includes(a) ? b : [a, ...b];
  }
  if (isStringArray(a) && isCssString(b)) {
    return a.includes(b) ? a : [...a, b];
  }

  // string[] + string[]
  if (isStringArray(a) && isStringArray(b)) {
    return Array.from(new Set([...a, ...b]));
  }

  // CssInJs + CssInJs
  if (isCssInJs(a) && isCssInJs(b)) {
    return deepMergeCss(a, b);
  }

  // CssInJs[] + CssInJs
  if (isCssInJsArray(a) && isCssInJs(b)) {
    return [...a, b];
  }
  if (isCssInJs(a) && isCssInJsArray(b)) {
    return [a, ...b];
  }

  // CssInJs[] + CssInJs[]
  if (isCssInJsArray(a) && isCssInJsArray(b)) {
    return [...a, ...b];
  }

  return b;
}

export function isCssString(rule: CssRule): rule is string {
  return typeof rule === 'string';
}

export function isStringArray(rule: CssRule): rule is string[] {
  return Array.isArray(rule) && rule.every((item) => typeof item === 'string');
}

export function isCssInJs(rule: CssRule): rule is CssInJs {
  return typeof rule === 'object' && !Array.isArray(rule);
}

export function isCssInJsArray(rule: CssRule): rule is CssInJs[] {
  return Array.isArray(rule) && rule.every((item) => isCssInJs(item));
}
