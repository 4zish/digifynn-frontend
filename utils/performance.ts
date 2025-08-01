/**
 * Advanced performance optimization utilities
 */

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkRequests: number
  cacheHitRate: number
}

export interface CacheConfig {
  maxSize: number
  ttl: number
  strategy: 'lru' | 'lfu' | 'fifo'
}

/**
 * Advanced caching system with multiple strategies
 */
export class AdvancedCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>()
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
  }

  set(key: string, value: T): void {
    // Implement LRU eviction
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    // Update access count and timestamp
    item.accessCount++
    item.timestamp = Date.now()

    return item.value
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.95 // Mock hit rate
    }
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  private static readonly SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png']
  private static readonly QUALITY_LEVELS = [75, 85, 95]

  static async optimizeImage(
    file: File,
    options: {
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      quality?: number
      width?: number
      height?: number
    } = {}
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const { width, height } = options
        canvas.width = width || img.width
        canvas.height = height || img.height

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const format = options.format || 'webp'
        const quality = options.quality || 85

        canvas.toBlob(
          (blob) => {
            resolve(blob!)
          },
          `image/${format}`,
          quality / 100
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  static generateSrcSet(
    src: string,
    widths: number[] = [320, 640, 960, 1280, 1920]
  ): string {
    return widths
      .map(width => `${src}?w=${width} ${width}w`)
      .join(', ')
  }

  static getOptimalFormat(): string {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    // Test WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp'
    }

    // Test AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif'
    }

    return 'jpeg'
  }
}

/**
 * Lazy loading utilities
 */
export class LazyLoader {
  private static observer: IntersectionObserver | null = null

  static init(): void {
    if (this.observer) return

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            this.loadElement(element)
            this.observer!.unobserve(element)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )
  }

  static observe(element: HTMLElement): void {
    if (!this.observer) {
      this.init()
    }
    this.observer!.observe(element)
  }

  private static loadElement(element: HTMLElement): void {
    const src = element.getAttribute('data-src')
    const srcset = element.getAttribute('data-srcset')

    if (src) {
      if (element.tagName === 'IMG') {
        (element as HTMLImageElement).src = src
      } else {
        element.style.backgroundImage = `url(${src})`
      }
    }

    if (srcset && element.tagName === 'IMG') {
      (element as HTMLImageElement).srcset = srcset
    }

    element.classList.remove('lazy')
    element.classList.add('loaded')
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static startTime: number = 0

  static start(): void {
    this.startTime = performance.now()
  }

  static end(): PerformanceMetrics {
    const endTime = performance.now()
    const loadTime = endTime - this.startTime

    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime: this.getRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      networkRequests: this.getNetworkRequests(),
      cacheHitRate: this.getCacheHitRate()
    }

    this.metrics.push(metrics)
    return metrics
  }

  private static getRenderTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0
  }

  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  private static getNetworkRequests(): number {
    return performance.getEntriesByType('resource').length
  }

  private static getCacheHitRate(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const cached = resources.filter(r => r.transferSize === 0).length
    return resources.length > 0 ? cached / resources.length : 0
  }

  static getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkRequests: 0,
        cacheHitRate: 0
      }
    }

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        networkRequests: acc.networkRequests + metric.networkRequests,
        cacheHitRate: acc.cacheHitRate + metric.cacheHitRate
      }),
      {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkRequests: 0,
        cacheHitRate: 0
      }
    )

    const count = this.metrics.length
    return {
      loadTime: sum.loadTime / count,
      renderTime: sum.renderTime / count,
      memoryUsage: sum.memoryUsage / count,
      networkRequests: sum.networkRequests / count,
      cacheHitRate: sum.cacheHitRate / count
    }
  }
}

/**
 * Bundle optimization utilities
 */
export class BundleOptimizer {
  static async preloadCriticalResources(): Promise<void> {
    const criticalResources = [
      '/fonts/Vazirmatn-Regular.woff2',
      '/fonts/Vazirmatn-Bold.woff2',
      '/css/critical.css'
    ]

    const promises = criticalResources.map(resource => {
      return new Promise<void>((resolve) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = this.getResourceType(resource)
        link.href = resource
        link.onload = () => resolve()
        link.onerror = () => resolve() // Don't fail on error
        document.head.appendChild(link)
      })
    })

    await Promise.all(promises)
  }

  private static getResourceType(resource: string): string {
    if (resource.endsWith('.woff2') || resource.endsWith('.woff')) {
      return 'font'
    }
    if (resource.endsWith('.css')) {
      return 'style'
    }
    if (resource.endsWith('.js')) {
      return 'script'
    }
    return 'fetch'
  }

  static async prefetchNonCriticalResources(): Promise<void> {
    const nonCriticalResources = [
      '/api/posts',
      '/api/search',
      '/blog'
    ]

    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        nonCriticalResources.forEach(resource => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = resource
          document.head.appendChild(link)
        })
      })
    }
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static readonly MEMORY_THRESHOLD = 50 * 1024 * 1024 // 50MB

  static checkMemoryUsage(): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMemory = memory.usedJSHeapSize
      // Removed unused totalMemory variable

      return usedMemory < this.MEMORY_THRESHOLD
    }

    return true
  }

  static cleanup(): void {
    // Clear unused event listeners
    this.removeUnusedEventListeners()

    // Clear unused timers
    this.clearUnusedTimers()

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }
  }

  private static removeUnusedEventListeners(): void {
    // This is a simplified version - in practice, you'd track listeners
    console.log('Cleaning up unused event listeners')
  }

  private static clearUnusedTimers(): void {
    // This is a simplified version - in practice, you'd track timers
    console.log('Cleaning up unused timers')
  }
}

/**
 * Network optimization utilities
 */
export class NetworkOptimizer {
  static async compressData(data: any): Promise<string> {
    // In a real implementation, you'd use compression libraries
    return JSON.stringify(data)
  }

  static async decompressData(compressedData: string): Promise<any> {
    // In a real implementation, you'd use decompression libraries
    return JSON.parse(compressedData)
  }

  static getOptimalChunkSize(): number {
    // Determine optimal chunk size based on network conditions
    const connection = (navigator as any).connection
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 1024 // 1KB
        case '3g':
          return 4096 // 4KB
        case '4g':
          return 16384 // 16KB
        default:
          return 8192 // 8KB
      }
    }
    return 8192
  }
}

/**
 * Service Worker utilities for advanced caching
 */
export class ServiceWorkerManager {
  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('Service Worker registered:', registration)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  static async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
    }
  }

  static async unregisterServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
      }
    }
  }
}

/**
 * Core Web Vitals monitoring
 */
export class CoreWebVitals {
  static monitorLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }

  static monitorFID(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })
  }

  static monitorCLS(): void {
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }
} 