// app/pages/blog/[slug].vue
<script setup lang="ts">
// Get the slug from the current URL
const route = useRoute()
const slug = route.params.slug

// Fetch the data for this specific post
const { data } = await useFetch(`/api/post/${slug}`)
</script>

<template>
  <article>
    <h1 v-html="data?.post.title"></h1>
    <p>Published on: {{ new Date(data?.post.date).toLocaleDateString() }}</p>
    <div v-html="data?.post.content"></div>
  </article>
</template>