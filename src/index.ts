import tailwindPlugin from 'tailwindcss/plugin';
import type {
  Config as TailwindConfig,
  PluginAPI as TailwindPluginAPI,
  PluginCreator as TailwindPluginCreator,
} from 'tailwindcss/types/config';

export type Config = Partial<TailwindConfig>;
export interface PluginAPI extends TailwindPluginAPI {
  addVar(name: string, value: string, prefix: string): void;
  addDark(className: string, lightRule: RuleSet, darkRule: RuleSet): void;
  addComponent(className: string, rule: RuleSet): void;
  addUtility(className: ClassName, style: DeclarationBlock): void;
  addVariant(name: VariantName, definition: VariantDefinition): void;
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
    addDark(className: string, lightRule: RuleSet, darkRule: RuleSet): void {
      const darkMode = config().darkMode || 'media';
      const rules: RuleSet = {};

      if (darkRule !== undefined) {
        let strategy: string;
        let selector: string | string[] | undefined;

        if (
          darkMode === 'media' ||
          darkMode === 'class' ||
          darkMode === 'selector'
        ) {
          strategy = darkMode;
          selector = undefined;
        } else {
          strategy = darkMode[0] || 'media';
          selector = darkMode[1];
        }

        switch (strategy) {
          case 'variant': {
            const selectors = Array.isArray(selector)
              ? selector
              : [selector || '.dark'];
            for (const selector of selectors) {
              rules[className] = {
                ...lightRule,
                [selector]: {
                  ...darkRule,
                },
              };
            }
            break;
          }
          case 'selector':
            rules[className] = {
              ...lightRule,
              [`&:where(${selector || '.dark'}, ${selector || '.dark'} *)`]: {
                ...darkRule,
              },
            };
            break;
          case 'class':
            rules[className] = {
              ...lightRule,
              [`:is(${selector || '.dark'} &)`]: {
                ...darkRule,
              },
            };
            break;
          default:
            rules[className] = {
              ...lightRule,
              '@media (prefers-color-scheme: dark)': {
                '&': {
                  ...darkRule,
                },
              },
            };
        }
      } else {
        rules[className] = lightRule;
      }

      this.addComponents(rules);
    },
    addComponent(className: string, rule: RuleSet): void {
      this.addComponents({ [`.${e(className)}`]: rule });
    },
    addUtility(className: ClassName, style: DeclarationBlock): void {
      this.addUtilities({
        [`.${e(className)}`]: style,
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
