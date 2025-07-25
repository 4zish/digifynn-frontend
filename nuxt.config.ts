// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-25',

  runtimeConfig: {
    public: {
      wpGraphQLEndpoint: 'https://cms.digifynn.com/graphql'
    }
  },

  // Add this section to include the Vazirmatn font
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap' }
      ]
    }
  }
})