<template>
  <div class="side-button-container">
    <div class="side-button" data-glass @click="scrollToTop">
      <i class="fas fa-caret-up"></i>
    </div>
    <div class="side-button" data-glass @click="goHome">
      <i class="fas fa-house"></i>
    </div>
    <div class="side-button" data-glass @click="scrollToBottom">
      <i class="fas fa-caret-down"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goHome = () => {
  router.push('/')
}

const scrollToBottom = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
</script>

<style scoped>
.side-button-container {
  position: fixed;
  bottom: clamp(1px, 5%, 50px);
  right: clamp(1px, 5%, 50px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.side-button {
  width: 40px;
  height: 40px;
  border-radius: 35%;
  color: var(--frame-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;

  &:hover {
    transform: scale(1.1);
    color: var(--main-color);
  }
}
</style>