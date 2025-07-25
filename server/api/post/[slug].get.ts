// server/api/post/[slug].get.ts
import { request, gql } from 'graphql-request'

const QUERY = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
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
    }
  }
`

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const endpoint = useRuntimeConfig().public.wpGraphqlEndpoint
  const variables = { slug }

  return request(endpoint, QUERY, variables)
})