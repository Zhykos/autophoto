import {assertEquals} from "@std/assert";
import {describe, it} from "@std/testing/bdd";
import {CommonLocales, formatNumber} from "../../../src/utils/format-number";

describe("Correct Format Number Utils", () => {
    // Use a set to store all common locales.
    // It is useful to invalidate the test if a new locale is added and not tested.
    const commonLocales: Set<string> = new Set(Object.values(CommonLocales));
    it("should format number using default, the English (United States) locale", () => {
        const expected: string = (1000).toLocaleString("en-US");
        const result: string = formatNumber(1000, CommonLocales.EnglishUnitedStates);
        const resultWithDefault: string = formatNumber(1000);
        assertEquals(result, expected);
        assertEquals(resultWithDefault, expected);
        commonLocales.delete(CommonLocales.EnglishUnitedStates);
    });

    it("should format number using English (United Kingdom) locale", () => {
        const expected: string = (1000).toLocaleString("en-GB");
        const result: string = formatNumber(1000, CommonLocales.EnglishUnitedKingdom);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.EnglishUnitedKingdom);
    });

    it("should format number using French locale", () => {
        const expected: string = (1000).toLocaleString("fr-FR");
        const result: string = formatNumber(1000, CommonLocales.French);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.French);
    });

    it("should format number using German locale", () => {
        const expected: string = (1000).toLocaleString("de-DE");
        const result: string = formatNumber(1000, CommonLocales.German);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.German);
    });

    it("should format number using Spanish locale", () => {
        const expected: string = (1000).toLocaleString("es-ES");
        const result: string = formatNumber(1000, CommonLocales.Spanish);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.Spanish);
    });

    it("should format number using Italian locale", () => {
        const expected: string = (1000).toLocaleString("it-IT");
        const result: string = formatNumber(1000, CommonLocales.Italian);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.Italian);
    });

    it("should format number using Japanese locale", () => {
        const expected: string = (1000).toLocaleString("ja-JP");
        const result: string = formatNumber(1000, CommonLocales.Japanese);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.Japanese);
    });

    it("should format number using Chinese (Simplified) locale", () => {
        const expected: string = (1000).toLocaleString("zh-CN");
        const result: string = formatNumber(1000, CommonLocales.Chinese);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.Chinese);
    });

    it("should format number using Russian locale", () => {
        const expected: string = (1000).toLocaleString("ru-RU");
        const result: string = formatNumber(1000, CommonLocales.Russian);
        assertEquals(result, expected);
        commonLocales.delete(CommonLocales.Russian);
    });

    it("should test all common locales", () => {
        assertEquals(commonLocales.size, 0);
    });
});

describe("All format numbers should be the same", () => {
    it("should each format number be the same because the digits are less than 1000", () => {
        const number: number = 999;
        const expected: string = number.toLocaleString("en-US");
        // Test all common locales.
        Object.values(CommonLocales).forEach((locale: string) => {
            const result: string = formatNumber(number, locale);
            assertEquals(result, expected);
        });
    });
});
