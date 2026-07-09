<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 bg-dark text-white px-4 py-4 sm:px-6 shadow-lg border-t border-gray-700"
    >
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p class="text-sm text-gray-300 leading-relaxed">
          {{ t('cookies.message') }}
          <RouterLink to="/privacy" class="underline text-primary-400 hover:text-primary-300">
            {{ t('cookies.learnMore') }}
          </RouterLink>
        </p>
        <div class="flex gap-2 shrink-0">
          <button
            @click="reject"
            class="px-4 py-2 text-sm font-medium border border-gray-500 text-gray-300 rounded hover:border-gray-300 hover:text-white transition-colors"
          >
            {{ t('cookies.reject') }}
          </button>
          <button
            @click="accept"
            class="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            {{ t('cookies.accept') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const visible = ref(false);

onMounted(() => {
  if (!localStorage.getItem('cookie-consent')) {
    visible.value = true;
  }
});

function accept() {
  localStorage.setItem('cookie-consent', 'accepted');
  visible.value = false;
}

function reject() {
  localStorage.setItem('cookie-consent', 'rejected');
  visible.value = false;
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
