<template>
  <div class="bg-white border border-gray-200 rounded-sm">

    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-widest text-gray-700">
        {{ t('catalog.filters') }}
      </span>
      <button v-if="hasActiveFilters" @click="resetFilters" class="text-xs text-primary-600 hover:text-primary-800 font-medium">
        {{ t('catalog.reset') }}
      </button>
    </div>

    <!-- Active filter tags -->
    <div v-if="hasActiveFilters" class="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
      <span
        v-for="tag in activeTags"
        :key="tag.key"
        class="inline-flex items-center gap-1 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium px-2 py-1 rounded"
      >
        {{ tag.label }}
        <button @click="removeFilter(tag.key)" class="hover:text-primary-900 leading-none">✕</button>
      </span>
    </div>

    <!-- Results count -->
    <div class="px-4 py-2.5 border-b border-gray-100 text-sm text-gray-500">
      <span class="font-bold text-gray-900">{{ total }}</span> {{ t('catalog.results') }}
    </div>

    <!-- Category -->
    <FilterSection :title="t('catalog.category')" :default-open="true">
      <div class="space-y-1">
        <label
          v-for="cat in categories"
          :key="cat.name"
          class="flex items-center justify-between cursor-pointer group py-0.5"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :value="cat.name"
              v-model="local.categories"
              @change="emit('update', { ...local })"
              class="accent-primary-500 w-3.5 h-3.5"
            />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">
              {{ t(`categories.${cat.name}`, cat.name) }}
            </span>
          </div>
          <span class="text-xs text-gray-400">{{ cat.count }}</span>
        </label>
      </div>
    </FilterSection>

    <!-- Brand -->
    <FilterSection v-if="filters.brands?.length" :title="t('catalog.brand')" :default-open="true">
      <div class="space-y-1 max-h-52 overflow-y-auto pr-1">
        <label
          v-for="brand in filters.brands"
          :key="brand.name"
          class="flex items-center justify-between cursor-pointer group py-0.5"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :value="brand.name"
              v-model="local.brands"
              @change="emit('update', { ...local })"
              class="accent-primary-500 w-3.5 h-3.5"
            />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ brand.name }}</span>
          </div>
          <span class="text-xs text-gray-400">{{ brand.count }}</span>
        </label>
      </div>
    </FilterSection>

    <!-- Condition -->
    <FilterSection :title="t('catalog.condition')" :default-open="false">
      <div class="space-y-1">
        <label class="flex items-center gap-2 cursor-pointer group py-0.5">
          <input type="checkbox" value="USED" v-model="local.conditions" @change="emit('update', { ...local })" class="accent-primary-500 w-3.5 h-3.5" />
          <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ t('product.used') }}</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer group py-0.5">
          <input type="checkbox" value="NEW" v-model="local.conditions" @change="emit('update', { ...local })" class="accent-primary-500 w-3.5 h-3.5" />
          <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ t('product.new') }}</span>
        </label>
      </div>
    </FilterSection>

    <!-- Year -->
    <FilterSection v-if="filters.yearRange?.min" :title="t('catalog.year')" :default-open="false">
      <div class="flex gap-2">
        <input
          type="number"
          v-model="local.yearFrom"
          :placeholder="filters.yearRange.min"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
        <input
          type="number"
          v-model="local.yearTo"
          :placeholder="filters.yearRange.max"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
      </div>
    </FilterSection>

    <!-- Hours -->
    <FilterSection v-if="filters.hoursRange?.max" :title="t('catalog.hours')" :default-open="false">
      <div class="flex gap-2">
        <input
          type="number"
          v-model="local.hoursFrom"
          placeholder="0"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
        <input
          type="number"
          v-model="local.hoursTo"
          :placeholder="filters.hoursRange.max"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
      </div>
    </FilterSection>

    <!-- Price -->
    <FilterSection :title="t('catalog.price')" :default-open="false">
      <div class="flex gap-2">
        <input
          type="number"
          v-model="local.priceFrom"
          placeholder="€ Min"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
        <input
          type="number"
          v-model="local.priceTo"
          placeholder="€ Max"
          @change="emit('update', { ...local })"
          class="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-400"
        />
      </div>
    </FilterSection>

    <!-- In Yard -->
    <div class="px-4 py-3 border-t border-gray-100">
      <label class="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          v-model="local.inYard"
          @change="emit('update', { ...local })"
          class="accent-primary-500 w-3.5 h-3.5"
        />
        <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ t('catalog.inYard') }}</span>
      </label>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FilterSection from './FilterSection.vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) },
  total: { type: Number, default: 0 },
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update', 'reset']);
const { t } = useI18n();

const defaultLocal = () => ({
  categories: [],
  brands: [],
  conditions: [],
  yearFrom: '',
  yearTo: '',
  hoursFrom: '',
  hoursTo: '',
  priceFrom: '',
  priceTo: '',
  inYard: false,
});

const local = ref({ ...defaultLocal(), ...props.modelValue });

watch(() => props.modelValue, (v) => { local.value = { ...defaultLocal(), ...v }; }, { deep: true });

const activeTags = computed(() => {
  const tags = [];
  if (local.value.categories.length) tags.push({ key: 'categories', label: local.value.categories.join(', ') });
  if (local.value.brands.length) tags.push({ key: 'brands', label: local.value.brands.join(', ') });
  if (local.value.conditions.length) tags.push({ key: 'conditions', label: local.value.conditions.map(c => t(`product.${c.toLowerCase()}`)).join(', ') });
  if (local.value.yearFrom) tags.push({ key: 'yearFrom', label: `${t('catalog.year')} ≥ ${local.value.yearFrom}` });
  if (local.value.yearTo) tags.push({ key: 'yearTo', label: `${t('catalog.year')} ≤ ${local.value.yearTo}` });
  if (local.value.hoursFrom) tags.push({ key: 'hoursFrom', label: `${t('catalog.hours')} ≥ ${local.value.hoursFrom}` });
  if (local.value.hoursTo) tags.push({ key: 'hoursTo', label: `${t('catalog.hours')} ≤ ${local.value.hoursTo}` });
  if (local.value.priceFrom) tags.push({ key: 'priceFrom', label: `€ ≥ ${local.value.priceFrom}` });
  if (local.value.priceTo) tags.push({ key: 'priceTo', label: `€ ≤ ${local.value.priceTo}` });
  if (local.value.inYard) tags.push({ key: 'inYard', label: t('catalog.inYard') });
  return tags;
});

const hasActiveFilters = computed(() => activeTags.value.length > 0);

function removeFilter(key) {
  if (key === 'categories') local.value.categories = [];
  else if (key === 'brands') local.value.brands = [];
  else if (key === 'conditions') local.value.conditions = [];
  else if (key === 'inYard') local.value.inYard = false;
  else local.value[key] = '';
  emit('update', { ...local.value });
}

function resetFilters() {
  local.value = defaultLocal();
  emit('reset');
}
</script>
