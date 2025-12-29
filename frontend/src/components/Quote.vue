<template>
    <div class="random-quote-box glass">
        <div class="quote-icon">
            <i class="fas fa-quote-left"></i>
        </div>
        <div class="quote-content">
            {{ displayText }}
        </div>
        <div class="quote-icon">
            <i class="fas fa-quote-right"></i>
        </div>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useLocaleStore } from '../stores/locale'
import { fetchRandomQuote } from '../api/quotes'

const localeStore = useLocaleStore()

const currentQuote = ref('')
const displayText = ref('')
const quoteLoading = ref(false)
const isTyping = ref(false)

let animationTimer = null
let autoRefreshTimer = null

// 自动刷新间隔（毫秒）
const AUTO_REFRESH_INTERVAL = 10000

/* 清除动画定时器 */
function clearAnimation() {
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
}

/* 清除自动刷新定时器 */
function clearAutoRefresh() {
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

/* 开始自动刷新计时 */
function scheduleAutoRefresh() {
  clearAutoRefresh()
  autoRefreshTimer = setTimeout(() => {
    refreshQuote()
  }, AUTO_REFRESH_INTERVAL)
}

/* 打字动画 */
function startTyping(text, onComplete) {
  let index = 0

  const type = () => {
    if (index < text.length) {
      displayText.value += text[index]
      index++
      animationTimer = setTimeout(type, 80)
    } else {
      isTyping.value = false
      onComplete?.()
    }
  }

  type()
}

/* 删除动画 */
function startDeleting(onComplete) {
  const deleteChar = () => {
    if (displayText.value.length > 0) {
      displayText.value = displayText.value.slice(0, -1)
      animationTimer = setTimeout(deleteChar, 40)
    } else {
      onComplete?.()
    }
  }

  deleteChar()
}

/* 先删除旧文字，再打字显示新文字 */
function animateQuoteChange(newQuote) {
  clearAnimation()
  isTyping.value = true

  // 如果当前有文字，先删除
  if (displayText.value.length > 0) {
    startDeleting(() => {
      startTyping(newQuote, scheduleAutoRefresh)
    })
  } else {
    // 直接打字
    startTyping(newQuote, scheduleAutoRefresh)
  }
}

/* 拉取名言 */
async function refreshQuote() {
  if (quoteLoading.value) return

  clearAutoRefresh()
  quoteLoading.value = true
  try {
    const quote = await fetchRandomQuote(localeStore.locale)
    currentQuote.value = quote
    animateQuoteChange(quote)
  } catch (error) {
    console.error('Failed to fetch random quote:', error)
    const errorText =
      localeStore.locale === 'zh-CN'
        ? '获取名言失败，请稍后重试'
        : 'Failed to load quote, please try again'

    currentQuote.value = errorText
    animateQuoteChange(errorText)
  } finally {
    quoteLoading.value = false
  }
}

/* 语言切换自动刷新 */
watch(() => localeStore.locale, () => {
  refreshQuote()
})

onMounted(() => {
  refreshQuote()
})

onUnmounted(() => {
  clearAnimation()
  clearAutoRefresh()
})
</script>


<style scoped>
.random-quote-box {
    text-align: center;
    color: var(--text-color);
    max-width: 600px;
}

.quote-icon {
    font-size: 2rem;
}

.quote-content {
    font-family: var(--content-font);
    font-size: 1.2rem;
    margin: 12px 0;
}

.quote-content::after {
  content: '|';
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .random-quote-box {
    margin: 0 20px 0 20px;
  }
}
</style>
