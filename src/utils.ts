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
