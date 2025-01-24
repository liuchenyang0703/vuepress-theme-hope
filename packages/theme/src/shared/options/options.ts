import type { ThemeData as DefaultThemeData } from "@vuepress/plugin-theme-data";

import type { AppearanceConfig, AppearanceOptions } from "./appearance.js";
import type { FeatureConfig, FeatureOptions } from "./feature/index.js";
import type { InfoOptions } from "./info.js";
import type { LayoutOptions } from "./layout/index.js";
import type { ThemeLocaleConfig, ThemeLocaleOptions } from "./locales.js";
import type { MarkdownOptions } from "./markdown.js";
import type { PluginsOptions } from "./plugins/index.js";

export interface ThemeOptions
  extends AppearanceOptions,
    FeatureOptions,
    InfoOptions,
    LayoutOptions,
    DefaultThemeData<ThemeLocaleOptions> {
  /**
   * Theme markdown options
   *
   * 主题 markdown 选项
   */
  markdown?: MarkdownOptions;

  /**
   * Theme plugins options
   *
   * 主题插件选项
   */
  plugins?: PluginsOptions;

  /**
   * @experimental
   *
   * Whether to preserve header information in page data
   *
   * 是否保留页面数据中的 header 信息
   *
   * @default false
   */
  preserveHeader?: boolean;
}

export interface ThemeData
  extends AppearanceConfig,
    FeatureConfig,
    InfoOptions {
  locales: Record<string, ThemeLocaleConfig>;
}
