import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const theme = ref('light')

    // 将主题应用到 DOM
    function applyTheme(themeName) {
        if (themeName === 'dark') {
            document.documentElement.classList.add('dark-mode')
        } else {
            document.documentElement.classList.remove('dark-mode')
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            theme.value = savedTheme
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // 如果用户系统偏好深色，则使用深色主题
            theme.value = 'dark'
        }
        applyTheme(theme.value)
    }

    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', theme.value)
        applyTheme(theme.value)
    }

    function setTheme(newTheme) {
        theme.value = newTheme
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    }

    return {
        theme,
        initTheme,
        toggleTheme,
        setTheme
    }
})
