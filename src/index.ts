import tailwindPlugin from 'tailwindcss/plugin';
import type {
  Config as TailwindConfig,
  PluginAPI as TailwindPluginAPI,
  PluginCreator as TailwindPluginCreator,
} from 'tailwindcss/types/config';

export type Config = Partial<TailwindConfig>;
export interface PluginAPI extends TailwindPluginAPI {
  addVar(name: string, value: string, prefix: string): void;
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
  addComponent(component: string, rule: RuleSet): void;
  addUtility(utility: string, style: DeclarationBlock): void;
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

export type ClassName = string;
export type ClassNames = ClassName[];

export type PropertyName = string;
export type PropertyValue = string;
export type PropertyVariant<T extends string> = {
  [key in T]: PropertyValue;
};
export type PropertyOption<T extends string> =
  | PropertyValue
  | PropertyVariant<T>;
export type PropertyConfig<T extends string> = {
  [key in PropertyName]: PropertyOption<T>;
};

export type UtilityName = string;
export type UtilityList = UtilityName[];
export type UtilityMap = {
  [key: UtilityName]: PropertyName;
};
export type Utilities = UtilityMap | UtilityList;

export type ComponentName = string;
export type ComponentOption =
  | UtilityName
  | Utilities
  | Record<UtilityName, Utilities>;

export interface ComponentList {
  [key: ComponentName]: ComponentOption;
}

export type DeclarationBlock = Record<string, string>;
export interface RuleSet {
  [key: string]: DeclarationBlock | RuleSet | string;
}

export type ExtraModifier = string | null;
export type Extra = { modifier: ExtraModifier };

export type StyleCallback = (value: string, extra: Extra) => RuleSet | null;
export type StyleCallbacks = Record<string, StyleCallback>;
export type StyleValues = Record<string, string>;

export type Selector = string;
export type SelectorList = Selector[];
export type SelectorCallback = () => Selector;
export type SelectorCallbackList = SelectorCallback[];

export type VariantName = string;
export type VariantDefinition =
  | Selector
  | SelectorCallback
  | SelectorList
  | SelectorCallbackList;
export type VariantCallback = (
  value: string,
  extra: Extra,
) => Selector | Selector[];
export type VariantCallbacks = Record<string, VariantCallback>;

export function extendAPI(api: TailwindPluginAPI): PluginAPI {
  const { config, e } = api;
  const _api: PluginAPI = {
    ...api,
    addVar(name: string, value: string, prefix = 'tw'): void {
      this.addBase({
        ':root': {
          [`--${prefix}-${name}`]: value,
        },
      });
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
    addComponent(component: string, rule: RuleSet): void {
      this.addComponents({ [`.${e(component)}`]: rule });
    },
    addUtility(utility: ClassName, style: DeclarationBlock): void {
      this.addUtilities({
        [`.${e(utility)}`]: style,
      });
    },
  };
  return _api;
}

const _plug: Plug = (plugin: Plugin): PluginCreator =>
  tailwindPlugin((api: TailwindPluginAPI) => {
    plugin(extendAPI(api));
  });

_plug.with = <T>(plugin: PluginWithOptions<T>): PluginCreatorWithOptions<T> =>
  tailwindPlugin.withOptions((options: T) => (api: TailwindPluginAPI) => {
    plugin(options)(extendAPI(api));
  });

export default _plug;
