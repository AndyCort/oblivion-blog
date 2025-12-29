<template>
  <ScrollingBar />
  <SideButton />
  <HeartAnimation />
  <div class="app" :data-theme="themeStore.theme">
    <NavBar />
    <div class="main-content">
      <router-view />
    <Footer />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useThemeStore } from './stores/theme'
import '@/assets/style.css'
import ScrollingBar from './components/ScrollingBar.vue'
import Footer from './components/Footer.vue'
import SideButton from './components/SideButton.vue'  
import HeartAnimation from './components/HeartAnimation.vue'
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
/* ===== 页面基础样式 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  min-height: 100vh;
  font-family: var(--content-font);
}
i {
  font-size: 1.25rem;
}

p {
  color: var(--text-color);
  white-space: pre-wrap;
  margin: 5px 0;
}

.app {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.main-content {
  padding: 0;
  margin: 0;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1623942840350-a978906afb3b'); 
}

.main-content::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3); /* 控制亮度 */
  z-index: 1;
}

.main-content  > * {
  position: relative;
  z-index: 2;
}
</style>