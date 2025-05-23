"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationService = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
/**
 * Localization Service
 * @class LocalizationService
 */
class LocalizationService {
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
        this.isLanguageImported = (name) => {
            return this.importedLanguages[name] != null;
        };
        /**
         * Change the current language name
         * @async
         * @param languageName. optional. name of the language that should be current. If parameter is undefined, then language name will be default
         * @returns [[LocalizationService]]
         */
        this.changeLanguage = async (languageName) => {
            languageName = languageName || LocalizationService.DEFAULT_CULTURE_NAME;
            const lang = this.importedLanguages[languageName] || null;
            this.currentLanguage = lang;
            this.currentLanguageName = languageName;
            if (this.onLanguageChanged != null)
                await this.onLanguageChanged(languageName, lang);
            return this;
        };
        /**
         * Get current language name
         */
        this.getCurrentLanguageName = () => {
            return this.currentLanguageName;
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
    localize(key, formatArgs) {
        return this.localizeInternal(key, this.currentLanguageName, this.currentLanguage, formatArgs);
    }
    localizeInternal(key, languageName, language, formatArgs) {
        let result = (0, lodash_get_1.default)(language || {}, key, null);
        if (result == null && this.onLocalizationMissing != null) {
            result = this.onLocalizationMissing(key, languageName, language, formatArgs);
        }
        if (result != null && typeof result === "string" && formatArgs) {
            for (const formatArgKey of Object.keys(formatArgs)) {
                result = result.replace(`{${formatArgKey}}`, formatArgs[formatArgKey]);
            }
        }
        return result;
    }
}
exports.LocalizationService = LocalizationService;
LocalizationService.DEFAULT_CULTURE_NAME = "";
