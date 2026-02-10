<template>
<footer class="footer">
  <p>
    {{ copyrightText }} {{ designedByText }} <a href="https://inpa.in">Anya</a>.
  </p>
  <p>
    <i class="fa-solid fa-memory"></i> {{ memoryUsageText }}.
  </p>
  <p>
   <i class="fa-solid fa-ethernet"></i> {{ ipAddressText }}
  </p>
</footer>
</template>

<script setup>
import { ref } from 'vue'

const copyrightText = ref('© 2023 Oblivion Blog. All rights reserved.')
const designedByText = ref('Designed by')
const memoryUsageText = ref('Memory usage: 0 MB')
const ipAddressText = ref('IP Address: 0.0.0.0')
</script>

<style>
.footer {
  text-align: center;
  margin: 0;
  border-top: none;
  margin-top: -1px;
  padding: 20px 0;

  p {
    margin: 5px 0;
  }

  a {
    color: var(--main-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>