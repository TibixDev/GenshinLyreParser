<template>
    <img src="/img/GenshinLyreParserIco_Purple.png" alt="Genshin Lyre Parser Icon" class="logo w-96">
    <p>
        <b class="text-xl">Genshin Lyre Parser</b> is an open-source tool that automatically parses lyre notes from any Genshin Impact video.
        It accomplishes this by scanning the video for notes that light up and searching the note index for the corresponding note.
    </p>
    <br>
    <p>
        This software is not affiliated with Genshin Impact, miHoYo or any other company. 
    </p>
    <br>
    <p>
        Copyright © 2020 <a href="https://github.com/TibixDev">TibixDev</a>.
        Licensed under the <a href="https://github.com/TibixDev/GenshinLyreParser/blob/main/LICENSE">MIT License</a>
    </p>
    <br>
    <a class="flex flex-row gap-1 items-center" href="https://github.com/TibixDev/GenshinLyreParser">
        <EyeIcon class="h-8 w-8"></EyeIcon>
        View Repository</a>
</template>

<script setup>
import { EyeIcon } from '@heroicons/vue/outline';
</script>

<style scoped>
a {
    @apply text-indigo-400 font-bold
}

.logo {
    
}
</style>