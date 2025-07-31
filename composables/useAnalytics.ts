export const useAnalytics = () => {
  const config = useRuntimeConfig()
  
  // Initialize analytics
  const initAnalytics = () => {
    if (process.server) return
    
    // Google Analytics 4 initialization
    if (config.public.googleAnalyticsId) {
      // Load Google Analytics
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.public.googleAnalyticsId}`
      document.head.appendChild(script)
      
      window.dataLayer = window.dataLayer || []
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', config.public.googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href
      })
      
      // Make gtag available globally
      window.gtag = gtag
    }
  }
  
  // Track page views
  const trackPageView = (page: string, title?: string) => {
    if (process.server) return
    
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: page
      })
    }
    
    // Custom analytics event
    trackEvent('page_view', {
      page,
      title: title || document.title,
      url: window.location.href
    })
  }
  
  // Track custom events
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (process.client && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
    
    // Send to custom analytics endpoint
    if (process.client) {
      sendAnalyticsEvent(eventName, parameters)
    }
  }
  
  // Track search events
  const trackSearch = (query: string, resultsCount: number) => {
    if (process.server) return
    
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
      page: window.location.pathname
    })
  }
  
  // Track article views
  const trackArticleView = (articleSlug: string, articleTitle: string, category?: string) => {
    if (process.server) return
    
    trackEvent('article_view', {
      article_slug: articleSlug,
      article_title: articleTitle,
      category,
      page: window.location.pathname
    })
  }
  
  // Track user engagement
  const trackEngagement = (action: string, target: string, value?: any) => {
    trackEvent('engagement', {
      action,
      target,
      value,
      timestamp: Date.now()
    })
  }
  
  // Track performance metrics
  const trackPerformance = (metric: string, value: number) => {
    trackEvent('performance', {
      metric,
      value,
      timestamp: Date.now()
    })
  }
  
  // Send analytics data to server
  const sendAnalyticsEvent = async (eventName: string, parameters: Record<string, any>) => {
    if (process.server) return
    
    try {
      await $fetch('/api/analytics', {
        method: 'POST',
        body: {
          event: eventName,
          parameters,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }
  
  // Track user session
  const trackSession = () => {
    if (process.server) return
    
    const sessionId = generateSessionId()
    const sessionData = {
      sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmSource: new URLSearchParams(window.location.search).get('utm_source'),
      utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
      utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
    }
    
    // Store session data
    localStorage.setItem('analytics_session', JSON.stringify(sessionData))
    
    trackEvent('session_start', sessionData)
  }
  
  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Track scroll depth
  const trackScrollDepth = () => {
    if (process.server) {
      return () => {} // Return empty cleanup function for SSR
    }
    
    let maxScrollDepth = 0
    
    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      
      // Prevent division by zero
      if (documentHeight <= 0) return
      
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)
      
      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage
        
        // Track at 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(maxScrollDepth)) {
          trackEvent('scroll_depth', {
            depth: maxScrollDepth,
            page: window.location.pathname
          })
        }
      }
    }
    
    // Add event listener with passive option for better performance
    window.addEventListener('scroll', updateScrollDepth, { passive: true })
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', updateScrollDepth)
    }
  }
  
  // Track time on page
  const trackTimeOnPage = () => {
    if (process.server) {
      return () => {} // Return empty cleanup function for SSR
    }
    
    const startTime = Date.now()
    let isActive = true
    
    const updateTimeOnPage = () => {
      if (!isActive) return
      
      const timeOnPage = Math.round((Date.now() - startTime) / 1000)
      
      // Track every 30 seconds
      if (timeOnPage % 30 === 0 && timeOnPage > 0) {
        trackEvent('time_on_page', {
          seconds: timeOnPage,
          page: window.location.pathname
        })
      }
    }
    
    const interval = setInterval(updateTimeOnPage, 1000)
    
    // Cleanup function
    return () => {
      isActive = false
      clearInterval(interval)
    }
  }
  
  return {
    initAnalytics,
    trackPageView,
    trackEvent,
    trackSearch,
    trackArticleView,
    trackEngagement,
    trackPerformance,
    trackSession,
    trackScrollDepth,
    trackTimeOnPage
  }
}

// Type declarations
declare global {
  interface Window {
    gtag: (..._args: any[]) => void
    dataLayer: any[]
  }
} 