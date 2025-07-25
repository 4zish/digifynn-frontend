<template>
  <header class="main-header">
    <div class="header-container">
      <div class="header-left">
        <button class="menu-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="logo">
          <NuxtLink to="/">DIGIFYNN</NuxtLink>
        </div>
        <nav class="main-nav">
          <NuxtLink to="/blog">Blog</NuxtLink>
          <a href="#">Reviews</a>
          <a href="#">Videos</a>
          <a href="#">About</a>
        </nav>
      </div>

      <div class="header-right">
        <div class="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search...</span>
        </div>
        <a href="#" class="login-button">Login / Register</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.main-header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  font-family: 'Vazirmatn', sans-serif;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.menu-button {
  display: none; /* Hidden on desktop */
  background: none;
  border: none;
  cursor: pointer;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.logo a {
  text-decoration: none;
  color: #c30000; /* Zoomit red */
}

.main-nav {
  display: flex;
  gap: 20px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.main-nav a:hover {
  color: #c30000;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7b7b7b;
  cursor: pointer;
}

.login-button {
  background-color: #f2f2f2;
  color: #333;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #e0e0e0;
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .main-nav, .login-button {
    display: none;
  }
  .menu-button {
    display: block;
  }
  .header-container {
    justify-content: flex-start;
  }
  .header-right {
    margin-left: auto;
  }
  .search-container span {
    display: none; /* Hide search text on mobile */
  }
}
</style>