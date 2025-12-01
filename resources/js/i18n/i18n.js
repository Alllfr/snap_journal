import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const inertiaProps = window?.__INERTIA_SSR_PROPS__?.props || {};
const translations = inertiaProps.translations || {};
const locale = inertiaProps.locale || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      [locale]: { translation: translations },
    },
    lng: locale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
