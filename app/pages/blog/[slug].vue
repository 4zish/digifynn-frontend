// app/pages/blog/[slug].vue
<script setup lang="ts">
// Get the slug from the current URL
const route = useRoute()
const slug = route.params.slug

// Fetch the data for this specific post
const { data } = await useFetch(`/api/post/${slug}`)
</script>

<template>
  <article class="blog-post">
    <h1 v-html="data?.post.title"></h1>
    <p>Published on: {{ new Date(data?.post.date).toLocaleDateString() }}</p>
    <div v-html="data?.post.content"></div>
  </article>
</template>

<style scoped>
.blog-post {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}

/* Because the content is loaded from WordPress using v-html, 
  you need to use the "deep" selector to style its contents.
*/
.blog-post :deep(p) {
  margin-bottom: 1rem;
}

.blog-post :deep(h2) {
  font-size: 1.75rem;
  margin-top: 2.5rem;
}

.blog-post :deep(a) {
  color: #007bff;
  text-decoration: none;
}

.blog-post :deep(a:hover) {
  text-decoration: underline;
}

.blog-post :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>