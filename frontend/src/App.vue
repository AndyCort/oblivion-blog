<template>
  <ScrollingBar />
  <SideButton />
  <Music />
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
import Music from './components/Music.vue'
import HeartAnimation from './components/HeartAnimation.vue'
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  min-height: 100vh;
  font-family: var(--content-font);

  &::-webkit-scrollbar {
    display: none;
  }
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
  background: center / cover repeat url('https://images.unsplash.com/photo-1770287691979-6b8ec41f5331');
  z-index: 1;
}
</style>