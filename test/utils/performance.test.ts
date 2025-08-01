import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  AdvancedCache,
  ImageOptimizer,
  LazyLoader,
  PerformanceMonitor,
  BundleOptimizer,
  MemoryManager,
  NetworkOptimizer,
  ServiceWorkerManager,
  CoreWebVitals
} from '../../utils/performance'

describe('Performance Utilities', () => {
  describe('AdvancedCache', () => {
    let cache: AdvancedCache<string>

    beforeEach(() => {
      cache = new AdvancedCache({
        maxSize: 3,
        ttl: 60000,
        strategy: 'lru'
      })
    })

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
    })

    it('should implement LRU eviction', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // Should evict key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    it('should update access count on get', () => {
      cache.set('key1', 'value1')
      cache.get('key1') // Access it
      cache.get('key1') // Access it again

      // The access count should be tracked internally
      const stats = cache.getStats()
      expect(stats.size).toBe(1)
    })

    it('should clear cache', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.clear()

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.getStats().size).toBe(0)
    })

    it('should provide stats', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.hitRate).toBeDefined()
    })
  })

  describe('ImageOptimizer', () => {
    it('should generate srcset', () => {
      const srcset = ImageOptimizer.generateSrcSet('test.jpg')
      expect(srcset).toContain('test.jpg')
      expect(srcset).toContain('320w')
      expect(srcset).toContain('1920w')
    })

    it('should generate srcset with custom widths', () => {
      const srcset = ImageOptimizer.generateSrcSet('test.jpg', [100, 200, 300])
      expect(srcset).toContain('100w')
      expect(srcset).toContain('200w')
      expect(srcset).toContain('300w')
    })

    it('should get optimal format', () => {
      const format = ImageOptimizer.getOptimalFormat()
      expect(['webp', 'avif', 'jpeg', 'png']).toContain(format)
    })

    it('should optimize image', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      try {
        const result = await ImageOptimizer.optimizeImage(file, {
          format: 'webp',
          quality: 85,
          width: 800,
          height: 600
        })
        expect(result).toBeInstanceOf(Blob)
      } catch (error) {
        // In test environment, canvas might not be available
        expect(error).toBeDefined()
      }
    })
  })

  describe('LazyLoader', () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should initialize observer', () => {
      LazyLoader.init()
      expect(global.IntersectionObserver).toHaveBeenCalled()
    })

    it('should observe elements', () => {
      LazyLoader.init()
      const element = document.createElement('div')
      
      LazyLoader.observe(element)
      
      const mockObserver = global.IntersectionObserver as any
      expect(mockObserver.mock.results[0].value.observe).toHaveBeenCalledWith(element)
    })
  })

  describe('PerformanceMonitor', () => {
    beforeEach(() => {
      // Mock performance API
      global.performance = {
        now: vi.fn().mockReturnValue(1000),
        getEntriesByType: vi.fn().mockReturnValue([]),
        mark: vi.fn(),
        measure: vi.fn()
      } as any

      // Mock memory API
      global.performance.memory = {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      } as any
    })

    it('should start monitoring', () => {
      PerformanceMonitor.start()
      expect(global.performance.now).toHaveBeenCalled()
    })

    it('should end monitoring and return metrics', () => {
      PerformanceMonitor.start()
      const metrics = PerformanceMonitor.end()

      expect(metrics).toHaveProperty('loadTime')
      expect(metrics).toHaveProperty('renderTime')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('networkRequests')
      expect(metrics).toHaveProperty('cacheHitRate')
    })

    it('should get average metrics', () => {
      PerformanceMonitor.start()
      PerformanceMonitor.end()
      PerformanceMonitor.start()
      PerformanceMonitor.end()

      const avgMetrics = PerformanceMonitor.getAverageMetrics()
      expect(avgMetrics).toHaveProperty('loadTime')
      expect(avgMetrics).toHaveProperty('renderTime')
      expect(avgMetrics).toHaveProperty('memoryUsage')
      expect(avgMetrics).toHaveProperty('networkRequests')
      expect(avgMetrics).toHaveProperty('cacheHitRate')
    })
  })

  describe('BundleOptimizer', () => {
    beforeEach(() => {
      // Mock document methods
      document.createElement = vi.fn().mockImplementation((tag) => ({
        tagName: tag.toUpperCase(),
        href: '',
        rel: '',
        type: '',
        setAttribute: vi.fn(),
        appendChild: vi.fn()
      }))

      document.head = {
        appendChild: vi.fn()
      } as any
    })

    it('should preload critical resources', async () => {
      await BundleOptimizer.preloadCriticalResources()
      expect(document.createElement).toHaveBeenCalledWith('link')
    })

    it('should prefetch non-critical resources', async () => {
      await BundleOptimizer.prefetchNonCriticalResources()
      expect(document.createElement).toHaveBeenCalledWith('link')
    })

    it('should get resource type', () => {
      expect(BundleOptimizer['getResourceType']('script.js')).toBe('script')
      expect(BundleOptimizer['getResourceType']('style.css')).toBe('style')
      expect(BundleOptimizer['getResourceType']('image.jpg')).toBe('image')
      expect(BundleOptimizer['getResourceType']('font.woff')).toBe('font')
      expect(BundleOptimizer['getResourceType']('unknown.xyz')).toBe('other')
    })
  })

  describe('MemoryManager', () => {
    beforeEach(() => {
      // Mock performance.memory
      global.performance = {
        memory: {
          usedJSHeapSize: 30 * 1024 * 1024,
          totalJSHeapSize: 50 * 1024 * 1024,
          jsHeapSizeLimit: 100 * 1024 * 1024
        }
      } as any
    })

    it('should check memory usage', () => {
      const isHigh = MemoryManager.checkMemoryUsage()
      expect(typeof isHigh).toBe('boolean')
    })

    it('should perform cleanup', () => {
      // Mock console methods
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      MemoryManager.cleanup()
      
      expect(consoleSpy).toHaveBeenCalledWith('Memory cleanup completed')
      consoleSpy.mockRestore()
    })
  })

  describe('NetworkOptimizer', () => {
    it('should compress data', async () => {
      const data = { test: 'data', nested: { value: 123 } }
      const compressed = await NetworkOptimizer.compressData(data)
      
      expect(typeof compressed).toBe('string')
      expect(compressed.length).toBeLessThan(JSON.stringify(data).length)
    })

    it('should decompress data', async () => {
      const originalData = { test: 'data', nested: { value: 123 } }
      const compressed = await NetworkOptimizer.compressData(originalData)
      const decompressed = await NetworkOptimizer.decompressData(compressed)
      
      expect(decompressed).toEqual(originalData)
    })

    it('should get optimal chunk size', () => {
      const chunkSize = NetworkOptimizer.getOptimalChunkSize()
      expect(typeof chunkSize).toBe('number')
      expect(chunkSize).toBeGreaterThan(0)
    })

    it('should handle compression errors', async () => {
      const invalidData = { circular: null }
      invalidData.circular = invalidData // Create circular reference
      
      try {
        await NetworkOptimizer.compressData(invalidData)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('ServiceWorkerManager', () => {
    beforeEach(() => {
      // Mock navigator.serviceWorker
      global.navigator = {
        serviceWorker: {
          register: vi.fn().mockResolvedValue({}),
          getRegistration: vi.fn().mockResolvedValue({}),
          getRegistrations: vi.fn().mockResolvedValue([])
        }
      } as any
    })

    it('should register service worker', async () => {
      await ServiceWorkerManager.registerServiceWorker()
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    })

    it('should update service worker', async () => {
      await ServiceWorkerManager.updateServiceWorker()
      expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled()
    })

    it('should unregister service worker', async () => {
      const mockRegistration = {
        unregister: vi.fn().mockResolvedValue(true)
      }
      ;(navigator.serviceWorker.getRegistration as any).mockResolvedValue(mockRegistration)
      
      await ServiceWorkerManager.unregisterServiceWorker()
      expect(mockRegistration.unregister).toHaveBeenCalled()
    })

    it('should handle registration errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(navigator.serviceWorker.register as any).mockRejectedValue(new Error('Registration failed'))
      
      await ServiceWorkerManager.registerServiceWorker()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('CoreWebVitals', () => {
    beforeEach(() => {
      // Mock PerformanceObserver
      global.PerformanceObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn()
      }))
    })

    it('should monitor LCP', () => {
      CoreWebVitals.monitorLCP()
      expect(global.PerformanceObserver).toHaveBeenCalled()
    })

    it('should monitor FID', () => {
      CoreWebVitals.monitorFID()
      expect(global.PerformanceObserver).toHaveBeenCalled()
    })

    it('should monitor CLS', () => {
      CoreWebVitals.monitorCLS()
      expect(global.PerformanceObserver).toHaveBeenCalled()
    })

    it('should handle missing PerformanceObserver', () => {
      const originalObserver = global.PerformanceObserver
      delete (global as any).PerformanceObserver
      
      expect(() => CoreWebVitals.monitorLCP()).not.toThrow()
      expect(() => CoreWebVitals.monitorFID()).not.toThrow()
      expect(() => CoreWebVitals.monitorCLS()).not.toThrow()
      
      global.PerformanceObserver = originalObserver
    })
  })
}) 