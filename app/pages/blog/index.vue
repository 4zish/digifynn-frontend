// app/pages/blog/index.vue
<script setup lang="ts">
const { data } = await useFetch('/api/posts')

useHead({
  title: 'Blog - DigiFynn'
})
</script>

<template>
  <section>
    <h1>Blog</h1>
    <article v-for="post in data?.posts.nodes" :key="post.id">
      <NuxtLink :to="`/blog/${post.slug}`">
        <h2 v-html="post.title"></h2>
      </NuxtLink>
      <div v-html="post.content"></div>
    </article>
  </section>
</template>
