<script setup lang="ts">
import { usePosts } from '../../../composables/usePosts'
import { useDateFormatter } from '../../../composables/useDateFormatter'

const { fetchPosts } = usePosts()
const { formatDate } = useDateFormatter()

const { data, pending, error, refresh } = await fetchPosts()

// SEO optimization
useHead({
  title: 'وبلاگ - دیجی‌فاین',
  meta: [
    { name: 'description', content: 'آخرین مقالات و اخبار تکنولوژی از دیجی‌فاین' },
    { property: 'og:title', content: 'وبلاگ - دیجی‌فاین' },
    { property: 'og:description', content: 'آخرین مقالات و اخبار تکنولوژی از دیجی‌فاین' }
  ]
})

// Breadcrumb navigation
const breadcrumbs = computed(() => [
  { name: 'خانه', path: '/' },
  { name: 'وبلاگ', path: '/blog' }
])
</script>

<template>
  <div class="blog-container">
    <!-- Page Title Section -->
    <section class="page-title-section">
      <div class="title-content">
        <h1 class="page-title">وبلاگ دیجی‌فاین</h1>
        <p class="page-description">آخرین اخبار و مقالات تکنولوژی</p>
      </div>
    </section>

    <!-- Breadcrumb -->
    <nav class="breadcrumb-digifynn" aria-label="مسیر ناوبری">
      <div class="breadcrumb-container">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
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

    <!-- Loading State -->
    <div
      v-if="pending"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p>در حال بارگذاری مقالات...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <div class="error-icon">
        ⚠️
      </div>
      <h2>خطا در بارگذاری مقالات</h2>
      <p>{{ error.message || 'متأسفانه مشکلی در بارگذاری مقالات پیش آمده است.' }}</p>
      <button
        class="retry-button"
        @click="() => refresh()"
      >
        تلاش مجدد
      </button>
    </div>

    <!-- Posts List -->
    <section
      v-else-if="data?.posts?.nodes?.length"
      class="posts-section"
    >
      <div class="posts-grid">
        <article 
          v-for="post in data.posts.nodes" 
          :key="post.id" 
          class="post-card"
        >
          <NuxtLink
            :to="`/blog/${post.slug}`"
            class="post-link"
          >
            <!-- Post Image from WordPress Featured Image -->
            <div class="post-image">
              <div v-if="post.featuredImage?.node?.sourceUrl" class="post-featured-image">
                <img
                  :src="post.featuredImage.node.sourceUrl"
                  :alt="post.featuredImage.node.altText || post.title"
                  loading="lazy"
                  class="featured-img"
                />
              </div>
              <div v-else class="image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#E4002B"/>
                </svg>
              </div>
            </div>

            <!-- Post Content -->
            <div class="post-content">
              <!-- Categories -->
              <div
                v-if="post.categories?.nodes?.length"
                class="post-categories"
              >
                <span 
                  v-for="category in post.categories.nodes.slice(0, 2)" 
                  :key="category.slug" 
                  class="category-tag"
                >
                  {{ category.name }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="post-title">
                {{ post.title }}
              </h2>

              <!-- Excerpt -->
              <div
                v-if="post.excerpt"
                class="post-excerpt"
              >
                {{ post.excerpt }}
              </div>

              <!-- Meta Information -->
              <div class="post-meta">
                <div class="meta-item">
                  <span class="meta-label">نویسنده:</span>
                  <span class="meta-value">{{ post.author?.node?.name || 'دیجی‌فاین' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">تاریخ:</span>
                  <span class="meta-value">{{ formatDate(post.date) }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- Empty State -->
    <div
      v-else
      class="empty-container"
    >
      <div class="empty-icon">
        📝
      </div>
      <h2>هیچ مقاله‌ای یافت نشد</h2>
      <p>در حال حاضر مقاله‌ای برای نمایش وجود ندارد.</p>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl;
}

/* Page Title Section */
.page-title-section {
  background: linear-gradient(135deg, #1C1F22 0%, #2C3E50 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.title-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: #E8E2D8;
}

.page-description {
  font-size: 1.1rem;
  color: #B8B8B8;
  font-weight: 400;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 0;
  max-width: 1200px;
  margin: 0 auto;
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
  max-width: 1200px;
  margin: 0 auto;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: #E4002B;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #c30000;
}

/* Posts Section */
.posts-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.post-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.post-image {
  height: 200px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e9ecef;
}

.post-featured-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .featured-img {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.post-content {
  padding: 1.5rem;
}

.post-categories {
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag {
  background-color: #E4002B;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1C1F22;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.meta-label {
  font-weight: 600;
  color: #495057;
}

.meta-value {
  color: #6c757d;
}

/* Empty State */
.empty-container {
  text-align: center;
  padding: 4rem 0;
  color: #6c757d;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-icon {
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
  .page-title-section {
    padding: 2rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .post-content {
    padding: 1rem;
  }
  
  .post-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
}
</style>