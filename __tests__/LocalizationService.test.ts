import { it, expect } from "vitest";

import LocalizationService, {
  LocalizationLanguage,
} from "../src/LocalizationService";

it("Default. Localize. key => key", async () => {
  const result: string = new LocalizationService().localize("Some Key");
  expect(result).toEqual("Some Key");
});

it("Setup. CurrentLanguageName", async () => {
  const result: string = new LocalizationService({
    currentLanguageName: "de-DE",
  }).getCurrentLanguageName();

  expect(result).toEqual("de-DE");
});

it("Setup. importedLanguages", async () => {
  const service = new LocalizationService({
    importedLanguages: {
      "": {
        "Some.Key": "Some Key",
      },
    },
  });

  let result: string = (await service.changeLanguage("")).localize("Some.Key");
  expect(result).toEqual("Some Key");

  result = (
    await service.importLanguage({
      Some: {
        Key: "Some Key {0}.{1}",
      },
    })
  ).localize("Some.Key");
  expect(result).toEqual("Some Key");

  await service.changeLanguage("");
  result = service.localize("Some.Key", "1", "2");

  expect(result).toEqual("Some Key 1.2");
});

it("Setup. currentLanguage", async () => {
  const result: string = new LocalizationService({
    currentLanguage: {
      "Some.Key": "Some Key",
    },
  }).localize("Some.Key");
  expect(result).toEqual("Some Key");
});

it("Setup. onLanguageChanged", async () => {
  let changedLanguage: LocalizationLanguage | null = null;
  let changedLanguageName: string | null = null;
  await new LocalizationService({
    importedLanguages: {
      [""]: {},
      somelanguage: {
        "Some.Key": "Some Key",
      },
    },
    onLanguageChanged: async (
      languageName: string,
      language: LocalizationLanguage | null
    ): Promise<void> => {
      changedLanguage = language;
      changedLanguageName = languageName;
    },
  }).changeLanguage("SomeLanguage");

  expect(changedLanguageName).toEqual("somelanguage");
  expect(changedLanguage).toEqual({
    "Some.Key": "Some Key",
  });
});

it("Setup. onLanguageImported", async () => {
  let importedLanguageName: string | null = null;
  let importedLanguage: LocalizationLanguage | null = null;
  const service = new LocalizationService({
    onLanguageImported: async (
      name: string,
      language: LocalizationLanguage
    ) => {
      importedLanguageName = name;
      importedLanguage = language;
    },
  });

  await service.importLanguage({
    __cultureName__: "some-language",
    Some: {
      Key: "SOME KEY",
    },
  });
  await service.changeLanguage("Some-Language");
  let result: string = service.localize("Some.Key");
  expect(importedLanguageName).toEqual("some-language");
  expect(importedLanguage).toEqual({
    __cultureName__: "some-language",
    Some: {
      Key: "SOME KEY",
    },
  });
  expect(result).toEqual("SOME KEY");

  await service.importLanguage(
    {
      "Some.Key": "SOME KEY 2",
    },
    "some-language-2"
  );
  await service.changeLanguage("Some-Language-2");
  result = service.localize("Some.Key");
  expect(importedLanguageName).toEqual("some-language-2");
  expect(importedLanguage).toEqual({
    "Some.Key": "SOME KEY 2",
  });
  expect(result).toEqual("SOME KEY 2");

  await service.importLanguage({
    "Some.Key": "SOME KEY {0}",
  });
  await service.changeLanguage("");
  result = service.localize("Some.Key", "3");
  expect(importedLanguageName).toEqual("");
  expect(importedLanguage).toEqual({
    "Some.Key": "SOME KEY {0}",
  });
  expect(result).toEqual("SOME KEY 3");
});

it("Not existed language", async () => {
  const service = new LocalizationService();
  await service.changeLanguage("bla bla language");
  const result: string = service.localize("Some.Key");

  expect(result).toEqual("Some.Key");
});

it("Returns localized object", async () => {
  const language: LocalizationLanguage = {
    __cultureName__: "",
    SomeKey: {
      Key1: "Value1",
      Key2: "Value2",
    },
  };
  const service = new LocalizationService({
    importedLanguages: {
      "": language,
    },
    currentLanguage: language,
  });
  const result = service.localize("SomeKey");
  expect(result).toEqual({
    Key1: "Value1",
    Key2: "Value2",
  });
});
