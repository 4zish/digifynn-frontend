import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

// Mock $fetch
const mockFetch = vi.fn()
vi.mock('#app', () => ({
  $fetch: mockFetch
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initAuth', () => {
    it('should initialize auth from localStorage', () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockToken = 'mock-token'
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockUser))
        .mockReturnValueOnce(mockToken)
      
      const { initAuth } = useAuth()
      initAuth()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_user')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
    })

    it('should clear auth on invalid stored data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const { initAuth } = useAuth()
      initAuth()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token'
      }
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const { login } = useAuth()
      await login('test@example.com', 'password')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password' }
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockResponse.user))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token)
    })

    it('should handle login error', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials'
      }
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const { login, error } = useAuth()
      await login('test@example.com', 'wrong-password')
      
      expect(error.value).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockFetch.mockResolvedValue({ success: true })
      
      const { logout } = useAuth()
      await logout()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      })
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('hasPermission', () => {
    it('should return true for user with permission', () => {
      const mockUser = {
        id: '1',
        permissions: ['read', 'write']
      }
      
      // Mock useState to return mock user
      vi.mock('#app', () => ({
        useState: () => ref(mockUser)
      }))
      
      const { hasPermission } = useAuth()
      expect(hasPermission('read')).toBe(true)
    })

    it('should return false for user without permission', () => {
      const mockUser = {
        id: '1',
        permissions: ['read']
      }
      
      vi.mock('#app', () => ({
        useState: () => ref(mockUser)
      }))
      
      const { hasPermission } = useAuth()
      expect(hasPermission('write')).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true for user with role', () => {
      const mockUser = {
        id: '1',
        roles: ['user', 'admin']
      }
      
      vi.mock('#app', () => ({
        useState: () => ref(mockUser)
      }))
      
      const { hasRole } = useAuth()
      expect(hasRole('admin')).toBe(true)
    })

    it('should return false for user without role', () => {
      const mockUser = {
        id: '1',
        roles: ['user']
      }
      
      vi.mock('#app', () => ({
        useState: () => ref(mockUser)
      }))
      
      const { hasRole } = useAuth()
      expect(hasRole('admin')).toBe(false)
    })
  })
}) 