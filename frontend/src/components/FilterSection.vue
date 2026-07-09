<template>
  <div class="border-t border-gray-100">
    <button
      type="button"
      @click="open = !open"
      class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
    >
      <span class="text-xs font-bold uppercase tracking-widest text-gray-700">{{ title }}</span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div v-if="open" class="px-4 pb-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: true },
});

const open = ref(props.defaultOpen);
</script>
