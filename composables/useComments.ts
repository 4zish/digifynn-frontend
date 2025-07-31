import type { Comment, CommentRequest, CommentResponse } from '~/types'

export const useComments = () => {
  const comments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalComments = ref(0)

  // Fetch comments for a post
  const fetchComments = async (postId: string, page: number = 1, limit: number = 10) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CommentResponse>(`/api/comments/${postId}`, {
        query: { page, limit }
      })

      if (response.success) {
        comments.value = response.comments || []
        totalComments.value = response.total || 0
      } else {
        error.value = response.message || 'خطا در بارگذاری نظرات'
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Add a new comment
  const addComment = async (commentData: CommentRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CommentResponse>('/api/comments', {
        method: 'POST',
        body: commentData
      })

      if (response.success && response.comment) {
        // Add new comment to the list
        comments.value.unshift(response.comment)
        totalComments.value++
        
        // Track comment event
        const { trackEvent } = useAnalytics()
        trackEvent('comment_added', {
          post_id: commentData.postId,
          comment_id: response.comment.id,
          has_parent: !!commentData.parentId
        })
        
        return response.comment
      } else {
        error.value = response.message || 'خطا در ارسال نظر'
        return null
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      error.value = 'خطا در اتصال به سرور'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update a comment
  const updateComment = async (commentId: string, content: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CommentResponse>(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: { content }
      })

      if (response.success && response.comment) {
        // Update comment in the list
        const index = comments.value.findIndex(c => c.id === commentId)
        if (index !== -1) {
          comments.value[index] = response.comment
        }
        
        // Track comment update
        const { trackEvent } = useAnalytics()
        trackEvent('comment_updated', {
          comment_id: commentId
        })
        
        return response.comment
      } else {
        error.value = response.message || 'خطا در بروزرسانی نظر'
        return null
      }
    } catch (err) {
      console.error('Error updating comment:', err)
      error.value = 'خطا در اتصال به سرور'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<CommentResponse>(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        // Remove comment from the list
        comments.value = comments.value.filter(c => c.id !== commentId)
        totalComments.value--
        
        // Track comment deletion
        const { trackEvent } = useAnalytics()
        trackEvent('comment_deleted', {
          comment_id: commentId
        })
        
        return true
      } else {
        error.value = response.message || 'خطا در حذف نظر'
        return false
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      error.value = 'خطا در اتصال به سرور'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Like/unlike a comment
  const toggleCommentLike = async (commentId: string) => {
    try {
      const response = await $fetch<CommentResponse>(`/api/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.success && response.comment) {
        // Update comment in the list
        const index = comments.value.findIndex(c => c.id === commentId)
        if (index !== -1) {
          comments.value[index] = response.comment
        }
        
        // Track like event
        const { trackEvent } = useAnalytics()
        trackEvent('comment_liked', {
          comment_id: commentId,
          likes: response.comment.likes
        })
        
        return response.comment
      } else {
        error.value = response.message || 'خطا در لایک نظر'
        return null
      }
    } catch (err) {
      console.error('Error toggling comment like:', err)
      error.value = 'خطا در اتصال به سرور'
      return null
    }
  }

  // Report a comment
  const reportComment = async (commentId: string, reason: string) => {
    try {
      const response = await $fetch<CommentResponse>(`/api/comments/${commentId}/report`, {
        method: 'POST',
        body: { reason }
      })

      if (response.success) {
        // Track report event
        const { trackEvent } = useAnalytics()
        trackEvent('comment_reported', {
          comment_id: commentId,
          reason
        })
        
        return true
      } else {
        error.value = response.message || 'خطا در گزارش نظر'
        return false
      }
    } catch (err) {
      console.error('Error reporting comment:', err)
      error.value = 'خطا در اتصال به سرور'
      return false
    }
  }

  // Get comment by ID
  const getCommentById = (commentId: string) => {
    return comments.value.find(c => c.id === commentId)
  }

  // Get replies for a comment
  const getCommentReplies = (commentId: string) => {
    return comments.value.filter(c => c.parentId === commentId)
  }

  // Check if user can edit comment
  const canEditComment = (comment: Comment) => {
    const { user } = useAuth()
    if (!user.value) return false
    
    return comment.author.id === user.value.id || 
           user.value.roles?.includes('admin') ||
           user.value.roles?.includes('moderator')
  }

  // Check if user can delete comment
  const canDeleteComment = (comment: Comment) => {
    const { user } = useAuth()
    if (!user.value) return false
    
    return comment.author.id === user.value.id || 
           user.value.roles?.includes('admin') ||
           user.value.roles?.includes('moderator')
  }

  // Format comment date
  const formatCommentDate = (dateString: string) => {
    const { formatRelativeDate } = useDateFormatter()
    return formatRelativeDate(dateString)
  }

  // Clear comments
  const clearComments = () => {
    comments.value = []
    totalComments.value = 0
    error.value = null
  }

  return {
    // State
    comments: readonly(comments),
    isLoading: readonly(isLoading),
    error: readonly(error),
    totalComments: readonly(totalComments),
    
    // Methods
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    reportComment,
    getCommentById,
    getCommentReplies,
    canEditComment,
    canDeleteComment,
    formatCommentDate,
    clearComments
  }
} 