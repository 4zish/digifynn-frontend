import { request, gql } from 'graphql-request'

const QUERY = gql`
  {
    posts(first: 10) {
      nodes {
        id
        title
        content
        date
        slug
      }
    }
  }
`

export default defineEventHandler(async () => {
  const endpoint = useRuntimeConfig().public.wpGraphqlEndpoint
  return request(endpoint, QUERY)
})