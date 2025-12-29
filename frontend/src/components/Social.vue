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
    margin-bottom: clamp(1rem, 2vw, 2rem);
}

.social-icons .container {
    height: 3rem;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 12px;
    border-radius: 50%;
}


.social-icons i {
    justify-content: center;
    align-items: center;
}
.social-icons a {
    font-size: 1.5rem;
    display: inline-block;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    transition: color 0.3s ease;
    text-decoration: none; 
}



</style>