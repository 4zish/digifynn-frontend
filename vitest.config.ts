import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '**/types/**',
        '**/__tests__/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },
      all: true,
      include: [
        'components/**/*.{js,ts,vue}',
        'composables/**/*.{js,ts}',
        'utils/**/*.{js,ts}',
        'server/**/*.{js,ts}',
        'app/**/*.{js,ts,vue}'
      ]
    },
    include: [
      'test/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{js,ts}',
      '**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      'coverage/**',
      'test/e2e/**' // Exclude E2E tests from unit test runs
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    maxConcurrency: 5,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  resolve: {
    alias: {
      '~': '.',
      '@': '.',
      '~utils': './utils',
      '~components': './components',
      '~composables': './composables',
      '~types': './types'
    }
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
}) 