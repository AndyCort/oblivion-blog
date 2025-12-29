<template>
    <div class="heart-animation-container">
        <div
            v-for="heart in hearts"
            :key="heart.id"
            class="floating-heart"
            :style="{
                left: heart.x + 'px',
                top: heart.y + 'px',
                '--size': heart.size + 'px',
                '--duration': heart.duration + 's',
                '--drift': heart.drift + 'px',
                '--rotation': heart.rotation + 'deg',
                '--color': heart.color
            }"
        >
            <div class="heart-shape"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const hearts = ref([]);

let heartId = 0;
let autoSpawnTimer = null;

// Soft pink/red colors
const heartColors = [
    '#ff8d9f',
    '#ffb6c1',
    '#ff99cc',
    '#ffe4e1',
    '#ffcced',
    '#ff1a1a',
];

function createHeart(x, y, isClick = false) {
    const size = isClick ? 14 + Math.random() * 8 : 10 + Math.random() * 6;
    const heart = {
        id: heartId++,
        x: x - size / 2,
        y: y - size / 2,
        size,
        duration: 3.5 + Math.random() * 2, // 
        drift: (Math.random() - 0.5) * 40,
        rotation: (Math.random() - 0.5) * 20,
        color: heartColors[Math.floor(Math.random() * heartColors.length)]
    };

    hearts.value.push(heart);

    setTimeout(() => {
        const index = hearts.value.findIndex(h => h.id === heart.id);
        if (index > -1) hearts.value.splice(index, 1);
    }, heart.duration * 1000);
}

function createHeartBurst(x, y) {
    const count = 1 + Math.floor(Math.random() * 2); // 
    for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 15;
        setTimeout(() => createHeart(x + offsetX, y + offsetY, true), i * 100);
    }
}

function autoSpawn() {
    const count = 3 + Math.floor(Math.random() * 2); // 3~6 个

    for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const y =
            window.innerHeight * 0.3 +
            Math.random() * window.innerHeight * 0.5;

        createHeart(x, y, false);
    }
}


function handleClick(e) {
    createHeartBurst(e.clientX, e.clientY);
}

onMounted(() => {
    const scheduleNext = () => {
        autoSpawnTimer = setTimeout(() => {
            autoSpawn();
            scheduleNext();
        }, 2000 + Math.random() * 2000); //     
    };
    scheduleNext();
    document.addEventListener('click', handleClick);
});

onUnmounted(() => {
    if (autoSpawnTimer) clearTimeout(autoSpawnTimer);
    document.removeEventListener('click', handleClick);
});
</script>

<style scoped>
.heart-animation-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}

.floating-heart {
    position: absolute;
    pointer-events: none;
    animation: floatUp var(--duration) ease-out forwards;
}

/* Pure CSS flat heart */
.heart-shape {
    position: relative;
    width: var(--size);
    height: calc(var(--size) * 0.9);
}

.heart-shape::before,
.heart-shape::after {
    content: '';
    position: absolute;
    top: 0;
    width: calc(var(--size) * 0.6);
    height: var(--size);
    background: var(--color);
    border-radius: calc(var(--size) * 0.6) calc(var(--size) * 0.6) 0 0;
}

.heart-shape::before {
    left: calc(var(--size) * 0.5);
    transform: rotate(-45deg);
    transform-origin: 0 100%;
}

.heart-shape::after {
    left: 0;
    transform: rotate(45deg);
    transform-origin: 100% 100%;
}

@keyframes floatUp {
    0% {
        transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
        opacity: 0;
    }
    10% {
        transform: translateY(-10px) translateX(calc(var(--drift) * 0.1)) scale(1) rotate(calc(var(--rotation) * 0.2));
        opacity: 0.85;
    }
    100% {
        transform: translateY(-150px) translateX(var(--drift)) scale(0.3) rotate(var(--rotation));
        opacity: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .floating-heart {
        animation-duration: 0.5s;
    }
}
</style>