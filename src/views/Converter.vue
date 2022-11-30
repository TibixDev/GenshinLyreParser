
<template>
    <!-- Song Save Modal -->
    <vue-final-modal
        v-model="showSaveModal"
        name="saveSongModal"
        classes="modal-container"
        content-class="modal-content"
    >
        <div class="bg-gray-600 p-4 rounded-lg">
            <div class="flex flex-row justify-between items-center border-b-2 border-indigo-400 mb-3 pb-1">
                <div class="flex flex-row items-center gap-2">
                    <SaveIcon class="h-8 w-8"></SaveIcon>
                    <h1 class="modal__title">
                        Save Song
                    </h1>
                </div>
                <button>
                    <XIcon
                        class="h-7 w-7 bg-red-500 rounded-full p-1 hover:bg-red-600 transition duration-150"
                        @click="showSaveModal = !showSaveModal"
                    ></XIcon>
                </button>
            </div>
            <div class="modal__content">
                <label for="songName">Song Title <span class="text-red-500 font-bold">(*)</span></label>
                <input
                    type="text"
                    id="songName"
                    class="save-input"
                    v-model="songTitle"
                >
                <label for="noteContainer" class="pt-3">Notes</label>
                <div class="bg-gray-700 p-2 rounded-md max-h-64 overflow-y-auto">
                    <NotesDisplay :notes="noteHits" :noteType="noteType" />
                </div>
                <button
                    v-if="songTitle.length > 0"
                    class="lyre-button mt-4 text-xl max-w-1/2 mx-auto"
                    @click="saveSong(songTitle, noteHits); showSaveModal = !showSaveModal"
                >
                    <SaveIcon class="button-icon"></SaveIcon>
                    <span class="ml-1">Save</span>
                </button>
                <p v-else class="py-2 font-bold text-red-400">Please fill out all the fields to save the song!</p>
            </div>
        </div>
    </vue-final-modal>
    <!-- Template content -->
    <p class="italic text-gray-500 truncate">🎵 Now parsing: [<b>{{ videoSource }}</b>]</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 items-center my-5 gap-4">
        <video controls ref="lyreVideo" :src="videoSource"></video>
        <canvas
            id="lyre-canvas"
            ref="lyreCanvas"
            width="1280"
            height="720"
            class="rounded-md border-4 border-indigo-400 mx-auto my-3"
        >
        </canvas>
    </div>

    <!-- Buttons, selections, and drop-zones -->
    <div class="flex flex-col sm:flex-row gap-4 sm:items-center">
        <button
            class="lyre-button"
            @click="toggleFileSelect(videoFilePicker)"
        >
            <VideoCameraIcon class="button-icon"/>
            Browse Video
        </button>
        <div
            class="border-2 border-indigo-500 text-indigo-500 
                   border-dashed py-2 px-5 rounded-md hidden sm:block"
            @drop="processVideoFileDrop"
            @dragover="allowDrop"
        >
            <p>Drop files here!</p>
        </div>
        <input
            type="file"
            accept="video/*"
            ref="videoFilePicker"
            class="hidden"
            @change="processVideoFileSelect">
        <button
            class="lyre-button"
            @click="resetNotes()"
        >
            <XIcon class="button-icon"/>
            Reset
        </button>
        <button
            class="lyre-button"
            @click="userVideoSource = null"
        >
            <XIcon class="button-icon"/>
            Reset Video
        </button>
        <button
            class="lyre-button"
            @click="showOptions = !showOptions"
        >
            <CogIcon class="button-icon"/>
            {{ showOptions ? 'Hide' : 'Show'  }} Options
        </button>
        <button
            class="lyre-button"
            @click="sanityChecks(lyreCanvas)"
            v-if="debug"
        >Canvas Sanity Check</button>
        <button
            class="lyre-button"
            @click="drawExample(lyreCanvas)"
            v-if="debug"
        >Draw Example & Note Grid</button>
        <select
            name="noteType"
            v-model="noteType"
            class="bg-indigo-400 text-white rounded-lg px-2 py-3"
        >
            <option value="pc">PC (Keyboard)</option>
            <option value="mobile">Mobile (Raw Notes)</option>
        </select>
    </div>

    <!-- Options -->
    <div v-if="showOptions">
        <p class="mt-5 mb-3 text-3xl border-b-4 border-indigo-400">Options</p>
        <Option
            title="Tolerance"
            description="Controls how lenient the parser is when parsing notes groups. e.g. (Do1, So2, La3).
                         Higher values result in more imperfectly bundled notes being bundled together." 
            :option="frameBundleSize"
            v-model="frameBundleSize"
        ></Option>
        <Option
            title="Grid Start X"
            description="Where the note grid begins on the X axis." 
            :option="gridModifiers.gridInit[0]"
            v-model="gridModifiers.gridInit[0]"
            :min="-2.5"
            :max="2.5"
            :step="0.0125"
        ></Option>
        <Option
            title="Grid Start Y"
            description="Where the note grid begins on the Y axis." 
            :option="gridModifiers.gridInit[1]"
            v-model="gridModifiers.gridInit[1]"
            :min="-2.5"
            :max="2.5"
            :step="0.0125"
        ></Option>
        <Option
            title="Grid Spacing X"
            description="How much space there is between the note grid elements on the X axis." 
            :option="gridModifiers.gridSpacing[0]"
            v-model="gridModifiers.gridSpacing[0]"
            :min="-2.5"
            :max="2.5"
            :step="0.0125"
        ></Option>
        <Option
            title="Grid Spacing Y"
            description="How much space there is between the note grid elements on the Y axis." 
            :option="gridModifiers.gridSpacing[1]"
            v-model="gridModifiers.gridSpacing[1]"
            :min="-2.5"
            :max="2.5"
            :step="0.0125"
        ></Option>
    </div>

    <!-- Notes rendering-->
    <div class="mt-5 mb-3 border-b-4 border-indigo-400 flex gap-4 items-center">
        <p class="text-3xl">Notes</p>
        <button
            v-if="noteHits.length > 0"
            class="save-button my-1 flex flex-row items-center gap-1 px-3"
            @click="showSaveModal = !showSaveModal"
        >
            <SaveIcon class="h-7 w-7 mb-0.5"></SaveIcon>
            Save
        </button>
    </div>
    <NotesDisplay :notes="noteHits" :noteType="noteType" />
