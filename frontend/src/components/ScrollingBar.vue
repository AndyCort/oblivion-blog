<template>
  <div class="scroll-bar" :style="{ transform: `scaleX(${scrollProgress})` }">
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

    const scrollProgress = ref(0)
    
    function updateScroll() {
        const scrollY = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        scrollProgress.value = docHeight > 0 ? scrollY / docHeight : 0
    }

    onMounted(() => {
        window.addEventListener('scroll', updateScroll)
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', updateScroll)
    })

</script>

<style scoped>
.scroll-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff8d9f;
  z-index: 10000;
  transform-origin: left;
  transition: transform 0.2s ease; 
}
</style>