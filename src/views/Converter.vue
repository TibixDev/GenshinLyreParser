
<template>
    <div class="container mx-auto text-xl">
        <h1 class="text-3xl font-semibold">Genshin Lyre Parser (Pre-Alpha)</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 items-center my-5 gap-4">
            <video controls ref="lyreVideo">
                <source :src="genshinLyreVid" type="video/mp4">
            </video>
            <canvas
                id="lyreCanvas"
                ref="lyreCanvas"
                width="1920"
                height="1080"
                class="rounded-md border-4 border-gray-400 mx-auto my-3"
            >
            </canvas>
        </div>
        <div class="flex flex-row gap-4 items-center">
            <button class="bg-gray-500 text-white p-5 rounded-xl shadow-lg">Browse MP4</button>
            <button
                class="bg-gray-500 text-white p-5 rounded-xl shadow-lg"
                @click="sanityChecks(lyreCanvas)"
            >Canvas Sanity Check</button>
            <button
                class="bg-gray-500 text-white p-5 rounded-xl shadow-lg"
                @click="drawExample(lyreCanvas)"
            >Draw Example & Note Grid</button>
        </div>
            <p class="text-semibold text-2xl">Notes: <strong>{{ noteHits.join(" ") }}</strong></p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import lyrePlayerImg from '../assets/lyreplayer.png';
import lyrePlayerPressedImg from '../assets/lyreplayer_pressed.png';
import genshinLyreVid from '../assets/genshin_lyre.mp4';
import { fetchImage, deltaE } from '../utils/CanvasUtils';

// Vue will automatically assign this to the canvas
// DOM element, since it's the same name
const lyreCanvas = ref(null);
const lyreVideo = ref(null);


let noteHits = ref([]);
let noteTimeouts = ref([]);

onMounted(() => {
    sanityChecks(lyreCanvas.value);
    const canvas = lyreCanvas.value;
    const ctx = canvas.getContext('2d');
    const video = lyreVideo.value;

    let shouldScan = false;
    video.addEventListener('play', () => {
        shouldScan = true;
        function step() {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            drawNoteDetection(canvas, noteTimeouts.value, noteHits.value);
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
    // Displaying the image
    const image = await fetchImage(lyrePlayerPressedImg);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    drawNoteDetection(canvas, noteTimeouts.value, noteHits.value);
}

/**
 * This is the function that draws the lyre
 * note grid on the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {*} noteTimeoutsRef - Reference to the note timeouts array
 * @param {*} noteHitsRef - Reference to the note hits that act as the permanent
 * `noteBundle` storage, this is where they get added to
 * @param {*} noteBundleRef - Reference to the current note bundle which will be consumed
 * by adding it to `noteHitsRef` when `nodeCurrentFrameRef` reaches 0
 * @param {*} noteCurrentFrameRef - Reference to the current frame count which will be
 * consumed by incrementing it by 1 every frame until it reaches `frameBundleSize`
 * @param {*} [frameBundleSize=3] - The amount of frames it takes for a `noteBundle` to be assembled
 */
async function drawNoteDetection(canvas, noteTimeoutsRef, noteHitsRef, noteBundleRef, noteCurrentFrameRef, frameBundleSize = 3) {
    // Getting context
    const ctx = canvas.getContext('2d');
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

            if (noteHasTimeout([i, j])) {
                console.log(`[NoteGrid] Skipping note ${noteMap[i]}${j+1}`);
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(pos[0], pos[1], circleFillRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = "red";
                continue;
            }
            const rgb = [pixel[0], pixel[1], pixel[2]];
            const similarity = deltaE(rgb, desiredRGB);
            //console.log(`[NoteGrid] [${i+1}, ${j+1}] - ${rgb} (${similarity})`);
            if (similarity < 7) {
                ctx.fillStyle = "green";
                console.log(`[NoteGrid] Found hit!`);
                //noteHits.value.push(`${noteMap[j]}${i+1}`);
                detectedNotes.push(keyMap[i][j]);
                noteTimeoutsRef.push({ noteIndex: `${i}-${j}`, timeout: noteTimeoutFrames });
                console.log(`[NoteGrid] Set timeout of ${noteTimeoutFrames} frames for ${i}/${j} (${noteMap[j]}${i+1})`);
            }
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], circleFillRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "red"
        }
    }

    if (detectedNotes.length === 0) return;
    noteHitsRef.push(detectedNotes.length === 1 ? detectedNotes[0] : `(${detectedNotes.join(', ')})`);
}
</script>

<style>
#lyreCanvas {
    aspect-ratio: 16/9;
    width: 100%;
}
</style>
