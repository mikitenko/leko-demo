<template>
  <div>
    <!-- Hero -->
    <section class="bg-gray-900 text-white py-10 px-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-primary-400 text-sm font-bold uppercase tracking-widest mb-2">{{ t('home.heroSubtitle') }}</p>
        <h1 class="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3 leading-tight">
          LEKO <span class="text-primary-400">demo</span>
        </h1>
        <p class="text-gray-300 text-lg">{{ t('home.heroDesc') }}</p>
      </div>
    </section>

    <!-- Categories -->
    <section class="w-full border-t-[15px] border-primary-400 py-5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">{{ t('home.browseByCategory') }}</h2>

      <div v-if="loading" class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        <div v-for="i in 16" :key="i" class="animate-pulse bg-gray-100 rounded h-20" />
      </div>

      <div v-else>
        <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          <RouterLink
            v-for="cat in visibleCategories"
            :key="cat.name"
            :to="`/stock?category=${encodeURIComponent(cat.name)}`"
            class="flex flex-col items-center gap-1 p-2 rounded border border-gray-100 hover:border-primary-400 hover:bg-primary-50 transition-all group text-center"
          >
            <span :class="[getCategoryIcon(cat.name), 'mdi text-2xl text-gray-500 group-hover:text-primary-600']" />
            <span class="text-xs text-gray-700 leading-tight font-medium group-hover:font-bold">
              {{ t(`categories.${cat.name}`, cat.name) }}
            </span>
            <span class="text-xs font-bold text-gray-400 group-hover:text-primary-500">{{ cat.count }}</span>
          </RouterLink>
        </div>

        <div v-if="categories.length > 16" class="mt-4 text-center">
          <button @click="showAll = !showAll" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {{ showAll ? t('home.hideMore') : t('home.showMore') }} {{ showAll ? '▲' : '▼' }}
          </button>
        </div>
      </div>
      </div>
    </section>

    <!-- Product Gallery Slideshow -->
    <section v-if="galleryProducts.length" class="relative bg-gray-950 overflow-hidden" style="height: 480px;">
      <!-- Slides -->
      <div
        v-for="(product, i) in galleryProducts"
        :key="product.id"
        class="absolute inset-0 transition-opacity duration-1000"
        :class="gallerySlide === i ? 'opacity-100' : 'opacity-0'"
      >
        <img :src="getProductPhoto(product)" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-transparent"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex items-center px-4">
        <div class="max-w-7xl mx-auto w-full">
          <transition name="fade" mode="out-in">
            <div :key="gallerySlide" class="max-w-lg">
              <span class="text-primary-400 text-xs font-bold uppercase tracking-widest">
                {{ t(`categories.${galleryProducts[gallerySlide]?.category}`, galleryProducts[gallerySlide]?.category) }}
              </span>
              <h3 class="text-white text-2xl sm:text-3xl font-black uppercase mt-1 mb-2 leading-tight">
                {{ galleryProducts[gallerySlide]?.brand }} {{ galleryProducts[gallerySlide]?.model }}
              </h3>
              <div class="flex gap-4 text-sm text-gray-300 mb-4">
                <span v-if="galleryProducts[gallerySlide]?.year">📅 {{ galleryProducts[gallerySlide].year }}</span>
                <span v-if="galleryProducts[gallerySlide]?.hours != null">⏱ {{ galleryProducts[gallerySlide].hours.toLocaleString() }} h</span>
                <span v-if="galleryProducts[gallerySlide]?.location">📍 {{ galleryProducts[gallerySlide].location }}</span>
              </div>
              <RouterLink
                :to="`/product/${galleryProducts[gallerySlide]?.referenceNumber}`"
                class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded font-semibold text-sm transition-colors"
              >
                {{ t('home.viewDetails') }} →
              </RouterLink>
            </div>
          </transition>
        </div>
      </div>

      <!-- Dots -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        <button
          v-for="(_, i) in galleryProducts"
          :key="i"
          @click="gallerySlide = i; resetGalleryTimer()"
          class="h-2 rounded-full transition-all duration-300"
          :class="gallerySlide === i ? 'bg-primary-400 w-6' : 'bg-white/40 w-2'"
        />
      </div>

      <!-- Arrows -->
      <button @click="prevSlide" class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
        ‹
      </button>
      <button @click="nextSlide" class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
        ›
      </button>
    </section>

    <!-- Stats bar -->
    <section class="bg-gray-900 text-white py-10 px-4">
      <div class="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <div>
          <div class="text-3xl font-black text-primary-400">{{ totalMachines }}+</div>
          <div class="text-sm text-gray-400 mt-1">{{ t('home.statsMachines') }}</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary-400">{{ categories.length }}</div>
          <div class="text-sm text-gray-400 mt-1">{{ t('home.statsCategories') }}</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary-400">12</div>
          <div class="text-sm text-gray-400 mt-1">{{ t('home.statsLanguages') }}</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary-400">20+</div>
          <div class="text-sm text-gray-400 mt-1">{{ t('home.statsExperience') }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProductsStore } from '@/stores/products';
