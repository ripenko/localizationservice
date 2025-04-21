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
    importedLanguages?: {
        [name: string]: LocalizationLanguage;
    };
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
    onLanguageImported?: (name: string, language: LocalizationLanguage) => Promise<void>;
    /**
     * Initialized handler when language will be changed
     */
    onLanguageChanged?: (languageName: string, language: LocalizationLanguage | null) => Promise<void>;
    /**
     * Initialized handler when on localization there is missing localizion key
     */
    onLocalizationMissing?: (key: string, languageName: string, language: LocalizationLanguage | null, ...formatArgs: any[]) => string;
}
/**
 * Localization Service
 * @class LocalizationService
 */
export declare class LocalizationService {
    static DEFAULT_CULTURE_NAME: string;
    protected importedLanguages: {
        [name: string]: LocalizationLanguage;
    };
    protected currentLanguageName: string;
    protected currentLanguage: LocalizationLanguage;
    constructor(setup?: LocalizationServiceSetup);
    /**
     * Import new language without change the current language
     * @async
     * @param language language
     * @param name optional. language name. When language hat `__cultureName__` then `__cultureName__` will be use and this param will be ignored. If language has no property and name param is undefined then default language name will be used
     * @returns [[LocalizationService]]
     */
    readonly importLanguage: (language: LocalizationLanguage, name?: string) => Promise<LocalizationService>;
    readonly isLanguageImported: (name: string) => boolean;
    /**
     * Change the current language name
     * @async
     * @param languageName. optional. name of the language that should be current. If parameter is undefined, then language name will be default
     * @returns [[LocalizationService]]
     */
    readonly changeLanguage: (languageName?: string) => Promise<LocalizationService>;
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
    localize<T = string>(key: string, ...formatArgs: string[]): T;
    /**
     * Get current language name
     */
    readonly getCurrentLanguageName: () => string;
    protected localizeInternal<T = string>(key: string, languageName: string, language: LocalizationLanguage, formatArgs: string[]): T;
    protected onLanguageChanged: (languageName: string, language: LocalizationLanguage | null) => Promise<void>;
    protected onLocalizationMissing: (key: string, languageName: string, language: LocalizationLanguage, formatArgs: any[]) => string;
    protected onLanguageImported: (name: string, language: LocalizationLanguage) => Promise<void>;
}
