<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Title + sort -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900">
        {{ categoryTitle || t('catalog.title') }}
        <span v-if="store.meta.total" class="text-base font-normal text-gray-400 ml-2">({{ store.meta.total }})</span>
      </h1>
      <select v-model="sortBy" @change="fetchData" class="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400 w-auto bg-white">
        <option value="featured">{{ t('catalog.sortFeatured') }}</option>
        <option value="newest">{{ t('catalog.sortNewest') }}</option>
        <option value="oldest">{{ t('catalog.sortOldest') }}</option>
        <option value="hoursAsc">{{ t('catalog.sortHoursAsc') }}</option>
        <option value="hoursDesc">{{ t('catalog.sortHoursDesc') }}</option>
        <option value="priceAsc">{{ t('catalog.sortPriceAsc') }}</option>
        <option value="priceDesc">{{ t('catalog.sortPriceDesc') }}</option>
      </select>
    </div>

    <div class="flex gap-6">

      <!-- Filters sidebar desktop -->
      <aside class="hidden lg:block w-60 shrink-0">
        <FilterPanel
          :categories="store.categories"
          :filters="store.filters"
          :total="store.meta.total"
          :model-value="activeFilters"
          @update="onFiltersUpdate"
          @reset="onFiltersReset"
        />
      </aside>

      <!-- Products -->
      <div class="flex-1 min-w-0">

        <!-- Mobile filter toggle -->
        <button
          @click="mobileFilters = !mobileFilters"
          class="lg:hidden mb-4 w-full flex items-center justify-center gap-2 border border-gray-200 rounded px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary-400 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          {{ t('catalog.filters') }} ({{ store.meta.total }} {{ t('catalog.results') }})
        </button>

        <!-- Mobile filters -->
        <div v-if="mobileFilters" class="lg:hidden mb-4">
          <FilterPanel
            :categories="store.categories"
            :filters="store.filters"
            :total="store.meta.total"
            :model-value="activeFilters"
            @update="onFiltersUpdate"
            @reset="onFiltersReset"
          />
        </div>

        <!-- Loading skeleton -->
        <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="animate-pulse bg-gray-100 rounded h-80" />
        </div>

        <!-- No results -->
        <div v-else-if="!store.products.length" class="text-center py-20 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-medium">{{ t('catalog.noResults') }}</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <ProductCard v-for="product in store.products" :key="product.id" :product="product" />
        </div>

        <!-- Pagination -->
        <div v-if="store.meta.totalPages > 1" class="mt-8 flex justify-center gap-1.5">
          <button
            v-for="p in store.meta.totalPages"
            :key="p"
            @click="goToPage(p)"
            class="w-9 h-9 rounded text-sm font-medium transition-colors"
            :class="p === currentPage ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400'"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProductsStore } from '@/stores/products';
import ProductCard from '@/components/ProductCard.vue';
import FilterPanel from '@/components/FilterPanel.vue';

const { t, locale } = useI18n();
const route = useRoute();
const store = useProductsStore();

const sortBy = ref('featured');
const currentPage = ref(1);
const mobileFilters = ref(false);

const defaultFilters = () => ({
  categories: [], brands: [], conditions: [],
  yearFrom: '', yearTo: '', hoursFrom: '', hoursTo: '',
  priceFrom: '', priceTo: '', inYard: false,
});

const activeFilters = ref(defaultFilters());

const categoryTitle = computed(() => {
  const cats = activeFilters.value.categories.length
    ? activeFilters.value.categories
    : (route.query.category || route.params.category) ? [route.query.category || route.params.category] : [];
  if (!cats.length) return '';
  return cats.map(c => t(`categories.${c}`, c)).join(', ');
});

function buildParams() {
  const f = activeFilters.value;
  const params = { locale: locale.value, sortBy: sortBy.value, page: currentPage.value, limit: 12 };

  const routeCategory = route.query.category || route.params.category;
  if (routeCategory && !f.categories.length) params.category = routeCategory;
  if (route.query.search) params.search = route.query.search;
  if (f.categories.length) params.category = f.categories.join(',');
  if (f.brands.length) params.brand = f.brands.join(',');
  if (f.conditions.length) params.condition = f.conditions[0];
  if (f.yearFrom) params.yearFrom = f.yearFrom;
  if (f.yearTo) params.yearTo = f.yearTo;
  if (f.hoursFrom) params.hoursFrom = f.hoursFrom;
  if (f.hoursTo) params.hoursTo = f.hoursTo;
  if (f.priceFrom) params.priceFrom = f.priceFrom;
  if (f.priceTo) params.priceTo = f.priceTo;
  if (f.inYard) params.inYard = true;

  return params;
}

async function fetchData() {
  await store.fetchProducts(buildParams());
}

function onFiltersUpdate(filters) {
  activeFilters.value = filters;
  currentPage.value = 1;
  fetchData();
}

function onFiltersReset() {
  activeFilters.value = defaultFilters();
  currentPage.value = 1;
  fetchData();
}

function goToPage(p) {
  currentPage.value = p;
  fetchData();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

watch(() => route.params.category, () => { currentPage.value = 1; fetchData(); });
watch(() => route.query.category, (cat) => {
  activeFilters.value = { ...defaultFilters(), categories: cat ? [cat] : [] };
  currentPage.value = 1;
  fetchData();
});
watch(locale, () => fetchData());

onMounted(async () => {
  const cat = route.query.category || route.params.category;
  if (cat) activeFilters.value = { ...defaultFilters(), categories: [cat] };
  await Promise.all([
    store.fetchCategories(),
    store.fetchFilters(cat),
    fetchData(),
  ]);
});
</script>