import { productsApi } from '@/services/api';
import { uploadsUrl } from '@/services/uploads';

const { t } = useI18n();
const store = useProductsStore();

const showAll = ref(false);
const loading = ref(true);

const categories = computed(() => store.categories);
const visibleCategories = computed(() => showAll.value ? categories.value : categories.value.slice(0, 16));
const totalMachines = computed(() => categories.value.reduce((sum, c) => sum + c.count, 0));

const categoryIcons = {
  'Excavators': 'mdi-excavator', 'Dozers': 'mdi-bulldozer', 'Motor Graders': 'mdi-road-variant',
  'Loaders': 'mdi-dump-truck', 'Rollers': 'mdi-tire', 'Pipeline': 'mdi-pipe',
  'Crushers': 'mdi-hammer', 'Screens': 'mdi-grid', 'Conveyors': 'mdi-transfer-right',
  'Drills': 'mdi-drill', 'Compactors': 'mdi-road-variant', 'Dump Trucks': 'mdi-dump-truck',
  'Telescopic Handlers': 'mdi-forklift', 'Forklifts': 'mdi-forklift', 'Cranes': 'mdi-crane',
  'Carriers': 'mdi-truck-flatbed', 'Chip Spreaders': 'mdi-road', 'Asphalt Pavers': 'mdi-road',
  'Trucks': 'mdi-truck', 'Trailers': 'mdi-truck-trailer', 'Generators': 'mdi-lightning-bolt',
  'Forestry': 'mdi-tree', 'Tractors': 'mdi-tractor', 'Harvesters': 'mdi-tractor-variant',
  'Parts': 'mdi-cog', 'Attachments': 'mdi-link-variant', 'Buckets': 'mdi-bucket', 'Engines': 'mdi-engine',
};

function getCategoryIcon(name) { return categoryIcons[name] || 'mdi-crane'; }

// Gallery slideshow
const galleryProducts = ref([]);
const gallerySlide = ref(0);
let galleryTimer = null;

function getProductPhoto(product) {
  const photo = product.photos?.find((p) => p.isPrimary) || product.photos?.[0];
  if (photo?.url) return photo.url;
  if (photo?.filename) return uploadsUrl(photo.filename);
  return `https://placehold.co/1200x480/1f2937/4b5563?text=${encodeURIComponent(product.brand + ' ' + product.model)}`;
}

function nextSlide() {
  gallerySlide.value = (gallerySlide.value + 1) % galleryProducts.value.length;
}

function prevSlide() {
  gallerySlide.value = (gallerySlide.value - 1 + galleryProducts.value.length) % galleryProducts.value.length;
}

function resetGalleryTimer() {
  clearInterval(galleryTimer);
  galleryTimer = setInterval(nextSlide, 4000);
}

onMounted(async () => {
  await store.fetchCategories();
  loading.value = false;

  try {
    const { data } = await productsApi.getAll({ limit: 8, featured: true });
    let items = data.data || [];
    if (!items.length) {
      const res = await productsApi.getAll({ limit: 8 });
      items = res.data.data || [];
    }
    galleryProducts.value = items.filter((p) => p.photos?.length).map((p) => ({
      ...p,
      photos: p.photos.filter((ph) => ph.isPrimary).slice(0, 1),
    }));
  } catch (e) {
    console.error('gallery fetch error:', e);
  }

  if (galleryProducts.value.length > 1) resetGalleryTimer();
});

onUnmounted(() => clearInterval(galleryTimer));
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.6s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
