// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/image"],

  devtools: {
    enabled: false,
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
    storage: "none",
    storageKey: "none",
  },

  ui: {
    theme: {
      colors: ["neutral", "primary"],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ||
        "https://jvzp9vk6-4200.euw.devtunnels.ms",
    },
  },

  routeRules: {
    "/": { prerender: true },
  },

  devServer: {
    host: "127.0.0.1",
    port: 5173,
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
