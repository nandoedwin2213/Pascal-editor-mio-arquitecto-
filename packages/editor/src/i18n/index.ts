import { useLanguage } from '../store/use-language'
import { es } from './es'

export function t(key: string, context?: string): string {
  if (useLanguage.getState().language === 'en') {
    return key
  }

  if (context) {
    const scoped = es[`${key}|${context}`]
    if (scoped) {
      return scoped
    }
  }

  return es[key] ?? key
}
