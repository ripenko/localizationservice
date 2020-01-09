# localizationservice

The simple localization service

[![Build Status](https://travis-ci.org/ripenko/localizationservice.svg?branch=master)](https://travis-ci.org/ripenko/localizationservice)

Also there is `localizationkeys-webpack` that generates typescript class of localization keys. See [https://github.com/ripenko/localizationkeys-webpack].

## Installation

```
npm install --save localizationservice
```

## Usage

### Simple usage
method `localize`
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage
    },
    currentLanguage: defaultLanguage
});

const localized: string = service.localize("Key2.Key21");
console.log(localized);  // "Value 21"

```

### Example. The facade pattern with event bus integration
The events bus is `eventservice`. See [https://github.com/ripenko/eventservice]

There are two localization files `default.jsonc` and `de-de.json`. To generate localization keys from `default.jsonc` file we can use webpack plugin [https://github.com/ripenko/localizationkeys-webpack].

The `Localization.ts` file in your app.
```typescript
import LocalizationService from "localizationservice";
import EventService from "eventservice";

export default class Localization {
       
    private static service: LocalizationService | null = null;

    public static localize<T = string>(key: string, ...formatArgs: string[]): T {
        if (Localization.service == null) initService();
        return Localization.service.localize(key, formatArgs);
    }

    private static initService(): void {
        const defaultLanguage = require("localization/default.jsonc");
        const germanLanguage = require("localization/de-de.jsonc");
        Localization.service = new LocalizationService({
            importedLanguages: {
                [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage,
                "de-de": germanLanguage
            },
            onLanguageChanged: (languageName: string, language: ILocalizationLanguage): Promise<void> => {
                // we can notify subscribers that the current language has been changed.
                // if we use momentjs then we can change locale by `moment.locale(languageName);`
                // or numeraljs, etc...
                return EventService.fire("Events.Localization.LanguageChanged", { name: languageName, langauge: language });
            },
            onLanguageImported: (languageName: string, language: ILocalizationLanguage): Promise<void> => {
                // we can load language from api or some another place async to import it by `service.importLanguage` method
                // when new language will be imported we can update UI by refreshing a list of available languages
                return EventService.fire("Events.Localization.LanguageImported", { name: languageName, langauge: language });
            },
            onLocalizationMissing: (key: string, _languageName: string, _language: ILocalizationLanguage | null, _formatArgs: string[]): string => {
                // When localization has been not found in current language we return just key. 
                // The testers could find easy such unlocalizated places.
                // Or we can notify insights about missing values.
                // Or we can try to get value from default language.
                // Or write in the console, etc...
                return key;
            }
        });
    }

}

```

### Return localized object instead of certain string
Method `localize`. By default return type of method `localize<T = string>` is string.
If we pass a localization key that point doesn't point to string, but it points to the parent nested object, then localized result will be object.
Typically usecases: 

- dynamic key. if localization key is computed
- localized object should be passed to some component. (Example: Globalization, or localization of some Telerik control)

```typescript
import LocalizationService from "localizationservice";

interface IFeatureString {
    Title: string;
    Description: string;
}

const defaultLanguage = {
    "Feature": {
        "Title": "Some Title",
        "Description": "Some Description"
    }
};

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage
    },
    currentLanguage: defaultLanguage
});

const result: IFeatureString = service.localize<IFeatureString>("Feature");
console.log(result); // -> { Title: "Some Title", Description: "Some Description" }

```

### Changing the current language
method `changeLanguage`
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const germanLanguage = {
    "Key1": "Wert 1",
    "Key2": {
        "Key21": "Wert 21"
    }
}

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage,
        "de-de": germanLanguage
    },
    currentLanguage: defaultLanguage
});

await service.changeLanguage("de-DE"); // language name case will be lowered => de-de

const localized: string = service.localize("Key2.Key21");
console.log(localized);  // "Wert 21"

```

