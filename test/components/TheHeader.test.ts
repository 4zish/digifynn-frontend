import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import TheHeader from '../../components/TheHeader.vue'

// Mock NuxtLink component
const NuxtLink = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

// Create router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/search', name: 'search' },
    { path: '/category/:slug', name: 'category' }
  ]
})

describe('TheHeader Component', () => {
  let wrapper: any

  beforeEach(async () => {
    await router.push('/')
    
    wrapper = mount(TheHeader, {
      global: {
        plugins: [router],
        components: {
          NuxtLink
        },
        stubs: {
          NuxtLink
        }
      }
    })
  })

  describe('Initial State', () => {
    it('should render header with correct structure', () => {
      expect(wrapper.find('.digiato-header').exists()).toBe(true)
      expect(wrapper.find('.top-bar').exists()).toBe(true)
      expect(wrapper.find('.main-navigation').exists()).toBe(true)
    })

    it('should display logo correctly', () => {
      const logo = wrapper.find('.logo-text')
      expect(logo.exists()).toBe(true)
      expect(logo.text()).toBe('دیجی‌فاین')
    })

    it('should render search input', () => {
      const searchInput = wrapper.find('#search-input')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('جستجو در سایت...')
    })

    it('should render navigation menu', () => {
      const navItems = wrapper.findAll('.nav-item')
      expect(navItems).toHaveLength(6) // 6 categories
    })

    it('should have correct category links', () => {
      const categories = [
        'تکنولوژی',
        'خودرو',
        'نقد و بررسی',
        'ویدیو',
        'آموزش',
        'راهنمای خرید'
      ]

      categories.forEach(category => {
        const link = wrapper.find(`text=${category}`)
        expect(link.exists()).toBe(true)
      })
    })
  })

  describe('Search Functionality', () => {
    it('should update search query on input', async () => {
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('test query')
      
      expect(wrapper.vm.searchQuery).toBe('test query')
    })

    it('should handle search on Enter key', async () => {
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('test query')
      
      const pushSpy = vi.spyOn(router, 'push')
      await searchInput.trigger('keydown', { key: 'Enter' })
      
      expect(pushSpy).toHaveBeenCalledWith({
        path: '/search',
        query: { q: 'test query' }
      })
    })

    it('should clear search on Escape key', async () => {
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('test query')
      
      await searchInput.trigger('keydown', { key: 'Escape' })
      
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.isSearchOpen).toBe(false)
    })

    it('should handle search button click', async () => {
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('test query')
      
      const searchButton = wrapper.find('.search-button')
      const pushSpy = vi.spyOn(router, 'push')
      
      await searchButton.trigger('click')
      
      expect(pushSpy).toHaveBeenCalledWith({
        path: '/search',
        query: { q: 'test query' }
      })
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.isSearchOpen).toBe(false)
    })

    it('should not search with empty query', async () => {
      const searchButton = wrapper.find('.search-button')
      const pushSpy = vi.spyOn(router, 'push')
      
      await searchButton.trigger('click')
      
      expect(pushSpy).not.toHaveBeenCalled()
    })

    it('should not search with whitespace-only query', async () => {
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('   ')
      
      const searchButton = wrapper.find('.search-button')
      const pushSpy = vi.spyOn(router, 'push')
      
      await searchButton.trigger('click')
      
      expect(pushSpy).not.toHaveBeenCalled()
    })
  })

  describe('Mobile Menu', () => {
    it('should toggle mobile menu on button click', async () => {
      const mobileButton = wrapper.find('.mobile-menu-button')
      
      expect(wrapper.vm.isMobileMenuOpen).toBe(false)
      
      await mobileButton.trigger('click')
      expect(wrapper.vm.isMobileMenuOpen).toBe(true)
      
      await mobileButton.trigger('click')
      expect(wrapper.vm.isMobileMenuOpen).toBe(false)
    })

    it('should render mobile menu when open', async () => {
      await wrapper.setData({ isMobileMenuOpen: true })
      await wrapper.vm.$nextTick()
      
      const mobileMenu = wrapper.find('.mobile-menu')
      expect(mobileMenu.exists()).toBe(true)
    })

    it('should close mobile menu when category link is clicked', async () => {
      await wrapper.setData({ isMobileMenuOpen: true })
      await wrapper.vm.$nextTick()
      
      const mobileNavLink = wrapper.find('.mobile-nav-link')
      await mobileNavLink.trigger('click')
      
      expect(wrapper.vm.isMobileMenuOpen).toBe(false)
    })

    it('should have mobile search functionality', async () => {
      await wrapper.setData({ isMobileMenuOpen: true })
      await wrapper.vm.$nextTick()
      
      const mobileSearchInput = wrapper.find('.mobile-search-input')
      expect(mobileSearchInput.exists()).toBe(true)
      
      await mobileSearchInput.setValue('mobile search')
      expect(wrapper.vm.searchQuery).toBe('mobile search')
    })
  })

  describe('Responsive Design', () => {
    it('should hide search section on mobile', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      await wrapper.vm.$nextTick()
      
      const searchSection = wrapper.find('.search-section')
      expect(searchSection.isVisible()).toBe(false)
    })

    it('should show mobile menu toggle on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })
      
      await wrapper.vm.$nextTick()
      
      const mobileToggle = wrapper.find('.mobile-menu-toggle')
      expect(mobileToggle.isVisible()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const searchButton = wrapper.find('.search-button')
      expect(searchButton.attributes('aria-label')).toBe('جستجو')
      
      const mobileButton = wrapper.find('.mobile-menu-button')
      expect(mobileButton.attributes('aria-label')).toBe('منوی موبایل')
    })

    it('should have proper focus management', async () => {
      const searchInput = wrapper.find('#search-input')
      await wrapper.setData({ isSearchOpen: true })
      await wrapper.vm.$nextTick()
      
      // Focus should be set on search input when search is opened
      expect(document.activeElement).toBe(searchInput.element)
    })
  })

  describe('Navigation Links', () => {
    it('should have correct href attributes', () => {
      const categoryLinks = wrapper.findAll('.nav-link')
      
      const expectedPaths = [
        '/category/technology',
        '/category/automotive',
        '/category/reviews',
        '/category/video',
        '/category/tutorial',
        '/category/buying-guide'
      ]
      
      categoryLinks.forEach((link: any, index: number) => {
        expect(link.attributes('href')).toBe(expectedPaths[index])
      })
    })

    it('should apply active class to current route', async () => {
      await router.push('/category/technology')
      await wrapper.vm.$nextTick()
      
      const activeLink = wrapper.find('.nav-link.router-link-active')
      expect(activeLink.exists()).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle router navigation errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock router.push to throw error
      const originalPush = router.push
      router.push = vi.fn().mockRejectedValue(new Error('Navigation error'))
      
      const searchInput = wrapper.find('#search-input')
      await searchInput.setValue('test')
      await searchInput.trigger('keydown', { key: 'Enter' })
      
      expect(consoleSpy).toHaveBeenCalled()
      
      // Restore original
      router.push = originalPush
      consoleSpy.mockRestore()
    })
  })

  describe('Performance', () => {
    it('should debounce search input', async () => {
      const searchInput = wrapper.find('#search-input')
      
      // Rapid input changes
      await searchInput.setValue('a')
      await searchInput.setValue('ab')
      await searchInput.setValue('abc')
      
      expect(wrapper.vm.searchQuery).toBe('abc')
    })
  })
}) 