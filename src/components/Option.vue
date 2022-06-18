<template>
    <div>
        <label
            class="inline-flex flex-row items-center"
            :for="optionClass.value"
            v-tooltip.right="`${props.description}`"
        >
            {{ props.title }}
            <QuestionMarkCircleIcon class="w-6 ml-1"/>
        </label>
        <br>
        <input :id="optionClass.value" type="range" :min="props.min" :max="props.max" v-model="internal" @input="handleInput()">
        <b class="ml-3">({{ props.option }})</b>
    </div>
</template>

<script setup>
import { QuestionMarkCircleIcon } from "@heroicons/vue/solid"
import { ref, onMounted } from 'vue'

const props = defineProps({
    option: {
        type: Number,
        default: 1,
    },
    title: {
        type: String,
        default: 'Option Name',
    },
    description: {
        type: String,
        default: 'Ideally there should be should be a neat description here',
    },
    min: {
        type: Number,
        default: 1,
    },
    max: {
        type: Number,
        default: 10,
    },
});

const emit = defineEmits(['update:modelValue']);
let internal = ref(0);
let optionClass = ref('');

onMounted(() => {
    internal.value = props.option;
    optionClass.value = ref(`option-${props.title.toLowerCase().replaceAll(' ', '-')}`);
});


function handleInput() {
    emit('update:modelValue', Number(internal.value))
}

</script>