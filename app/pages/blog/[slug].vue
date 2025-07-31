<script setup lang="ts">
import { usePosts } from '../../../composables/usePosts'
import { useDateFormatter } from '../../../composables/useDateFormatter'
import { sanitizeHtml } from '../../../utils/validation'
import type { PostsResponse } from '../../../types'

const route = useRoute()
const slug = route.params.slug as string

const { fetchPostBySlug, calculateReadingTime, fetchRelatedPosts } = usePosts()
const { formatDate, formatTime } = useDateFormatter()

const { data, pending, error, refresh } = await fetchPostBySlug(slug)

// Get related posts - only if post ID is available
const relatedPosts = ref<PostsResponse | null>(null)
if (data.value?.post?.id) {
  const { data: relatedData } = await fetchRelatedPosts(data.value.post.id, 3)
  relatedPosts.value = relatedData.value
}

// Calculate reading time
const readingTime = computed(() => 
  data.value?.post?.content ? calculateReadingTime(data.value.post.content) : 0
)

// Social interaction states
const isLiked = ref(false)
const isBookmarked = ref(false)
const likesCount = ref(Math.floor(Math.random() * 100) + 10) // Mock data
const showCommentBox = ref(false)
const newComment = ref('')

// Mock hot content
const hotContent = ref([
  { title: 'بهترین گوشی‌های 2025', views: '15.2K' },
  { title: 'نقد و بررسی لپ‌تاپ جدید اپل', views: '12.8K' },
  { title: 'آیفون 16 پرو مکس در برابر گلکسی S25', views: '11.4K' },
  { title: 'راهنمای خرید هدفون بی‌سیم', views: '9.7K' },
])

