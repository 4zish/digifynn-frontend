<template>
  <div>
    <h1>My Awesome Blog</h1>
    <p v-if="pending">Loading...</p>
    <p v-else-if="error">Error fetching posts: {{ error.message }}</p>
    <ul v-else-if="posts.length">
      <li v-for="post in posts" :key="post.id">
        {{ post.title }}
      </li>
    </ul>
    <p v-else>No posts found.</p>
  </div>
</template>

<script setup lang="ts">
// The URL of your WordPress GraphQL endpoint
const GQL_HOST = 'https://cms.digifynn.com/graphql';

// Your GraphQL query
const query = `
  query GetPosts {
    posts(first: 10) {
      nodes {
        id
        title
      }
    }
  }
`;

// Use Nuxt's built-in useFetch to make the request
const { data, pending, error } = await useFetch(GQL_HOST, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
  // Create a key to prevent refetching on every navigation
  key: 'all-posts'
});

// Safely access the nested data
const posts = computed(() => data.value?.data?.posts?.nodes || []);
</script>