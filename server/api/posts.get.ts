import { request, gql } from 'graphql-request'
import { validateWpEndpoint } from '../../utils/env'
import { createRateLimiter, getClientIP, createRateLimitKey } from '../../utils/rateLimit'

const QUERY = gql`
  {
    posts(first: 10) {
      nodes {
        id
        title
        content
        excerpt
        date
        slug
        author {
          node {
            name
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

// Rate limiter configuration
const rateLimiter = createRateLimiter({
  maxRequests: 100, // requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour block
})

export default defineEventHandler(async (event) => {
  try {
    // Enhanced rate limiting check
    const clientIP = getClientIP(event)
    const rateLimitKey = createRateLimitKey('posts', clientIP)
    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'تعداد درخواست‌ها بیش از حد مجاز است',
        data: {
          message: 'لطفاً کمی صبر کنید و دوباره تلاش کنید.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }
      })
    }
    
    // Add rate limit headers
    setResponseHeaders(event, {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
    })
    
    // Get endpoint from server-side config with validation
    const config = useRuntimeConfig()
    const endpoint = config.wpGraphqlEndpoint
    
    if (!endpoint || !validateWpEndpoint(endpoint)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'پیکربندی نامعتبر است',
        data: {
          message: 'خطا در پیکربندی سرور: WordPress GraphQL endpoint نامعتبر است.'
        }
      })
    }

    const result = await request(endpoint, QUERY)
    return result
  } catch (error: any) {
    console.error('GraphQL Error:', error)
    
    // If it's already a Nuxt error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Return a structured error response
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در دریافت مقالات',
      data: {
        message: 'متأسفانه مشکلی در بارگذاری مقالات پیش آمده است.',
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})