### Using onChangeLanguage handler. When the current language has been changed
method `changeLanguage` and constructor options property `onChangeLanguage`.
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const germanLanguage = {
    "Key1": "Wert 1",
    "Key2": {
        "Key21": "Wert 21"
    }
}

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage,
        "de-de": germanLanguage
    },
    currentLanguage: defaultLanguage,
    onChangeLanguage: async (languageName: string, language: ILocalizationLanguage | null): Promise<void> => {
        console.info(languageName, language);
    }
});

await service.changeLanguage("de-DE"); // language name case will be lowered => de-de
// -> de-de { Key1: "Wert 1", Key2: { Key21: "Wert 21" } }

```

### Importing new language using language property `__cultureName__`
method `importLanguage`.
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const germanLanguage = {
    __cultureName__: "de-de",
    "Key1": "Wert 1",
    "Key2": {
        "Key21": "Wert 21"
    }
}

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage
    },
    currentLanguage: defaultLanguage
});

// `__cultureName__` of `germanLanguage` will be used to definde language name
// The method doesn't change the current language. See `changeLanguage`.
// The language name detection priority is language property `__cultureName__`, 
// if there is no, then parameter `name`. If the parameter `name` is undefined,
// then `LocalizationService.DEFAULT_CULTURE_NAME`
await service.importLanguage(germanLanguage);

const localized: string = service.localize("Key2.Key21");
console.log(localized);  // "Value 21"

```

### Importing new language using optional method parameter `name`
method `importLanguage`.
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const germanLanguage = {
    "Key1": "Wert 1",
    "Key2": {
        "Key21": "Wert 21"
    }
}

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage
    },
    currentLanguage: defaultLanguage
});

// There is no `__cultureName__` of `germanLanguage`, 
// then parameter `name` will be used to definde language name `de-de` (case will be lowered).
// The method doesn't change the current language. See `changeLanguage`.
await service.importLanguage(germanLanguage, "de-DE");

const localized: string = service.localize("Key2.Key21");
console.log(localized);  // "Value 21"

```

### Importing new default language
method `importLanguage`.
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const germanLanguage = {
    "Key1": "Wert 1",
    "Key2": {
        "Key21": "Wert 21"
    }
}

const service = new LocalizationService({
    importedLanguages: {
        [LocalizationService.DEFAULT_CULTURE_NAME]: defaultLanguage
    },
    currentLanguage: defaultLanguage
});

// `__cultureName__` of `germanLanguage` will be used to definde language name
// The method doesn't change the current language. See `changeLanguage`.
await service.importLanguage(germanLanguage);

// To apply updated language you have to refresh current language
await service.changeLanguage();

const localized: string = service.localize("Key2.Key21");
console.log(localized);  // "Wert 21"

```

### Using on `onLanguageImported` handler. When the language has been imported.
constructor option `onLanguageImported` or property `onLanguageImported`.
```typescript
import LocalizationService from "localizationservice";

const defaultLanguage = {
    "Key1": "Value 1",
    "Key2": {
        "Key21": "Value 21"
    }
};

const service = new LocalizationService({
    onLanguageImported: async (name: string, language: ILocalizationLanguage): Promise<void> => {
        console.log(name, language);
    }
});

// `__cultureName__` of `defaultLanguage` will be used to definde language name
// The method doesn't change the current language. See `changeLanguage`.
await service.importLanguage(defaultLanguage);
// -> "" { Key1: "Value 1", Key2: { Key21: "Value 21" } }

```

### Using on `onLocalizationMissing` handler. When localization string has been not found
constructor option `onLocalizationMissing` or property `onLocalizationMissing`.
```typescript
import LocalizationService from "localizationservice";

const service = new LocalizationService({
    // name will be `LocalizationService.DEFAULT_CULTURE_NAME`, language is `{}`
    onLocalizationMissing: (key: string, name: string, language: ILocalizationLanguage): string => {
        return `Missed '${key}' for default language`;
    }
});

const result: string = service.localize("SomeKey");
console.log(result); // -> "Missed 'SomeKey' for default language"

```

## Credits
[Alexey Ripenko](http://ripenko.ru/), [GitHub](https://github.com/ripenko/)

## License

MIT
