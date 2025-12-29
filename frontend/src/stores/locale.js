import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref('zh-CN')

    function initLocale() {
        const savedLocale = localStorage.getItem('locale')
        if (savedLocale) {
            locale.value = savedLocale
        }
    }

    function setLocale(newLocale) {
        locale.value = newLocale
        localStorage.setItem('locale', newLocale)
    }

    function toggleLocale() {
        const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
        setLocale(newLocale)
    }

    return {
        locale,
        initLocale,
        setLocale,
        toggleLocale
    }
})
