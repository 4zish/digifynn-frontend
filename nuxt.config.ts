// nuxt.config.ts
import { fileURLToPath } from 'node:url';
export default defineNuxtConfig({
  compatibilityDate: '2025-07-25',

  runtimeConfig: {
    // Private keys (only available on server-side)
    wpGraphqlEndpoint: process.env.WP_GRAPHQL_ENDPOINT || 'https://cms.digifynn.com/graphql',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    rateLimitSecret: process.env.RATE_LIMIT_SECRET || 'rate-limit-secret',
    
    // Public keys (exposed to client-side)
    public: {
      siteName: 'دیجی‌فاین',
      siteDescription: 'اخبار و مقالات تکنولوژی',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.digifynn.com',
      siteUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://digifynn.com'
    }
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    // inlineSSRStyles: false, // Removed - not available in Nuxt 4
    renderJsonPayloads: true,
    componentIslands: true,
    // treeshakeClientOnly: true, // Removed - not available in Nuxt 4
    asyncContext: true,
    crossOriginPrefetch: true,
    viewTransition: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  // Path aliases – use absolute paths so they resolve correctly on Windows
  alias: {
    '~': fileURLToPath(new URL('.', import.meta.url)),
    '@': fileURLToPath(new URL('.', import.meta.url)),
    '~/': fileURLToPath(new URL('.', import.meta.url)),
    '@/': fileURLToPath(new URL('.', import.meta.url)),

    '~utils': fileURLToPath(new URL('./utils', import.meta.url)),
    '~components': fileURLToPath(new URL('./components', import.meta.url)),
    '~composables': fileURLToPath(new URL('./composables', import.meta.url)),
    '~types': fileURLToPath(new URL('./types', import.meta.url)),
    '/app.vue': fileURLToPath(new URL('./app.vue', import.meta.url))
  },

  // App configuration
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#E4002B' },
        { name: 'msapplication-TileColor', content: '#E4002B' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'دیجی‌فاین' },
        { name: 'description', content: 'آخرین اخبار و مقالات تکنولوژی، موبایل، کامپیوتر و گجت‌ها از دیجی‌فاین' },
        { name: 'keywords', content: 'تکنولوژی, موبایل, کامپیوتر, گجت, اخبار, مقالات' },
        { name: 'author', content: 'دیجی‌فاین' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'دیجی‌فاین' },
        { property: 'og:locale', content: 'fa_IR' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:site', content: '@digifynn' },
        { property: 'twitter:creator', content: '@digifynn' }
      ],
      script: [
        // Service Worker registration
        {
          innerHTML: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
          type: 'text/javascript'
        },
        // Performance monitoring
        {
          innerHTML: `
            // Core Web Vitals monitoring
            if ('PerformanceObserver' in window) {
              // LCP
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
              }).observe({ entryTypes: ['largest-contentful-paint'] });
              
              // FID
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                  console.log('FID:', entry.processingStart - entry.startTime);
                });
              }).observe({ entryTypes: ['first-input'] });
              
              // CLS
              let clsValue = 0;
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                  }
                });
                console.log('CLS:', clsValue);
              }).observe({ entryTypes: ['layout-shift'] });
            }
          `,
          type: 'text/javascript'
        }
      ]
    },
    // PWA configuration
    baseURL: process.env.NODE_ENV === 'development' ? '/' : (process.env.BASE_URL || 'https://digifynn.com'),
    cdnURL: process.env.CDN_URL || '',
    keepalive: true,
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  // Security headers and caching
  nitro: {
    // Route rules for caching
    routeRules: {
      '/api/posts': { 
        cache: { maxAge: 300 },
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300'
        }
      },
      '/api/post/**': { 
        cache: { maxAge: 600 },
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600'
        }
      },
      '/api/search': { 
        cache: { maxAge: 300 },
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300'
        }
      },
      '/api/analytics': { 
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      },
      '/blog/**': { 
        prerender: false, // Disable prerendering to avoid 404 errors during build
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      },
      '/': { 
        prerender: false, // Temporarily disable prerendering
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800'
        }
      },
      '/search': { 
        ssr: true,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300'
        }
      },
      '/static/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    },
    // Security headers (removed - not available in Nuxt 4 nitro config)
    // TODO: Move security headers to server middleware or runtime config
    // headers: {
    //   'X-Content-Type-Options': 'nosniff',
    //   'X-Frame-Options': 'DENY',
    //   'X-XSS-Protection': '1; mode=block',
    //   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    //   'Content-Security-Policy': [
    //     "default-src 'self'",
    //     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com",
    //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    //     "font-src 'self' https://fonts.gstatic.com",
    //     "img-src 'self' data: https: blob: https://cms.digifynn.com",
    //     "media-src 'self' https:",
    //     "connect-src 'self' https://cms.digifynn.com https://www.google-analytics.com https://analytics.google.com",
    //     "frame-ancestors 'none'",
    //     "base-uri 'self'",
    //     "form-action 'self'",
    //     "upgrade-insecure-requests"
    //   ].join('; '),
    //   'Referrer-Policy': 'strict-origin-when-cross-origin',
    //   'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    //   'Cross-Origin-Embedder-Policy': 'require-corp',
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    //   'Cross-Origin-Resource-Policy': 'same-origin'
    // },
    // Compression
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
    // Minification
    minify: true,
    // Source maps in development
    sourceMap: process.env.NODE_ENV === 'development'
  },

  // Component auto-import configuration
  components: {
    global: true,
    dirs: ['~/components']
    // dts: true // Removed - not available in Nuxt 4
  },

  // Auto-import configuration
  imports: {
    autoImport: true,
    // Global imports
    global: true,
    // Presets
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed', 'watch', 'onMounted', 'onUnmounted', 'nextTick']
      },
      // Removed vue-router imports as Nuxt provides these automatically
      {
        from: '~/composables',
        imports: ['usePosts', 'useAuth', 'useComments', 'useAnalytics', 'useDateFormatter']
      },
      {
        from: '~/utils',
        imports: ['validateInput', 'sanitizeInput', 'generateSecureToken']
      }
    ]
  },

  // Module configuration
  modules: [
    // '@nuxt/image', // Temporarily removed due to compatibility issue with Nuxt 4
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],

  // Image optimization (disabled temporarily due to @nuxt/image compatibility issue)
  // image: {
  //   provider: 'ipx',
  //   quality: 85,
  //   format: ['webp', 'avif', 'jpeg'],
  //   screens: {
  //     xs: 320,
  //     sm: 640,
  //     md: 768,
  //     lg: 1024,
  //     xl: 1280,
  //     xxl: 1536
  //   },
  //   presets: {
  //     avatar: {
  //       modifiers: {
  //         format: 'webp',
  //         width: 50,
  //         height: 50,
  //         quality: 80
  //       }
  //     },
  //     thumbnail: {
  //       modifiers: {
  //         format: 'webp',
  //         width: 300,
  //         height: 200,
  //         quality: 85
  //       }
  //     },
  //     hero: {
  //       modifiers: {
  //         format: 'webp',
  //         width: 1200,
  //         height: 600,
  //         quality: 90
  //       }
  //     }
  //   }
  // },

  // Robots configuration
  robots: {
    robotsTxt: false, // Disable robots.txt generation to avoid base URL error
    groups: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/']
      }
    ]
  },

  // Sitemap configuration
  sitemap: {
    // siteUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://digifynn.com', // Removed - not available in this version
    exclude: ['/api/**', '/admin/**', '/private/**']
    // routes: async () => { // Removed - not available in this version
    //   // Dynamic routes for blog posts
    //   return [
    //     '/',
    //     '/blog',
    //     '/search',
    //     '/category/technology',
    //     '/category/automotive',
    //     '/category/reviews',
    //     '/category/video',
    //     '/category/tutorial',
    //     '/category/buying-guide'
    //   ]
    // }
  },

  // Build optimization
  build: {
    transpile: ['graphql-request', 'bcryptjs', 'jsonwebtoken']
    // treeshake: true, // Removed - not available in Nuxt 4
    // sourcemap: process.env.NODE_ENV === 'development' // Removed - not available in Nuxt 4
  },

  // Vite configuration for better performance
  vite: {
    resolve: {
      alias: {
        // Keep any additional Vite-only aliases here if needed
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            graphql: ['graphql-request'],
            utils: ['bcryptjs', 'jsonwebtoken']
            // ui: ['@nuxt/image'] // Removed due to @nuxt/image compatibility issue
          }
        }
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ['graphql-request', 'bcryptjs', 'jsonwebtoken']
    },
    server: {
      fs: {
        allow: ['.']
      }
    },
    // CSS optimization
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/styles/variables.scss";'
        }
      }
    },
    // Performance optimizations
    esbuild: {
      target: 'es2020',
      treeShaking: true
    },
    // Development optimizations
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false
    }
  },

  // Development server configuration
  devServer: {
    port: 3000,
    host: 'localhost',
    url: 'http://localhost:3000'
  },

  // Runtime configuration (removed - not available in Nuxt 4)
  // runtime: {
  //   // Enable experimental features
  //   experimental: {
  //     asyncContext: true,
  //     crossOriginPrefetch: true
  //   }
  // }
})