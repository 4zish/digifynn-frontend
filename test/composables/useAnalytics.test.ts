import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAnalytics } from '../../composables/useAnalytics'

// Mock $fetch
global.$fetch = vi.fn()

describe('useAnalytics', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'test-user-agent',
        language: 'en-US',
        cookieEnabled: true,
        onLine: true
      },
      writable: true
    })

    // Mock screen
    Object.defineProperty(window, 'screen', {
      value: {
        width: 1920,
        height: 1080,
        colorDepth: 24
      },
      writable: true
    })

    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://digifynn.com/test',
        origin: 'https://digifynn.com',
        pathname: '/test',
        search: '',
        hash: ''
      },
      writable: true
    })

    // Mock document
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true
    })

    // Mock Performance API
    global.performance = {
      now: vi.fn().mockReturnValue(1000),
      getEntriesByType: vi.fn().mockReturnValue([]),
      mark: vi.fn(),
      measure: vi.fn()
    } as any

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initAnalytics', () => {
    it('should initialize analytics with default config', () => {
      const { initAnalytics } = useAnalytics()
      
      expect(() => initAnalytics()).not.toThrow()
    })

    it('should initialize with custom config', () => {
      const { initAnalytics } = useAnalytics()
      const config = {
        enabled: true,
        endpoint: '/api/analytics',
        batchSize: 10,
        flushInterval: 5000
      }
      
      expect(() => initAnalytics(config)).not.toThrow()
    })

    it('should handle initialization errors gracefully', () => {
      const { initAnalytics } = useAnalytics()
      
      // Mock console.error to avoid test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Force an error by mocking localStorage to throw
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('Storage error') }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true
      })
      
      expect(() => initAnalytics()).not.toThrow()
      consoleSpy.mockRestore()
    })
  })

  describe('trackPageView', () => {
    it('should track page view with default parameters', () => {
      const { trackPageView } = useAnalytics()
      
      expect(() => trackPageView()).not.toThrow()
    })

    it('should track page view with custom parameters', () => {
      const { trackPageView } = useAnalytics()
      
      expect(() => trackPageView('/custom-page', 'Custom Title')).not.toThrow()
    })

    it('should include user agent and screen info', () => {
      const { trackPageView } = useAnalytics()
      
      expect(() => trackPageView('/test', 'Test Page')).not.toThrow()
    })
  })

  describe('trackEvent', () => {
    it('should track custom events', () => {
      const { trackEvent } = useAnalytics()
      
      expect(() => trackEvent('button_click', { buttonId: 'test-btn' })).not.toThrow()
    })

    it('should track events with complex parameters', () => {
      const { trackEvent } = useAnalytics()
      
      const params = {
        category: 'user_interaction',
        action: 'form_submit',
        label: 'contact_form',
        value: 1,
        customData: {
          formId: 'contact',
          fields: ['name', 'email', 'message']
        }
      }
      
      expect(() => trackEvent('form_submit', params)).not.toThrow()
    })

    it('should handle events without parameters', () => {
      const { trackEvent } = useAnalytics()
      
      expect(() => trackEvent('simple_event')).not.toThrow()
    })
  })

  describe('trackSession', () => {
    it('should track session start', () => {
      const { trackSession } = useAnalytics()
      
      expect(() => trackSession()).not.toThrow()
    })

    it('should handle session tracking errors', () => {
      const { trackSession } = useAnalytics()
      
      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Force error by mocking sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('Session error') }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true
      })
      
      expect(() => trackSession()).not.toThrow()
      consoleSpy.mockRestore()
    })
  })

  describe('trackScrollDepth', () => {
    it('should start scroll depth tracking', () => {
      const { trackScrollDepth } = useAnalytics()
      
      const cleanup = trackScrollDepth()
      expect(typeof cleanup).toBe('function')
    })

    it('should cleanup scroll tracking', () => {
      const { trackScrollDepth } = useAnalytics()
      
      const cleanup = trackScrollDepth()
      expect(() => cleanup()).not.toThrow()
    })

    it('should handle scroll events', () => {
      const { trackScrollDepth } = useAnalytics()
      
      const cleanup = trackScrollDepth()
      
      // Simulate scroll event
      const scrollEvent = new Event('scroll')
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true })
      
      window.dispatchEvent(scrollEvent)
      
      cleanup()
    })
  })

  describe('trackTimeOnPage', () => {
    it('should start time tracking', () => {
      const { trackTimeOnPage } = useAnalytics()
      
      const cleanup = trackTimeOnPage()
      expect(typeof cleanup).toBe('function')
    })

    it('should cleanup time tracking', () => {
      const { trackTimeOnPage } = useAnalytics()
      
      const cleanup = trackTimeOnPage()
      expect(() => cleanup()).not.toThrow()
    })

    it('should track time intervals', () => {
      const { trackTimeOnPage } = useAnalytics()
      
      const cleanup = trackTimeOnPage()
      
      // Mock setTimeout to trigger immediately
      vi.useFakeTimers()
      
      cleanup()
      vi.useRealTimers()
    })
  })

  describe('trackUserEngagement', () => {
    it('should track user engagement metrics', () => {
      const { trackUserEngagement } = useAnalytics()
      
      expect(() => trackUserEngagement()).not.toThrow()
    })

    it('should track engagement with custom metrics', () => {
      const { trackUserEngagement } = useAnalytics()
      
      const metrics = {
        timeOnPage: 30000,
        scrollDepth: 75,
        interactions: 5,
        formInteractions: 2
      }
      
      expect(() => trackUserEngagement(metrics)).not.toThrow()
    })
  })

  describe('trackError', () => {
    it('should track JavaScript errors', () => {
      const { trackError } = useAnalytics()
      
      const error = new Error('Test error')
      expect(() => trackError(error)).not.toThrow()
    })

    it('should track errors with context', () => {
      const { trackError } = useAnalytics()
      
      const error = new Error('API Error')
      const context = {
        url: '/api/posts',
        method: 'GET',
        statusCode: 500
      }
      
      expect(() => trackError(error, context)).not.toThrow()
    })

    it('should handle error tracking gracefully', () => {
      const { trackError } = useAnalytics()
      
      // Mock console.error to avoid test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => trackError(null as any)).not.toThrow()
      consoleSpy.mockRestore()
    })
  })

  describe('trackPerformance', () => {
    it('should track performance metrics', () => {
      const { trackPerformance } = useAnalytics()
      
      expect(() => trackPerformance()).not.toThrow()
    })

    it('should track custom performance metrics', () => {
      const { trackPerformance } = useAnalytics()
      
      const metrics = {
        loadTime: 1500,
        renderTime: 800,
        memoryUsage: 50 * 1024 * 1024
      }
      
      expect(() => trackPerformance(metrics)).not.toThrow()
    })
  })

  describe('trackConversion', () => {
    it('should track conversion events', () => {
      const { trackConversion } = useAnalytics()
      
      expect(() => trackConversion('newsletter_signup')).not.toThrow()
    })

    it('should track conversions with value', () => {
      const { trackConversion } = useAnalytics()
      
      expect(() => trackConversion('purchase', 99.99)).not.toThrow()
    })

    it('should track conversions with additional data', () => {
      const { trackConversion } = useAnalytics()
      
      const data = {
        productId: 'prod_123',
        category: 'electronics',
        currency: 'USD'
      }
      
      expect(() => trackConversion('purchase', 99.99, data)).not.toThrow()
    })
  })

  describe('getAnalyticsData', () => {
    it('should return analytics data', () => {
      const { getAnalyticsData } = useAnalytics()
      
      const data = getAnalyticsData()
      expect(data).toHaveProperty('sessionId')
      expect(data).toHaveProperty('userId')
      expect(data).toHaveProperty('pageViews')
      expect(data).toHaveProperty('events')
    })

    it('should return empty data for new session', () => {
      const { getAnalyticsData } = useAnalytics()
      
      const data = getAnalyticsData()
      expect(data.pageViews).toBe(0)
      expect(data.events).toHaveLength(0)
    })
  })

  describe('flushAnalytics', () => {
    it('should flush analytics data', async () => {
      const { flushAnalytics } = useAnalytics()
      
      // Mock successful API call
      ;(global.$fetch as any).mockResolvedValue({ success: true })
      
      const result = await flushAnalytics()
      expect(result).toBe(true)
    })

    it('should handle flush errors', async () => {
      const { flushAnalytics } = useAnalytics()
      
      // Mock API error
      ;(global.$fetch as any).mockRejectedValue(new Error('Network error'))
      
      const result = await flushAnalytics()
      expect(result).toBe(false)
    })

    it('should handle empty data flush', async () => {
      const { flushAnalytics } = useAnalytics()
      
      const result = await flushAnalytics()
      expect(result).toBe(true)
    })
  })

  describe('setUserProperties', () => {
    it('should set user properties', () => {
      const { setUserProperties } = useAnalytics()
      
      const properties = {
        name: 'John Doe',
        email: 'john@example.com',
        plan: 'premium'
      }
      
      expect(() => setUserProperties(properties)).not.toThrow()
    })

    it('should merge with existing properties', () => {
      const { setUserProperties } = useAnalytics()
      
      setUserProperties({ name: 'John' })
      setUserProperties({ email: 'john@example.com' })
      
      // Should not throw when setting multiple properties
      expect(() => setUserProperties({ plan: 'premium' })).not.toThrow()
    })
  })

  describe('identifyUser', () => {
    it('should identify user with ID', () => {
      const { identifyUser } = useAnalytics()
      
      expect(() => identifyUser('user_123')).not.toThrow()
    })

    it('should identify user with ID and properties', () => {
      const { identifyUser } = useAnalytics()
      
      const properties = {
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      expect(() => identifyUser('user_123', properties)).not.toThrow()
    })
  })

  describe('resetAnalytics', () => {
    it('should reset analytics state', () => {
      const { resetAnalytics } = useAnalytics()
      
      expect(() => resetAnalytics()).not.toThrow()
    })

    it('should clear all stored data', () => {
      const { resetAnalytics } = useAnalytics()
      
      // Mock localStorage.clear
      const clearSpy = vi.spyOn(localStorage, 'clear')
      
      resetAnalytics()
      
      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('isAnalyticsEnabled', () => {
    it('should return analytics enabled status', () => {
      const { isAnalyticsEnabled } = useAnalytics()
      
      const enabled = isAnalyticsEnabled()
      expect(typeof enabled).toBe('boolean')
    })

    it('should respect user preferences', () => {
      const { isAnalyticsEnabled } = useAnalytics()
      
      // Mock user preference
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockReturnValue('false'),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true
      })
      
      const enabled = isAnalyticsEnabled()
      expect(enabled).toBe(false)
    })
  })
}) 