import get from "lodash.get";
/**
 * Localization Service
 * @class LocalizationService
 */
export class LocalizationService {
    constructor(setup = {}) {
        /**
         * Import new language without change the current language
         * @async
         * @param language language
         * @param name optional. language name. When language hat `__cultureName__` then `__cultureName__` will be use and this param will be ignored. If language has no property and name param is undefined then default language name will be used
         * @returns [[LocalizationService]]
         */
        this.importLanguage = async (language, name) => {
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
        this.changeLanguage = async (languageName) => {
            languageName = (languageName || LocalizationService.DEFAULT_CULTURE_NAME).toLowerCase();
            const lang = this.importedLanguages[languageName] || null;
            this.currentLanguage = lang;
            this.currentLanguageName = languageName;
            if (this.onLanguageChanged != null)
                await this.onLanguageChanged(languageName, lang);
            return this;
        };
        const mergedSetup = {
            importedLanguages: {
                [LocalizationService.DEFAULT_CULTURE_NAME]: {},
            },
            currentLanguageName: LocalizationService.DEFAULT_CULTURE_NAME,
            currentLanguage: {},
            onLanguageChanged: (_languageName, _language) => {
                return Promise.resolve();
            },
            onLanguageImported: (_name, _language) => {
                return Promise.resolve();
            },
            onLocalizationMissing: (key, _languageName, _language, _formatArgs) => {
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
    localize(key, ...formatArgs) {
        return this.localizeInternal(key, this.currentLanguageName, this.currentLanguage, formatArgs);
    }
    /**
     * Get current language name
     */
    getCurrentLanguageName() {
        return this.currentLanguageName;
    }
    localizeInternal(key, languageName, language, formatArgs) {
        let result = get(language || {}, key, null);
        if (result == null && this.onLocalizationMissing != null) {
            result = this.onLocalizationMissing(key, languageName, language, formatArgs);
        }
        if (result != null && typeof result === "string" && formatArgs) {
            for (let index = 0; index < formatArgs.length; index++) {
                const arg = formatArgs[index];
                result = result.replace(`{${index}}`, arg);
            }
        }
        return result;
    }
}
LocalizationService.DEFAULT_CULTURE_NAME = "";
