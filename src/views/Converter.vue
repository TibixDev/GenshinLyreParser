
<template>
    <div class="container mx-auto text-xl p-5">
        <h1 class="text-4xl font-semibold border-b-2 border-indigo-500 pb-2">Genshin Lyre Parser (Alpha)</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 items-center my-5 gap-4">
            <video controls ref="lyreVideo">
                <source :src="genshinLyreVid" type="video/mp4">
            </video>
            <canvas
                id="lyre-canvas"
                ref="lyreCanvas"
                width="1280"
                height="720"
                class="rounded-md border-4 border-indigo-400 mx-auto my-3"
            >
            </canvas>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center">
            <button class="lyre-button">Browse MP4</button>
            <button
                class="lyre-button"
                @click="resetNotes()"
            >Reset</button>
            <button
                class="lyre-button hidden"
                @click="sanityChecks(lyreCanvas)"
            >Canvas Sanity Check</button>
            <button
                class="lyre-button hidden"
                @click="drawExample(lyreCanvas)"
            >Draw Example & Note Grid</button>
            <select
                name="noteType"
                v-model="noteType"
                class="bg-indigo-400 text-white rounded-lg px-2 py-4"
            >
                <option value="pc">PC (Keyboard)</option>
                <option value="mobile">Mobile (Raw Notes)</option>
                <option disabled value="ps">Playstation (TBD)</option>
                <option disabled value="xbox">Xbox (TBD)</option>
            </select>
        </div>
        <p class="text-semibold text-3xl mt-5 mb-3 border-b-4 border-indigo-400">Notes</p>
        <NotesDisplay :notes="noteHits" :noteType="noteType" />
    </div>
</template>

<style>
#lyre-canvas {
    aspect-ratio: 16/9;
    width: 100%;
}

.lyre-button {
    @apply bg-violet-500 text-white p-4 rounded-xl shadow-lg transition ease-in-out duration-500
    hover:bg-violet-600;
}
</style>

<script setup>
// Vue Imports
import { ref, onMounted } from 'vue';
import NotesDisplay from '../components/NotesDisplay.vue';

// Imports
import lyrePlayerImg from '../assets/lyreplayer.png';
import lyrePlayerPressedImg from '../assets/lyreplayer_pressed.png';
import genshinLyreVid from '../assets/genshin_lit_lyre.mp4';
import { fetchImage, deltaE } from '../utils/CanvasUtils';

// DOM ref bindings
// ^ Vue will automatically assign this to the canvas
// ^ DOM element, since it's the same name
const lyreCanvas = ref(null);
const lyreVideo = ref(null);

// Note detection variables
let noteHits = ref([]);
let noteTimeouts = [];
let noteBundle = [];
let noteCurrentFrame = ref(0);

// Option variables
let noteType = ref('pc');

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
            drawNoteDetection(canvas, noteHits.value, noteTimeouts, noteBundle, noteCurrentFrame);
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

const keyMap = [
    ["Q", "W", "E", "R", "T", "Y", "U"],
    ["A", "S", "D", "F", "G", "H", "J"],
    ["Z", "X", "C", "V", "B", "N", "M"]
]

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
    drawNoteDetection(canvas, noteHits.value, noteTimeouts, noteBundle, noteCurrentFrame);
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
 * consumed by incrementing it by 1 every frame until it reaches `frameBundleSize`
 * @param {*} [frameBundleSize=3] - The amount of frames it takes for a `noteBundle` to be assembled
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
    const gridInit = [canvasSize[0]*0.22, canvasSize[1]*0.66];
    const gridSize = [7, 3];
    const gridPass = [canvasSize[0]*0.0873, canvasSize[1]*0.125];
    const noteTimeoutFrames = 5;
    const circleFillRadius = canvasSize[0]*0.007;

    for (let i = 0; i < gridSize[1]; i++) {
        for (let j = 0; j < gridSize[0]; j++) {
            // We define the position and pixel early, since
            // it is subject to changing after detection.
            const pos = [j * gridPass[0] + gridInit[0], i * gridPass[1] + gridInit[1]];
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
                noteCurrentFrameRef.value++;
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
        console.log(`[NoteGrid] Added bundle to noteHits`);
    } else {
        noteCurrentFrameRef.value--;
    }

    const endTime = performance.now();
    console.log(`[NoteGrid] Time: ${(endTime - startTime).toFixed(2)}ms`);
}
</script>