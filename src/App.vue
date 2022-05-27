<script setup>
import './index.css';
import "floating-vue/dist/style.css";
import Converter from '@views/Converter.vue';
import Header from '@components/Header.vue';
</script>

<template>
    <div class="container mx-auto text-xl p-5">
        <Header></Header>
        <router-view></router-view>
    </div>
</template>

<style>

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin-top: 30px;
}

body {
    background-color: #333333;
    color: white;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #3a3a3a;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
