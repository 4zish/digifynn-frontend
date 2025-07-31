<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const isSearchOpen = ref(false)
const isMobileMenuOpen = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
    searchQuery.value = ''
    isSearchOpen.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  } else if (event.key === 'Escape') {
    isSearchOpen.value = false
    searchQuery.value = ''
  }
}

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    nextTick(() => {
      const searchInput = document.getElementById('search-input')
      searchInput?.focus()
    })
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Categories from Digiato
const categories = [
  { name: 'تکنولوژی', href: '/category/technology' },
  { name: 'خودرو', href: '/category/automotive' },
  { name: 'نقد و بررسی', href: '/category/reviews' },
  { name: 'ویدیو', href: '/category/video' },
  { name: 'آموزش', href: '/category/tutorial' },
  { name: 'راهنمای خرید', href: '/category/buying-guide' }
]
</script>

<template>
  <header class="digiato-header">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="container">
        <div class="top-bar-content">
          <div class="logo-section">
            <NuxtLink to="/" class="logo">
              <span class="logo-text">دیجی‌فاین</span>
            </NuxtLink>
          </div>
          
          <div class="search-section">
            <div class="search-container">
              <input
                id="search-input"
                v-model="searchQuery"
                type="text"
                placeholder="جستجو در سایت..."
                class="search-input"
                @keydown="handleKeydown"
              />
              <button 
                class="search-button"
                @click="handleSearch"
                aria-label="جستجو"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="mobile-menu-toggle">
            <button 
              class="mobile-menu-button"
              @click="toggleMobileMenu"
              aria-label="منوی موبایل"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="main-navigation">
      <div class="container">
        <div class="nav-content">
          <ul class="nav-menu">
            <li v-for="category in categories" :key="category.name" class="nav-item">
              <NuxtLink :to="category.href" class="nav-link">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-content">
        <div class="mobile-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="جستجو در سایت..."
            class="mobile-search-input"
            @keydown="handleKeydown"
          />
          <button 
            class="mobile-search-button"
            @click="handleSearch"
          >
            جستجو
          </button>
        </div>
        
        <ul class="mobile-nav-menu">
          <li v-for="category in categories" :key="category.name" class="mobile-nav-item">
            <NuxtLink 
              :to="category.href" 
              class="mobile-nav-link"
              @click="isMobileMenuOpen = false"
            >
              {{ category.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped>
.digiato-header {
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 12px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  flex-shrink: 0;
}

.logo {
  text-decoration: none;
  color: #ffffff;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #ff4444;
}

.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #555;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background-color: #ff4444;
  border: none;
  padding: 12px 16px;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: #e63939;
}

.mobile-menu-toggle {
  display: none;
}

.main-navigation {
  background-color: #222;
  padding: 0;
}

.nav-content {
  display: flex;
  align-items: center;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
}

.nav-item {
  flex: 1;
}

.nav-link {
  display: block;
  padding: 16px 20px;
  color: #ffffff;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.nav-link:hover {
  background-color: #333;
  color: #ff4444;
  border-bottom-color: #ff4444;
}

.nav-link.router-link-active {
  color: #ff4444;
  border-bottom-color: #ff4444;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1001;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
}

.mobile-menu-content {
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.mobile-search {
  margin-bottom: 24px;
}

.mobile-search-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 12px;
}

.mobile-search-input::placeholder {
  color: #999;
}

.mobile-search-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #ff4444;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.mobile-nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  border-bottom: 1px solid #333;
}

.mobile-nav-item:last-child {
  border-bottom: none;
}

.mobile-nav-link {
  display: block;
  padding: 16px 0;
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s;
}

.mobile-nav-link:hover {
  color: #ff4444;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-section {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .nav-menu {
    display: none;
  }
  
  .top-bar-content {
    gap: 16px;
  }
  
  .logo-text {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .mobile-menu-content {
    width: 95%;
    padding: 20px;
  }
}

/* Animation for mobile menu */
.mobile-menu {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>