<template>
  <h2 class="list-title">最新文章</h2>
  <div class="article-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>{{ $t('articles.loading') || '加载中...' }}</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="articles.length === 0" class="empty-state">
      <i class="far fa-folder-open"></i>
      <p>{{ $t('articles.noArticles') }}</p>
    </div>

    <!-- 文章列表 -->
    <template v-else>
      <TransitionGroup name="list" tag="div" class="articles-grid" >
        <article 
          v-for="article in paginatedArticles" 
          :key="article.id" 
          class="article-card"
          data-glass
          @click="goToArticle(article.id)"
        >
          <!-- 文章特色图片 -->
          <div 
            class="article-cover" 
            :style="{ backgroundImage: `url(${getArticleCover(article)})` }"
          >
            <div class="meta-left" data-glass>
              <span class="meta-item date">
                <i class="far fa-calendar"></i>
                {{ formatDate(article.date) }}
              </span>
            </div>
            <div class="meta-right" data-glass>
              <span v-if="article.author" class="meta-item author">
                <i class="far fa-user"></i>
                {{ article.author }}
              </span>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="article-content">
            <h3 class="article-title"><span class="title-text">{{ getLocalizedField(article.title) }}</span></h3>
            <p class="article-summary">{{ getLocalizedField(article.summary) }}</p>
            
            <!-- 文章元信息 -->



            <!-- 标签 -->
            <div v-if="article.tags && article.tags.length" class="article-tags">
              <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
            <span class="read-more">
              {{ $t('articles.readMore') }}
              <i class="fas fa-arrow-right"></i>
            </span>
          </div>
          
          <div class="article-footer">

          </div>
        </article>
      </TransitionGroup>

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn prev" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
          <span>{{ $t('articles.prev') || '上一页' }}</span>
        </button>

        <div class="pagination-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="pagination-num"
            :class="{ active: page === currentPage, ellipsis: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button 
          class="pagination-btn next" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span>{{ $t('articles.next') || '下一页' }}</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../stores/locale'
import { fetchArticles } from '../api/articles'

// 默认封面图片
import defaultCover from '../assets/home.jpg'

const router = useRouter()
const localeStore = useLocaleStore()

// 响应式数据
const articles = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 5 // 每页显示的文章数量

// 计算属性：总页数
const totalPages = computed(() => {
  return Math.ceil(articles.value.length / pageSize)
})

// 计算属性：当前页的文章
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return articles.value.slice(start, end)
})

// 计算属性：可见的页码
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // 总页数小于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7，显示省略号
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

// 获取文章封面图片
function getArticleCover(article) {
  return article.cover || article.featuredImage || defaultCover
}

// 图片加载失败时的处理
function handleImageError(event) {
  event.target.src = defaultCover
}

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
    month: 'short',
    day: 'numeric'
  })
}

// 跳转到文章详情
function goToArticle(id) {
  router.push(`/articles/${id}`)
}

// 跳转到指定页码
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // 滚动到文章列表顶部
  const listElement = document.querySelector('.article-list')
  if (listElement) {
    listElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 加载文章数据
onMounted(async () => {
  try {
    articles.value = await fetchArticles()
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 文章区域 */
.list-title {
  color: var(--main-color);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 20px 0;
  text-align: center;

}

.article-list {
  padding: 20px;
  width: clamp(800px, 80%, 1200px);
  margin: 0 auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--text-color);
  opacity: 0.6;
}

.empty-state i {
  font-size: 48px;
}

.empty-state p {
  font-size: 16px;
}

/* 文章单列布局 */
.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: clamp(200px, 40vw, 800px);
  margin: 0 auto;
}

/* 文章卡片 - 毛玻璃效果 */
.article-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--glass-box-shadow);
}

/* 文章封面 */
.article-cover {
  display: flex;
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}

.meta-left,
.meta-right {
  border-radius: 6px;
  margin: 30px;
  padding: 6px;
  color: var(--text-color);
  background-color: var(--glass-bg-color);
}

.meta-left {
position: absolute;
top: 0;
left: 0;
}

.meta-right {
position: absolute;
top: 0;
right: 0;
}

.article-card:hover .article-cover {
  background-size: 110%;
}

/* 文章内容 */
.article-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
}

.title-text {
  position: relative;
  display: inline;
  padding-bottom: 2px;
}

.title-text::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(100% + 20px);
  height: 1.5px;
  background-color: var(--text-color);
  
}

.title-text::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1.5px;
  background-color: var(--main-color);
  transition: width 0.5s ease;

}

.article-title:hover .title-text {
  color: var(--main-color);
}

.article-title:hover .title-text::after {
  background-color: var(--main-color);
  width: calc(100% + 20px);
}
.article-summary {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文章元信息 */
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  font-size: 12px;
}

/* 标签 */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag {
  padding: 4px 10px;
  font-size: 0.75rem;
  background: var(--glass-bg-color);
  border-radius: 20px;
  color: var(--text-color);
  opacity: 0.8;
}

/* 文章底部 */
.article-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--glass-border-color);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.2s;
}

.read-more i {
  font-size: 12px;
  transition: transform 0.2s;
}

.article-card:hover .read-more {
  opacity: 1;
}

.article-card:hover .read-more i {
  transform: translateX(4px);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border-color);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn i {
  font-size: 12px;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-num {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border-color);
}

.pagination-num:hover:not(:disabled):not(.active) {
  background: var(--bg-tertiary);
}

.pagination-num.active {
  background: var(--text-color);
  color: var(--bg-color);
  font-weight: 600;
}

.pagination-num.ellipsis {
  cursor: default;
  background: transparent;
  border: none;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}






/* 响应式设计 */
@media (max-width: 768px) {
  .list-title {
    font-size: 1.8rem;
    margin: 16px 0;
  }

  .article-list {
    width: 100%;
    padding: 12px;
  }
  
  .articles-grid {
    width: 100%;
    gap: 16px;
  }
  
  .article-cover {
    height: 180px;
  }

  .meta-left,
  .meta-right {
    font-size: 0.75rem;
    padding: 4px 8px;
    margin: 8px;
  }
  
  .article-content {
    padding: 14px;
    gap: 10px;
  }
  
  .article-title {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  .article-summary {
    font-size: 0.85rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .article-tags {
    gap: 6px;
  }

  .tag {
    padding: 3px 8px;
    font-size: 0.7rem;
  }

  .read-more {
    font-size: 0.85rem;
  }

  .article-footer {
    padding: 12px 14px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
    padding: 16px 0;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .pagination-btn span {
    display: none;
  }

  .pagination-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }

  .pagination-num {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}

/* 响应式设计 - 小手机 */
@media (max-width: 480px) {
  .list-title {
    font-size: 1.5rem;
  }

  .article-list {
    padding: 8px;
  }

  .articles-grid {
    gap: 12px;
  }

  .article-cover {
    height: 150px;
  }

  .article-content {
    padding: 12px;
  }

  .article-title {
    font-size: 1rem;
  }

  .article-summary {
    font-size: 0.8rem;
  }

  .pagination-num {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>