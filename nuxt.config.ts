// nuxt.config.ts
import { fileURLToPath } from 'node:url';
export default defineNuxtConfig({
  compatibilityDate: '2025-07-25',

  runtimeConfig: {
    // Private keys (only available on server-side)
    wpGraphqlEndpoint: process.env.WP_GRAPHQL_ENDPOINT || 'https://cms.digifynn.com/graphql',
    jwtSecret: process.env.JWT_SECRET || '',
    rateLimitSecret: process.env.RATE_LIMIT_SECRET || '',
    redisUrl: process.env.REDIS_URL || '',
    sentryDsn: process.env.SENTRY_DSN || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsRegion: process.env.AWS_REGION || '',
    cloudinaryUrl: process.env.CLOUDINARY_URL || '',
    
    // Public keys (exposed to client-side)
    public: {
      siteName: 'دیجی‌فاین',
      siteDescription: 'اخبار و مقالات تکنولوژی',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.digifynn.com',
      siteUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://digifynn.com',
      sentryPublicDsn: process.env.SENTRY_PUBLIC_DSN || '',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || ''
    }
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    componentIslands: true,
    asyncContext: true,
    crossOriginPrefetch: true,
    viewTransition: true,
    asyncEntry: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
    tsConfig: {
      compilerOptions: {
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true
      }
    }
  },

  // Path aliases – simplified to prevent conflicts
  alias: {
    '~': fileURLToPath(new URL('.', import.meta.url)),
    '@': fileURLToPath(new URL('.', import.meta.url)),
    '~/': fileURLToPath(new URL('.', import.meta.url)),
    '@/': fileURLToPath(new URL('.', import.meta.url)),
    '~utils': fileURLToPath(new URL('./utils', import.meta.url)),
    '~components': fileURLToPath(new URL('./components', import.meta.url)),
    '~composables': fileURLToPath(new URL('./composables', import.meta.url)),
    '~types': fileURLToPath(new URL('./types', import.meta.url))
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
        { property: 'twitter:creator', content: '@digifynn' },
        // Security headers
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
        { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
        { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
        { 'http-equiv': 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { 'http-equiv': 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
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
    // Remove baseURL to prevent conflicts with Vite
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
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/api/post/**': { 
        cache: { maxAge: 600 },
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/api/search': { 
        cache: { maxAge: 300 },
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/api/analytics': { 
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/blog/**': { 
        prerender: false,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/': { 
        prerender: false,
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/search': { 
        ssr: true,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/static/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      },
      // Handle asset requests properly
      '/_nuxt/**': { 
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        }
      },
      
      // Handle static assets
      '/assets/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    },
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
  },

  // Auto-import configuration
  imports: {
    autoImport: true,
    global: true,
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'computed', 'watch', 'onMounted', 'onUnmounted', 'nextTick']
      },
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
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/image'
  ],

  // Robots configuration - Fixed
  robots: {
    robotsTxt: false,
    groups: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/', '/_nuxt/', '/.well-known/']
      }
    ]
  },

  // Sitemap configuration - Fixed (remove hardcoded URLs)
  sitemap: {
    exclude: ['/api/**', '/admin/**', '/private/**', '/_nuxt/**', '/.well-known/**']
  },

  // Router configuration to prevent asset routing issues
  router: {
    options: {
      strict: false
    }
  },

  // Build optimization
  build: {
    transpile: ['graphql-request']
  },

  // Vite configuration for better performance
  vite: {
    resolve: {
      alias: {
        // Keep any additional Vite-only aliases here if needed
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      target: 'es2020'
    },
    optimizeDeps: {
      include: ['graphql-request', 'vue', 'vue-router']
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
    },
    // Ensure proper asset handling
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.webp']
  },

  // Development server configuration
  devServer: {
    port: 3000,
    host: 'localhost',
    url: 'http://localhost:3000'
  },

  // Fix development server issues
  devtools: {
    enabled: true
  },

  // Tailwind CSS configuration
  css: ['~/assets/styles/tailwind.css'],

  // PostCSS configuration for Tailwind - Fixed
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }

})