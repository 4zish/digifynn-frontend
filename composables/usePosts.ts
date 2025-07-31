import type { PostsResponse, SinglePostResponse } from '../types'

export const usePosts = () => {
  
  const fetchPosts = async () => {
    try {
      const { data, error, refresh, pending } = await useFetch<PostsResponse>('/api/posts', {
        key: 'posts',
        default: () => ({ posts: { nodes: [] } }),
        server: false, // Disable SSR for better caching
        lazy: true, // Enable lazy loading
        onResponseError({ response }) {
          console.error('Error fetching posts:', response._data)
        }
      })
      
      return { data, error, refresh, pending }
    } catch (err) {
      console.error('Unexpected error fetching posts:', err)
      return { 
        data: ref({ posts: { nodes: [] } }), 
        error: ref({ message: 'خطا در بارگذاری مقالات' }),
        refresh: () => {},
        pending: ref(false)
      }
    }
  }

  const fetchPostBySlug = async (slug: string) => {
    try {
      const { data, error, refresh, pending } = await useFetch<SinglePostResponse>(`/api/post/${slug}`, {
        key: `post-${slug}`,
        default: () => ({ post: null as any }),
        server: false, // Disable SSR for better caching
        lazy: true, // Enable lazy loading
        onResponseError({ response }) {
          console.error('Error fetching post:', response._data)
        }
      })
      
      return { data, error, refresh, pending }
    } catch (err) {
      console.error('Unexpected error fetching post:', err)
      return { 
        data: ref({ post: null }), 
        error: ref({ message: 'خطا در بارگذاری مقاله' }),
        refresh: () => {},
        pending: ref(false)
      }
    }
  }

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200 // Average reading speed in Persian
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  const fetchRelatedPosts = async (postId: string, limit: number = 3) => {
    try {
      const { data, error } = await useFetch<PostsResponse>(`/api/posts/related/${postId}?limit=${limit}`, {
        key: `related-posts-${postId}`,
        default: () => ({ posts: { nodes: [] } }),
        server: false,
        lazy: true
      })
      return { data, error }
    } catch (err) {
      console.error('Error fetching related posts:', err)
      return { 
        data: ref({ posts: { nodes: [] } }), 
        error: ref(null)
      }
    }
  }

  return {
    fetchPosts,
    fetchPostBySlug,
    calculateReadingTime,
    fetchRelatedPosts
  }
} 