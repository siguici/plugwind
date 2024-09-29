import tailwindPlugin from 'tailwindcss/plugin';
import type {
  Config as TailwindConfig,
  PluginAPI as TailwindPluginAPI,
  PluginCreator as TailwindPluginCreator,
} from 'tailwindcss/types/config';

export type Config = Partial<TailwindConfig>;
export interface PluginAPI extends TailwindPluginAPI {
  addThemes(themes: Record<string, RuleSet>): void;
  addTheme(theme: string, rule: RuleSet): void;
  addVars(vars: DeclarationBlock, className?: string, prefix?: string): void;
  addVar(
    name: string,
    value: string,
    className?: string,
    prefix?: string,
  ): void;
  addRoot(rule: RuleSet): void;
  addComponent(component: string, rule: RuleSet): void;
  addUtility(utility: string, style: DeclarationBlock): void;
  addProperty(property: string, value: string, utility?: string): void;
  addProperties(
    properties: DeclarationBlock,
    utilities: DeclarationBlock,
  ): void;
  addDark(component: string, darkRule: RuleSet, lightRule: RuleSet): void;
  addDarkVariant(
    component: string,
    darkRule: RuleSet,
    lightRule: RuleSet,
    variant?: string | string[],
  ): void;
  addDarkSelector(
    component: string,
    darkRule: RuleSet,
    lightRule: RuleSet,
    selector?: string,
  ): void;
  addDarkClass(
    component: string,
    darkRule: RuleSet,
    lightRule: RuleSet,
    className?: string,
  ): void;
  addDarkMedia(component: string, darkRule: RuleSet, lightRule: RuleSet): void;
}
export type Plugin = (api: PluginAPI) => void;
export type PluginWithOptions<T> = (options: T) => Plugin;
export type PluginCreator =
  | TailwindPluginCreator
  | { handler: TailwindPluginCreator; config?: Config };
export type PluginCreatorWithOptions<T> = {
  (options: T): { handler: Plugin; config?: Config };
  __isOptionsFunction: true;
};
export type Plugger = (plugin: Plugin) => PluginCreator;
export type PluggerWithOptions<T> = (
  plugin: PluginWithOptions<T>,
) => PluginCreatorWithOptions<T>;
export interface Plug {
  (plugin: Plugin): PluginCreator;
  with<T>(plugin: PluginWithOptions<T>): PluginCreatorWithOptions<T>;
}

export type DeclarationBlock = Record<string, string>;
export interface RuleSet {
  [key: string]: DeclarationBlock | RuleSet | string;
}

export function extendAPI<T extends TailwindPluginAPI>(api: T): PluginAPI {
  const { config, e } = api;
  const _api: PluginAPI = {
    ...api,
    addThemes(themes: Record<string, RuleSet>): void {
      for (const [theme, rule] of Object.entries(themes)) {
        this.addTheme(theme, rule);
      }
    },
    addTheme(theme: string, rule: RuleSet): void {
      this.addBase({
        [`data-theme="${theme}"`]: rule,
      });
    },
    addVars(vars: DeclarationBlock, className?: string, prefix?: string): void {
      const rule = Object.keys(vars).reduce(
        (acc, name) => {
          acc[`--${prefix ? `${prefix}-` : ''}${name}`] = vars[name];
          return acc;
        },
        {} as Record<string, string>,
      );
      className ? this.addComponent(className, rule) : this.addRoot(rule);
    },
    addVar(
      name: string,
      value: string,
      className?: string,
      prefix?: string,
    ): void {
      const rule = {
        [`--${prefix ? `${prefix}-` : ''}${name}`]: value,
      };
      className ? this.addComponent(className, rule) : this.addRoot(rule);
    },
    addRoot(rule: RuleSet): void {
      this.addBase({
        ':root': rule,
      });
    },
    addComponent(component: string, rule: RuleSet): void {
      this.addComponents({ [`.${e(component)}`]: rule });
    },
    addUtility(utility: string, style: DeclarationBlock): void {
      this.addUtilities({
        [`.${e(utility)}`]: style,
      });
    },
    addProperty(property: string, value: string, utility?: string): void {
      this.addUtility(utility ?? property, {
        [property]: value,
      });
    },
    addProperties(
      properties: DeclarationBlock,
      utilities: DeclarationBlock,
    ): void {
      for (const [property, value] of Object.entries(properties)) {
        this.addProperty(property, value, utilities[property]);
      }
    },
    addDark(
      component: string,
      darkRule: RuleSet,
      lightRule: RuleSet = {},
    ): void {
      const darkMode = config().darkMode || 'media';
      let strategy: 'media' | 'class' | 'selector' | 'variant';
      let selector: string[] | string | undefined;

      if (typeof darkMode === 'string') {
        strategy = darkMode;
        selector = undefined;
      } else {
        strategy = darkMode[0] || 'media';
        selector = darkMode[1];
      }

      switch (strategy) {
        case 'variant':
          this.addDarkVariant(component, darkRule, lightRule, selector);
          break;
        case 'selector':
          this.addDarkSelector(
            component,
            darkRule,
            lightRule,
            selector as string | undefined,
          );
          break;
        case 'class':
          this.addDarkClass(
            component,
            darkRule,
            lightRule,
            selector as string | undefined,
          );
          break;
        default:
          this.addDarkMedia(component, darkRule, lightRule);
      }
    },
    addDarkVariant(
      component: string,
      darkRule: RuleSet,
      lightRule: RuleSet = {},
      variant?: string | string[],
    ): void {
      const selectors = Array.isArray(variant) ? variant : [variant || '.dark'];
      for (const selector of selectors) {
        this.addComponent(component, {
          ...lightRule,
          [selector]: {
            ...darkRule,
          },
        });
      }
    },
    addDarkSelector(
      component: string,
      darkRule: RuleSet,
      lightRule: RuleSet = {},
      selector?: string,
    ): void {
      this.addComponent(component, {
        ...lightRule,
        [`&:where(${selector || '.dark'}, ${selector || '.dark'} *)`]: {
          ...darkRule,
        },
      });
    },
    addDarkClass(
      component: string,
      darkRule: RuleSet,
      lightRule: RuleSet = {},
      className?: string,
    ): void {
      this.addComponent(component, {
        ...lightRule,
        [`:is(${className || '.dark'} &)`]: {
          ...darkRule,
        },
      });
    },
    addDarkMedia(
      component: string,
      darkRule: RuleSet,
      lightRule: RuleSet = {},
    ): void {
      this.addComponent(component, {
        ...lightRule,
        '@media (prefers-color-scheme: dark)': {
          '&': {
            ...darkRule,
          },
        },
      });
    },
  };
  return _api;
}

export function plug(plugin: Plugin): PluginCreator {
  return tailwindPlugin((api: TailwindPluginAPI) => {
    plugin(extendAPI(api));
  });
}

export function plugWith<T>(
  plugin: PluginWithOptions<T>,
): PluginCreatorWithOptions<T> {
  return tailwindPlugin.withOptions(
    (options: T) => (api: TailwindPluginAPI) => {
      plugin(options)(extendAPI(api));
    },
  );
}

const _plug: Plug = Object.assign(plug, {
  with: plugWith,
});

export default _plug;
