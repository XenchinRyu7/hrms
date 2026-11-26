import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@etherealui/react',
        'lucide-react',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        '@radix-ui/react-tabs',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-popover',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-switch',
        '@radix-ui/react-slot',
      ],
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
