<template>
    <div class="container">
        <div class="card">
            <div class="imgBx">

            </div>
            <div class="content">

            </div>
        </div>
        <div class="card">
            <div class="imgBx">

            </div>
            <div class="content">

            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
body{
    display:flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #333;
}

.container{
    position: relative;
    display:flex;
    align-items: center;
}

.container .card {
    position:relative;
    width:300px;
    height: 300px;
    background: #fff;
    border-radius: 40px;
    box-shadow:0 20px 25px #00000040;
    transition:0.5;
}

.container .card:hover {
    height:420px;
}
.container .card .imgBx {
    position: relative;
    width: 100%;
    height:260px;
    background: #555;
}
.container .card .imgBx::before {
    content: "";
    position: absolute;
    bottom:-40px;
    width: 100%;
    height: 80px;
    border-radius: 40px;
    background: #fff;   
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

.container .card .imgBx::after {
    content: '';
    position:relative;
    right: 0;
    bottom: 40px;
    width: 80px;
    height: 80px;
    background: #0f0;
    border-radius: 50%;
    box-shadow: 75px 70px 0 40px #fff;
}

.container .card .content {
    position: relative;
    top:-40px;
    z-index: 10;
    padding: 0 30px;
    transition:0.5s;
}

.container .card .content h3 {
    font-size: 1.25em;
}




</style>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            