</template>

<style>
#lyre-canvas {
    aspect-ratio: 16/9;
    width: 100%;
}

.lyre-button {
    @apply bg-violet-500 text-white px-4 py-3 rounded-xl shadow-lg transition ease-in-out duration-300
    hover:bg-violet-600 flex flex-row items-center gap-2;
}

.save-button {
    @apply bg-violet-500 text-white py-1 px-2 rounded-md shadow-md transition ease-in-out duration-150
    hover:bg-violet-600;
}

.button-icon {
    @apply h-7 w-7;
}

.save-input {
    @apply rounded-md text-lg px-2 py-1 border-2 border-indigo-400 text-black;
}

.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  @apply max-w-lg px-2;
  margin: auto;
}

/* Modal */
.modal__content {
  display: flex;
  flex-direction: column;
  width: auto;
}
.modal__title {
  font-size: 1.7rem;
  font-weight: 500;
}
</style>

<script setup>
// Vue Imports
import { ref, onMounted, computed, watch } from 'vue';
import { VueFinalModal } from 'vue-final-modal'
import NotesDisplay from '@components/NotesDisplay.vue';
import Option from '../components/Option.vue';

// Imports
import lyrePlayerImg from '@assets/lyreplayer.png';
import lyrePlayerPressedImg from '@assets/lyreplayer_pressed.png';
import genshinLyreVid from '@assets/genshin_lit_lyre.mp4';
import { fetchImage, deltaE } from '@utils/CanvasUtils';
import { saveSong } from '@utils/SongStorage'

// HeroIcon Imports
import { VideoCameraIcon, XIcon, SaveIcon, CogIcon } from '@heroicons/vue/outline';


// DOM ref bindings
// ^ Vue will automatically assign this to the canvas
// ^ DOM element, since it's the same name
const lyreCanvas = ref(null);
const lyreVideo = ref(null);
const videoFilePicker = ref(null);

// Video source variables
let userVideoSource = ref(null);
let videoSource = computed(() => userVideoSource.value || genshinLyreVid);

// Note detection variables
let noteHits = ref([]);
let noteTimeouts = [];
let noteBundle = [];
let noteCurrentFrame = ref(0);

// Option variables
let noteType = ref('pc');
let debug = ref(false);
let showOptions = ref(false);
let frameBundleSize = ref(5);
let gridModifiers = ref({
    gridInit: [1, 1],
    gridSpacing: [1, 1],
})

// Modal variables
let showSaveModal = ref(false);
let songTitle = ref('');

/**
 * Resets all the global values associated
 * with the note grid.
 */
function resetNotes() {
    noteHits.value = [];
    noteTimeouts = [];
    noteBundle = [];
    noteCurrentFrame.value = 0;
}

// We watch for gridModifiers to change, because
// when it does change, we need to redraw the note
// detection, so the user can see the changes too.
watch(gridModifiers.value, (data) => {
    const canvas = lyreCanvas.value;
    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext('2d', { alpha: false });
    const video = lyreVideo.value;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawNoteDetection(canvas, noteHits.value, noteTimeouts, noteBundle, noteCurrentFrame, frameBundleSize.value);
})

