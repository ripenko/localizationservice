import get from "lodash.get";

/**
 * Interface of localization language
 */
export type LocalizationLanguage = {
  /**
   * If this property exists then will be used to define language name
   */
  __cultureName__?: string;
} & {
  /**
   * Localization value by name. Could be nested.
   * ```typescript
   * {
   *      "key1": {
   *          "key1.1": {
   *              "Key1.1.1": "Some Value"
   *          }
   *      }
   * }
   * ```
   */
  [name: string]: string | LocalizationLanguageValue;
};

export interface LocalizationLanguageValue {
  [name: string]: string | LocalizationLanguageValue;
}

/**
 * Interface of init setup of [[LocalizationService]]
 * @interface ILocalizationServiceSetup
 * @see https://ripenko.github.com/localizationservice
 */
export interface LocalizationServiceSetup {
  /**
   * Initialized imported languages
   */
  importedLanguages?: { [name: string]: LocalizationLanguage };

  /**
   * Initialized current language name
   */
  currentLanguageName?: string;

  /**
   * Initialized current language
   */
  currentLanguage?: LocalizationLanguage;

  /**
   * Initialized handler when language will be imported
   */
  onLanguageImported?: (
    name: string,
    language: LocalizationLanguage
  ) => Promise<void>;

  /**
   * Initialized handler when language will be changed
   */
  onLanguageChanged?: (
    languageName: string,
    language: LocalizationLanguage | null
  ) => Promise<void>;

  /**
   * Initialized handler when on localization there is missing localizion key
   */
  onLocalizationMissing?: (
    key: string,
    languageName: string,
    language: LocalizationLanguage | null,
    ...formatArgs: any[]
  ) => string;
}

/**
 * Localization Service
 * @class LocalizationService
 */
export class LocalizationService {
  public static DEFAULT_CULTURE_NAME: string = "";

  protected importedLanguages: { [name: string]: LocalizationLanguage };
  protected currentLanguageName: string;
  protected currentLanguage: LocalizationLanguage;

  constructor(setup: LocalizationServiceSetup = {}) {
    const mergedSetup = {
      importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: {},
      },
      currentLanguageName: LocalizationService.DEFAULT_CULTURE_NAME,
      currentLanguage: {},
      onLanguageChanged: (
        _languageName: string,
        _language: LocalizationLanguage | null
      ): Promise<void> => {
        return Promise.resolve();
      },
      onLanguageImported: (
        _name: string,
        _language: LocalizationLanguage
      ): Promise<void> => {
        return Promise.resolve();
      },
      onLocalizationMissing: (
        key: string,
        _languageName: string,
        _language: LocalizationLanguage | null,
        _formatArgs: string[]
      ): string => {
        return key;
      },
      ...setup,
    };

    this.importedLanguages = mergedSetup.importedLanguages;
    this.currentLanguageName = mergedSetup.currentLanguageName;
    this.currentLanguage = mergedSetup.currentLanguage;

    this.onLanguageImported = mergedSetup.onLanguageImported;
    this.onLanguageChanged = mergedSetup.onLanguageChanged;
    this.onLocalizationMissing = mergedSetup.onLocalizationMissing;
  }

  /**
   * Import new language without change the current language
   * @async
   * @param language language
   * @param name optional. language name. When language hat `__cultureName__` then `__cultureName__` will be use and this param will be ignored. If language has no property and name param is undefined then default language name will be used
   * @returns [[LocalizationService]]
   */
  public importLanguage = async (
    language: LocalizationLanguage,
    name?: string
  ): Promise<LocalizationService> => {
    name =
      language.__cultureName__ ||
      name ||
      LocalizationService.DEFAULT_CULTURE_NAME;
    this.importedLanguages[name] = language;
    if (this.onLanguageImported != null)
      await this.onLanguageImported(name, language);
    return this;
  };

  /**
   * Change the current language name
   * @async
   * @param languageName. optional. name of the language that should be current. If parameter is undefined, then language name will be default
   * @returns [[LocalizationService]]
   */
  public changeLanguage = async (
    languageName?: string
  ): Promise<LocalizationService> => {
    languageName = (
      languageName || LocalizationService.DEFAULT_CULTURE_NAME
    ).toLowerCase();
    const lang = this.importedLanguages[languageName] || null;
    this.currentLanguage = lang;
    this.currentLanguageName = languageName;
    if (this.onLanguageChanged != null)
      await this.onLanguageChanged(languageName, lang);
    return this;
  };

  /**
   * Get localization by the key.
   * @param key The localization Key. To get nested value we use '.' to define nested properties
   * ```
   *    {
   *          "key1": {
   *              "key11": {
   *                  "Key111": "Some Value {0} {1}"
   *              }
   *          }
   *    }
   * ```
   * Key is "key1.key11.key111" to get "Some Value"
   * @param formatArgs The array of replacement values. '{0}', {1}, ..., {N}
   */
  public localize<T = string>(key: string, ...formatArgs: string[]): T {
    return this.localizeInternal(
      key,
      this.currentLanguageName,
      this.currentLanguage,
      formatArgs
    );
  }

  /**
   * Get current language name
   */
  public getCurrentLanguageName(): string {
    return this.currentLanguageName;
  }

  protected localizeInternal<T = string>(
    key: string,
    languageName: string,
    language: LocalizationLanguage,
    formatArgs: string[]
  ): T {
    let result: T = get(language || {}, key, null) as T;
    if (result == null && this.onLocalizationMissing != null) {
      result = this.onLocalizationMissing(
        key,
        languageName,
        language,
        formatArgs
      ) as T;
    }

    if (result != null && typeof result === "string" && formatArgs) {
      for (let index: number = 0; index < formatArgs.length; index++) {
        const arg: string = formatArgs[index];
        result = (result as string).replace(`{${index}}`, arg) as T;
      }
    }

    return result;
  }

  protected onLanguageChanged: (
    languageName: string,
    language: LocalizationLanguage | null
  ) => Promise<void>;

  protected onLocalizationMissing: (
    key: string,
    languageName: string,
    language: LocalizationLanguage,
    formatArgs: any[]
  ) => string;

  protected onLanguageImported: (
    name: string,
    language: LocalizationLanguage
  ) => Promise<void>;
}
