<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white hover:text-primary-300 transition-colors"
    >
      <span>{{ currentLang.flag }}</span>
      <span class="hidden sm:inline">{{ currentLang.label }}</span>
      <svg class="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg border border-gray-100 z-50 py-1 max-h-80 overflow-y-auto"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="selectLang(lang.code)"
        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        :class="{ 'font-semibold text-primary-600 bg-primary-50': locale === lang.code }"
      >
        <span>{{ lang.flag }}</span>
        <span>{{ lang.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { loadLocale } from '@/i18n';

const { locale } = useI18n();
const open = ref(false);
const dropdownRef = ref(null);

const languages = [
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski',     flag: '🇵🇱' },
  { code: 'cs', label: 'Čeština',    flag: '🇨🇿' },
  { code: 'ro', label: 'Română',     flag: '🇷🇴' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
];

const currentLang = computed(() => languages.find((l) => l.code === locale.value) || languages[0]);

async function selectLang(code) {
  await loadLocale(code);
  open.value = false;
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) open.value = false;
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>
