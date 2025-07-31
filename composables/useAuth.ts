import type { User } from '~/types'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (process.client) {
      const storedUser = localStorage.getItem('auth_user')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedUser && storedToken) {
        try {
          user.value = JSON.parse(storedUser)
          // Validate token on server
          validateToken(storedToken)
        } catch (err) {
          console.error('Error parsing stored user:', err)
          clearAuth()
        }
      }
    }
  }

  // Login user
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.success) {
        user.value = response.user
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          localStorage.setItem('auth_token', response.token)
        }
        
        // Track login event
        const { trackEvent } = useAnalytics()
        trackEvent('user_login', {
          user_id: response.user.id,
          email: response.user.email
        })
      } else {
        error.value = response.message || 'خطا در ورود'
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Register user
  const register = async (userData: {
    email: string
    password: string
    name: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (response.success) {
        user.value = response.user
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          localStorage.setItem('auth_token', response.token)
        }
        
        // Track registration event
        const { trackEvent } = useAnalytics()
        trackEvent('user_register', {
          user_id: response.user.id,
          email: response.user.email
        })
      } else {
        error.value = response.message || 'خطا در ثبت‌نام'
      }
    } catch (err) {
      console.error('Registration error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Logout user
  const logout = async () => {
    try {
      // Call logout endpoint
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
      
      // Track logout event
      const { trackEvent } = useAnalytics()
      trackEvent('user_logout')
    }
  }

  // Clear auth data
  const clearAuth = () => {
    user.value = null
    if (process.client) {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
  }

  // Validate token with server
  const validateToken = async (token: string) => {
    try {
      const response = await $fetch('/api/auth/validate', {
        method: 'POST',
        body: { token }
      })

      if (!response.valid) {
        clearAuth()
      }
    } catch (err) {
      console.error('Token validation error:', err)
      clearAuth()
    }
  }

  // Get current user
  const getCurrentUser = () => {
    return user.value
  }

  // Check if user has permission
  const hasPermission = (permission: string) => {
    if (!user.value) return false
    return user.value.permissions?.includes(permission) || false
  }

  // Check if user has role
  const hasRole = (role: string) => {
    if (!user.value) return false
    return user.value.roles?.includes(role) || false
  }

  // Update user profile
  const updateProfile = async (profileData: Partial<User>) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/profile', {
        method: 'PUT',
        body: profileData
      })

      if (response.success) {
        user.value = { ...user.value, ...response.user }
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(user.value))
        }
        
        // Track profile update
        const { trackEvent } = useAnalytics()
        trackEvent('profile_update', {
          user_id: user.value?.id,
          updated_fields: Object.keys(profileData)
        })
      } else {
        error.value = response.message || 'خطا در بروزرسانی پروفایل'
      }
    } catch (err) {
      console.error('Profile update error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword }
      })

      if (response.success) {
        // Track password change
        const { trackEvent } = useAnalytics()
        trackEvent('password_change', {
          user_id: user.value?.id
        })
      } else {
        error.value = response.message || 'خطا در تغییر رمز عبور'
      }
    } catch (err) {
      console.error('Password change error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })

      if (response.success) {
        // Track password reset request
        const { trackEvent } = useAnalytics()
        trackEvent('password_reset_request', { email })
      } else {
        error.value = response.message || 'خطا در ارسال ایمیل بازنشانی'
      }
    } catch (err) {
      console.error('Password reset request error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword }
      })

      if (response.success) {
        // Track password reset
        const { trackEvent } = useAnalytics()
        trackEvent('password_reset_complete')
      } else {
        error.value = response.message || 'خطا در بازنشانی رمز عبور'
      }
    } catch (err) {
      console.error('Password reset error:', err)
      error.value = 'خطا در اتصال به سرور'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Methods
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    getCurrentUser,
    hasPermission,
    hasRole,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword
  }
} 