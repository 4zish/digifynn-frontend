<template>
  <div>
    <TheHeader />
    
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
/* Add some global styles to prevent content from touching the header */
body {
  margin: 0;
  background-color: #f9f9f9;
}

.main-content {
  padding: 1rem;
}
</style>