<script setup lang="ts">
const { data } = await useFetch('/api/posts')
</script>

<template>
  <section>
    <h1>Blog</h1>
    <article v-for="post in data?.posts.nodes" :key="post.id">
      <h2 v-html="post.title"></h2>
      <div v-html="post.content"></div>
    </article>
  </section>
</template>