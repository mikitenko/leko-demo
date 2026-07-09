import { createI18n } from 'vue-i18n';

const messages = {
  en: () => import('./locales/en.json'),
  de: () => import('./locales/de.json'),
  uk: () => import('./locales/uk.json'),
  ru: () => import('./locales/ru.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  pl: () => import('./locales/pl.json'),
  it: () => import('./locales/it.json'),
  pt: () => import('./locales/pt.json'),
  nl: () => import('./locales/nl.json'),
  cs: () => import('./locales/cs.json'),
  ro: () => import('./locales/ro.json'),
};

const savedLocale = localStorage.getItem('locale') || 'de';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'de',
  messages: {},
});

export async function loadLocale(locale) {
  if (!i18n.global.availableLocales.includes(locale)) {
    const msgs = await messages[locale]?.();
    if (msgs) {
      i18n.global.setLocaleMessage(locale, msgs.default || msgs);
    }
  }
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
}

loadLocale(savedLocale);

export default i18n;
