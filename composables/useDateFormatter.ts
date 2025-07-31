export const useDateFormatter = () => {
  const formatDate = (dateString: string, locale: string = 'fa-IR') => {
    if (!dateString) return ''
    
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const formatRelativeDate = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return dateString
      }
      
      const diffTime = now.getTime() - date.getTime() // Remove Math.abs to handle future dates correctly
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      // Handle future dates
      if (diffTime < 0) {
        return formatDate(dateString)
      }
      
      if (diffDays === 0) return 'امروز'
      if (diffDays === 1) return 'دیروز'
      if (diffDays < 7) return `${diffDays} روز پیش`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`
      
      return formatDate(dateString)
    } catch (error) {
      console.error('Error formatting relative date:', error)
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      return new Date(dateString).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      return ''
    }
  }

  return {
    formatDate,
    formatRelativeDate,
    formatTime
  }
} 