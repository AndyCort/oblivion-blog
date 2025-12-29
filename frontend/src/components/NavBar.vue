<template>
  <nav class="nav-bar" :class="{ 'nav-hidden': !navVisible }">
    <!-- nav-left -->
    <div class="nav-left">
      <div class="site-title">
        <a href="/">{{ title }}</a>
      </div>
    </div>
    
    <!-- 汉堡菜单按钮 (移动端) -->
    <button class="menu-toggle" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
      <i :class="['fas', mobileMenuOpen ? 'fa-xmark' : 'fa-bars']"></i>
    </button>
    
    <!-- nav-middle -->
    <div class="nav-middle" :class="{ 'mobile-open': mobileMenuOpen }">
      <ul class="nav-menu">
        <li v-for="item in menuItems" :key="item.key">
          <router-link :to="item.path" @click="handleMenuItemClick(item.key)">{{ t(localeStore.locale, item.key) }}</router-link>
        </li>
      </ul>
    </div>
    
    <!-- nav-right -->
    <div class="nav-right" :class="{ 'mobile-open': mobileMenuOpen }">  
      <div class="nav-search" :class="{ expanded: showSearch }">
          <form action="/search" method="get">
            <input ref="searchInput" type="search" name="s"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            class="search-input"
            data-glass
            @focus="onSearchFocus"
            @blur="onSearchBlur">
            <button type="button" @click="toggleSearch">
              <i class="fas fa-magnifying-glass"></i>
            </button>
          </form>
      </div>
      <div class="nav-btns">
          <div class="lang-btn" @click.stop="toggleDropdown">
            <i class="fas fa-language"></i>
            <ul v-show="dropdownOpen" class="language-dropdown data-glass">
              <li :class="{ active: localeStore.locale === 'zh-CN' }" @click.stop="setLocale('zh-CN')">中文</li>
              <li :class="{ active: localeStore.locale === 'en-US' }" @click.stop="setLocale('en-US')">English</li>
            </ul>
          </div>
          <div class="dark-btn" @click="switchDarkMode">
            <i :class="['fas', themeStore.theme === 'dark' ? 'fa-sun' : 'fa-moon']"></i>
          </div>
        </div>
      </div>
  </nav>
  
  <!-- 移动端菜单遮罩 -->
  <div class="mobile-overlay" :class="{ active: mobileMenuOpen }" @click="closeMobileMenu"></div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useLocaleStore } from '../stores/locale'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()



// 站点标题
const title = computed(() => {
  return localeStore.locale === 'zh-CN' ? '半生雨' : 'Oblivion'
})

// 导航菜单
const menuItems = [
  { key: 'home', path: '/' },
  { key: 'articles', path: '/articles' },
  { key: 'about', path: '/about' }
]

// 翻译函数
const translations = {
  'zh-CN': {
    home: '首页',
    articles: '文章',
    about: '关于',
    search: '搜索...'
  },
  'en-US': {
    home: 'Home',
    articles: 'Articles',
    about: 'About',
    search: 'Search...'
  }
}

function t(locale, key) {
  return translations[locale]?.[key] || key
}

// 搜索相关
const showSearch = ref(false)
const searchInput = ref(null)
const searchPlaceholder = computed(() => t(localeStore.locale, 'search'))

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    setTimeout(() => searchInput.value?.focus(), 100)
  }
}

function onSearchFocus() {
  showSearch.value = true
}

function onSearchBlur() {
  // 延迟收起，允许点击搜索按钮
  setTimeout(() => {
    if (!searchInput.value?.value) {
      showSearch.value = false
    }
  }, 200)
}

// 语言下拉菜单
const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function setLocale(newLocale) {
  localeStore.setLocale(newLocale)
  dropdownOpen.value = false
}

// 关闭下拉菜单
function handleClickOutside(e) {
  if (!e.target.closest('.lang-btn')) {
    dropdownOpen.value = false
  }
}

// 主题切换
function switchDarkMode() {
  themeStore.toggleTheme()
}

