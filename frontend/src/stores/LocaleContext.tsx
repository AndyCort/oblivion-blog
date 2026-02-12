import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface LocaleContextType {
    locale: string
    initLocale: () => void
    setLocale: (newLocale: string) => void
    toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState('zh-CN')

    const initLocale = useCallback(() => {
        const savedLocale = localStorage.getItem('locale')
        if (savedLocale) {
            setLocaleState(savedLocale)
        }
    }, [])

    const setLocale = useCallback((newLocale: string) => {
        setLocaleState(newLocale)
        localStorage.setItem('locale', newLocale)
    }, [])

    const toggleLocale = useCallback(() => {
        setLocaleState((prev) => {
            const next = prev === 'zh-CN' ? 'en-US' : 'zh-CN'
            localStorage.setItem('locale', next)
            return next
        })
    }, [])

    useEffect(() => {
        initLocale()
    }, [initLocale])

    return (
        <LocaleContext.Provider value={{ locale, initLocale, setLocale, toggleLocale }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    const ctx = useContext(LocaleContext)
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
    return ctx
}
