<script setup lang="ts">
import type { Post } from '~/types'
import { validateSearchQuery, sanitizeSearchQuery } from '~/utils/validation'

const route = useRoute()
const searchQuery = ref('')
const searchResults = ref<Post[]>([])
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const totalResults = ref(0)

// SEO optimization
useHead(() => ({
  title: searchQuery.value ? `جستجو: ${searchQuery.value} - دیجی‌فاین` : 'جستجو - دیجی‌فاین',
  meta: [
    { 
      name: 'description', 
      content: searchQuery.value ? `نتایج جستجو برای ${searchQuery.value} در دیجی‌فاین` : 'جستجو در مقالات دیجی‌فاین' 
    }
  ]
}))

onMounted(() => {
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    performSearch(query)
  }
})

const performSearch = async (query: string) => {
  // Validate search query
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    searchError.value = validation.errors.join(', ')
    return
  }

  isSearching.value = true
  searchError.value = null
  
  try {
    const sanitizedQuery = sanitizeSearchQuery(query)
    
    // Fetch search results from API
    const { data, error } = await useFetch('/api/search', {
      method: 'POST',
      body: {
        query: sanitizedQuery,
        page: 1,
        limit: 20
      }
    })

    if (error.value) {
      throw new Error(error.value.message || 'خطا در جستجو')
    }

    if (data.value && typeof data.value === 'object') {
      searchResults.value = (data.value as any).results || []
      totalResults.value = (data.value as any).total || 0
    }
  } catch (err) {
    console.error('Search error:', err)
    searchError.value = err instanceof Error ? err.message : 'خطا در جستجو'
    searchResults.value = []
    totalResults.value = 0
  } finally {
    isSearching.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

// Watch for route changes to update search
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery as string
    performSearch(newQuery as string)
  }
})

// Breadcrumb navigation
const breadcrumbs = computed(() => [
  { name: 'خانه', path: '/' },
  { name: 'جستجو', path: '/search' }
])
</script>

<template>
  <div class="search-page">
    <section class="search-title-section">
      <h1 class="search-title">
        جستجو
      </h1>
      <p class="search-description">
        مقالات و اخبار تکنولوژی را جستجو کنید
      </p>
    </section>

    <!-- Breadcrumb -->
    <nav
      class="breadcrumb-digifynn"
      aria-label="مسیر ناوبری"
    >
      <div class="breadcrumb-container">
        <template
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
        >
          <NuxtLink 
            :to="crumb.path"
            class="breadcrumb-item breadcrumb-link"
          >
            {{ crumb.name }}
          </NuxtLink>
          <span 
            v-if="index < breadcrumbs.length - 1"
            class="breadcrumb-separator"
          >
            ›
          </span>
        </template>
      </div>
    </nav>

    <!-- Search Form -->
    <form
      class="search-form"
      @submit.prevent="handleSearch"
    >
      <div class="search-input-container">
        <input 
          v-model="searchQuery" 
          type="text"
          placeholder="جستجو در مقالات..." 
          class="search-input"
          aria-label="عبارت جستجو"
          @keydown="handleKeydown"
        >
        <button
          type="submit"
          class="search-button"
          aria-label="جستجو"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              d="M18.449 16.751l-4.586-4.586a7.222 7.222 0 1 0-1.7 1.7l4.586 4.586zM2.4 8A5.6 5.6 0 1 1 8 13.6 5.6 5.6 0 0 1 2.4 8z"
              transform="translate(2 2)"
            />
          </svg>
        </button>
      </div>
    </form>

    <!-- Loading State -->
    <div
      v-if="isSearching"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p>در حال جستجو...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="searchError"
      class="error-container"
    >
      <div class="error-icon">
        ⚠️
      </div>
      <h2>خطا در جستجو</h2>
      <p>{{ searchError }}</p>
    </div>

    <!-- Search Results -->
    <div
      v-else-if="searchQuery && !isSearching"
      class="search-results"
    >
      <div class="results-header">
        <h2>نتایج جستجو</h2>
        <p v-if="totalResults > 0">
          {{ totalResults }} نتیجه برای "{{ searchQuery }}"
        </p>
        <p v-else>
          هیچ نتیجه‌ای برای "{{ searchQuery }}" یافت نشد
        </p>
      </div>

      <!-- Results List -->
      <div
        v-if="searchResults.length > 0"
        class="results-list"
      >
        <article 
          v-for="post in searchResults" 
          :key="post.id" 
          class="result-item"
        >
          <NuxtLink
            :to="`/blog/${post.slug}`"
            class="result-link"
          >
            <h3
              class="result-title"
              v-text="post.title"
            />
            <div
              v-if="post.excerpt"
              class="result-excerpt"
              v-text="post.excerpt"
            />
            <div class="result-meta">
              <span
                v-if="post.date"
                class="result-date"
              >{{ new Date(post.date).toLocaleDateString('fa-IR') }}</span>
              <span
                v-if="post.author?.node?.name"
                class="result-author"
              >{{ post.author.node.name }}</span>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- No Results -->
      <div
        v-else
        class="no-results"
      >
        <div class="no-results-icon">
          🔍
        </div>
        <h3>نتیجه‌ای یافت نشد</h3>
        <p>سعی کنید عبارت دیگری جستجو کنید</p>
      </div>
    </div>

    <!-- Initial State -->
    <div
      v-else
      class="initial-state"
    >
      <div class="initial-icon">
        🔍
      </div>
      <h3>جستجو در مقالات</h3>
      <p>عبارت مورد نظر خود را وارد کنید</p>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl;
}

.search-title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.search-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0c0c0c;
  margin-bottom: 0.5rem;
}

.search-description {
  font-size: 1.1rem;
  color: #666;
}

.search-form {
  margin-bottom: 2rem;
}

.search-input-container {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background-color: #E4002B;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: #c30000;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E4002B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  text-align: center;
  padding: 4rem 0;
  color: #d32f2f;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Search Results */
.search-results {
  margin-top: 2rem;
}

.results-header {
  margin-bottom: 2rem;
  text-align: center;
}

.results-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c0c0c;
  margin-bottom: 0.5rem;
}

.results-header p {
  color: #666;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.result-link {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0c0c0c;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.result-excerpt {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Initial State */
.initial-state {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.initial-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Breadcrumb */
.breadcrumb-digifynn {
  background: #f8f9fa;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e8eaed;
}

.breadcrumb-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: #5f6368;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #E4002B;
}

.breadcrumb-separator {
  color: #9aa0a6;
  margin: 0 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .search-page {
    padding: 1rem;
  }
  
  .search-title {
    font-size: 2rem;
  }
  
  .search-input-container {
    flex-direction: column;
  }
  
  .search-input {
    border-radius: 8px 8px 0 0;
  }
  
  .search-button {
    border-radius: 0 0 8px 8px;
  }
}
</style> 