<script setup lang="ts">
// SEO optimization
useHead({
  title: 'دیجی‌فاین - اخبار و مقالات تکنولوژی',
  meta: [
    { name: 'description', content: 'آخرین اخبار و مقالات تکنولوژی، موبایل، کامپیوتر و گجت‌ها از دیجی‌فاین' },
    { property: 'og:title', content: 'دیجی‌فاین - اخبار و مقالات تکنولوژی' },
    { property: 'og:description', content: 'آخرین اخبار و مقالات تکنولوژی، موبایل، کامپیوتر و گجت‌ها از دیجی‌فاین' }
  ]
})
</script>

<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          به دیجی‌فاین خوش آمدید
        </h1>
        <p class="hero-description">
          آخرین اخبار و مقالات تکنولوژی، موبایل، کامپیوتر و گجت‌ها را از ما بخوانید
        </p>
        <div class="hero-actions">
          <NuxtLink
            to="/blog"
            class="cta-button primary"
          >
            مشاهده مقالات
          </NuxtLink>
          <a
            href="#"
            class="cta-button secondary"
          >
            درباره ما
          </a>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            📱
          </div>
          <h3>موبایل</h3>
          <p>آخرین اخبار و بررسی گوشی‌های هوشمند</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            💻
          </div>
          <h3>کامپیوتر</h3>
          <p>اخبار و مقالات حوزه کامپیوتر و لپ‌تاپ</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            🎮
          </div>
          <h3>گیمینگ</h3>
          <p>اخبار بازی‌ها و کنسول‌های بازی</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            🔬
          </div>
          <h3>تکنولوژی</h3>
          <p>آخرین دستاوردهای تکنولوژی جهان</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl;
}

.hero-section {
  background: linear-gradient(135deg, #1C1F22 0%, #383E43 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #E8E2D8;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #E8E2D8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.cta-button.primary {
  background-color: #E4002B;
  color: white;
}

.cta-button.primary:hover {
  background-color: #c30000;
  transform: translateY(-2px);
}

.cta-button.secondary {
  background-color: transparent;
  color: #E8E2D8;
  border: 2px solid #E8E2D8;
}

.cta-button.secondary:hover {
  background-color: #E8E2D8;
  color: #1C1F22;
}

.features-section {
  padding: 4rem 2rem;
  background-color: #f9f9f9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c0c0c;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .hero-section,
  .features-section {
    padding: 2rem 1rem;
  }
}
</style>