import { defineConfig } from "astro/config"
import svelte from "@astrojs/svelte"
import markdoc from "@astrojs/markdoc"
import tailwindcss from "@tailwindcss/vite"

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), markdoc()],

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },

  devToolbar: {
    enabled: false,
  },

  site: "https://austincrim.com",

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
})