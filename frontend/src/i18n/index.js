import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'zh-CN',
    messages: {
        'zh-CN': zh,
        'en-US': en
    }
})

export default i18n
