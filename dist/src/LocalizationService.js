"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_get_1 = __importDefault(require("lodash.get"));
/**
 * Localization Service
 * @class LocalizationService
 */
var LocalizationService = /** @class */ (function () {
    function LocalizationService(setup) {
        var _a;
        var _this = this;
        if (setup === void 0) { setup = {}; }
        /**
         * Import new language without change the current language
         * @async
         * @param language language
         * @param name optional. language name. When language hat `__cultureName__` then `__cultureName__` will be use and this param will be ignored. If language has no property and name param is undefined then default language name will be used
         * @returns [[LocalizationService]]
         */
        this.importLanguage = function (language, name) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = language.__cultureName__ || name || LocalizationService.DEFAULT_CULTURE_NAME;
                        this.importedLanguages[name] = language;
                        if (!(this.onLanguageImported != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.onLanguageImported(name, language)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        }); };
        /**
         * Change the current language name
         * @async
         * @param languageName. optional. name of the language that should be current. If parameter is undefined, then language name will be default
         * @returns [[LocalizationService]]
         */
        this.changeLanguage = function (languageName) { return __awaiter(_this, void 0, void 0, function () {
            var lang;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        languageName = (languageName || LocalizationService.DEFAULT_CULTURE_NAME).toLowerCase();
                        lang = this.importedLanguages[languageName] || null;
                        this.currentLanguage = lang;
                        this.currentLanguageName = languageName;
                        if (!(this.onLanguageChanged != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.onLanguageChanged(languageName, lang)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        }); };
        setup = __assign({ importedLanguages: (_a = {},
                _a[LocalizationService.DEFAULT_CULTURE_NAME] = {},
                _a), currentLanguageName: LocalizationService.DEFAULT_CULTURE_NAME, currentLanguage: {}, onLanguageChanged: function (_languageName, _language) {
                return Promise.resolve();
            }, onLanguageImported: function (_name, _language) {
                return Promise.resolve();
            }, onLocalizationMissing: function (key, _languageName, _language, _formatArgs) {
                return key;
            } }, setup);
        this.importedLanguages = setup.importedLanguages;
        this.currentLanguageName = setup.currentLanguageName;
        this.currentLanguage = setup.currentLanguage;
        this.onLanguageImported = setup.onLanguageImported;
        this.onLanguageChanged = setup.onLanguageChanged;
        this.onLocalizationMissing = setup.onLocalizationMissing;
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
    LocalizationService.prototype.localize = function (key) {
        var formatArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            formatArgs[_i - 1] = arguments[_i];
        }
        return this.localizeInternal(key, this.currentLanguageName, this.currentLanguage, formatArgs);
    };
    /**
     * Get current language name
     */
    LocalizationService.prototype.getCurrentLanguageName = function () {
        return this.currentLanguageName;
    };
    LocalizationService.prototype.localizeInternal = function (key, languageName, language, formatArgs) {
        var result = lodash_get_1.default(language || {}, key, null);
        if (result == null && this.onLocalizationMissing != null) {
            result = this.onLocalizationMissing(key, languageName, language, formatArgs);
        }
        if (result != null && typeof result === "string" && formatArgs) {
            for (var index = 0; index < formatArgs.length; index++) {
                var arg = formatArgs[index];
                result = result.replace("{" + index + "}", arg);
            }
        }
        return result;
    };
    LocalizationService.DEFAULT_CULTURE_NAME = "";
    return LocalizationService;
}());
exports.default = LocalizationService;
//# sourceMappingURL=LocalizationService.js.map