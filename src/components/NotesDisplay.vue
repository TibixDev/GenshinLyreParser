<template>
    <template v-for="note, noteIndex in notes" :key="noteIndex">
        <span v-if="typeof note[0] === 'number'" :class="getNoteClass(note)">
            {{ constructNote(note) + " "}} 
        </span>
        <span v-else>
            (
            <template v-for="subNote, subNoteIndex in note" :key="subNoteIndex">
                <span :class="getNoteClass(subNote)">
                    {{ constructNote(subNote) }}
                </span>
                <template v-if="subNoteIndex !== note.length - 1">, </template>
            </template>
            )
        </span>
    </template>
</template>

<script setup>

const props = defineProps({
    notes: {
        type: Array,
        default: () => []
    },
    displayType: {
        // can be pc, mobile, xbox, ps
        type: String,
        default: 'mobile'
    }
});

/**
 * Constructs a note string based on the
 * display type, for example for PC or Mobile.
 * @param {Number[]} note 
 * @param {String} displayType 
 */
function constructNote(note, displayType=props.displayType) {
    switch (displayType) {
        case 'pc':
            return keyMap[note[0]][note[1]];
        case 'mobile':
            return noteMap[note[1]] + (note[0] + 1);
        case 'xbox':
            return "TBD";
        case 'ps':
            return "TBD";
        default:
            return note;
    }
}

/**
 * 
 * @param {Number[]} note 
 */
function constructNoteClass(note) {
    const colorMap = ["teal", "cyan", "sky"]
    return `text-${colorMap[note[0]]}-${note[1]+1}00`;
    // Classlist
    // text-teal-100 text-teal-200 text-teal-300 text-teal-400 text-teal-500 text-teal-600 text-teal-700 text-teal-800 text-teal-900
    // text-cyan-100 text-cyan-200 text-cyan-300 text-cyan-400 text-cyan-500 text-cyan-600 text-cyan-700 text-cyan-800 text-cyan-900
    // text-sky-100 text-sky-200 text-sky-300 text-sky-400 text-sky-500 text-sky-600 text-sky-700 text-sky-800 text-sky-900
}

// We pre-generate the classlist, in order to
// avoid the need to do this every time we render.
let noteClassListStatic = [];
for (let i = 0; i < 3; i++) {
    let listRow = [];
    for (let j = 0; j < 8; j++) {
        listRow.push(constructNoteClass([i, j]));
    }
    noteClassListStatic.push(listRow);
}

/**
 * Gets the color class for a note.
 * @param {Number[]} note 
 */
function getNoteClass(note) {
    return noteClassListStatic[note[0]][note[1]];
}

/**
 * Maps a note to a music note.
 */
const noteMap = [
    "Do", "Re", "Mi", "Fa", "So", "La", "Ti", "Do",
];

/**
 * Maps a note array to a key on the keyboard.
 */
const keyMap = [
    ["Q", "W", "E", "R", "T", "Y", "U"],
    ["A", "S", "D", "F", "G", "H", "J"],
    ["Z", "X", "C", "V", "B", "N", "M"]
]

</script>

<style scoped>
span {
    font-weight: 600;
}
</style>