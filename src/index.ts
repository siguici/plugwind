import plugin from 'tailwindcss/plugin';
import type {
  Config,
  DarkModeConfig,
  PluginAPI,
  PluginCreator,
} from 'tailwindcss/types/config';

export type PluginWithoutOptions =
  | PluginCreator
  | {
      handler: PluginCreator;
      config?: Partial<Config>;
    };
export type PluginWithOptions<T> = {
  (
    options: T,
  ): {
    handler: PluginCreator;
    config?: Partial<Config> | undefined;
  };
  __isOptionsFunction: true;
};

export type HandlerParams = { api: PluginAPI; plugger: Plugger };
export type HandlerParamsWithOptions<T> = HandlerParams & { options: T };
export type PluginHandler = (params: HandlerParams) => PluginCreator;
export type PluginWithOptionsHandler<T> = (
  params: HandlerParamsWithOptions<T>,
) => PluginCreator;

export function plug(handler: PluginHandler): PluginWithoutOptions {
  return plugin((api: PluginAPI) => {
    const plugger = new Plugger(api);
    return handler({ api, plugger });
  });
}

export function plugWithOptions<T>(
  handler: PluginWithOptionsHandler<T>,
): PluginWithOptions<T> {
  return plugin.withOptions((options: T) => (api: PluginAPI) => {
    const plugger = new PluggerWithOptions(api, options);
    return handler({ api, plugger, options });
  });
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
export type StyleCallback = (
  value: string,
  extra: { modifier: string | null },
) => RuleSet | null;
export type StyleCallbacks = Record<string, StyleCallback>;
export type StyleValues = Record<string, string>;

export type DarkMode = Partial<DarkModeConfig>;

export class Plugger {
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
}

export class PluggerWithOptions<T> extends Plugger {
  constructor(
    api: PluginAPI,
    readonly options: T,
  ) {
    super(api);
  }
}
