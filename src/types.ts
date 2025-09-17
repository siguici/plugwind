import type tailwindColors from 'tailwindcss/colors';

export type Css = string;
export type CssStmt = Css | Css[] | CssInJs | CssInJs[];
export type CssInJs = {
  [key: string]: CssStmt;
};
export type CssStmts = CssStmt[];

export type PluginUtils = {
  theme: (keypath: string, defaultValue?: any) => any;
  colors: typeof tailwindColors;
};

export type ResolvableTo<T> = T | ((utils: PluginUtils) => T);
export type ThemeValue =
  | ResolvableTo<Record<string, unknown>>
  | null
  | undefined;
export type ThemeConfig = Record<string, ThemeValue> & {
  extend?: Record<string, ThemeValue>;
};
export type ContentFile =
  | string
  | {
      raw: string;
      extension?: string;
    };
export type DarkModeStrategy =
  | false
  | 'media'
  | 'class'
  | ['class', string]
  | 'selector'
  | ['selector', string]
  | ['variant', string | string[]];
export interface UserConfig {
  presets?: UserConfig[];
  theme?: ThemeConfig;
  plugins?: Plugin[];
}
export interface UserConfig {
  content?:
    | ContentFile[]
    | {
        relative?: boolean;
        files: ContentFile[];
      };
}
export interface UserConfig {
  darkMode?: DarkModeStrategy;
}
export interface UserConfig {
  prefix?: string;
}
export interface UserConfig {
  blocklist?: string[];
}
export interface UserConfig {
  important?: boolean | string;
}
export interface UserConfig {
  future?: 'all' | Record<string, boolean>;
}
export type NamedUtilityValue = {
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
