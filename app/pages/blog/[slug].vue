<script setup lang="ts">
// Get the slug from the current URL
const route = useRoute()
const slug = route.params.slug

// Fetch the data for this specific post
const { data, pending, error } = await useFetch(`/api/post/${slug}`)
</script>

<template>
  <div>
    <div v-if="pending" class="loading">Loading article...</div>
    <div v-else-if="error">Error loading the article.</div>
    <article v-else-if="data?.post" class="blog-post">
      <header class="post-header">
        <h1 v-html="data.post.title"></h1>
        <p class="post-meta">
          Published on: {{ new Date(data.post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </header>
      <div class="post-content" v-html="data.post.content"></div>
    </article>
  </div>
</template>

<style scoped>
/* Main font and layout for the blog post */
.blog-post {
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl; /* Right-to-left for Persian content */
  max-width: 750px; /* Max width for readability */
  margin: 2rem auto;
  padding: 0 1rem;
  color: #333;
  line-height: 1.8;
}

.post-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.post-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.post-meta {
  font-size: 0.9rem;
  color: #666;
}

/* Styles for the content coming from WordPress */
.post-content {
  font-size: 1.125rem; /* ~18px */
}

/* Deep selectors for styling v-html content */
.post-content :deep(p) {
  margin-bottom: 1.5em;
}

.post-content :deep(h2),
.post-content :deep(h3) {
  font-weight: 700;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.post-content :deep(a) {
  color: #0a72cc;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.post-content :deep(a:hover) {
  border-color: #0a72cc;
}

.post-content :deep(img),
.post-content :deep(figure) {
  max-width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 8px;
}

.post-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-right: 4px solid #0a72cc;
  background-color: #f8f9fa;
  font-style: italic;
  color: #555;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .post-header h1 {
    font-size: 2rem;
  }
  .post-content {
    font-size: 1rem; /* ~16px */
  }
}
</style>