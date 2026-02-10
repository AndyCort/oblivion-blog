<template>
<div class="social-icons">
    <div class="container" data-glass-hover>
        <a href="https://github.com" target="_blank" >
            <i class="fab fa-github"></i>
        </a>
    </div>
    <div class="container" data-glass-hover>
        <a href="https://twitter.com" target="_blank" >
            <i class="fab fa-twitter"></i>
        </a>
    </div>
    <div class="container" data-glass-hover>
        <a href="https://weibo.com" target="_blank" >
            <i class="fab fa-weibo"></i>
        </a>
    </div>
    <div class="container" data-glass-hover>
        <a href="https://t.me/Anyaovo" target="_blank" >
            <i class="fab fa-telegram"></i>
    </a>
    </div>
</div>
</template>

<script setup>

</script>

<style scoped>
.social-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;

  .container {
    height: clamp(2rem, 4vh, 3rem);
    width: clamp(2rem, 4vh, 3rem);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 clamp(6px, 1.5vw, 12px);
    border-radius: 50%;
  }

  i {
    justify-content: center;
    align-items: center;
  }

  a {
    font-size: clamp(1rem, 2vh, 1.5rem);
    display: inline-block;
    align-items: center;
    justify-content: center;
    color: var(--frame-color);
    transition: color 0.3s ease;
    text-decoration: none;
  }
}
</style>