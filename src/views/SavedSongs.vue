<template>
    <div v-if="songs?.length > 0" class="flex flex-col gap-4">
        <select
            name="noteType"
            v-model="noteType"
            class="bg-indigo-400 text-white rounded-lg px-2 py-3"
        >
            <option value="pc">PC (Keyboard)</option>
            <option value="mobile">Mobile (Raw Notes)</option>
            <option disabled value="ps">Playstation (TBD)</option>
            <option disabled value="xbox">Xbox (TBD)</option>
        </select>
        <div
            v-for="song, songIndex in songs"
            :key="songIndex"
            class="bg-zinc-700 rounded-md p-3"
        >
            <div class="flex flex-row items-center justify-between">
                <h1 class="text-2xl font-bold pb-2 truncate">{{ song.title }}</h1>
                <div class="flex flex-row gap-1">
                    <button>
                        <ChevronDownIcon class="h-8 w-8"></ChevronDownIcon>
                    </button>
                    <button @click="deleteSongAndUpdate(songIndex)">
                        <XIcon class="h-8 w-8"></XIcon>
                    </button>
                </div>
            </div>
            <NotesDisplayVue :notes="song.notes" :noteType="noteType"></NotesDisplayVue>
        </div>
    </div>
    <div v-else>
        <h1 class="text-2xl text-gray-400 text-center mt-5">It seems like nothing is here for now... Try saving some songs and they should appear here.</h1>
    </div>
</template>

<script setup>
import { getSongs, deleteSong } from "@utils/SongStorage.js"
import NotesDisplayVue from "@components/NotesDisplay.vue";
import { XIcon, ChevronDownIcon } from "@heroicons/vue/outline";
import { ref } from "vue";

let songs = ref(getSongs());
let noteType = ref('pc');

/**
 * Deletes a song from localStorage and
 * updates the songs array.
 * (Non-modular)
 * @param {Number} songIndex 
 * @param {ref<Array>} songsRef 
 */
function deleteSongAndUpdate(songIndex) {
    deleteSong(songIndex);
    songs.value = getSongs();
}
</script>

<style scoped>

</style>