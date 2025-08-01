<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const errorInfo = ref<any>(null)
const isDev = import.meta.env.DEV

onErrorCaptured((err: Error, instance: any, info: string) => {
  error.value = err
  errorInfo.value = { instance, info }
  
  // Log error for debugging
  console.error('Error caught by ErrorBoundary:', err)
  console.error('Error info:', info)
  
  // Prevent error from propagating
  return false
})

const router = useRouter()

const resetError = () => {
  error.value = null
  errorInfo.value = null
}

const navigateToHome = () => {
  try {
    router.push('/')
  } catch (err) {
    // Fallback to window.location if router fails
    if (process.client) {
      window.location.href = '/'
    }
  }
}
</script>

<template>
  <div
    v-if="error"
    class="error-boundary"
  >
    <div class="error-container">
      <div class="error-icon">
        ⚠️
      </div>
      <h2>خطایی رخ داده است</h2>
      <p>متأسفانه مشکلی در بارگذاری این بخش پیش آمده است.</p>
      
      <div
        v-if="isDev"
        class="error-details"
      >
        <details>
          <summary>جزئیات خطا (فقط در حالت توسعه)</summary>
          <pre>{{ error.message }}</pre>
          <pre v-if="errorInfo">{{ JSON.stringify(errorInfo, null, 2) }}</pre>
        </details>
      </div>
      
      <div class="error-actions">
        <button
          class="retry-button"
          @click="resetError"
        >
          تلاش مجدد
        </button>
        <button
          class="home-button"
          @click="navigateToHome"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  </div>
  
  <template v-else>
    <slot />
  </template>
</template>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #666;
  margin-bottom: 1.5rem;
}

.error-details {
  margin: 1rem 0;
  text-align: left;
}

.error-details details {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.error-details pre {
  background: #2d2d2d;
  color: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button, .home-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button {
  background-color: #E4002B;
  color: white;
}

.retry-button:hover {
  background-color: #c30000;
}

.home-button {
  background-color: #f5f5f5;
  color: #333;
}

.home-button:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .error-boundary {
    padding: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 