<template>
<div 
    class="music-widget"
    :style="widgetStyle"
    ref="widgetRef"
>
    <!-- Drag Handle -->
    <div 
        class="drag-handle"
        @mousedown="startDrag"
        @touchstart.prevent="startDrag"
    >
        <i class="fas fa-grip-lines"></i>
    </div>

    <!-- Player Controls -->
    <div class="player-controls">
        <div class="control-btn" data-glass-hover @click="prevTrack" :disabled="loading">
            <i class="fas fa-step-backward"></i>
        </div>
        <div class="control-btn" data-glass-hover @click="togglePlay" :disabled="loading">
            <i :class="['fas', loading ? 'fa-spinner fa-spin' : (isPlaying ? 'fa-pause' : 'fa-play')]"></i>
        </div>
        <div class="control-btn" data-glass-hover @click="nextTrack" :disabled="loading">
            <i class="fas fa-step-forward"></i>
        </div>
    </div>

    <!-- Track Info (collapsible) -->
    <div class="track-info" v-if="expanded">
        <span class="track-text" v-if="currentTrack">{{ currentTrack.name }} - {{ currentTrack.artist_name }}</span>
        <span class="track-text" v-else>{{ loading ? 'Loading...' : 'No track' }}</span>
    </div>

    <!-- Toggle expand/collapse -->
    <div class="toggle-btn" @click="expanded = !expanded">
        <i :class="['fas', expanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
    </div>

    <audio 
        ref="audioRef" 
        :src="currentTrack?.audio"
        @ended="nextTrack"
        @canplay="onCanPlay"
        @error="handleAudioError"
        preload="auto"
    ></audio>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// ─── Music URL Helper ───
function getMusicUrl(filename) {
    return new URL(`../assets/music/${filename}`, import.meta.url).href
}

// ─── Playlist ───
const playlist = ref([
    { 
        name: 'いつかこの恋を思い出してきっと泣いてしまう', 
        artist_name: '得田真裕',
        audio: getMusicUrl('得田真裕 - いつかこの恋を思い出してきっと泣いてしまう.flac')
    }
])

// ─── Player State ───
const currentIndex = ref(0)
const isPlaying = ref(false)
const loading = ref(false)
const audioRef = ref(null)
const expanded = ref(false)

const currentTrack = computed(() => playlist.value[currentIndex.value] || null)

// ─── Drag State ───
const widgetRef = ref(null)
const STORAGE_KEY = 'music-widget-pos'

const position = ref(loadPosition())

function loadPosition() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return JSON.parse(saved)
    } catch {}
    return { x: 20, y: 20 }
}

function savePosition() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position.value))
    } catch {}
}

const widgetStyle = computed(() => ({
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
}))

let isDragging = false
let dragOffset = { x: 0, y: 0 }

function startDrag(e) {
    isDragging = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragOffset.x = clientX - position.value.x
    dragOffset.y = clientY - position.value.y

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchmove', onDrag, { passive: false })
    document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
    if (!isDragging) return
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const el = widgetRef.value
    if (!el) return

    const maxX = window.innerWidth - el.offsetWidth
    const maxY = window.innerHeight - el.offsetHeight

    position.value = {
        x: Math.max(0, Math.min(clientX - dragOffset.x, maxX)),
        y: Math.max(0, Math.min(clientY - dragOffset.y, maxY)),
    }
}

function stopDrag() {
    isDragging = false
    savePosition()
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
}

// ─── Keep widget in bounds on resize ───
function clampPosition() {
    const el = widgetRef.value
    if (!el) return
    const maxX = window.innerWidth - el.offsetWidth
    const maxY = window.innerHeight - el.offsetHeight
    position.value = {
        x: Math.max(0, Math.min(position.value.x, maxX)),
        y: Math.max(0, Math.min(position.value.y, maxY)),
    }
    savePosition()
}

onMounted(() => {
    window.addEventListener('resize', clampPosition)
    // initial clamp
    requestAnimationFrame(clampPosition)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', clampPosition)
})

// ─── Player Controls ───
function togglePlay() {
    if (!audioRef.value || !currentTrack.value) return
    if (isPlaying.value) {
        audioRef.value.pause()
    } else {
        audioRef.value.play().catch(() => {})
    }
    isPlaying.value = !isPlaying.value
}

function prevTrack() {
    if (playlist.value.length === 0) return
    currentIndex.value = currentIndex.value === 0 ? playlist.value.length - 1 : currentIndex.value - 1
    playNewTrack()
}

function nextTrack() {
    if (playlist.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    playNewTrack()
}

function playNewTrack() {
    if (!audioRef.value) return
    audioRef.value.load()
    if (isPlaying.value) {
        audioRef.value.play().catch(() => {})
    }
}

function onCanPlay() {
    console.log('Audio ready to play:', currentTrack.value?.name)
}

function handleAudioError(e) {
    console.error('Audio playback error:', e.target?.error?.message || 'Unknown error')
    isPlaying.value = false
}
</script>

<style scoped>
.music-widget {
  position: fixed;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  user-select: none;
  transition: box-shadow 0.3s ease;
  min-width: 140px;

  &:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  }
}

.drag-handle {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: grab;
  padding: 2px 0;
  color: var(--frame-color);
  opacity: 0.4;
  font-size: 0.75rem;
  transition: opacity 0.2s;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    opacity: 0.8;
  }
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 6px;

  .control-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: clamp(2rem, 4vh, 2.8rem);
    width: clamp(2rem, 4vh, 2.8rem);
    border-radius: 50%;
    color: var(--frame-color);
    font-size: clamp(0.85rem, 1.6vh, 1.1rem);
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;

    &:hover {
      transform: scale(1.15);
      color: var(--main-color);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.track-info {
  text-align: center;
  max-width: 180px;
  overflow: hidden;
}

.track-text {
  font-family: var(--content-font);
  font-size: clamp(0.6rem, 1vh, 0.75rem);
  color: var(--frame-color);
  opacity: 0.75;
  white-space: nowrap;
  display: inline-block;
  animation: scroll-text 12s linear infinite;
}

@keyframes scroll-text {
  0%, 15% { transform: translateX(0); }
  85%, 100% { transform: translateX(calc(-100% + 180px)); }
}

.toggle-btn {
  cursor: pointer;
  color: var(--frame-color);
  opacity: 0.4;
  font-size: 0.6rem;
  transition: opacity 0.2s;
  padding: 0 4px;

  &:hover {
    opacity: 0.8;
  }
}
</style>