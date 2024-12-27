/**
 * A useful enumeration of common locales.
 *
 * The values are supported by the BCP 47 standard.
 */
export enum CommonLocales {
  EnglishUnitedStates = "en-US",
  EnglishUnitedKingdom = "en-GB",
  French = "fr-FR",
  German = "de-DE",
  Spanish = "es-ES",
  Italian = "it-IT",
  Japanese = "ja-JP",
  Chinese = "zh-CN",
  Russian = "ru-RU",
}

/**
 * Formats a number using the specified locale.
 * For example, 1000 will be formatted as 1,000 in English (United States).
 *
 * @param number - The number to format.
 * @param locales - The default locale to use for formatting is English (United States).
 *                  You can use the {@link CommonLocales} enumeration to specify a locale,
 *                  or you can hardcode a locale string using the
 *                  {@link https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry|BCP 47 standard}.
 * @returns The formatted number.
 */
export function formatNumber(
  number: number,
  locales: CommonLocales | string = CommonLocales.EnglishUnitedStates,
): string {
  return number.toLocaleString(locales);
}
