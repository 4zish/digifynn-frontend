/**
 * Advanced Performance Monitoring and Optimization System
 * Real-time metrics, predictive analytics, and automated optimization
 */

import { PerformanceObserver, PerformanceEntry } from 'perf_hooks'

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
  
  // Advanced Metrics
  tti: number // Time to Interactive
  tbt: number // Total Blocking Time
  si: number // Speed Index
  lh: number // Lighthouse Score
  
  // Custom Metrics
  apiResponseTime: number
  imageLoadTime: number
  bundleSize: number
  memoryUsage: number
  cpuUsage: number
  networkLatency: number
  cacheHitRate: number
  errorRate: number
}

export interface PerformanceAlert {
  id: string
  timestamp: number
  type: 'threshold' | 'anomaly' | 'degradation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
  recommendations: string[]
}

export interface OptimizationConfig {
  enabled: boolean
  autoOptimize: boolean
  predictiveOptimization: boolean
  adaptiveLoading: boolean
  intelligentCaching: boolean
  bundleOptimization: boolean
  imageOptimization: boolean
  cdnOptimization: boolean
}

/**
 * Advanced Performance Monitor with Real-time Analytics
 */
export class AdvancedPerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static alerts: PerformanceAlert[] = []
  private static observers: Map<string, PerformanceObserver> = new Map()
  private static thresholds = {
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    ttfb: 800, // 800ms
    fcp: 1800, // 1.8 seconds
    tti: 3800, // 3.8 seconds
    tbt: 300, // 300ms
    apiResponseTime: 1000, // 1 second
    errorRate: 0.05 // 5%
  }

  /**
   * Initialize performance monitoring
   */
  static initialize(): void {
    this.setupCoreWebVitalsMonitoring()
    this.setupCustomMetricsMonitoring()
    this.setupRealTimeAnalytics()
    this.setupPredictiveAnalytics()
  }

  /**
   * Monitor Core Web Vitals
   */
  private static setupCoreWebVitalsMonitoring(): void {
    // LCP Monitoring
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.recordMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID Monitoring
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS Monitoring
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric('cls', clsValue)
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Store observers for cleanup
      this.observers.set('lcp', lcpObserver)
      this.observers.set('fid', fidObserver)
      this.observers.set('cls', clsObserver)
    }
  }

  /**
   * Monitor custom performance metrics
   */
  private static setupCustomMetricsMonitoring(): void {
    // API Response Time
    this.monitorApiPerformance()
    
    // Image Load Performance
    this.monitorImagePerformance()
    
    // Bundle Size Monitoring
    this.monitorBundlePerformance()
    
    // Memory Usage
    this.monitorMemoryUsage()
    
    // Error Rate Monitoring
    this.monitorErrorRate()
  }

  /**
   * Monitor API performance
   */
  private static monitorApiPerformance(): void {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        this.recordMetric('apiResponseTime', endTime - startTime)
        return response
      } catch (error) {
        const endTime = performance.now()
        this.recordMetric('apiResponseTime', endTime - startTime)
        throw error
      }
    }
  }

  /**
   * Monitor image loading performance
   */
  private static monitorImagePerformance(): void {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      const startTime = performance.now()
      img.addEventListener('load', () => {
        const endTime = performance.now()
        this.recordMetric('imageLoadTime', endTime - startTime)
      })
    })
  }

  /**
   * Monitor bundle performance
   */
  private static monitorBundlePerformance(): void {
    // Monitor script loading
    const scripts = document.querySelectorAll('script')
    scripts.forEach(script => {
      const startTime = performance.now()
      script.addEventListener('load', () => {
        const endTime = performance.now()
        this.recordMetric('bundleSize', endTime - startTime)
      })
    })
  }

  /**
   * Monitor memory usage
   */
  private static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric('memoryUsage', memory.usedJSHeapSize / 1024 / 1024) // MB
      }, 5000) // Every 5 seconds
    }
  }

  /**
   * Monitor error rate
   */
  private static monitorErrorRate(): void {
    let errorCount = 0
    let totalRequests = 0

    window.addEventListener('error', () => {
      errorCount++
      totalRequests++
      this.recordMetric('errorRate', errorCount / totalRequests)
    })

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', () => {
      errorCount++
      totalRequests++
      this.recordMetric('errorRate', errorCount / totalRequests)
    })
  }

  /**
   * Setup real-time analytics
   */
  private static setupRealTimeAnalytics(): void {
    // Send metrics to analytics service every 10 seconds
    setInterval(() => {
      const currentMetrics = this.getCurrentMetrics()
      this.sendToAnalytics(currentMetrics)
    }, 10000)
  }

  /**
   * Setup predictive analytics
   */
  private static setupPredictiveAnalytics(): void {
    // Analyze performance trends and predict issues
    setInterval(() => {
      this.analyzePerformanceTrends()
    }, 30000) // Every 30 seconds
  }

  /**
   * Record performance metric
   */
  private static recordMetric(name: keyof PerformanceMetrics, value: number): void {
    const metric: Partial<PerformanceMetrics> = {}
    metric[name] = value

    this.metrics.push(metric as PerformanceMetrics)

    // Check thresholds and create alerts
    this.checkThresholds(name, value)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Check performance thresholds
   */
  private static checkThresholds(metricName: string, value: number): void {
    const threshold = this.thresholds[metricName as keyof typeof this.thresholds]
    if (threshold && value > threshold) {
      this.createAlert({
        type: 'threshold',
        severity: this.getSeverity(value, threshold),
        metric: metricName,
        value,
        threshold,
        message: `${metricName} exceeded threshold: ${value} > ${threshold}`,
        recommendations: this.getRecommendations(metricName, value)
      })
    }
  }

  /**
   * Create performance alert
   */
  private static createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: PerformanceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      ...alertData
    }

    this.alerts.push(alert)
    this.notifyPerformanceTeam(alert)
  }

  /**
   * Get severity level based on threshold violation
   */
  private static getSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold
    if (ratio > 2) return 'critical'
    if (ratio > 1.5) return 'high'
    if (ratio > 1.2) return 'medium'
    return 'low'
  }

  /**
   * Get optimization recommendations
   */
  private static getRecommendations(metric: string, value: number): string[] {
    const recommendations: Record<string, string[]> = {
      lcp: [
        'Optimize server response time',
        'Use CDN for static assets',
        'Implement lazy loading for images',
        'Optimize critical rendering path'
      ],
      fid: [
        'Reduce JavaScript bundle size',
        'Split code into smaller chunks',
        'Use web workers for heavy computations',
        'Optimize event handlers'
      ],
      cls: [
        'Set explicit dimensions for images',
        'Avoid inserting content above existing content',
        'Use transform animations instead of layout changes',
        'Preload critical resources'
      ],
      apiResponseTime: [
        'Optimize database queries',
        'Implement caching strategies',
        'Use connection pooling',
        'Consider microservices architecture'
      ],
      errorRate: [
        'Implement proper error handling',
        'Add retry mechanisms',
        'Use circuit breakers',
        'Monitor and fix root causes'
      ]
    }

    return recommendations[metric] || ['Review and optimize performance']
  }

  /**
   * Analyze performance trends
   */
  private static analyzePerformanceTrends(): void {
    const recentMetrics = this.metrics.slice(-100) // Last 100 metrics
    
    // Calculate trends for each metric
    const trends = this.calculateTrends(recentMetrics)
    
    // Predict potential issues
    this.predictIssues(trends)
  }

  /**
   * Calculate performance trends
   */
  private static calculateTrends(metrics: PerformanceMetrics[]): Record<string, number> {
    const trends: Record<string, number> = {}
    
    // Calculate trend for each metric
    Object.keys(this.thresholds).forEach(metric => {
      const values = metrics.map(m => m[metric as keyof PerformanceMetrics]).filter(v => v !== undefined)
      if (values.length > 1) {
        const trend = this.calculateLinearTrend(values)
        trends[metric] = trend
      }
    })
    
    return trends
  }

  /**
   * Calculate linear trend
   */
  private static calculateLinearTrend(values: number[]): number {
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }

  /**
   * Predict potential performance issues
   */
  private static predictIssues(trends: Record<string, number>): void {
    Object.entries(trends).forEach(([metric, trend]) => {
      const threshold = this.thresholds[metric as keyof typeof this.thresholds]
      if (threshold && trend > 0) {
        // Positive trend indicates degradation
        const currentValue = this.getCurrentMetricValue(metric)
        const predictedValue = currentValue + (trend * 10) // Predict 10 intervals ahead
        
        if (predictedValue > threshold) {
          this.createAlert({
            type: 'anomaly',
            severity: 'medium',
            metric,
            value: predictedValue,
            threshold,
            message: `Predicted ${metric} degradation: ${predictedValue.toFixed(2)}`,
            recommendations: this.getRecommendations(metric, predictedValue)
          })
        }
      }
    })
  }

  /**
   * Get current metric value
   */
  private static getCurrentMetricValue(metric: string): number {
    const recentMetrics = this.metrics.slice(-10) // Last 10 metrics
    const values = recentMetrics.map(m => m[metric as keyof PerformanceMetrics]).filter(v => v !== undefined)
    return values.length > 0 ? values[values.length - 1] : 0
  }

  /**
   * Get current performance metrics
   */
  static getCurrentMetrics(): PerformanceMetrics {
    const recentMetrics = this.metrics.slice(-10) // Average of last 10 metrics
    const currentMetrics: Partial<PerformanceMetrics> = {}
    
    Object.keys(this.thresholds).forEach(metric => {
      const values = recentMetrics.map(m => m[metric as keyof PerformanceMetrics]).filter(v => v !== undefined)
      if (values.length > 0) {
        currentMetrics[metric as keyof PerformanceMetrics] = values.reduce((a, b) => a + b, 0) / values.length
      }
    })
    
    return currentMetrics as PerformanceMetrics
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalMetrics: number
    totalAlerts: number
    criticalAlerts: number
    averageMetrics: PerformanceMetrics
    trends: Record<string, number>
  } {
    const criticalAlerts = this.alerts.filter(alert => alert.severity === 'critical')
    const recentMetrics = this.metrics.slice(-100)
    
    // Calculate average metrics
    const averageMetrics: Partial<PerformanceMetrics> = {}
    Object.keys(this.thresholds).forEach(metric => {
      const values = recentMetrics.map(m => m[metric as keyof PerformanceMetrics]).filter(v => v !== undefined)
      if (values.length > 0) {
        averageMetrics[metric as keyof PerformanceMetrics] = values.reduce((a, b) => a + b, 0) / values.length
      }
    })
    
    // Calculate trends
    const trends = this.calculateTrends(recentMetrics)
    
    return {
      totalMetrics: this.metrics.length,
      totalAlerts: this.alerts.length,
      criticalAlerts: criticalAlerts.length,
      averageMetrics: averageMetrics as PerformanceMetrics,
      trends
    }
  }

  /**
   * Send metrics to analytics service
   */
  private static sendToAnalytics(metrics: PerformanceMetrics): void {
    // In a real implementation, this would send to:
    // - Google Analytics
    // - Custom analytics service
    // - Performance monitoring service
    // - APM (Application Performance Monitoring)
    
    console.log('📊 Performance Metrics:', metrics)
  }

  /**
   * Notify performance team
   */
  private static notifyPerformanceTeam(alert: PerformanceAlert): void {
    // In a real implementation, this would send notifications via:
    // - Email
    // - Slack/Discord
    // - PagerDuty
    // - Performance monitoring dashboard
    
    console.warn('⚠️ Performance Alert:', {
      id: alert.id,
      severity: alert.severity,
      metric: alert.metric,
      value: alert.value,
      message: alert.message,
      timestamp: new Date(alert.timestamp).toISOString()
    })
  }

  /**
   * Cleanup performance monitoring
   */
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

