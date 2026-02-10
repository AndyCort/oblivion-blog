<template>
  <div class="home">
    <div class="home-bg"></div>
    <div class="welcome-content">
      <h1 class="welcome-title">
        {{ welcomeText }}
      </h1>
      <Quote />
      <Social />
    </div>
    <ScrollArrow />
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

</script>

<style scoped>
.home {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: visible;
}

.home-bg {
  height: 100vh;
  width: 100%;
  background: center / cover no-repeat var(--home-bg);
  position: absolute;
  overflow: visible;
  z-index: -1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: scaleY(-1) translateY(-100%);
    background: inherit;
    -webkit-mask-image: linear-gradient(
      to top,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0) 60%
    );
    mask-image: linear-gradient(
      to top,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0) 60%
    );
  }
}

.welcome-content {
  position: relative;
  z-index: 1;
  height: 100vh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 2vh, 2rem);
  padding: clamp(1rem, 5vh, 3rem) 1rem;
  box-sizing: border-box;
}

.welcome-title {
  font-size: clamp(1.5rem, 5vh, 3.5rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: var(--site-title-font);
}

.list {
  position: relative; 
  z-index: 100;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>