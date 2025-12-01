import '../css/app.css';
import '../css/journal.css';
import '../css/journal-form.css';
import './i18n/i18n';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: async (name) => {
    const pages = import.meta.glob('./pages/**/*.{tsx,jsx}');

    const tsxPath = `./pages/${name}.tsx`;
    const jsxPath = `./pages/${name}.jsx`;

    if (pages[tsxPath]) {
      return resolvePageComponent(tsxPath, pages);
    } else if (pages[jsxPath]) {
      return resolvePageComponent(jsxPath, pages);
    } else {
      throw new Error(`Page not found: ${name}`);
    }
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(<App {...props} />);
  },
  progress: {
    color: '#4B5563',
  },
});
