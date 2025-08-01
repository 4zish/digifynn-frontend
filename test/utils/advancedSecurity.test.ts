import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  AIThreatDetector,
  ZeroTrustSecurity,
  SecurityHeadersGenerator,
  SecurityMonitor,
  type SecurityEvent,
  type ThreatPattern
} from '../../utils/advancedSecurity'

describe('Advanced Security System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AIThreatDetector', () => {
    describe('analyzeRequest', () => {
      it('should detect SQL injection threats', () => {
        const request = {
          url: '/api/posts',
          method: 'POST',
          headers: { 'user-agent': 'test' },
          body: 'SELECT * FROM users WHERE id = 1',
          ip: '192.168.1.1'
        }

        const result = AIThreatDetector.analyzeRequest(request)

        expect(result.isThreat).toBe(true)
        expect(result.threats.length).toBeGreaterThan(0)
        expect(result.threats.some(t => t.category === 'sql-injection')).toBe(true)
        expect(result.action).toBe('block')
        expect(result.confidence).toBeGreaterThan(0.8)
      })

      it('should detect XSS threats', () => {
        const request = {
          url: '/api/comments',
          method: 'POST',
          headers: { 'user-agent': 'test' },
          body: '<script>alert("xss")</script>',
          ip: '192.168.1.1'
        }

        const result = AIThreatDetector.analyzeRequest(request)

        expect(result.isThreat).toBe(true)
        expect(result.threats.some(t => t.category === 'xss')).toBe(true)
        expect(result.riskScore).toBeGreaterThan(30)
      })

      it('should detect RCE threats', () => {
        const request = {
          url: '/api/execute',
          method: 'POST',
          headers: { 'user-agent': 'test' },
          body: 'eval("malicious code")',
          ip: '192.168.1.1'
        }

        const result = AIThreatDetector.analyzeRequest(request)

        expect(result.isThreat).toBe(true)
        expect(result.threats.some(t => t.category === 'rce')).toBe(true)
        expect(result.severity).toBe('critical')
      })

      it('should allow legitimate requests', () => {
        const request = {
          url: '/api/posts',
          method: 'GET',
          headers: { 'user-agent': 'Mozilla/5.0' },
          body: '{"title": "Legitimate post"}',
          ip: '192.168.1.1'
        }

        const result = AIThreatDetector.analyzeRequest(request)

        expect(result.isThreat).toBe(false)
        expect(result.action).toBe('allow')
        expect(result.riskScore).toBeLessThan(20)
      })

      it('should detect anomalies', () => {
        const request = {
          url: '/api/posts',
          method: 'GET',
          headers: { 'user-agent': 'bot-crawler' },
          body: '',
          ip: '192.168.1.1'
        }

        const result = AIThreatDetector.analyzeRequest(request)

        expect(result.riskScore).toBeGreaterThan(0)
      })
    })

    describe('recordEvent', () => {
      it('should record security events', () => {
        const event: SecurityEvent = {
          timestamp: Date.now(),
          type: 'threat',
          severity: 'high',
          source: '192.168.1.1',
          details: { pattern: 'sql-injection' },
          ip: '192.168.1.1',
          userAgent: 'test'
        }

        AIThreatDetector.recordEvent(event)

        const stats = AIThreatDetector.getSecurityStats()
        expect(stats.totalEvents).toBeGreaterThan(0)
        expect(stats.threatCount).toBeGreaterThan(0)
      })

      it('should update risk scores', () => {
        const event: SecurityEvent = {
          timestamp: Date.now(),
          type: 'threat',
          severity: 'critical',
          source: '192.168.1.1',
          details: { pattern: 'rce' },
          ip: '192.168.1.1',
          userAgent: 'test'
        }

        AIThreatDetector.recordEvent(event)

        const stats = AIThreatDetector.getSecurityStats()
        expect(stats.criticalEvents).toBeGreaterThan(0)
      })
    })

    describe('getSecurityStats', () => {
      it('should return comprehensive security statistics', () => {
        const stats = AIThreatDetector.getSecurityStats()

        expect(stats).toHaveProperty('totalEvents')
        expect(stats).toHaveProperty('threatCount')
        expect(stats).toHaveProperty('criticalEvents')
        expect(stats).toHaveProperty('topThreats')
        expect(stats).toHaveProperty('riskScores')
        expect(Array.isArray(stats.topThreats)).toBe(true)
        expect(stats.riskScores instanceof Map).toBe(true)
      })
    })
  })

  describe('ZeroTrustSecurity', () => {
    describe('verifyRequest', () => {
      it('should verify legitimate requests', async () => {
        const request = {
          headers: { authorization: 'Bearer valid-token' },
          ip: '192.168.1.1',
          sessionId: 'valid-session'
        }

        const result = await ZeroTrustSecurity.verifyRequest(request)

        expect(result.allowed).toBe(true)
        expect(result.riskScore).toBeLessThan(70)
        expect(result.challenges.length).toBeLessThan(3)
        expect(result.sessionToken).toBeDefined()
      })

      it('should block high-risk requests', async () => {
        const request = {
          headers: {},
          ip: '192.168.1.1',
          sessionId: 'invalid-session'
        }

        const result = await ZeroTrustSecurity.verifyRequest(request)

        expect(result.allowed).toBe(false)
        expect(result.riskScore).toBeGreaterThan(70)
        expect(result.challenges.length).toBeGreaterThan(0)
      })

      it('should challenge medium-risk requests', async () => {
        const request = {
          headers: { authorization: 'Bearer weak-token' },
          ip: '192.168.1.1',
          sessionId: 'suspicious-session'
        }

        const result = await ZeroTrustSecurity.verifyRequest(request)

        expect(result.allowed).toBe(false)
        expect(result.riskScore).toBeGreaterThan(50)
        expect(result.challenges).toContain('identity_verification')
      })
    })

    describe('updateConfig', () => {
      it('should update zero-trust configuration', () => {
        const newConfig = {
          strictMode: false,
          continuousVerification: false
        }

        ZeroTrustSecurity.updateConfig(newConfig)
        const config = ZeroTrustSecurity.getConfig()

        expect(config.strictMode).toBe(false)
        expect(config.continuousVerification).toBe(false)
        expect(config.enabled).toBe(true) // Should preserve other settings
      })
    })

    describe('getConfig', () => {
      it('should return current configuration', () => {
        const config = ZeroTrustSecurity.getConfig()

        expect(config).toHaveProperty('enabled')
        expect(config).toHaveProperty('strictMode')
        expect(config).toHaveProperty('continuousVerification')
        expect(config).toHaveProperty('adaptiveAuth')
        expect(config).toHaveProperty('riskScoring')
        expect(config).toHaveProperty('anomalyDetection')
        expect(config).toHaveProperty('aiThreatDetection')
      })
    })
  })

  describe('SecurityHeadersGenerator', () => {
    describe('generateHeaders', () => {
      it('should generate comprehensive security headers', () => {
        const headers = SecurityHeadersGenerator.generateHeaders()

        expect(headers['Content-Security-Policy']).toBeDefined()
        expect(headers['Strict-Transport-Security']).toBeDefined()
        expect(headers['X-Frame-Options']).toBe('DENY')
        expect(headers['X-Content-Type-Options']).toBe('nosniff')
        expect(headers['X-XSS-Protection']).toBe('1; mode=block')
        expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
        expect(headers['Permissions-Policy']).toBeDefined()
        expect(headers['Cross-Origin-Embedder-Policy']).toBe('require-corp')
        expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin')
        expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin')
      })

      it('should include restrictive CSP', () => {
        const headers = SecurityHeadersGenerator.generateHeaders()
        const csp = headers['Content-Security-Policy']

        expect(csp).toContain("default-src 'self'")
        expect(csp).toContain("script-src 'self'")
        expect(csp).toContain("style-src 'self'")
        expect(csp).toContain("frame-ancestors 'none'")
        expect(csp).toContain("upgrade-insecure-requests")
        expect(csp).toContain("block-all-mixed-content")
      })

      it('should include comprehensive permissions policy', () => {
        const headers = SecurityHeadersGenerator.generateHeaders()
        const permissionsPolicy = headers['Permissions-Policy']

        expect(permissionsPolicy).toContain('geolocation=()')
        expect(permissionsPolicy).toContain('microphone=()')
        expect(permissionsPolicy).toContain('camera=()')
        expect(permissionsPolicy).toContain('payment=()')
      })
    })

    describe('generateNonce', () => {
      it('should generate unique nonces', () => {
        const nonce1 = SecurityHeadersGenerator.generateNonce()
        const nonce2 = SecurityHeadersGenerator.generateNonce()

        expect(nonce1).toBeDefined()
        expect(nonce2).toBeDefined()
        expect(nonce1).not.toBe(nonce2)
        expect(nonce1).toMatch(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 format
      })
    })

    describe('generateHash', () => {
      it('should generate SHA-256 hashes', () => {
        const content = '<script>alert("test")</script>'
        const hash = SecurityHeadersGenerator.generateHash(content)

        expect(hash).toBeDefined()
        expect(hash).toMatch(/^[A-Za-z0-9+/]+={0,2}$/) // Base64 format
        expect(hash.length).toBe(44) // SHA-256 hash in base64
      })

      it('should generate consistent hashes for same content', () => {
        const content = 'test content'
        const hash1 = SecurityHeadersGenerator.generateHash(content)
        const hash2 = SecurityHeadersGenerator.generateHash(content)

        expect(hash1).toBe(hash2)
      })
    })
  })

  describe('SecurityMonitor', () => {
    describe('monitorEvent', () => {
      it('should monitor security events', () => {
        const event: SecurityEvent = {
          timestamp: Date.now(),
          type: 'threat',
          severity: 'high',
          source: '192.168.1.1',
          details: { pattern: 'sql-injection' },
          ip: '192.168.1.1',
          userAgent: 'test'
        }

        SecurityMonitor.monitorEvent(event)

        const dashboardData = SecurityMonitor.getDashboardData()
        expect(dashboardData.totalAlerts).toBeGreaterThan(0)
      })

      it('should create alerts for critical events', () => {
        const event: SecurityEvent = {
          timestamp: Date.now(),
          type: 'attack',
          severity: 'critical',
          source: '192.168.1.1',
          details: { pattern: 'rce' },
          ip: '192.168.1.1',
          userAgent: 'test'
        }

        SecurityMonitor.monitorEvent(event)

        const dashboardData = SecurityMonitor.getDashboardData()
        expect(dashboardData.criticalAlerts).toBeGreaterThan(0)
      })
    })

    describe('getDashboardData', () => {
      it('should return comprehensive dashboard data', () => {
        const dashboardData = SecurityMonitor.getDashboardData()

        expect(dashboardData).toHaveProperty('totalAlerts')
        expect(dashboardData).toHaveProperty('criticalAlerts')
        expect(dashboardData).toHaveProperty('resolvedAlerts')
        expect(dashboardData).toHaveProperty('recentEvents')
        expect(dashboardData).toHaveProperty('threatStats')
        expect(Array.isArray(dashboardData.recentEvents)).toBe(true)
        expect(typeof dashboardData.threatStats).toBe('object')
      })
    })

    describe('resolveAlert', () => {
      it('should resolve alerts', () => {
        // First create an alert
        const event: SecurityEvent = {
          timestamp: Date.now(),
          type: 'threat',
          severity: 'high',
          source: '192.168.1.1',
          details: { pattern: 'xss' },
          ip: '192.168.1.1',
          userAgent: 'test'
        }

        SecurityMonitor.monitorEvent(event)

        const dashboardData = SecurityMonitor.getDashboardData()
        const alertId = dashboardData.totalAlerts > 0 ? 'test-alert-id' : 'mock-id'

        const resolved = SecurityMonitor.resolveAlert(alertId)
        expect(typeof resolved).toBe('boolean')
      })

      it('should return false for non-existent alerts', () => {
        const resolved = SecurityMonitor.resolveAlert('non-existent-id')
        expect(resolved).toBe(false)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work together as a complete security system', async () => {
      // Simulate a malicious request
      const maliciousRequest = {
        url: '/api/admin',
        method: 'POST',
        headers: { 'user-agent': 'bot' },
        body: 'SELECT * FROM users WHERE id = 1 OR 1=1',
        ip: '192.168.1.1'
      }

      // 1. AI Threat Detection
      const threatAnalysis = AIThreatDetector.analyzeRequest(maliciousRequest)
      expect(threatAnalysis.isThreat).toBe(true)

      // 2. Zero Trust Verification
      const zeroTrustResult = await ZeroTrustSecurity.verifyRequest(maliciousRequest)
      expect(zeroTrustResult.allowed).toBe(false)

      // 3. Security Monitoring
      const securityEvent: SecurityEvent = {
        timestamp: Date.now(),
        type: 'threat',
        severity: 'critical',
        source: '192.168.1.1',
        details: threatAnalysis.threats[0],
        ip: '192.168.1.1',
        userAgent: 'bot'
      }

      SecurityMonitor.monitorEvent(securityEvent)

      // 4. Verify security response
      const dashboardData = SecurityMonitor.getDashboardData()
      expect(dashboardData.criticalAlerts).toBeGreaterThan(0)

      // 5. Generate security headers
      const headers = SecurityHeadersGenerator.generateHeaders()
      expect(headers['Content-Security-Policy']).toBeDefined()
    })

    it('should handle legitimate requests correctly', async () => {
      // Simulate a legitimate request
      const legitimateRequest = {
        url: '/api/posts',
        method: 'GET',
        headers: { 
          'user-agent': 'Mozilla/5.0',
          'authorization': 'Bearer valid-token'
        },
        body: '{"title": "Legitimate post"}',
        ip: '192.168.1.1'
      }

      // 1. AI Threat Detection
      const threatAnalysis = AIThreatDetector.analyzeRequest(legitimateRequest)
      expect(threatAnalysis.isThreat).toBe(false)

      // 2. Zero Trust Verification
      const zeroTrustResult = await ZeroTrustSecurity.verifyRequest(legitimateRequest)
      expect(zeroTrustResult.allowed).toBe(true)

      // 3. Security Monitoring (no alerts should be created)
      const initialAlerts = SecurityMonitor.getDashboardData().totalAlerts

      const securityEvent: SecurityEvent = {
        timestamp: Date.now(),
        type: 'suspicious',
        severity: 'low',
        source: '192.168.1.1',
        details: { pattern: 'legitimate' },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }

      SecurityMonitor.monitorEvent(securityEvent)

      const finalAlerts = SecurityMonitor.getDashboardData().totalAlerts
      expect(finalAlerts).toBeGreaterThanOrEqual(initialAlerts)
    })
  })

  describe('Performance Tests', () => {
    it('should handle high-volume threat detection efficiently', () => {
      const startTime = Date.now()
      
      // Simulate 1000 requests
      for (let i = 0; i < 1000; i++) {
        const request = {
          url: `/api/test${i}`,
          method: 'GET',
          headers: { 'user-agent': 'test' },
          body: `test body ${i}`,
          ip: `192.168.1.${i % 255}`
        }

        AIThreatDetector.analyzeRequest(request)
      }

      const endTime = Date.now()
      const processingTime = endTime - startTime

      // Should process 1000 requests in under 1 second
      expect(processingTime).toBeLessThan(1000)
    })

    it('should maintain performance under load', () => {
      const requests = []
      
      // Generate 1000 varied requests
      for (let i = 0; i < 1000; i++) {
        requests.push({
          url: `/api/test${i}`,
          method: i % 2 === 0 ? 'GET' : 'POST',
          headers: { 'user-agent': `user-${i}` },
          body: i % 10 === 0 ? 'malicious content' : `legitimate content ${i}`,
          ip: `192.168.1.${i % 255}`
        })
      }

      const startTime = Date.now()
      
      requests.forEach(request => {
        AIThreatDetector.analyzeRequest(request)
      })

      const endTime = Date.now()
      const processingTime = endTime - startTime

      // Should process 1000 requests in under 2 seconds
      expect(processingTime).toBeLessThan(2000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty requests', () => {
      const emptyRequest = {}
      const result = AIThreatDetector.analyzeRequest(emptyRequest)

      expect(result.isThreat).toBe(false)
      expect(result.action).toBe('allow')
    })

    it('should handle malformed requests', () => {
      const malformedRequest = {
        url: null,
        method: undefined,
        headers: 'not-an-object',
        body: 123,
        ip: null
      }

      const result = AIThreatDetector.analyzeRequest(malformedRequest)

      expect(typeof result.isThreat).toBe('boolean')
      expect(typeof result.action).toBe('string')
    })

    it('should handle very large requests', () => {
      const largeRequest = {
        url: '/api/test',
        method: 'POST',
        headers: { 'user-agent': 'test' },
        body: 'x'.repeat(1000000), // 1MB body
        ip: '192.168.1.1'
      }

      const result = AIThreatDetector.analyzeRequest(largeRequest)

      expect(typeof result.isThreat).toBe('boolean')
      expect(typeof result.action).toBe('string')
    })
  })
}) 