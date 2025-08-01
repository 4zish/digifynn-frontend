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
      reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '**/types/**',
        '**/__tests__/**',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
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
    testTimeout: 15000,
    hookTimeout: 15000,
    maxConcurrency: 10,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Enhanced test reporting
    reporters: ['verbose', 'html', 'json'],
    // Performance optimizations
    isolate: true,
    // Better error reporting
    onConsoleLog(log, type) {
      if (type === 'stderr') {
        return false
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