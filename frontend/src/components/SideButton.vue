<template>
  <div class="side-button-container">
    <div class="side-button" data-glass>
      <i class="fas fa-caret-up"></i>
    </div>
    <div class="side-button" data-glass>
      <i class="fas fa-house"></i>
    </div>
    <div class="side-button" data-glass>
      <i class="fas fa-caret-down"></i>
    </div>
  </div>
</template>

<script setup="ts">
</script>

<style scoped>
.side-button-container {
    position: fixed;
    bottom: clamp(1px, 5%, 50px);
    right: clamp(1px, 5%, 50px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
}

.side-button {
    width: 40px;
    height: 40px;
    border-radius: 20%;
    color: var(--text-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.side-button:hover {
    transform: scale(1.1);
}
</style>