// 显示侧边按钮（占位函数）
function showSideButtons() {
  // 返回页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 移动端菜单
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // 打开菜单时禁止背景滚动
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

function handleMenuItemClick(key) {
  // 关闭移动端菜单
  closeMobileMenu()
  // 如果是首页，滚动到顶部
  if (key === 'home') {
    showSideButtons()
  }
}

// 滚动逻辑
const scrollProgress = ref(0)
const navVisible = ref(true)
const lastScrollY = ref(0)
const hasGlass = ref(false)

function updateScroll() {
  const scrollY = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  
    scrollProgress.value = docHeight > 0 ? scrollY / docHeight : 0
  
  // 2. 处理导航栏隐藏/显示
    if (scrollY > 100) {
      // 向下滚动隐藏，向上滚动显示
      navVisible.value = scrollY < lastScrollY.value
    } else {
      // 在顶部始终显示
      navVisible.value = true
    }
    
    // 滚动时添加毛玻璃效果
    const navBar = document.querySelector('.nav-bar')
    if (navBar) {
      if (scrollY > 0) {
        navBar.style.backdropFilter = 'blur(10px)'
        navBar.style.webkitBackdropFilter = 'blur(10px)'
        navBar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
      } else {
        navBar.style.backdropFilter = 'none'
        navBar.style.webkitBackdropFilter = 'none'
        navBar.style.backgroundColor = ''
      }
    }
    
  lastScrollY.value = scrollY
}



onMounted(() => {
  window.addEventListener('scroll', updateScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>
<style scoped>


/* 导航栏 */
.nav-bar {
  font-family: var(--title-font);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-sizing: border-box;
}

.nav-bar.nav-hidden {
  transform: translateY(-100%);
}

/* 左侧 - 网站标题 */
.nav-left {
  flex-shrink: 0;
}

.site-title a {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: var(--site-title-font);
  /* 使用白色，mix-blend-mode: difference 会让它在浅色背景上变深，深色背景上变浅 */
  color: var(--main-color);
  mix-blend-mode: difference;
  text-decoration: none;
  transition: color 0.2s;
}

/* 中间 - 导航菜单 */
.nav-middle {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.nav-menu li a {
  display: block;
  padding: 8px 16px;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
}

.nav-menu li a:hover,
.nav-menu li a.router-link-active {
  color: var(--main-color);
}

/* 下划线基础样式 */
.nav-menu li a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1.5px;
  background-color: var(--main-color);
  transition: width 0.3s ease, left 0.3s ease;
}

/* 悬浮时下划线从中间向两边展开 */
.nav-menu li a:hover::after {
  width: 100%;
  left: 0;
}

/* 选中状态显示完整下划线 */
.nav-menu li a.router-link-active::after {
  width: 100%;
  left: 0;
}

/* 右侧 - 搜索和按钮 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 搜索框 */
.nav-search {
  display: flex;
  align-items: center;
}

.nav-search form {
  display: flex;
  align-items: center;
}

.nav-search .search-input {
  width: 0;
  padding: 0;
  border: none;
  outline: none;
  opacity: 0;
  transition: all 0.3s ease;
  color: var(--text-color);
  border-radius: 6px;
}

.nav-search.expanded .search-input {
  width: 180px;
  padding: 8px 12px;
  opacity: 1;
  border: 1px solid var(--border-color);
  border-right: none;
}

.nav-search button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  transition: color 0.2s;
}

.nav-search button:hover {
  color: var(--hover-color);
}

.nav-search.expanded button { 
  border-radius: 0 6px 6px 0;
}

/* 功能按钮容器 */
.nav-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 语言切换按钮 */
.lang-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: var(--hover-bg);
  color: var(--hover-color);
}



/* 语言下拉菜单 - 毛玻璃效果 */
.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  list-style: none;
  padding: 8px 0;
  min-width: 120px;
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
}

.language-dropdown.glass {
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
}

:root.light-mode .language-dropdown.glass {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.language-dropdown li {
  padding: 10px 16px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s;
}

.language-dropdown li:hover {
  color: var(--hover-color);
  background: var(--hover-bg);
}

.language-dropdown li.active {
  color: var(--accent-color);
  font-weight: 600;
}

/* 深色模式切换按钮 */
.dark-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.dark-btn:hover {
  background: var(--hover-bg);
  color: var(--hover-color);
}



/* 汉堡菜单按钮 - 默认隐藏 */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 20px;
}

.menu-toggle:hover {
  background: var(--hover-bg);
  color: var(--hover-color);
}

/* 移动端遮罩层 - 默认隐藏 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 响应式布局 - 移动端 */
@media (max-width: 768px) {
  .nav-bar {
    padding: 12px 16px;
  }
  
  /* 显示汉堡菜单按钮 */
  .menu-toggle {
    display: flex;
    order: 3;
  }
  
  /* 显示遮罩层 */
  .mobile-overlay {
    display: block;
  }
  
  /* 中间导航菜单 - 侧边栏样式 */
  .nav-middle {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100vh;
    background: var(--bg-color);
    z-index: 1001;
    padding: 80px 20px 20px;
    box-sizing: border-box;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }
  
  .nav-middle.mobile-open {
    right: 0;
  }
  
  .nav-menu {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-menu li a {
    display: block;
    padding: 14px 16px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  /* 右侧按钮区域 - 移动端放入侧边栏 */
  .nav-right {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    z-index: 1002;
    padding: 20px;
    box-sizing: border-box;
    transition: right 0.3s ease;
    justify-content: flex-end;
    background: var(--bg-color);
    border-bottom: 1px solid var(--border-color);
  }
  
  .nav-right.mobile-open {
    right: 0;
  }
  
  /* 搜索框移动端样式 */
  .nav-search {
    flex: 1;
  }
  
  .nav-search.expanded .search-input {
    width: 100%;
  }
  
  .nav-search form {
    width: 100%;
  }
  
  /* 按钮组 */
  .nav-btns {
    gap: 4px;
  }
}

/* 更小屏幕适配 */
@media (max-width: 480px) {
  .nav-bar {
    padding: 10px 12px;
  }
  
  .site-title a {
    font-size: 1.25rem;
  }
  
  .nav-middle {
    width: 260px;
    right: -260px;
    padding: 70px 16px 16px;
  }
  
  .nav-middle.mobile-open {
    right: 0;
  }
  
  .nav-right {
    width: 260px;
    right: -260px;
    padding: 16px;
  }
  
  .nav-right.mobile-open {
    right: 0;
  }
  
  .nav-menu li a {
    padding: 12px 14px;
    font-size: 15px;
  }
}
</style>
