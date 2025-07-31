import { request, gql } from 'graphql-request'
import { validateSearchQuery, sanitizeSearchQuery } from '../../utils/validation'
import { validateWpEndpoint } from '../../utils/env'
import { createRateLimiter, getClientIP, createRateLimitKey } from '../../utils/rateLimit'

const SEARCH_QUERY = gql`
  query SearchPosts($search: String!, $first: Int!, $offset: Int!) {
    posts(
      where: { search: $search }
      first: $first
      offset: $offset
    ) {
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
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

// Rate limiter configuration for search
const rateLimiter = createRateLimiter({
  maxRequests: 50, // requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour block
})

export default defineEventHandler(async (event) => {
  try {
    // Enhanced rate limiting check
    const clientIP = getClientIP(event)
    const rateLimitKey = createRateLimitKey('search', clientIP)
    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'تعداد درخواست‌های جستجو بیش از حد مجاز است',
        data: {
          message: 'لطفاً کمی صبر کنید و دوباره تلاش کنید.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }
      })
    }
    
    // Add rate limit headers
    setResponseHeaders(event, {
      'X-RateLimit-Limit': '50',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
    })
    
    // Get request body
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'درخواست نامعتبر است',
        data: {
          message: 'بدنه درخواست خالی است.'
        }
      })
    }
    
    const { query, page = 1, limit = 20 } = body
    
    // Validate search query
    const validation = validateSearchQuery(query)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'عبارت جستجو نامعتبر است',
        data: {
          message: validation.errors.join(', '),
          errors: validation.errors
        }
      })
    }
    
    // Sanitize search query
    const sanitizedQuery = sanitizeSearchQuery(query)
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'پارامترهای صفحه‌بندی نامعتبر است',
        data: {
          message: 'شماره صفحه و تعداد نتایج باید عدد مثبت باشد.'
        }
      })
    }
    
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
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Execute search query
    const variables = {
      search: sanitizedQuery,
      first: limit,
      offset
    }
    
    const result: any = await request(endpoint, SEARCH_QUERY, variables)
    
    // Transform results
    const posts = result.posts?.nodes || []
    const total = posts.length // Note: WordPress GraphQL doesn't provide total count easily
    
    return {
      results: posts,
      total,
      page,
      limit,
      query: sanitizedQuery,
      hasNextPage: result.posts?.pageInfo?.hasNextPage || false,
      hasPreviousPage: result.posts?.pageInfo?.hasPreviousPage || false
    }
    
  } catch (error: any) {
    console.error('Search Error:', error)
    
    // If it's already a Nuxt error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Return a structured error response
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در جستجو',
      data: {
        message: 'متأسفانه مشکلی در جستجو پیش آمده است.',
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}) 