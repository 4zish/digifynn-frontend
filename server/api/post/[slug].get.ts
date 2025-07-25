// server/api/post/[slug].get.ts
import { request, gql } from 'graphql-request'

// This query accepts a variable, `$slug`, to fetch a specific post
const QUERY = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      date
    }
  }
`

export default defineEventHandler(async (event) => {
  // Get the slug from the URL (e.g., 'my-first-post')
  const slug = getRouterParam(event, 'slug')

  const endpoint = useRuntimeConfig().public.wpGraphqlEndpoint
  const variables = { slug }

  // The request now includes the variables object
  return request(endpoint, QUERY, variables)
})