onMounted(() => {
    sanityChecks(lyreCanvas.value);
    const canvas = lyreCanvas.value;
    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext('2d', { alpha: false });
    const video = lyreVideo.value;

    let shouldScan = false;
    video.addEventListener('play', () => {
        shouldScan = true;
        function step() {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            drawNoteDetection(canvas, noteHits.value, noteTimeouts, noteBundle, noteCurrentFrame, frameBundleSize.value);
            if (shouldScan) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    })

    video.addEventListener('pause', () => {
        shouldScan = false;
    })
});

const noteMap = [
    "Do", "Re", "Mi", "Fa", "So", "La", "Ti", "Do",
];

/**
 * This is the function helps you check if the canvas size
 * is correct by drawing some shapes on it.
 * @param {HTMLCanvasElement} canvas
 */
function sanityChecks(canvas) {
    // Draw a small circle and a line, if these look bad,
    // you probably need to change the canvas size
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red"
    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    ctx.stroke();
    console.log("[SanityCheck] Repainted canvas");
}

/**
 * This is the function that draws the example
 * image and the note grid on the canvas.
 * @param {HTMLCanvasElement} canvas
 */
async function drawExample(canvas) {
    resetNotes();

    // Fetching the image
    const image = await fetchImage(lyrePlayerPressedImg);

    // Displaying the image
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Drawing the notes
    drawNoteDetection(canvas, noteHits.value, noteTimeouts, noteBundle, noteCurrentFrame, frameBundleSize.value);
}

/**
 * This is the function that draws the lyre
 * note grid on the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {*} noteHitsRef - Reference to the note hits that act as the permanent
 * `noteBundle` storage, this is where they get added to
 * @param {*} noteTimeoutsRef - Reference to the note timeouts array
 * @param {*} noteBundleRef - Reference to the current note bundle which will be consumed
 * by adding it to `noteHitsRef` when `nodeCurrentFrameRef` reaches 0
 * @param {*} noteCurrentFrameRef - Reference to the current frame count which will be
 * consumed by decrementing it by 1 every frame until it reaches 0, upon which it is
 * set back to `frameBundleSizeRef`
 * @param {*} [frameBundleSize=5] - The amount of frames it takes for a `noteBundle` to be assembled
 */
async function drawNoteDetection(canvas, noteHitsRef, noteTimeoutsRef, noteBundleRef, noteCurrentFrameRef, frameBundleSize = 5) {
    // Performance measure init
    const startTime = performance.now();
    
    // Getting context
    const ctx = canvas.getContext('2d', { alpha: false });
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clearing timeouts
    for (let i = 0; i < noteTimeoutsRef.length; i++) {
        noteTimeoutsRef[i].timeout--;
        if (noteTimeoutsRef[i].timeout <= 0) {
            noteTimeoutsRef.splice(i, 1);
        }
    }

    function noteHasTimeout(note) {
        return !!noteTimeoutsRef.find(t => t.noteIndex === `${note[0]}-${note[1]}`);
    }

    function getTimeout(note) {
        return noteTimeoutsRef.find(t => t.noteIndex === `${note[0]}-${note[1]}`).timeout;
    }

    let detectedNotes = [];

    // Displaying the note grid
    ctx.fillStyle = "red"
    const desiredRGB = [139, 237, 214];
    const canvasSize = [canvas.width, canvas.height];
    const gridInit = [
        canvasSize[0] * 0.22 * gridModifiers.value.gridInit[0],
        canvasSize[1] * 0.66 * gridModifiers.value.gridInit[1]
    ];
    const gridSize = [7, 3];
    const gridSpacing = [
        canvasSize[0] * 0.0873 * gridModifiers.value.gridSpacing[0],
        canvasSize[1] * 0.125 * gridModifiers.value.gridSpacing[1]
    ];
    const noteTimeoutFrames = 5;
    const circleFillRadius = canvasSize[0]*0.007;

    for (let i = 0; i < gridSize[1]; i++) {
        for (let j = 0; j < gridSize[0]; j++) {
            // We define the position and pixel early, since
            // it is subject to changing after detection.
            const pos = [j * gridSpacing[0] + gridInit[0], i * gridSpacing[1] + gridInit[1]];
            const pixel = ctx.getImageData(pos[0], pos[1], 1, 1).data;
            
            // We optionally offset the position to be at the center of the note
            //pos[0] += 35;

            // We skip notes that have already been pressed recently
            // and we fill those places with green.
            if (noteHasTimeout([i, j])) {
                console.log(`[NoteGrid] Skipping note ${noteMap[i]}${j+1} (${getTimeout([i, j])})`);
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(pos[0], pos[1], circleFillRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = "red";
                continue;
            }
            const rgb = [pixel[0], pixel[1], pixel[2]];

            // DeltaE is a measure of how similar the colors are
            // see https://www.viewsonic.com/library/creative-work/what-is-delta-e-and-why-is-it-important-for-color-accuracy/
            // for more information on how this works.

            // <= 1.0: Not perceptible by the human eye
            // 1-2: Perceptible through close observation
            // 2-10: Perceptible at a glance
            // 11-49: Colors are more similar than the opposite
            // 100: Colors are exactly the opposite
            const similarity = deltaE(rgb, desiredRGB);

            //console.log(`[NoteGrid] [${i+1}, ${j+1}] - ${rgb} (${similarity})`);

            //* Match!
            // If the colors are similar enough, we draw the note with green
            // and add it to the note bundle, while also giving it a timeout,
            // so it won't duplicate. Otherwise draw with red.
            if (similarity < 7) {
                ctx.fillStyle = "green";
                console.log(`[NoteGrid] Found hit at ${noteMap[i]}${j+1}`);
                //* This is legacy code for when we didn't have
                //* a NotesDisplay component
                //detectedNotes.push(keyMap[i][j]);
                detectedNotes.push([i, j]);
                noteTimeoutsRef.push({ noteIndex: `${i}-${j}`, timeout: noteTimeoutFrames });
                console.log(`[NoteGrid] Set timeout of ${noteTimeoutFrames} frames for ${i}/${j} (${noteMap[j]}${i+1})`);

                // We also update the noteCurrentFrameRef, because
                // we expect more notes now.
                //noteCurrentFrameRef.value++;
                noteCurrentFrameRef.value = frameBundleSize;
            }
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], circleFillRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "red"
        }
    }

    // If there are any notes, we add them to the global bundle
    if (detectedNotes.length >= 1) {
        console.log(`[NoteGrid] Pushing ${detectedNotes.length} notes to ${noteBundleRef}!`);
        noteBundleRef.push(...detectedNotes);
    }

    //console.log(`[NoteGrid] CurrentFrame: ${noteCurrentFrameRef.value} | BS: ${frameBundleSize}`);
    //console.log(`[NoteGrid] #1 NoteBundle: ${noteBundleRef} | DetectedNotes: ${detectedNotes}`);
    if (noteCurrentFrameRef.value === 0) {
        // We reset the frame bundle because we reached the limit
        noteCurrentFrameRef.value = frameBundleSize;

        // If there are any notes, we push them with the correct formatting
        if (noteBundleRef.length === 0) return;
        noteHitsRef.push(noteBundleRef.length > 1 ? [...noteBundleRef] : noteBundleRef[0]);

        // We empty the array, this is the only way that works
        // when trying to keep the reference type.
        noteBundleRef = noteBundleRef.splice(0, noteBundleRef.length)

        console.log(`[NoteGrid] Final NoteBundle: ${noteBundleRef}`);
        console.log(`[NoteGrid] Added bundle to noteHits, reset to ${frameBundleSize}`);
    } else {
        //console.log(`[NoteGrid] noteCurrentFrameRef: ${noteCurrentFrameRef.value}`);
        noteCurrentFrameRef.value--;
    }

    const endTime = performance.now();
    console.log(`[NoteGrid] Time: ${(endTime - startTime).toFixed(2)}ms`);
}

/**
 * Changes the video source when user selects a new video
 * to be scanned for notes.
 * (Not modular)
 * @param {*} event 
 */
function processVideoFileSelect(event) {
    console.log(`[VideoFile] Processing video file...`);
    const file = event.target.files[0];
    console.log(`[VideoFile] Type: ${file.type}`);
    userVideoSource.value = URL.createObjectURL(file);
}

/**
 * Processes the dropped file and if it is
 * a video, it sets the video source to the
 * dropped file.
 * @param {*} event 
 */
function processVideoFileDrop(event) {
    console.log(`[FileDrop] Detected dropped file...`);
    event.preventDefault();
    if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        if (event.dataTransfer.items[0].kind === 'file') {
            const file = event.dataTransfer.items[0].getAsFile();
            console.log(`[FileDrop] Type: ${file.type}`);
            if (file.type.includes("video")) {
                console.log(`[FileDrop] Setting video source to ${file.name}`);
                userVideoSource.value = URL.createObjectURL(file);
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        const file = event.dataTransfer.files[0];
        console.log(`[FileDrop] Type: ${file.type}`);
        if (file.type.includes("video")) {
            console.log(`[FileDrop] Setting video source to ${file.name}`);
            userVideoSource.value = URL.createObjectURL(file);
        }
    }
}

/**
 * Toggles the file select with a simulated click
 */
function toggleFileSelect(element) {
    element.click();
}

/**
 * Allows a file drop by disabling the
 * default behavior of the browser.
 * @param {*} event 
 */
function allowDrop(event) {
    event.preventDefault();
}
</script>