// Social actions
const toggleLike = () => {
  isLiked.value = !isLiked.value
  likesCount.value += isLiked.value ? 1 : -1
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const submitComment = () => {
  if (newComment.value.trim()) {
    // Handle comment submission
    console.log('Comment submitted:', newComment.value)
    newComment.value = ''
    showCommentBox.value = false
  }
}

// SEO optimization
useHead(() => ({
  title: data.value?.post?.title ? `${data.value.post.title} - دیجی‌فاین` : 'مقاله - دیجی‌فاین',
  meta: [
    { 
      name: 'description', 
      content: data.value?.post?.excerpt || 'مقاله از دیجی‌فاین' 
    },
    { 
      property: 'og:title', 
      content: data.value?.post?.title || 'مقاله - دیجی‌فاین' 
    },
    { 
      property: 'og:description', 
      content: data.value?.post?.excerpt || 'مقاله از دیجی‌فاین' 
    },
    { 
      property: 'og:type', 
      content: 'article' 
    },
    { 
      property: 'article:published_time', 
      content: data.value?.post?.date || '' 
    },
    { 
      property: 'article:author', 
      content: data.value?.post?.author?.node?.name || '' 
    }
  ]
}))

// Breadcrumb navigation
const breadcrumbs = computed(() => [
  { name: 'خانه', path: '/' },
  { name: 'وبلاگ', path: '/blog' },
  { name: data.value?.post?.title || 'مقاله', path: route.path }
])
</script>

<template>
  <div class="blog-post-container">
    <!-- Loading State -->
    <div
      v-if="pending"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p>در حال بارگذاری مقاله...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <div class="error-icon">⚠️</div>
      <h2>خطا در بارگذاری مقاله</h2>
      <p>{{ error.message || 'متأسفانه مشکلی در بارگذاری مقاله پیش آمده است.' }}</p>
      <div class="error-actions">
        <button class="retry-button" @click="() => refresh()">تلاش مجدد</button>
        <NuxtLink to="/blog" class="back-button">بازگشت به وبلاگ</NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="data?.post" class="digifynn-layout">


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

      <div class="content-layout">
        <!-- Main Article -->
        <article class="blog-post">
        <!-- Category Path (WordPress dynamic) -->
        <div v-if="data.post.categories?.nodes?.length" class="category-path-digifynn">
          {{ data.post.categories.nodes.map(cat => cat.name).join('') }}
        </div>
        
        <!-- Title -->
        <h1 class="post-title">{{ data.post.title }}</h1>
        
        <!-- Meta Information (Dynamic from WordPress) -->
        <div class="post-meta-digifynn">
          {{ formatDate(data.post.date) }} - {{ formatTime(data.post.date) }}مطالعه {{ readingTime }} دقیقه
            </div>
        
        <!-- Author Section -->
        <div v-if="data.post.author?.node?.name" class="author-section-digifynn">
          <span class="author-name">{{ data.post.author.node.name }}</span>
          <button class="follow-button-digifynn">دنبال کردن</button>
            </div>
      
      <!-- Article Content -->
          <div class="post-content">
            <!-- WordPress Dynamic Content -->
            <div class="wordpress-content" v-html="sanitizeHtml(data.post.content)" />
            
            <!-- Advertisement in content -->
            <div class="content-ad">
              <span>تبلیغات</span>
            </div>
      </div>
      
          <!-- Social Actions -->
          <div class="social-actions">
            <button :class="['action-button', { active: isLiked }]" @click="toggleLike">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              لایک
              <span class="count">{{ likesCount }}</span>
              </button>
            
            <button class="action-button" @click="showCommentBox = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              نظرت چیه؟ارسال نظر
              </button>
            
            <button :class="['action-button', { active: isBookmarked }]" @click="toggleBookmark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              بوکمارک
              </button>
            
            <button class="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              اشتراک‌گذاری
              </button>
            </div>

          <!-- Comment Input -->
          <div v-if="showCommentBox" class="comment-input-section">
            <textarea
              v-model="newComment"
              placeholder="نظر خود را بنویسید..."
              class="comment-textarea"
            />
            <div class="comment-actions">
              <button @click="submitComment" class="submit-comment">ارسال نظر</button>
              <button @click="showCommentBox = false" class="cancel-comment">لغو</button>
            </div>
          </div>
          
          <!-- Comments Section -->
          <div class="comments-section">
            <h3 class="comments-title">نظرات</h3>
            <div class="comments-placeholder">
              <p>تبلیغات</p>
          </div>
            <div class="comments-list">
              <!-- Comments would be displayed here -->
              <p class="no-comments">هنوز نظری ثبت نشده است.</p>
        </div>
          </div>
          
                    <!-- Related Articles (WordPress dynamic) -->
          <div v-if="relatedPosts?.posts?.nodes?.length" class="related-articles-digifynn">
            <h3>مقاله‌های مرتبط</h3>
            <ul class="related-list">
              <li v-for="post in relatedPosts.posts.nodes" :key="post.id" class="related-item">
                <NuxtLink :to="`/blog/${post.slug}`" class="related-link-digifynn">
                  {{ post.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          
          <!-- Article Footer (digifynn style) -->
          <div class="article-footer-digifynn">
            <p class="footer-question">مقاله رو دوست داشتی؟</p>
            <div class="footer-actions">
              <button :class="['footer-action-btn', { active: isLiked }]" @click="toggleLike">لایک</button>
              <span class="footer-text">نظرت چیه؟</span>
              <button @click="showCommentBox = true" class="footer-action-btn">ارسال نظر</button>
              <button :class="['footer-action-btn', { active: isBookmarked }]" @click="toggleBookmark">بوکمارک</button>
              <span class="footer-text">اشتراک‌گذاری</span>
          </div>
        </div>
    </article>

        <!-- Sidebar -->
        <aside class="sidebar">
          <!-- All Videos Link -->
          <div class="sidebar-section">
            <a href="#" class="view-all-videos">مشاهده همه ویدئو‌ها</a>
      </div>

          <!-- Advertisement -->
          <div class="sidebar-section ad-section">
            <div class="ad-placeholder">
              <span>تبلیغات</span>
            </div>
          </div>

          <!-- Hot Content -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">داغ‌ترین مطالب روز</h3>
            <div class="hot-content">
              <div class="ad-placeholder-small">
                <span>تبلیغات</span>
              </div>
            </div>
          </div>

          <!-- Study Lists Section -->
          <div class="sidebar-section">
            <a href="#" class="study-lists-link">مشاهده تمامی لیست‌های مطالعاتی</a>
          </div>

          <!-- Media Play Section -->
          <div class="sidebar-section">
            <div class="media-section">
              <span>پخش از رسانه</span>
            </div>
          </div>

          <!-- Product Recommendations -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">با چشم باز خرید کنید</h3>
            <p class="sidebar-subtitle">دیجی‌فاین شما را برای انتخاب بهتر و خرید ارزان‌تر راهنمایی می‌کند</p>
            <a href="#" class="products-entry-link">ورود به بخش محصولات</a>
            
            <div class="product-categories">
              <a href="#" class="product-link">گوشی</a>
              <a href="#" class="product-link">تبلت</a>
              <a href="#" class="product-link">لپ‌تاپ</a>
              <a href="#" class="product-link">تلویزیون</a>
              <a href="#" class="product-link">ساعت هوشمند</a>
              <a href="#" class="product-link">هدفون</a>
              <a href="#" class="product-link">هارد</a>
              <a href="#" class="product-link">کنسول بازی</a>
              <a href="#" class="product-link">کارت گرافیک</a>
              <a href="#" class="product-link">پردازنده</a>
              <a href="#" class="product-link">مانیتور</a>
              <a href="#" class="product-link">SSD</a>
              <a href="#" class="product-link">دوربین‌</a>
              <a href="#" class="product-link">پاوربانک</a>
              <a href="#" class="product-link">شارژر</a>
              <a href="#" class="product-link">اسپیکر</a>
            </div>
          </div>
        </aside>
      </div>

      <!-- digifynn Footer -->
      <footer class="digifynn-footer">
        <div class="footer-container">
          <!-- Main Footer Content -->
          <div class="footer-main">
            <div class="footer-section">
              <h4 class="footer-title">با چشم باز خرید کنید</h4>
              <p class="footer-subtitle">دیجی‌فاین شما را برای انتخاب بهتر و خرید ارزان‌تر راهنمایی می‌کند</p>
              <a href="#" class="footer-link-primary">ورود به بخش محصولات</a>
              
              <div class="product-grid-footer">
                <a href="#" class="product-link-footer">گوشی</a>
                <a href="#" class="product-link-footer">تبلت</a>
                <a href="#" class="product-link-footer">لپ‌تاپ</a>
                <a href="#" class="product-link-footer">تلویزیون</a>
                <a href="#" class="product-link-footer">ساعت هوشمند</a>
                <a href="#" class="product-link-footer">هدفون</a>
                <a href="#" class="product-link-footer">هارد</a>
                <a href="#" class="product-link-footer">کنسول بازی</a>
                <a href="#" class="product-link-footer">کارت گرافیک</a>
                <a href="#" class="product-link-footer">پردازنده</a>
                <a href="#" class="product-link-footer">مانیتور</a>
                <a href="#" class="product-link-footer">SSD</a>
                <a href="#" class="product-link-footer">دوربین‌</a>
                <a href="#" class="product-link-footer">پاوربانک</a>
                <a href="#" class="product-link-footer">شارژر</a>
                <a href="#" class="product-link-footer">اسپیکر</a>
              </div>
            </div>
          </div>

          <!-- Footer Links -->
          <div class="footer-links">
            <div class="footer-links-section">
              <a href="#" class="footer-link">مرور تمامی مطالب</a>
              <a href="#" class="footer-link">تبلیغات در دیجی‌فاین</a>
              <a href="#" class="footer-link">تماس با ما</a>
              <a href="#" class="footer-link">درباره ما</a>
            </div>

            <div class="footer-supporters">
              <h5>حامیان دیجی‌فاین</h5>
              <a href="#" class="supporter-link">پارس پک | میزبانی و پشتیبانی</a>
              <a href="#" class="supporter-link">وب رخ | حس خوب پیکسل‌ها</a>
              <a href="#" class="supporter-link">TheForge | هسته قدرتمند دیجی‌فاین</a>
            </div>

            <div class="footer-family">
              <h5>خانواده ما</h5>
              <!-- Family links would go here -->
            </div>
          </div>

          <!-- Copyright -->
          <div class="footer-copyright">
            <p>© 1404 - 1389 کپی بخش یا کل هر کدام از مطالب دیجی‌فاین تنها با کسب مجوز مکتوب امکان پذیر است</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-container">
      <div class="not-found-icon">📄</div>
      <h2>مقاله یافت نشد</h2>
      <p>متأسفانه مقاله مورد نظر یافت نشد.</p>
      <NuxtLink to="/blog" class="back-button">بازگشت به وبلاگ</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.blog-post-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl;
}

/* Loading & Error States */
.loading-container, .error-container, .not-found-container {
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

.error-icon, .not-found-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.retry-button, .back-button {
  background-color: #E4002B;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
}

.retry-button:hover, .back-button:hover {
  background-color: #c30000;
}

/* digifynn Layout */
.digifynn-layout {
  background: white;
}



/* digifynn Breadcrumb */
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

/* Main Layout */
.content-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 1rem;
  padding: 0.75rem 0;
}

.breadcrumb ol {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.breadcrumb li:not(:last-child)::after {
  content: '›';
  margin-right: 0.5rem;
  color: #999;
}

.breadcrumb-link {
  color: #E4002B;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #666;
  font-weight: 500;
}

/* Remove duplicate content-layout rule since it's now above */

/* Main Article */
.blog-post {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}



/* Category Path (digifynn exact format - concatenated) */
.category-path-digifynn {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #5f6368;
  /* Concatenated text with no separators */
}

/* Title */
.post-title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.4;
  color: #202124;
  margin-bottom: 0.75rem;
  font-family: 'Vazirmatn', sans-serif;
}

/* Meta Information (digifynn exact format - one string) */
.post-meta-digifynn {
  font-size: 0.875rem;
  color: #5f6368;
  margin-bottom: 0.75rem;
  /* Single continuous string, no separate elements */
}

/* Author Section (digifynn style) */
.author-section-digifynn {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8eaed;
}

.author-name {
  font-weight: 600;
  color: #202124;
  font-size: 0.9rem;
}

.follow-button-digifynn {
  background: transparent;
  border: 1px solid #dadce0;
  color: #1a73e8;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}

.follow-button-digifynn:hover {
  background-color: #f8f9fa;
}

/* Article Content */
.post-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #3c4043;
  margin-bottom: 2rem;
}

/* Content Image Section */
.content-image-section {
  margin: 2rem 0;
}

.image-grid {
  text-align: center;
}

.content-image {
  margin-bottom: 1rem;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
}

.image-placeholder svg {
  max-width: 100%;
  height: auto;
  display: block;
}

.image-caption {
  font-size: 0.875rem;
  color: #5f6368;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Content Advertisement */
.content-ad {
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  text-align: center;
  color: #9aa0a6;
  font-size: 0.875rem;
}

/* WordPress Content Styling */
.wordpress-content {
  font-size: 1rem;
  line-height: 1.7;
  color: #3c4043;
}

.wordpress-content :deep(p) {
  margin-bottom: 1.5rem;
  text-align: justify;
}

.wordpress-content :deep(h2),
.wordpress-content :deep(h3),
.wordpress-content :deep(h4) {
  font-weight: 600;
  color: #202124;
  margin: 2rem 0 1rem 0;
  line-height: 1.4;
}

.wordpress-content :deep(h2) {
  font-size: 1.5rem;
}

.wordpress-content :deep(h3) {
  font-size: 1.25rem;
}

.wordpress-content :deep(h4) {
  font-size: 1.1rem;
}

.wordpress-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wordpress-content :deep(figure) {
  margin: 1.5rem 0;
  text-align: center;
}

.wordpress-content :deep(figcaption) {
  font-size: 0.875rem;
  color: #5f6368;
  margin-top: 0.5rem;
  font-style: italic;
}

.wordpress-content :deep(blockquote) {
  border-right: 3px solid #E4002B;
  padding-right: 1rem;
  margin: 1.5rem 0;
  color: #5f6368;
  font-style: italic;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

.wordpress-content :deep(ul),
.wordpress-content :deep(ol) {
  padding-right: 1.5rem;
  margin-bottom: 1.5rem;
}

.wordpress-content :deep(li) {
  margin-bottom: 0.5rem;
}

.wordpress-content :deep(a) {
  color: #1a73e8;
  text-decoration: none;
}

.wordpress-content :deep(a:hover) {
  text-decoration: underline;
}

.wordpress-content :deep(code) {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.wordpress-content :deep(pre) {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.wordpress-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.wordpress-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.wordpress-content :deep(th),
.wordpress-content :deep(td) {
  border: 1px solid #e8eaed;
  padding: 0.75rem;
  text-align: right;
}

.wordpress-content :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

/* Content Paragraphs (legacy) */
.content-paragraphs p {
  margin-bottom: 1.5rem;
  text-align: justify;
}

/* Comments Section */
.comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e8eaed;
}

.comments-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 1.5rem;
}

.comments-placeholder {
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #9aa0a6;
}

.comments-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.no-comments {
  color: #5f6368;
  font-style: italic;
  margin: 0;
}

.post-content :deep(p) {
  margin-bottom: 1rem;
}

.post-content :deep(h2),
.post-content :deep(h3) {
  font-weight: 600;
  color: #202124;
  margin: 1.5rem 0 1rem;
  line-height: 1.4;
}

.post-content :deep(h2) {
  font-size: 1.5rem;
}

.post-content :deep(h3) {
  font-size: 1.25rem;
}

.post-content :deep(a) {
  color: #1a73e8;
  text-decoration: none;
}

.post-content :deep(a:hover) {
  text-decoration: underline;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.post-content :deep(blockquote) {
  border-right: 3px solid #E4002B;
  padding-right: 1rem;
  margin: 1rem 0;
  color: #5f6368;
  font-style: italic;
}

/* Social Actions */
.social-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e8eaed;
  border-bottom: 1px solid #e8eaed;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #dadce0;
  color: #5f6368;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #f8f9fa;
}

.action-button.active {
  background-color: #e8f0fe;
  border-color: #1a73e8;
  color: #1a73e8;
}

.count {
  font-weight: 600;
}

/* Comment Input */
.comment-input-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.comment-actions {
  display: flex;
  gap: 0.75rem;
}

.submit-comment, .cancel-comment {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-comment {
  background-color: #1a73e8;
  color: white;
}

.submit-comment:hover {
  background-color: #1557b0;
}

.cancel-comment {
  background-color: #f8f9fa;
  color: #5f6368;
}

.cancel-comment:hover {
  background-color: #e8eaed;
}

/* Related Articles (digifynn format) */
.related-articles-digifynn {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e8eaed;
}

.related-articles-digifynn h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 1rem;
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-item {
  margin-bottom: 0.5rem;
  position: relative;
  padding-right: 1rem;
}

.related-item::before {
  content: '•';
  color: #E4002B;
  position: absolute;
  right: 0;
  font-weight: bold;
}

.related-link-digifynn {
  color: #1a73e8;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.4;
}

.related-link-digifynn:hover {
  text-decoration: underline;
}

/* Article Footer (digifynn style) */
.article-footer-digifynn {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e8eaed;
}

.footer-question {
  font-size: 1rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 1rem;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-action-btn {
  background: transparent;
  border: 1px solid #dadce0;
  color: #1a73e8;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}

.footer-action-btn:hover {
  background-color: #f8f9fa;
}

.footer-action-btn.active {
  background-color: #e8f0fe;
  border-color: #1a73e8;
}

.footer-text {
  color: #5f6368;
  font-size: 0.875rem;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 1rem;
  border-bottom: 2px solid #E4002B;
  padding-bottom: 0.5rem;
}

.sidebar-subtitle {
  font-size: 0.875rem;
  color: #5f6368;
  margin-bottom: 1rem;
  line-height: 1.4;
}

/* Sidebar Links */
.view-all-videos,
.study-lists-link,
.products-entry-link {
  display: block;
  color: #1a73e8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  padding: 0.75rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-all-videos:hover,
.study-lists-link:hover,
.products-entry-link:hover {
  background-color: #f8f9fa;
  text-decoration: underline;
}

/* Hot Content */
.hot-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ad-placeholder-small {
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  color: #9aa0a6;
  font-size: 0.8rem;
}

/* Media Section */
.media-section {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  color: #5f6368;
  font-size: 0.875rem;
}

/* Advertisement */
.ad-section {
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.ad-placeholder {
  color: #9aa0a6;
  font-size: 0.875rem;
}

/* Product Categories */
.product-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.product-link {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-decoration: none;
  color: #5f6368;
  font-size: 0.875rem;
  text-align: center;
  transition: background-color 0.2s;
}

.product-link:hover {
  background-color: #e8eaed;
  color: #202124;
}

/* digifynn Footer */
.digifynn-footer {
  background: #f8f9fa;
  margin-top: 3rem;
  padding: 2rem 0;
  border-top: 1px solid #e8eaed;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-main {
  margin-bottom: 2rem;
}

.footer-section {
  margin-bottom: 1.5rem;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #202124;
  margin-bottom: 0.5rem;
}

.footer-subtitle {
  color: #5f6368;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.footer-link-primary {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.footer-link-primary:hover {
  text-decoration: underline;
}

.product-grid-footer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.product-link-footer {
  color: #5f6368;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  text-align: center;
  transition: all 0.2s;
}

.product-link-footer:hover {
  background: #e8eaed;
  color: #202124;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-links-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: #5f6368;
  text-decoration: none;
  font-size: 0.875rem;
}

.footer-link:hover {
  color: #202124;
  text-decoration: underline;
}

.footer-supporters h5,
.footer-family h5 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #202124;
  margin-bottom: 0.75rem;
}

.supporter-link {
  color: #5f6368;
  text-decoration: none;
    font-size: 0.8rem;
  display: block;
  margin-bottom: 0.25rem;
}

.supporter-link:hover {
  color: #1a73e8;
  text-decoration: underline;
}

.footer-copyright {
  border-top: 1px solid #e8eaed;
  padding-top: 1rem;
  text-align: center;
}

.footer-copyright p {
  color: #9aa0a6;
  font-size: 0.8rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .sidebar {
    order: -1;
  }
  

}

@media (max-width: 768px) {
  .main-layout {
    padding: 0.5rem;
  }
  
  .blog-post {
    padding: 1.5rem;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
  
  .social-actions {
    flex-wrap: wrap;
  }
  
  .meta-primary {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .author-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .post-title {
    font-size: 1.25rem;
  }
  
  .action-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .product-categories {
    grid-template-columns: 1fr;
  }
}
</style>