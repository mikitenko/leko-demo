<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Loading -->
    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-100 rounded w-1/3" />
      <div class="h-96 bg-gray-100 rounded" />
    </div>

    <!-- Not found -->
    <div v-else-if="!store.product" class="text-center py-20 text-gray-400">
      <p class="text-xl font-medium">Product not found</p>
      <RouterLink to="/stock" class="mt-4 btn-primary inline-block">← Back to stock</RouterLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <RouterLink to="/stock" class="hover:text-primary-600">{{ t('nav.stock') }}</RouterLink>
        <span>›</span>
        <RouterLink :to="`/stock/${product.category}`" class="hover:text-primary-600">
          {{ t(`categories.${product.category}`, product.category) }}
        </RouterLink>
        <span>›</span>
        <span class="text-gray-700">{{ product.referenceNumber }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Photos -->
        <div>
          <div class="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-3">
            <img
              :src="activePhotoSrc"
              :alt="title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Thumbnails -->
          <div v-if="product.photos?.length > 1" class="flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="photo in product.photos"
              :key="photo.id"
              @click="activePhotoId = photo.id"
              class="shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors"
              :class="activePhotoId === photo.id ? 'border-primary-500' : 'border-transparent'"
            >
              <img :src="photo.url || uploadsUrl(photo.filename)" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Details -->
        <div>
          <!-- Highlights -->
          <div v-if="product.highlights" class="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded mb-4">
            {{ product.highlights }}
          </div>

          <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
            {{ title || `${product.brand} ${product.model}` }}
          </h1>

          <!-- Specs table -->
          <div class="border border-gray-200 rounded overflow-hidden mb-6">
            <div class="grid grid-cols-2 divide-x divide-gray-100">
              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">{{ t('product.referenceNumber') }}</div>
              <div class="px-4 py-3 text-sm font-bold text-gray-900">{{ product.referenceNumber }}</div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-t border-gray-100">{{ t('product.year') }}</div>
              <div class="px-4 py-3 text-sm text-gray-900 border-t border-gray-100">{{ product.year || '—' }}</div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-t border-gray-100">{{ t('product.hours') }}</div>
              <div class="px-4 py-3 text-sm text-gray-900 border-t border-gray-100">{{ product.hours?.toLocaleString() || '—' }}</div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-t border-gray-100">{{ t('product.condition') }}</div>
              <div class="px-4 py-3 text-sm text-gray-900 border-t border-gray-100">
                {{ product.condition === 'NEW' ? t('product.new') : t('product.used') }}
              </div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-t border-gray-100">{{ t('product.inYard') }}</div>
              <div class="px-4 py-3 text-sm border-t border-gray-100">
                <span v-if="product.inYard" class="text-green-600 font-semibold">✓</span>
                <span v-else class="text-gray-400">—</span>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-t border-gray-100">{{ t('product.location') }}</div>
              <div class="px-4 py-3 text-sm text-gray-900 border-t border-gray-100">{{ product.location || 'Trier, Germany' }}</div>

              <div class="px-4 py-3 bg-gray-50 text-sm font-bold text-gray-700 border-t border-gray-100">{{ t('product.price') }}</div>
              <div class="px-4 py-3 text-sm font-black text-gray-900 border-t border-gray-100">
                {{ product.priceOnRequest ? t('product.onRequest') : `€ ${product.price?.toLocaleString()}` }}
              </div>
            </div>
          </div>

          <!-- CTA -->
          <a
            href="mailto:info@leko-gmbh.de"
            class="btn-primary w-full py-3 text-base justify-center"
          >
            {{ t('product.requestInfo') }}
          </a>

          <a
            href="tel:+4965112345678"
            class="btn-outline w-full py-3 text-base justify-center mt-3"
          >
            +49 651 123 4567
          </a>
        </div>
      </div>

      <!-- Description -->
      <div v-if="description" class="mt-10">
        <h2 class="text-lg font-bold text-gray-900 mb-3">{{ t('product.description') }}</h2>
        <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ description }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProductsStore } from '@/stores/products';
import { uploadsUrl } from '@/services/uploads';

const { t, locale } = useI18n();
const route = useRoute();
const store = useProductsStore();

const activePhotoId = ref(null);

const product = computed(() => store.product);

const activePhoto = computed(() => {
  if (!product.value?.photos?.length) return null;
  return product.value.photos.find((p) => p.id === activePhotoId.value) || product.value.photos[0];
});

const activePhotoSrc = computed(() => {
  if (activePhoto.value?.url) return activePhoto.value.url;
  if (activePhoto.value?.filename) return uploadsUrl(activePhoto.value.filename);
  if (!product.value) return '';
  return `https://placehold.co/800x600/e5e7eb/9ca3af?text=${encodeURIComponent(product.value.brand + ' ' + product.value.model)}`;
});

const translation = computed(() =>
  product.value?.translations?.find((tr) => tr.locale === locale.value) || product.value?.translations?.[0]
);

const title = computed(() => translation.value?.title || '');
const description = computed(() => translation.value?.description || '');

async function load() {
  await store.fetchProduct(route.params.id, locale.value);
  if (product.value?.photos?.length) {
    activePhotoId.value = product.value.photos.find((p) => p.isPrimary)?.id || product.value.photos[0].id;
  }
}

watch(locale, () => store.fetchProduct(route.params.id, locale.value));
onMounted(load);
</script>
