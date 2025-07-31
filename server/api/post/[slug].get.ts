// server/api/post/[slug].get.ts
import { request, gql } from 'graphql-request'
import { validateSlug, sanitizeSlug } from '../../../utils/validation'
import { validateWpEndpoint } from '../../../utils/env'

const QUERY = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      date
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
`

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'شناسه مقاله نامعتبر است',
        data: {
          message: 'شناسه مقاله ارائه نشده است.',
          errors: ['Slug is required']
        }
      })
    }
    
    // Input validation using utility function
    const validation = validateSlug(slug)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'شناسه مقاله نامعتبر است',
        data: {
          message: validation.errors.join(', '),
          errors: validation.errors
        }
      })
    }

    // Sanitize slug to prevent injection
    const sanitizedSlug = sanitizeSlug(slug)
    
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

    // For development, check if we can connect to WordPress
    let result: any
    
    try {
      const variables = { slug: sanitizedSlug }
      result = await request(endpoint, QUERY, variables)
      
      // Check if post exists
      if (!result.post) {
        throw createError({
          statusCode: 404,
          statusMessage: 'مقاله یافت نشد',
          data: {
            message: 'مقاله مورد نظر یافت نشد.'
          }
        })
      }
    } catch (graphqlError) {
      // Fall back to mock data for development
      console.warn('WordPress GraphQL not available, using mock data:', graphqlError)
      
      result = {
        post: {
          id: `mock-${sanitizedSlug}`,
          title: `نمونه مقاله: ${sanitizedSlug}`,
          content: `<p>این یک مقاله نمونه است برای توسعه محلی.</p>
                   <p>در این مقاله می‌توانید محتوای آزمایشی را مشاهده کنید که برای تست عملکرد صفحه طراحی شده است.</p>
                   <h2>زیرعنوان نمونه</h2>
                   <p>این بخش نشان می‌دهد که چگونه محتوای واقعی در صفحه نمایش داده می‌شود.</p>
                   <p>شما می‌توانید این محتوا را با اتصال به WordPress واقعی جایگزین کنید.</p>`,
          excerpt: 'خلاصه‌ای از مقاله نمونه برای تست عملکرد سیستم',
          date: new Date().toISOString(),
          author: {
            node: {
              name: 'نویسنده نمونه'
            }
          },
          categories: {
            nodes: [
              { name: 'فناوری', slug: 'technology' },
              { name: 'آموزش', slug: 'tutorial' }
            ]
          },
          featuredImage: {
            node: {
              sourceUrl: 'https://via.placeholder.com/800x400?text=تصویر+نمونه',
              altText: 'تصویر نمونه مقاله'
            }
          }
        }
      }
    }
    
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
      statusMessage: 'خطا در دریافت مقاله',
      data: {
        message: 'متأسفانه مشکلی در بارگذاری مقاله پیش آمده است.',
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})