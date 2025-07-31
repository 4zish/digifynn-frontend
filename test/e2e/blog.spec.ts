import { test, expect } from '@playwright/test'

test.describe('Blog Pages', () => {
  test('should display blog index page', async ({ page }) => {
    await page.goto('/blog')
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('وبلاگ')
    await expect(page.locator('.blog-description')).toBeVisible()
  })

  test('should handle loading state', async ({ page }) => {
    await page.goto('/blog')
    
    // Check for loading spinner (briefly)
    const loadingSpinner = page.locator('.loading-spinner')
    await expect(loadingSpinner).toBeVisible()
  })

  test('should handle error state', async ({ page }) => {
    // Mock network error
    await page.route('**/api/posts', route => route.abort())
    await page.goto('/blog')
    
    // Check error state
    await expect(page.locator('.error-container')).toBeVisible()
    await expect(page.locator('text=خطا در بارگذاری مقالات')).toBeVisible()
  })

  test('should display posts when available', async ({ page }) => {
    // Mock successful response
    await page.route('**/api/posts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: {
            nodes: [
              {
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                date: '2024-01-01',
                slug: 'test-post',
                excerpt: 'Test excerpt'
              }
            ]
          }
        })
      })
    })
    
    await page.goto('/blog')
    
    // Check post is displayed
    await expect(page.locator('.post-card')).toBeVisible()
    await expect(page.locator('.post-title')).toContainText('Test Post')
  })

  test('should navigate to individual post', async ({ page }) => {
    // Mock successful response
    await page.route('**/api/posts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts: {
            nodes: [
              {
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                date: '2024-01-01',
                slug: 'test-post',
                excerpt: 'Test excerpt'
              }
            ]
          }
        })
      })
    })
    
    await page.route('**/api/post/test-post', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          post: {
            id: '1',
            title: 'Test Post',
            content: 'Test content',
            date: '2024-01-01',
            slug: 'test-post',
            excerpt: 'Test excerpt'
          }
        })
      })
    })
    
    await page.goto('/blog')
    await page.click('.post-link')
    
    // Verify navigation to post
    await expect(page).toHaveURL('/blog/test-post')
    await expect(page.locator('.post-title')).toContainText('Test Post')
  })

  test('should handle 404 for non-existent post', async ({ page }) => {
    await page.route('**/api/post/non-existent', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ post: null })
      })
    })
    
    await page.goto('/blog/non-existent')
    
    // Check 404 state
    await expect(page.locator('.not-found-container')).toBeVisible()
    await expect(page.locator('text=مقاله یافت نشد')).toBeVisible()
  })

  test('should have proper breadcrumb navigation', async ({ page }) => {
    // Mock successful response
    await page.route('**/api/post/test-post', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          post: {
            id: '1',
            title: 'Test Post',
            content: 'Test content',
            date: '2024-01-01',
            slug: 'test-post'
          }
        })
      })
    })
    
    await page.goto('/blog/test-post')
    
    // Check breadcrumb
    await expect(page.locator('.breadcrumb')).toBeVisible()
    await expect(page.locator('text=خانه')).toBeVisible()
    await expect(page.locator('text=وبلاگ')).toBeVisible()
  })
}) 