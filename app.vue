<script setup lang="ts">
// Import composables and types
const { initAuth } = useAuth()
const { initAnalytics, trackPageView, trackSession, trackScrollDepth, trackTimeOnPage } = useAnalytics()

// Initialize authentication on app start
onMounted(async () => {
  // Initialize authentication
  await initAuth()
  
  // Initialize analytics
  initAnalytics()
  
  // Track initial session
  trackSession()
  
  // Set up scroll and time tracking
  const cleanupScrollDepth = trackScrollDepth()
  const cleanupTimeOnPage = trackTimeOnPage()
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanupScrollDepth?.()
    cleanupTimeOnPage?.()
  })
})

// Track page changes for analytics
const route = useRoute()
watch(() => route.path, (newPath) => {
  if (process.client) {
    nextTick(() => {
      trackPageView(newPath, document.title)
    })
  }
})

// Global meta configuration
useHead({
  htmlAttrs: {
    lang: 'fa',
    dir: 'rtl'
  },
  titleTemplate: '%s - دیجی‌فاین',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#E4002B' }
  ]
})
</script>

<template>
  <div
    id="app"
    class="app-container"
  >
    <!-- Error Boundary for the entire application -->
    <ErrorBoundary>
      <!-- Main Header -->
      <TheHeader />
      
      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Transition Wrapper -->
        <div class="page-wrapper">
          <NuxtPage />
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">
              دیجی‌فاین
            </h3>
            <p class="footer-description">
              منبع معتبر اخبار و مقالات تکنولوژی، موبایل، کامپیوتر و گجت‌ها
            </p>
          </div>
          
          <div class="footer-section">
            <h4>دسته‌بندی‌ها</h4>
            <ul class="footer-links">
              <li>
                <NuxtLink to="/category/technology">
                  تکنولوژی
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/category/automotive">
                  خودرو
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/category/reviews">
                  نقد و بررسی
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/category/video">
                  ویدیو
                </NuxtLink>
              </li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>صفحات</h4>
            <ul class="footer-links">
              <li>
                <NuxtLink to="/">
                  صفحه اصلی
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blog">
                  وبلاگ
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/search">
                  جستجو
                </NuxtLink>
              </li>
              <li><a href="#contact">تماس با ما</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>شبکه‌های اجتماعی</h4>
            <div class="social-links">
              <a
                href="#"
                aria-label="اینستاگرام"
              >📷</a>
              <a
                href="#"
                aria-label="تلگرام"
              >📱</a>
              <a
                href="#"
                aria-label="توییتر"
              >🐦</a>
              <a
                href="#"
                aria-label="یوتیوب"
              >📺</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} دیجی‌فاین. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </ErrorBoundary>
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  direction: rtl;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 200px);
}

.page-wrapper {
  min-height: 500px;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Footer styles */
.app-footer {
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 3rem 0 1rem 0;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  color: #ff4444;
  margin-bottom: 1rem;
  font-weight: 700;
}

.footer-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.footer-description {
  color: #ccc;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #ff4444;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 50%;
  text-align: center;
  line-height: 40px;
  text-decoration: none;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.social-links a:hover {
  background-color: #ff4444;
}

.footer-bottom {
  border-top: 1px solid #333;
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  color: #999;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
  
  html {
    scroll-behavior: auto;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
  
  .footer-bottom {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  body {
    font-size: 14px;
  }
}

/* Focus styles for accessibility */
a:focus,
button:focus {
  outline: 2px solid #ff4444;
  outline-offset: 2px;
}

/* Loading states */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Error states */
.error {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ffcdd2;
}

/* Success states */
.success {
  color: #2e7d32;
  background-color: #e8f5e8;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #c8e6c9;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #e0e0e0;
  }
}

/* Print styles */
@media print {
  .app-footer,
  .app-header {
    display: none;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.4;
  }
}
</style> 