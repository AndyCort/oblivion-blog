<template>
  <div class="article-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <i class="far fa-face-sad-tear"></i>
      <p>文章加载失败</p>
      <button @click="router.push('/')">返回首页</button>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="article" class="article" data-glass>
      <!-- 文章头部 -->
      <header class="article-header">
        <h1 class="article-title">{{ getLocalizedField(article.title) }}</h1>
        <div class="article-meta">
          <span class="meta-item">
            <i class="far fa-calendar"></i>
            {{ formatDate(article.date) }}
          </span>
          <span v-if="article.author" class="meta-item">
            <i class="far fa-user"></i>
            {{ article.author }}
          </span>
        </div>
        <div v-if="article.tags && article.tags.length" class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>

      <!-- 封面图 -->
      <div v-if="article.cover" class="article-cover">
        <img :src="article.cover" :alt="getLocalizedField(article.title)" />
      </div>

      <!-- 正文 -->
      <div class="article-body">
        <p>{{ getLocalizedField(article.content) }}</p>
      </div>

      <!-- 文章底部 -->
      <footer class="article-footer">
        <button class="back-btn" @click="router.back()">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { fetchArticle } from '../api/articles'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()

const article = ref(null)
const loading = ref(true)
const error = ref(false)

// 获取本地化字段
function getLocalizedField(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  const lang = localeStore.locale === 'zh-CN' ? 'zh' : 'en'
  return field[lang] || field.zh || field.en || Object.values(field)[0]
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(localeStore.locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 加载文章
onMounted(async () => {
  try {
    const id = route.params.id
    article.value = await fetchArticle(id)
  } catch (err) {
    console.error('Failed to load article:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  padding: 100px 20px 60px;
  max-width: 800px;
  margin: 0px auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 20px;
  color: var(--text-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border-color);
  border-top-color: var(--text-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 20px;
  color: var(--text-color);

  i {
    font-size: 64px;
    opacity: 0.5;
  }

  p {
    font-size: 18px;
    opacity: 0.7;
  }

  button {
    padding: 10px 24px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
}

.article {
  border: 1px solid var(--glass-border-color);
  border-radius: 16px;
}

.article-header {
  padding: 40px 40px 24px;
}

.article-title,
.article-meta,
.article-tags {
  color: var(--main-color);
}

.article-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 16px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.9rem;
  opacity: 0.6;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.article-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-body {
  padding: 32px 40px;
  color: var(--text-color);
  font-size: 1.1rem;
  line-height: 1.8;

  p {
    margin: 0;
    white-space: pre-wrap;
  }
}

.article-footer {
  padding: 24px 40px;
  border-top: 1px solid var(--glass-border-color);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 768px) {
  .article-detail {
    padding: 80px 16px 40px;
  }

  .article-header {
    padding: 24px 20px 16px;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-body {
    padding: 20px;
    font-size: 1rem;
  }

  .article-footer {
    padding: 16px 20px;
  }
}
</style>
