import get from "lodash.get";

/**
 * Interface of localization language
 */
export interface ILocalizationLanguage {
    /**
     * If this property exists then will be used to define language name
     */
    __cultureName__?: string;
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
    [name: string]: string | ILocalizationLanguageValue;
}

export interface ILocalizationLanguageValue {
    [name: string]: string | ILocalizationLanguageValue;
}

/**
 * Interface of init setup of [[LocalizationService]]
 * @interface ILocalizationServiceSetup
 * @see https://ripenko.github.com/localizationservice
 */
export interface ILocalizationServiceSetup {
    /**
     * Initialized imported languages
     */
    importedLanguages?: { [name: string]: ILocalizationLanguage };

    /**
     * Initialized current language name
     */
    currentLanguageName?: string;

    /**
     * Initialized current language
     */
    currentLanguage?: ILocalizationLanguage;

    /**
     * Initialized handler when language will be imported
     */
    onLanguageImported?: (name: string, language: ILocalizationLanguage) => Promise<void>;

    /**
     * Initialized handler when language will be changed
     */
    onLanguageChanged?: (languageName: string, language: ILocalizationLanguage | null) => Promise<void>;

    /**
     * Initialized handler when on localization there is missing localizion key
     */
    onLocalizationMissing?: (key: string, languageName: string, language: ILocalizationLanguage | null, ...formatArgs: any[]) => string;
}

/**
 * Localization Service
 * @class LocalizationService
 */
export default class LocalizationService {

    public static DEFAULT_CULTURE_NAME: string = "";

    protected importedLanguages: { [name: string]: ILocalizationLanguage };
    protected currentLanguageName: string;
    protected currentLanguage: ILocalizationLanguage;

    constructor(setup: ILocalizationServiceSetup = {}) {
        setup = {
            importedLanguages: {
                [LocalizationService.DEFAULT_CULTURE_NAME]: {}
            },
            currentLanguageName: LocalizationService.DEFAULT_CULTURE_NAME,
            currentLanguage: {},
            onLanguageChanged: (_languageName: string, _language: ILocalizationLanguage | null): Promise<void> => {
                return Promise.resolve();
            },
            onLanguageImported: (_name: string, _language: ILocalizationLanguage): Promise<void> => {
                return Promise.resolve();
            },
            onLocalizationMissing: (key: string, _languageName: string, _language: ILocalizationLanguage | null, _formatArgs: string[]): string => {
                return key;
            },
            ...setup
        }

        this.importedLanguages = setup.importedLanguages;
        this.currentLanguageName = setup.currentLanguageName;
        this.currentLanguage = setup.currentLanguage;

        this.onLanguageImported = setup.onLanguageImported;
        this.onLanguageChanged = setup.onLanguageChanged;
        this.onLocalizationMissing = setup.onLocalizationMissing;
    }

    /**
     * Import new language without change the current language
     * @async
     * @param language language
     * @param name optional. language name. When language hat `__cultureName__` then `__cultureName__` will be use and this param will be ignored. If language has no property and name param is undefined then default language name will be used
     * @returns [[LocalizationService]]
     */
    public importLanguage = async (language: ILocalizationLanguage, name?: string): Promise<LocalizationService> => {
        name = language.__cultureName__ || name || LocalizationService.DEFAULT_CULTURE_NAME;
        this.importedLanguages[name] = language;
        if (this.onLanguageImported != null) await this.onLanguageImported(name, language);
        return this;
    }

    /**
     * Change the current language name
     * @async
     * @param languageName. optional. name of the language that should be current. If parameter is undefined, then language name will be default
     * @returns [[LocalizationService]]
     */
    public changeLanguage = async (languageName?: string): Promise<LocalizationService> => {
        languageName = (languageName || LocalizationService.DEFAULT_CULTURE_NAME).toLowerCase();
        const lang = this.importedLanguages[languageName] || null;
        this.currentLanguage = lang;
        this.currentLanguageName = languageName;
        if (this.onLanguageChanged != null) await this.onLanguageChanged(languageName, lang);
        return this;
    }

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
        return this.localizeInternal(key, this.currentLanguageName, this.currentLanguage, formatArgs);
    }

    /**
     * Get current language name
     */
    public getCurrentLanguageName(): string {
        return this.currentLanguageName;
    }

    protected localizeInternal<T = string>(key: string, languageName: string, language: ILocalizationLanguage | null, formatArgs: string[]): T {
        let result = get(language || {}, key, null);
        if (result == null && this.onLocalizationMissing != null) {
            result = this.onLocalizationMissing(key, languageName, language, formatArgs);
        }

        if (result != null && typeof result === "string" && formatArgs) {
            for (let index: number = 0; index < formatArgs.length; index++) {
                const arg: string = formatArgs[index];
                result = result.replace(`{${index}}`, arg);
            }
        }

        return result;
    }
    protected onLanguageChanged: (languageName: string, language: ILocalizationLanguage | null) => Promise<void>;

    protected onLocalizationMissing: (key: string, languageName: string, language: ILocalizationLanguage, formatArgs: any[]) => string;

    protected onLanguageImported: (name: string, language: ILocalizationLanguage) => Promise<void>;

}
