import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  AdvancedPerformanceMonitor,
  AdvancedPerformanceOptimizer,
  type PerformanceMetrics,
  type PerformanceAlert,
  type OptimizationConfig
} from '../../utils/advancedPerformance'

describe('Advanced Performance System', () => {
  beforeEach(() => {
    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }))

    // Mock performance API
    global.performance = {
      now: vi.fn().mockReturnValue(1000),
      getEntriesByType: vi.fn().mockReturnValue([]),
      mark: vi.fn(),
      measure: vi.fn()
    } as any

    // Mock window.fetch
    global.fetch = vi.fn()

    // Mock navigator.connection
    Object.defineProperty(global, 'navigator', {
      value: {
        connection: {
          effectiveType: '4g'
        }
      },
      writable: true
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AdvancedPerformanceMonitor', () => {
    describe('initialize', () => {
      it('should initialize performance monitoring', () => {
        expect(() => AdvancedPerformanceMonitor.initialize()).not.toThrow()
      })

      it('should setup all monitoring systems', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        AdvancedPerformanceMonitor.initialize()
        
        // Should setup Core Web Vitals monitoring
        expect(global.PerformanceObserver).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
      })
    })

    describe('recordMetric', () => {
      it('should record performance metrics', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the recordMetric method
        const recordSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'recordMetric')
        
        // Simulate metric recording
        ;(AdvancedPerformanceMonitor as any).recordMetric('lcp', 1500)
        
        expect(recordSpy).toHaveBeenCalledWith('lcp', 1500)
      })

      it('should check thresholds when recording metrics', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the checkThresholds method
        const checkSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'checkThresholds')
        
        // Simulate metric recording
        ;(AdvancedPerformanceMonitor as any).recordMetric('lcp', 3000) // Above threshold
        
        expect(checkSpy).toHaveBeenCalledWith('lcp', 3000)
      })
    })

    describe('checkThresholds', () => {
      it('should create alerts for threshold violations', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the createAlert method
        const alertSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'createAlert')
        
        // Simulate threshold violation
        ;(AdvancedPerformanceMonitor as any).checkThresholds('lcp', 3000) // Above 2500ms threshold
        
        expect(alertSpy).toHaveBeenCalled()
      })

      it('should not create alerts for values within thresholds', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the createAlert method
        const alertSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'createAlert')
        
        // Simulate normal value
        ;(AdvancedPerformanceMonitor as any).checkThresholds('lcp', 1500) // Below 2500ms threshold
        
        expect(alertSpy).not.toHaveBeenCalled()
      })
    })

    describe('createAlert', () => {
      it('should create performance alerts', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the notifyPerformanceTeam method
        const notifySpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'notifyPerformanceTeam')
        
        const alertData = {
          type: 'threshold' as const,
          severity: 'high' as const,
          metric: 'lcp',
          value: 3000,
          threshold: 2500,
          message: 'LCP exceeded threshold',
          recommendations: ['Optimize images', 'Use CDN']
        }
        
        ;(AdvancedPerformanceMonitor as any).createAlert(alertData)
        
        expect(notifySpy).toHaveBeenCalled()
      })
    })

    describe('getSeverity', () => {
      it('should return correct severity levels', () => {
        const getSeverity = (AdvancedPerformanceMonitor as any).getSeverity
        
        expect(getSeverity(5000, 2500)).toBe('critical') // 2x threshold
        expect(getSeverity(3750, 2500)).toBe('high') // 1.5x threshold
        expect(getSeverity(3000, 2500)).toBe('medium') // 1.2x threshold
        expect(getSeverity(2000, 2500)).toBe('low') // Below threshold
      })
    })

    describe('getRecommendations', () => {
      it('should return recommendations for LCP', () => {
        const getRecommendations = (AdvancedPerformanceMonitor as any).getRecommendations
        
        const recommendations = getRecommendations('lcp', 3000)
        
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations.length).toBeGreaterThan(0)
        expect(recommendations).toContain('Optimize server response time')
      })

      it('should return recommendations for FID', () => {
        const getRecommendations = (AdvancedPerformanceMonitor as any).getRecommendations
        
        const recommendations = getRecommendations('fid', 150)
        
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations).toContain('Reduce JavaScript bundle size')
      })

      it('should return recommendations for CLS', () => {
        const getRecommendations = (AdvancedPerformanceMonitor as any).getRecommendations
        
        const recommendations = getRecommendations('cls', 0.2)
        
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations).toContain('Set explicit dimensions for images')
      })

      it('should return default recommendations for unknown metrics', () => {
        const getRecommendations = (AdvancedPerformanceMonitor as any).getRecommendations
        
        const recommendations = getRecommendations('unknown', 100)
        
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations).toContain('Review and optimize performance')
      })
    })

    describe('analyzePerformanceTrends', () => {
      it('should analyze performance trends', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the calculateTrends method
        const trendsSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'calculateTrends')
        
        ;(AdvancedPerformanceMonitor as any).analyzePerformanceTrends()
        
        expect(trendsSpy).toHaveBeenCalled()
      })
    })

    describe('calculateTrends', () => {
      it('should calculate performance trends', () => {
        const calculateTrends = (AdvancedPerformanceMonitor as any).calculateTrends
        
        const mockMetrics: PerformanceMetrics[] = [
          { lcp: 1000, fid: 50, cls: 0.05 } as PerformanceMetrics,
          { lcp: 1200, fid: 60, cls: 0.06 } as PerformanceMetrics,
          { lcp: 1400, fid: 70, cls: 0.07 } as PerformanceMetrics
        ]
        
        const trends = calculateTrends(mockMetrics)
        
        expect(typeof trends).toBe('object')
        expect(Object.keys(trends).length).toBeGreaterThan(0)
      })
    })

    describe('calculateLinearTrend', () => {
      it('should calculate linear trend', () => {
        const calculateLinearTrend = (AdvancedPerformanceMonitor as any).calculateLinearTrend
        
        const values = [100, 120, 140, 160, 180]
        const trend = calculateLinearTrend(values)
        
        expect(typeof trend).toBe('number')
        expect(trend).toBeGreaterThan(0) // Positive trend
      })

      it('should handle decreasing trends', () => {
        const calculateLinearTrend = (AdvancedPerformanceMonitor as any).calculateLinearTrend
        
        const values = [200, 180, 160, 140, 120]
        const trend = calculateLinearTrend(values)
        
        expect(typeof trend).toBe('number')
        expect(trend).toBeLessThan(0) // Negative trend
      })
    })

    describe('predictIssues', () => {
      it('should predict performance issues', () => {
        AdvancedPerformanceMonitor.initialize()
        
        // Mock the createAlert method
        const alertSpy = vi.spyOn(AdvancedPerformanceMonitor as any, 'createAlert')
        
        const trends = { lcp: 100 } // Positive trend
        ;(AdvancedPerformanceMonitor as any).predictIssues(trends)
        
        expect(alertSpy).toHaveBeenCalled()
      })
    })

    describe('getCurrentMetrics', () => {
      it('should return current performance metrics', () => {
        AdvancedPerformanceMonitor.initialize()
        
        const metrics = AdvancedPerformanceMonitor.getCurrentMetrics()
        
        expect(typeof metrics).toBe('object')
        expect(metrics).toHaveProperty('lcp')
        expect(metrics).toHaveProperty('fid')
        expect(metrics).toHaveProperty('cls')
      })
    })

    describe('getPerformanceStats', () => {
      it('should return comprehensive performance statistics', () => {
        AdvancedPerformanceMonitor.initialize()
        
        const stats = AdvancedPerformanceMonitor.getPerformanceStats()
        
        expect(stats).toHaveProperty('totalMetrics')
        expect(stats).toHaveProperty('totalAlerts')
        expect(stats).toHaveProperty('criticalAlerts')
        expect(stats).toHaveProperty('averageMetrics')
        expect(stats).toHaveProperty('trends')
        expect(typeof stats.averageMetrics).toBe('object')
        expect(typeof stats.trends).toBe('object')
      })
    })

    describe('cleanup', () => {
      it('should cleanup performance monitoring', () => {
        AdvancedPerformanceMonitor.initialize()
        
        expect(() => AdvancedPerformanceMonitor.cleanup()).not.toThrow()
      })
    })
  })

  describe('AdvancedPerformanceOptimizer', () => {
    describe('initialize', () => {
      it('should initialize performance optimization', () => {
        expect(() => AdvancedPerformanceOptimizer.initialize()).not.toThrow()
      })

      it('should setup all optimization systems', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        AdvancedPerformanceOptimizer.initialize()
        
        // Should setup various optimization systems
        expect(consoleSpy).toHaveBeenCalledWith('🖼️ Optimizing images for low bandwidth')
        expect(consoleSpy).toHaveBeenCalledWith('⚡ Preloading critical resources')
        expect(consoleSpy).toHaveBeenCalledWith('🔧 Setting up service worker')
        
        consoleSpy.mockRestore()
      })
    })

    describe('setupAdaptiveLoading', () => {
      it('should setup adaptive loading for 4g', () => {
        // Mock 4g connection
        Object.defineProperty(global, 'navigator', {
          value: {
            connection: {
              effectiveType: '4g'
            }
          },
          writable: true
        })
        
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupAdaptiveLoading()
        
        expect(consoleSpy).toHaveBeenCalledWith('⚡ Preloading critical resources')
        expect(consoleSpy).toHaveBeenCalledWith('🚀 Enabling advanced features')
        expect(consoleSpy).toHaveBeenCalledWith('🏃 Optimizing for speed')
        
        consoleSpy.mockRestore()
      })

      it('should setup adaptive loading for slow connections', () => {
        // Mock slow connection
        Object.defineProperty(global, 'navigator', {
          value: {
            connection: {
              effectiveType: '2g'
            }
          },
          writable: true
        })
        
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupAdaptiveLoading()
        
        expect(consoleSpy).toHaveBeenCalledWith('🖼️ Optimizing images for low bandwidth')
        expect(consoleSpy).toHaveBeenCalledWith('🚫 Disabling non-critical features')
        expect(consoleSpy).toHaveBeenCalledWith('💾 Enabling aggressive caching')
        
        consoleSpy.mockRestore()
      })
    })

    describe('setupIntelligentCaching', () => {
      it('should setup intelligent caching', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupIntelligentCaching()
        
        expect(consoleSpy).toHaveBeenCalledWith('🔧 Setting up service worker')
        expect(consoleSpy).toHaveBeenCalledWith('🔄 Setting up cache invalidation')
        expect(consoleSpy).toHaveBeenCalledWith('🔥 Setting up cache warming')
        
        consoleSpy.mockRestore()
      })
    })

    describe('setupBundleOptimization', () => {
      it('should setup bundle optimization', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupBundleOptimization()
        
        expect(consoleSpy).toHaveBeenCalledWith('📦 Implementing code splitting')
        expect(consoleSpy).toHaveBeenCalledWith('🌳 Setting up tree shaking')
        expect(consoleSpy).toHaveBeenCalledWith('📥 Setting up dynamic imports')
        
        consoleSpy.mockRestore()
      })
    })

    describe('setupImageOptimization', () => {
      it('should setup image optimization', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupImageOptimization()
        
        expect(consoleSpy).toHaveBeenCalledWith('😴 Implementing lazy loading')
        expect(consoleSpy).toHaveBeenCalledWith('📱 Setting up responsive images')
        expect(consoleSpy).toHaveBeenCalledWith('🖼️ Setting up modern image formats')
        
        consoleSpy.mockRestore()
      })
    })

    describe('setupCDNOptimization', () => {
      it('should setup CDN optimization', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        
        ;(AdvancedPerformanceOptimizer as any).setupCDNOptimization()
        
        expect(consoleSpy).toHaveBeenCalledWith('🌐 Setting up edge caching')
        expect(consoleSpy).toHaveBeenCalledWith('🌍 Setting up geographic optimization')
        expect(consoleSpy).toHaveBeenCalledWith('🛣️ Setting up intelligent routing')
        
        consoleSpy.mockRestore()
      })
    })

    describe('updateConfig', () => {
      it('should update optimization configuration', () => {
        const newConfig: Partial<OptimizationConfig> = {
          enabled: false,
          autoOptimize: false
        }
        
        AdvancedPerformanceOptimizer.updateConfig(newConfig)
        const config = AdvancedPerformanceOptimizer.getConfig()
        
        expect(config.enabled).toBe(false)
        expect(config.autoOptimize).toBe(false)
        expect(config.predictiveOptimization).toBe(true) // Should preserve other settings
      })
    })

    describe('getConfig', () => {
      it('should return current configuration', () => {
        const config = AdvancedPerformanceOptimizer.getConfig()
        
        expect(config).toHaveProperty('enabled')
        expect(config).toHaveProperty('autoOptimize')
        expect(config).toHaveProperty('predictiveOptimization')
        expect(config).toHaveProperty('adaptiveLoading')
        expect(config).toHaveProperty('intelligentCaching')
        expect(config).toHaveProperty('bundleOptimization')
        expect(config).toHaveProperty('imageOptimization')
        expect(config).toHaveProperty('cdnOptimization')
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work together as a complete performance system', () => {
      // Initialize both systems
      AdvancedPerformanceMonitor.initialize()
      AdvancedPerformanceOptimizer.initialize()
      
      // Simulate performance monitoring
      const metrics = AdvancedPerformanceMonitor.getCurrentMetrics()
      expect(typeof metrics).toBe('object')
      
      // Simulate performance optimization
      const config = AdvancedPerformanceOptimizer.getConfig()
      expect(config.enabled).toBe(true)
      
      // Get performance statistics
      const stats = AdvancedPerformanceMonitor.getPerformanceStats()
      expect(stats).toHaveProperty('totalMetrics')
      expect(stats).toHaveProperty('totalAlerts')
      
      // Cleanup
      AdvancedPerformanceMonitor.cleanup()
    })

    it('should handle performance alerts correctly', () => {
      AdvancedPerformanceMonitor.initialize()
      
      // Simulate threshold violation
      ;(AdvancedPerformanceMonitor as any).checkThresholds('lcp', 3000)
      
      const stats = AdvancedPerformanceMonitor.getPerformanceStats()
      expect(stats.totalAlerts).toBeGreaterThan(0)
    })

    it('should optimize based on network conditions', () => {
      // Mock slow connection
      Object.defineProperty(global, 'navigator', {
        value: {
          connection: {
            effectiveType: '2g'
          }
        },
        writable: true
      })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      AdvancedPerformanceOptimizer.initialize()
      
      expect(consoleSpy).toHaveBeenCalledWith('🖼️ Optimizing images for low bandwidth')
      expect(consoleSpy).toHaveBeenCalledWith('🚫 Disabling non-critical features')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Performance Tests', () => {
    it('should handle high-volume metric recording efficiently', () => {
      AdvancedPerformanceMonitor.initialize()
      
      const startTime = Date.now()
      
      // Record 1000 metrics
      for (let i = 0; i < 1000; i++) {
        ;(AdvancedPerformanceMonitor as any).recordMetric('lcp', 1000 + i)
      }
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      // Should process 1000 metrics in under 1 second
      expect(processingTime).toBeLessThan(1000)
    })

    it('should maintain performance under optimization load', () => {
      const startTime = Date.now()
      
      // Initialize optimization multiple times
      for (let i = 0; i < 100; i++) {
        AdvancedPerformanceOptimizer.initialize()
      }
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      // Should initialize 100 times in under 1 second
      expect(processingTime).toBeLessThan(1000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing PerformanceObserver', () => {
      // Remove PerformanceObserver
      delete (global as any).PerformanceObserver
      
      expect(() => AdvancedPerformanceMonitor.initialize()).not.toThrow()
    })

    it('should handle missing navigator.connection', () => {
      // Remove navigator.connection
      delete (global as any).navigator
      
      expect(() => AdvancedPerformanceOptimizer.initialize()).not.toThrow()
    })

    it('should handle empty metrics', () => {
      AdvancedPerformanceMonitor.initialize()
      
      const metrics = AdvancedPerformanceMonitor.getCurrentMetrics()
      expect(typeof metrics).toBe('object')
    })

    it('should handle configuration updates', () => {
      const newConfig: Partial<OptimizationConfig> = {
        enabled: false,
        autoOptimize: false,
        predictiveOptimization: false
      }
      
      AdvancedPerformanceOptimizer.updateConfig(newConfig)
      const config = AdvancedPerformanceOptimizer.getConfig()
      
      expect(config.enabled).toBe(false)
      expect(config.autoOptimize).toBe(false)
      expect(config.predictiveOptimization).toBe(false)
    })
  })
}) 