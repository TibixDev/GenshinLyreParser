<template>
    <div class="pb-5">
        <h1 class="text-4xl font-semibold border-b-2 border-indigo-500 pb-2">Genshin Lyre Parser (Beta)</h1>
        <div class="flex flex-row gap-2 items-center">
            <router-link to="/" class="tab-link">Home</router-link>
            <router-link to="/saved" class="tab-link">Saved Songs</router-link>
        </div>
    </div>

</template>

<style>
    .tab-link {
        @apply bg-violet-500 hover:bg-violet-600 transition duration-150 rounded-b-lg p-2;
    }
</style>