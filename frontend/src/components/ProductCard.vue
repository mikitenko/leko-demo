<template>
  <RouterLink
    :to="`/product/${product.referenceNumber}`"
    class="group block bg-white border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all duration-200 rounded-sm overflow-hidden"
  >
    <!-- Photo -->
    <div class="relative aspect-[4/3] bg-gray-100 overflow-hidden">
      <img
        :src="photoSrc"
        :alt="title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      <!-- Badges -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="product.featured" class="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
          Featured
        </span>
        <span v-if="product.condition === 'NEW'" class="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
          {{ t('product.new') }}
        </span>
      </div>
      <div v-if="product.inYard" class="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
        {{ t('product.inYard') }}
      </div>

      <!-- Photo count -->
      <div v-if="product.photos?.length > 1" class="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ product.photos.length }}
      </div>
    </div>

    <!-- Highlights bar -->
    <div v-if="product.highlights" class="bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 truncate tracking-wide">
      {{ product.highlights }}
    </div>

    <!-- Info -->
    <div class="p-4">
      <!-- Category -->
      <div class="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1">
        {{ t(`categories.${product.category}`, product.category) }}
      </div>

      <!-- Title -->
      <h3 class="font-bold text-gray-900 text-sm uppercase tracking-wide leading-tight mb-3 line-clamp-2">
        {{ title || `${product.brand} ${product.model}` }}
      </h3>

      <!-- Specs -->
      <div class="space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400 text-xs">{{ t('product.referenceNumber') }}</span>
          <span class="font-medium text-gray-700 text-xs">{{ product.referenceNumber }}</span>
        </div>
        <div v-if="product.year" class="flex justify-between">
          <span class="text-gray-400 text-xs">{{ t('product.year') }}</span>
          <span class="font-medium text-gray-700 text-xs">{{ product.year }}</span>
        </div>
        <div v-if="product.hours != null" class="flex justify-between">
          <span class="text-gray-400 text-xs">{{ t('product.hours') }}</span>
          <span class="font-medium text-gray-700 text-xs">{{ product.hours.toLocaleString() }} h</span>
        </div>
        <div v-if="product.location" class="flex justify-between">
          <span class="text-gray-400 text-xs">{{ t('product.location') }}</span>
          <span class="font-medium text-gray-700 text-xs truncate max-w-[120px]">{{ product.location }}</span>
        </div>
      </div>

      <!-- Price -->
      <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span class="text-gray-400 text-xs font-medium">{{ t('product.price') }}</span>
        <span class="font-bold text-gray-900 text-sm">
          {{ product.priceOnRequest ? t('product.onRequest') : `€ ${product.price?.toLocaleString()}` }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  product: { type: Object, required: true },
});

const { t, locale } = useI18n();

const primaryPhoto = computed(() =>
  props.product.photos?.find((p) => p.isPrimary) || props.product.photos?.[0]
);

const photoSrc = computed(() => {
  if (primaryPhoto.value?.url) return primaryPhoto.value.url;
  if (primaryPhoto.value?.filename) return `/uploads/${primaryPhoto.value.filename}`;
  return `https://placehold.co/400x300/e5e7eb/9ca3af?text=${encodeURIComponent(props.product.brand + ' ' + props.product.model)}`;
});

const title = computed(() => {
  const tr = props.product.translations?.find((t) => t.locale === locale.value)
    || props.product.translations?.[0];
  return tr?.title || '';
});
</script>
