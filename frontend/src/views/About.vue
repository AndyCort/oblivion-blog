<template>
  <div class="about-page">
    <div class="about-container">
      <!-- 头像和标题 -->
      <header class="about-header">
        <div class="avatar">🧑‍💻</div>
        <h1 class="title">关于我</h1>
        <p class="tagline">一个热爱代码与生活的开发者</p>
      </header>

      <!-- 介绍 -->
      <section class="about-content">
        <p>欢迎来到我的自留地。</p>
        <p>这里有我的碎碎念，有我的奇思妙想，还有一些奇奇怪怪的东西。</p>
        <p>希望你能在这里找到你想要的东西。</p>
      </section>

      <!-- 联系方式 -->
      <section class="contact">

      </section>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.about-container {
  max-width: 600px;
  width: 100%;
}

/* 头部 */
.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.avatar {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  font-family: var(--title-font);
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1rem;
  color: var(--text-muted);
  font-family: var(--content-font);
}

/* 内容 */
.about-content {
  line-height: 1.8;
}

.about-content p {
  color: var(--text-secondary);
  font-family: var(--content-font);
  font-size: 1.05rem;
  margin-bottom: 1rem;
}

.about-content p:last-child {
  margin-bottom: 0;
}

/* 分割线 */
.divider {
  border: none;
  height: 1px;
  background: var(--border-color);
  margin: 3rem 0;
}

/* 联系方式 */
.contact {
  text-align: center;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-family: var(--title-font);
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--text-color);
}

.contact-link svg {
  font-size: 1.1rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .about-page {
    padding: 3rem 1.5rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .avatar {
    font-size: 3rem;
  }
}
</style>