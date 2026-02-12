import { useCallback } from 'react'
import { useLocale } from '../stores/LocaleContext'
import zh from './zh.json'
import en from './en.json'

const messages = {
    'zh-CN': zh,
    'en-US': en,
}

export function useTranslation() {
    const { locale } = useLocale()

    const t = useCallback(
        (key, params) => {
            const keys = key.split('.')
            let value = messages[locale] || messages['zh-CN']
            for (const k of keys) {
                value = value?.[k]
            }
            if (typeof value !== 'string') return key

            // Handle interpolation like {current} / {total}
            if (params) {
                return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
            }
            return value
        },
        [locale]
    )

    return { t, locale }
}
