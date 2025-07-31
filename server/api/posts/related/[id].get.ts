import { request, gql } from 'graphql-request'
import { validateWpEndpoint } from '../../../../utils/env'

const RELATED_POSTS_QUERY = gql`
  query GetRelatedPosts($first: Int = 3, $excludeId: ID) {
    posts(first: $first, where: { notIn: [$excludeId] }) {
      nodes {
        id
        title
        slug
        date
        excerpt
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

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const limit = Number(query.limit) || 3

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'شناسه مقاله نامعتبر است',
        data: {
          message: 'شناسه مقاله ارائه نشده است.'
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

    const variables = { 
      first: limit,
      excludeId: id
    }
    
    const result = await request(endpoint, RELATED_POSTS_QUERY, variables)
    
    return result
  } catch (error: any) {
    console.error('GraphQL Error for related posts:', error)
    
    // If it's already a Nuxt error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Return empty result on error to prevent breaking the page
    return {
      posts: {
        nodes: []
      }
    }
  }
})