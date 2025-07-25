<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

const { data, pending, error } = await useFetch(`/api/post/${slug}`)

// A helper to format the date
const formattedDate = computed(() => {
  if (data.value?.post.date) {
    return new Date(data.value.post.date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return '';
});
</script>

<template>
  <div>
    <div v-if="pending" class="loading">در حال بارگذاری مقاله...</div>
    <div v-else-if="error">خطا در بارگذاری مقاله.</div>
    <article v-else-if="data?.post" class="blog-post">
      <header class="post-header">
        <div class="post-meta-categories">
          <span v-for="category in data.post.categories.nodes" :key="category.slug" class="category-tag">
            {{ category.name }}
          </span>
        </div>
        <h1 class="post-title" v-html="data.post.title"></h1>
        <div class="post-meta">
          <span>نویسنده: {{ data.post.author.node.name }}</span>
          <span> | </span>
          <span>{{ formattedDate }}</span>
        </div>
      </header>
      <div class="post-content" v-html="data.post.content"></div>
    </article>
  </div>
</template>

<style scoped>
/* Base styles */
.blog-post {
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl; /* Crucial for Persian content */
  max-width: 760px;
  margin: 32px auto;
  padding: 0 20px;
  color: #0c0c0c;
  background-color: #fff;
}

.loading {
  text-align: center;
  padding: 50px;
  font-family: 'Vazirmatn', sans-serif;
}

/* Header and Metadata */
.post-header {
  margin-bottom: 32px;
}

.post-meta-categories {
  margin-bottom: 12px;
}

.category-tag {
  display: inline-block;
  background-color: #f2f2f2;
  color: #585858;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 8px;
}

.post-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.4;
  color: #0c0c0c;
  margin-bottom: 16px;
}

.post-meta {
  font-size: 0.85rem;
  color: #7b7b7b;
}

/* Main Content Typography and Elements */
.post-content {
  font-size: 1.125rem;
  line-height: 2;
  color: #383838;
}

.post-content :deep(p) {
  margin-bottom: 1.75em;
}

.post-content :deep(h2),
.post-content :deep(h3) {
  font-weight: 700;
  color: #0c0c0c;
  margin-top: 2.5em;
  margin-bottom: 1em;
  line-height: 1.5;
}

.post-content :deep(a) {
  color: #c30000;
  text-decoration: none;
}

.post-content :deep(a:hover) {
  text-decoration: underline;
}

.post-content :deep(img),
.post-content :deep(figure) {
  max-width: 100%;
  height: auto;
  margin: 32px 0;
  border-radius: 12px;
  display: block;
}

.post-content :deep(figcaption) {
  text-align: center;
  font-size: 0.9rem;
  color: #7b7b7b;
  margin-top: -20px;
  margin-bottom: 32px;
}

.post-content :deep(blockquote) {
  margin: 32px 0;
  padding: 16px 24px;
  border-right: 3px solid #c30000;
  background-color: #f9f9f9;
  font-style: italic;
  color: #383838;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  padding-right: 20px;
  margin-bottom: 1.75em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .blog-post {
    margin: 16px auto;
  }
  .post-title {
    font-size: 1.75rem;
  }
  .post-content {
    font-size: 1rem;
    line-height: 1.9;
  }
}
</style>