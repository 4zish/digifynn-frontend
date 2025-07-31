import { validateWpEndpoint } from '../../utils/env'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const startTime = Date.now()
    
    // Check basic configuration
    const healthChecks = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        config: {
          status: 'healthy',
          details: 'Configuration loaded successfully'
        },
        wpEndpoint: {
          status: 'unknown',
          details: 'WordPress GraphQL endpoint validation'
        },
        memory: {
          status: 'healthy',
          details: 'Memory usage within limits'
        }
      }
    }
    
    // Validate WordPress endpoint
    const endpoint = config.wpGraphqlEndpoint
    if (endpoint && validateWpEndpoint(endpoint)) {
      healthChecks.checks.wpEndpoint.status = 'healthy'
      healthChecks.checks.wpEndpoint.details = 'WordPress GraphQL endpoint is valid'
    } else {
      healthChecks.checks.wpEndpoint.status = 'unhealthy'
      healthChecks.checks.wpEndpoint.details = 'WordPress GraphQL endpoint is invalid or missing'
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
    
    // Consider memory usage unhealthy if it exceeds 500MB
    if (memUsageMB.heapUsed > 500) {
      healthChecks.checks.memory.status = 'warning'
      healthChecks.checks.memory.details = `High memory usage: ${memUsageMB.heapUsed}MB`
    }
    
    healthChecks.checks.memory.details = `Memory usage: ${memUsageMB.heapUsed}MB / ${memUsageMB.heapTotal}MB`
    
    // Calculate overall status
    const allChecks = Object.values(healthChecks.checks)
    const healthyChecks = allChecks.filter(check => check.status === 'healthy').length
    const totalChecks = allChecks.length
    
    const overallStatus = healthyChecks === totalChecks ? 'healthy' : 
                         healthyChecks > 0 ? 'degraded' : 'unhealthy'
    
    const response = {
      status: overallStatus,
      checks: healthChecks.checks,
      summary: {
        total: totalChecks,
        healthy: healthyChecks,
        unhealthy: allChecks.filter(check => check.status === 'unhealthy').length,
        warning: allChecks.filter(check => check.status === 'warning').length
      },
      responseTime: Date.now() - startTime
    }
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    setResponseStatus(event, statusCode)
    
    return response
    
  } catch (error) {
    console.error('Health check error:', error)
    
    setResponseStatus(event, 503)
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      checks: {
        error: {
          status: 'unhealthy',
          details: 'Health check failed'
        }
      }
    }
  }
}) 