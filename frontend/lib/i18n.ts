/**
 * Internationalization utilities
 */

export type Locale = 'it' | 'en'

export const defaultLocale: Locale = 'en'

export function isValidLocale(locale: string): locale is Locale {
  return ['it', 'en'].includes(locale)
}

export function getLocaleFromPath(path: string): Locale {
  const match = path.match(/^\/(it|en)/)
  if (match && isValidLocale(match[1])) {
    return match[1]
  }
  return defaultLocale
}
