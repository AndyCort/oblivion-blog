<template>
<div class="music-player">
    <div class="player-controls">
        <div class="container" data-glass-hover @click="prevTrack" :disabled="loading">
            <i class="fas fa-step-backward"></i>
        </div>
        <div class="container" data-glass-hover @click="togglePlay" :disabled="loading">
            <i :class="['fas', loading ? 'fa-spinner fa-spin' : (isPlaying ? 'fa-pause' : 'fa-play')]"></i>
        </div>
        <div class="container" data-glass-hover @click="nextTrack" :disabled="loading">
            <i class="fas fa-step-forward"></i>
        </div>
    </div>

    <div class="track-info">
        <span class="track-text" v-if="currentTrack">{{ currentTrack.name }} - {{ currentTrack.artist_name }}</span>
        <span class="track-text" v-else>{{ loading ? 'Loading...' : 'No track available' }}</span>
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
import { ref, computed } from 'vue'

// 辅助函数：获取 assets 目录下的音乐文件 URL
function getMusicUrl(filename) {
    return new URL(`../assets/music/${filename}`, import.meta.url).href
}

const playlist = ref([
    { 
        name: 'いつかこの恋を思い出してきっと泣いてしまう', 
        artist_name: '得田真裕',
        audio: getMusicUrl('得田真裕 - いつかこの恋を思い出してきっと泣いてしまう.flac')
    }
    // 添加更多歌曲只需要：
    // { name: '歌名', artist_name: '歌手', audio: getMusicUrl('文件名.flac') }
])

const currentIndex = ref(0)
const isPlaying = ref(false)
const loading = ref(false)
const audioRef = ref(null)

const currentTrack = computed(() => playlist.value[currentIndex.value] || null)

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
    // 不自动跳过，让用户手动操作
    isPlaying.value = false
}

</script>

<style scoped>
.music-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    gap: 10px;
}

.player-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}
.player-controls .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
    width: 3rem;
    margin: 0 6px;
    border-radius: 50%;
    color: var(--text-color);
}
.control-btn {
    display: inline-block;
    height: 3rem;
    width: 3rem;
    font-size: 1.5rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
}



.track-info {
    text-align: center;
}

.track-text {
    font-family: var(--content-font);
    font-size: 0.85rem;
    color: var(--text-secondary);
    opacity: 0.8;
}
</style>