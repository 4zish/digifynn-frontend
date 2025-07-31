/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
  wpGraphqlEndpoint: string
  googleAnalyticsId: string
  environment: string
  nodeEnv: string
}

/**
 * Validates and returns environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const config = useRuntimeConfig()
  
  // Validate required environment variables
  const requiredVars = {
    wpGraphqlEndpoint: config.wpGraphqlEndpoint || process.env.WP_GRAPHQL_ENDPOINT,
    googleAnalyticsId: config.public.googleAnalyticsId || process.env.GOOGLE_ANALYTICS_ID,
    environment: config.public.environment || process.env.NODE_ENV,
    nodeEnv: process.env.NODE_ENV
  }
  
  // Check for missing required variables in production
  if (process.env.NODE_ENV === 'production') {
    const missingVars = Object.entries(requiredVars)
      .filter(([, value]) => !value)
      .map(([key]) => key)
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars)
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
  }
  
  return {
    wpGraphqlEndpoint: requiredVars.wpGraphqlEndpoint || 'https://cms.digifynn.com/graphql',
    googleAnalyticsId: requiredVars.googleAnalyticsId || '',
    environment: requiredVars.environment || 'development',
    nodeEnv: requiredVars.nodeEnv || 'development'
  }
}

/**
 * Validates if the application is in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Validates if the application is in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Gets the WordPress GraphQL endpoint with validation
 */
export function getWpGraphqlEndpoint(): string {
  const config = getEnvConfig()
  return config.wpGraphqlEndpoint
}

/**
 * Gets Google Analytics ID with validation
 */
export function getGoogleAnalyticsId(): string {
  const config = getEnvConfig()
  return config.googleAnalyticsId
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates WordPress GraphQL endpoint
 */
export function validateWpEndpoint(endpoint: string): boolean {
  if (!endpoint) return false
  if (!isValidUrl(endpoint)) return false
  if (!endpoint.includes('/graphql')) return false
  return true
} 