// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-25',

  // Add this section
  runtimeConfig: {
    public: {
      wpGraphqlEndpoint: 'https://cms.digifynn.com/graphql'
    }
  }
})