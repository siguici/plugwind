import tailwindPlugin from 'tailwindcss/plugin';
import type {
  Config,
  DarkModeConfig,
  PluginAPI,
  PluginCreator,
} from 'tailwindcss/types/config';

export type TailwindPlugin =
  | PluginCreator
  | {
      handler: PluginCreator;
      config?: Partial<Config>;
    };
export type TailwindPluginWithOptions<T> = {
  (
    options: T,
  ): {
    handler: PluginCreator;
    config?: Partial<Config> | undefined;
  };
  __isOptionsFunction: true;
};

export type PluggerAPI = PluginAPI & { plugin: Plugin };
export type PluggerWithOptionsAPI<T> = PluggerAPI & { options: T };
export type Plugger = (api: PluggerAPI) => PluginCreator;
export type PluggerWithOptions<T> = (
  api: PluggerWithOptionsAPI<T>,
) => PluginCreator;

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

export type DarkMode = Partial<DarkModeConfig>;

export class Plugin {
  readonly darkMode: DarkMode = 'media';

  constructor(readonly api: PluginAPI) {
    const { config } = api;
    this.darkMode = config().darkMode || 'media';
  }

  public addVar(name: string, value: string, prefix = 'tw'): this {
    return this.addBase({
      ':root': {
        [`--${prefix}-${name}`]: value,
      },
    });
  }

  public addBase(base: RuleSet | RuleSet[]): this {
    this.api.addBase(base);
    return this;
  }

  public addComponents(components: RuleSet | RuleSet[]): this {
    this.api.addComponents(components);
    return this;
  }

  public matchComponents(
    components: StyleCallbacks,
    values: StyleValues = {},
  ): this {
    this.api.matchComponents(components, {
      values,
    });
    return this;
  }

  public addUtilities(utilities: RuleSet | RuleSet[]): this {
    this.api.addUtilities(utilities);
    return this;
  }

  public matchUtilities(
    utilities: StyleCallbacks,
    values: StyleValues = {},
  ): this {
    this.api.matchUtilities(utilities, {
      values,
    });
    return this;
  }

  public addVariant(name: VariantName, definition: VariantDefinition): this {
    this.api.addVariant(name, definition);
    return this;
  }

  public matchVariant(
    name: VariantName,
    callback: VariantCallback,
    values: StyleValues = {},
  ): this {
    this.api.matchVariant(name, callback, {
      values,
    });
    return this;
  }
}

export class PluginWithOptions<T> extends Plugin {
  constructor(
    api: PluginAPI,
    readonly options: T,
  ) {
    super(api);
  }
}

const _plug = (plugger: Plugger): TailwindPlugin =>
  tailwindPlugin((api: PluginAPI) => {
    const plugin = new Plugin(api);
    return plugger({ ...api, plugin });
  });

_plug.with = <T>(
  plugger: PluggerWithOptions<T>,
): TailwindPluginWithOptions<T> =>
  tailwindPlugin.withOptions((options: T) => (api: PluginAPI) => {
    const plugin = new PluginWithOptions(api, options);
    return plugger({ ...api, plugin, options });
  });

export default _plug;
