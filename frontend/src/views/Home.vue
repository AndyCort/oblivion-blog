<template>
  <div class="home">
    <div class="welcome-content">
      <h1 class="welcome-title">
        {{ welcomeText }}
      </h1>
      <Quote />
      <Social />
      <Music />
      <ScrollArrow />
    </div>
  </div>  
    <!-- 文章列表 -->
    <div class="list">
      <List />
    </div>  
</template>

<script setup>
import List from '@/components/List.vue'
import Quote from '@/components/Quote.vue'
import Social from '@/components/Social.vue'
import ScrollArrow from '@/components/ScrollArrow.vue'
import Music from '@/components/Music.vue'
</script>

<style scoped>
.home {
  height: 100vh;
  width: 100%;
  background-image: var(--home-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

/* 背景遮罩层 */
.home::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--home-bg-filter); /* 控制亮度 */
  z-index: 1;
}

/* 内容层 */
.home > * {
  position: relative;
  z-index: 2;
}

.welcome-content {
  position: relative;
  height: 100vh;
  min-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: var(--site-title-font);
}




@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


</style>