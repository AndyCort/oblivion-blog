<template>
    <div class="scroll-down-hint" @click="scrollToArticles">
        <div class="scroll-arrow">
            <i class="fas fa-chevron-down"></i>
        </div>
    </div>
</template>

<script setup>
function scrollToArticles() {
    const articlesSection = document.getElementsByClassName('articles-section')[0]
    if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: 'smooth' })
    }
}
</script>

<style scoped>
.scroll-down-hint {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 100;
    animation: bounce 2s ease-in-out infinite;
}

.scroll-arrow {
    font-size: 24px;
    color: var(--text-color);
    transition: color 0.2s, transform 0.2s;
}

.scroll-arrow:hover {
    color: var(--accent-color);
    transform: scale(1.2);
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
    }
    40% {
        transform: translateX(-50%) translateY(-12px);
    }
    60% {
        transform: translateX(-50%) translateY(-6px);
    }
}
</style>