/**
 * Advanced Performance Optimizer
 */
export class AdvancedPerformanceOptimizer {
  private static config: OptimizationConfig = {
    enabled: true,
    autoOptimize: true,
    predictiveOptimization: true,
    adaptiveLoading: true,
    intelligentCaching: true,
    bundleOptimization: true,
    imageOptimization: true,
    cdnOptimization: true
  }

  /**
   * Initialize performance optimization
   */
  static initialize(): void {
    if (this.config.enabled) {
      this.setupAdaptiveLoading()
      this.setupIntelligentCaching()
      this.setupBundleOptimization()
      this.setupImageOptimization()
      this.setupCDNOptimization()
    }
  }

  /**
   * Setup adaptive loading based on network conditions
   */
  private static setupAdaptiveLoading(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableLowBandwidthMode()
      } else if (connection.effectiveType === '4g') {
        this.enableHighBandwidthMode()
      }
    }
  }

  /**
   * Enable low bandwidth optimizations
   */
  private static enableLowBandwidthMode(): void {
    // Reduce image quality
    this.optimizeImagesForLowBandwidth()
    
    // Disable non-critical features
    this.disableNonCriticalFeatures()
    
    // Enable aggressive caching
    this.enableAggressiveCaching()
  }

  /**
   * Enable high bandwidth optimizations
   */
  private static enableHighBandwidthMode(): void {
    // Preload critical resources
    this.preloadCriticalResources()
    
    // Enable advanced features
    this.enableAdvancedFeatures()
    
    // Optimize for speed
    this.optimizeForSpeed()
  }

  /**
   * Setup intelligent caching strategy
   */
  private static setupIntelligentCaching(): void {
    // Implement service worker for caching
    this.setupServiceWorker()
    
    // Setup intelligent cache invalidation
    this.setupCacheInvalidation()
    
    // Implement cache warming
    this.setupCacheWarming()
  }

  /**
   * Setup bundle optimization
   */
  private static setupBundleOptimization(): void {
    // Implement code splitting
    this.implementCodeSplitting()
    
    // Setup tree shaking
    this.setupTreeShaking()
    
    // Implement dynamic imports
    this.setupDynamicImports()
  }

  /**
   * Setup image optimization
   */
  private static setupImageOptimization(): void {
    // Implement lazy loading
    this.implementLazyLoading()
    
    // Setup responsive images
    this.setupResponsiveImages()
    
    // Implement WebP/AVIF support
    this.setupModernImageFormats()
  }

  /**
   * Setup CDN optimization
   */
  private static setupCDNOptimization(): void {
    // Implement edge caching
    this.setupEdgeCaching()
    
    // Setup geographic optimization
    this.setupGeographicOptimization()
    
    // Implement intelligent routing
    this.setupIntelligentRouting()
  }

  // Mock implementation methods
  private static optimizeImagesForLowBandwidth(): void {
    console.log('🖼️ Optimizing images for low bandwidth')
  }

  private static disableNonCriticalFeatures(): void {
    console.log('🚫 Disabling non-critical features')
  }

  private static enableAggressiveCaching(): void {
    console.log('💾 Enabling aggressive caching')
  }

  private static preloadCriticalResources(): void {
    console.log('⚡ Preloading critical resources')
  }

  private static enableAdvancedFeatures(): void {
    console.log('🚀 Enabling advanced features')
  }

  private static optimizeForSpeed(): void {
    console.log('🏃 Optimizing for speed')
  }

  private static setupServiceWorker(): void {
    console.log('🔧 Setting up service worker')
  }

  private static setupCacheInvalidation(): void {
    console.log('🔄 Setting up cache invalidation')
  }

  private static setupCacheWarming(): void {
    console.log('🔥 Setting up cache warming')
  }

  private static implementCodeSplitting(): void {
    console.log('📦 Implementing code splitting')
  }

  private static setupTreeShaking(): void {
    console.log('🌳 Setting up tree shaking')
  }

  private static setupDynamicImports(): void {
    console.log('📥 Setting up dynamic imports')
  }

  private static implementLazyLoading(): void {
    console.log('😴 Implementing lazy loading')
  }

  private static setupResponsiveImages(): void {
    console.log('📱 Setting up responsive images')
  }

  private static setupModernImageFormats(): void {
    console.log('🖼️ Setting up modern image formats')
  }

  private static setupEdgeCaching(): void {
    console.log('🌐 Setting up edge caching')
  }

  private static setupGeographicOptimization(): void {
    console.log('🌍 Setting up geographic optimization')
  }

  private static setupIntelligentRouting(): void {
    console.log('🛣️ Setting up intelligent routing')
  }

  /**
   * Update optimization configuration
   */
  static updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  static getConfig(): OptimizationConfig {
    return { ...this.config }
  }
}

// Export performance utilities
export {
  AdvancedPerformanceMonitor,
  AdvancedPerformanceOptimizer
} 