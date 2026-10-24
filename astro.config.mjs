import { defineConfig } from 'astro/config';

const base = process.env.GITHUB_ACTIONS === 'true' ? '/decapcms-storage' : '/';

export default defineConfig({
  site: 'https://hexondev.github.io',
  base,
});
