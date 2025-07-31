import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to search page with query', async ({ page }) => {
    // Type in search input
    await page.fill('#search-input', 'تکنولوژی')
    await page.press('#search-input', 'Enter')
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=تکنولوژی/)
    
    // Should display search query
    await expect(page.locator('input[placeholder*="جستجو"]')).toHaveValue('تکنولوژی')
  })

  test('should perform search via search button', async ({ page }) => {
    await page.fill('#search-input', 'موبایل')
    await page.click('.search-button')
    
    await expect(page).toHaveURL(/\/search\?q=موبایل/)
  })

  test('should handle empty search query', async ({ page }) => {
    await page.fill('#search-input', '')
    await page.press('#search-input', 'Enter')
    
    // Should not navigate
    await expect(page).toHaveURL('/')
  })

  test('should handle whitespace-only search query', async ({ page }) => {
    await page.fill('#search-input', '   ')
    await page.press('#search-input', 'Enter')
    
    // Should not navigate
    await expect(page).toHaveURL('/')
  })

  test('should clear search input after search', async ({ page }) => {
    await page.fill('#search-input', 'test query')
    await page.press('#search-input', 'Enter')
    
    // Navigate back to home
    await page.goto('/')
    
    // Search input should be empty
    await expect(page.locator('#search-input')).toHaveValue('')
  })

  test('should handle special characters in search', async ({ page }) => {
    const specialQueries = [
      'تست & جستجو',
      'تست + جستجو',
      'تست @ جستجو',
      'تست < جستجو >'
    ]
    
    for (const query of specialQueries) {
      await page.fill('#search-input', query)
      await page.press('#search-input', 'Enter')
      
      await expect(page).toHaveURL(new RegExp(`/search\\?q=${encodeURIComponent(query)}`))
      
      // Go back to home for next test
      await page.goto('/')
    }
  })

  test('should handle long search queries', async ({ page }) => {
    const longQuery = 'a'.repeat(200)
    await page.fill('#search-input', longQuery)
    await page.press('#search-input', 'Enter')
    
    // Should navigate with truncated query
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test('should handle search with keyboard navigation', async ({ page }) => {
    await page.fill('#search-input', 'keyboard test')
    await page.keyboard.press('Enter')
    
    await expect(page).toHaveURL(/\/search\?q=keyboard\+test/)
  })

  test('should handle search with mouse click', async ({ page }) => {
    await page.fill('#search-input', 'mouse test')
    await page.click('.search-button')
    
    await expect(page).toHaveURL(/\/search\?q=mouse\+test/)
  })

  test('should maintain search state on page refresh', async ({ page }) => {
    await page.fill('#search-input', 'persistent test')
    await page.press('#search-input', 'Enter')
    
    // Refresh page
    await page.reload()
    
    // Should maintain search query
    await expect(page.locator('input[placeholder*="جستجو"]')).toHaveValue('persistent test')
  })

  test('should handle search with URL parameters', async ({ page }) => {
    // Navigate directly to search page with query
    await page.goto('/search?q=direct+query')
    
    // Should display the query
    await expect(page.locator('input[placeholder*="جستجو"]')).toHaveValue('direct query')
  })

  test('should handle search with multiple spaces', async ({ page }) => {
    await page.fill('#search-input', '  multiple   spaces  ')
    await page.press('#search-input', 'Enter')
    
    // Should trim spaces
    await expect(page).toHaveURL(/\/search\?q=multiple\+spaces/)
  })

  test('should handle search with Persian text', async ({ page }) => {
    const persianQueries = [
      'تکنولوژی',
      'گوشی هوشمند',
      'لپ تاپ',
      'کامپیوتر'
    ]
    
    for (const query of persianQueries) {
      await page.fill('#search-input', query)
      await page.press('#search-input', 'Enter')
      
      await expect(page).toHaveURL(new RegExp(`/search\\?q=${encodeURIComponent(query)}`))
      
      // Go back to home for next test
      await page.goto('/')
    }
  })

  test('should handle search with numbers', async ({ page }) => {
    await page.fill('#search-input', 'iPhone 14')
    await page.press('#search-input', 'Enter')
    
    await expect(page).toHaveURL(/\/search\?q=iPhone\+14/)
  })

  test('should handle search with mixed languages', async ({ page }) => {
    await page.fill('#search-input', 'iPhone 14 پرو')
    await page.press('#search-input', 'Enter')
    
    await expect(page).toHaveURL(/\/search\?q=iPhone\+14\+پرو/)
  })

  test('should handle rapid successive searches', async ({ page }) => {
    const queries = ['query1', 'query2', 'query3']
    
    for (const query of queries) {
      await page.fill('#search-input', query)
      await page.press('#search-input', 'Enter')
      
      await expect(page).toHaveURL(new RegExp(`/search\\?q=${query}`))
      
      // Go back to home for next test
      await page.goto('/')
    }
  })

  test('should handle search with special keyboard shortcuts', async ({ page }) => {
    await page.fill('#search-input', 'shortcut test')
    
    // Test Ctrl+Enter
    await page.keyboard.press('Control+Enter')
    await expect(page).toHaveURL(/\/search\?q=shortcut\+test/)
    
    // Go back and test Cmd+Enter (Mac)
    await page.goto('/')
    await page.fill('#search-input', 'cmd test')
    await page.keyboard.press('Meta+Enter')
    await expect(page).toHaveURL(/\/search\?q=cmd\+test/)
  })

  test('should handle search with paste operation', async ({ page }) => {
    // Mock clipboard content
    await page.evaluate(() => {
      navigator.clipboard.writeText('pasted query')
    })
    
    await page.click('#search-input')
    await page.keyboard.press('Control+v')
    await page.press('#search-input', 'Enter')
    
    await expect(page).toHaveURL(/\/search\?q=pasted\+query/)
  })

  test('should handle search with autocomplete', async ({ page }) => {
    // Type partial query
    await page.fill('#search-input', 'tech')
    
    // Wait for potential autocomplete
    await page.waitForTimeout(500)
    
    // Complete the search
    await page.press('#search-input', 'Enter')
    
    await expect(page).toHaveURL(/\/search\?q=tech/)
  })

  test('should handle search with browser back/forward', async ({ page }) => {
    await page.fill('#search-input', 'back test')
    await page.press('#search-input', 'Enter')
    
    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')
    
    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/\/search\?q=back\+test/)
  })

  test('should handle search with browser refresh', async ({ page }) => {
    await page.fill('#search-input', 'refresh test')
    await page.press('#search-input', 'Enter')
    
    // Refresh page
    await page.reload()
    
    // Should maintain search state
    await expect(page.locator('input[placeholder*="جستجو"]')).toHaveValue('refresh test')
  })

  test('should handle search with network errors', async ({ page }) => {
    // Mock network error
    await page.route('**/api/search', route => route.abort())
    
    await page.fill('#search-input', 'error test')
    await page.press('#search-input', 'Enter')
    
    // Should still navigate to search page
    await expect(page).toHaveURL(/\/search\?q=error\+test/)
    
    // Should show error state
    await expect(page.locator('.error-container')).toBeVisible()
  })

  test('should handle search with slow network', async ({ page }) => {
    // Mock slow network
    await page.route('**/api/search', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [],
            total: 0,
            page: 1,
            limit: 20,
            query: 'slow test'
          })
        })
      }, 2000)
    })
    
    await page.fill('#search-input', 'slow test')
    await page.press('#search-input', 'Enter')
    
    // Should show loading state
    await expect(page.locator('.loading-spinner')).toBeVisible()
    
    // Wait for response
    await page.waitForTimeout(2500)
    
    // Should show results
    await expect(page.locator('.search-results')).toBeVisible()
  })

  test('should handle search with no results', async ({ page }) => {
    // Mock empty results
    await page.route('**/api/search', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [],
          total: 0,
          page: 1,
          limit: 20,
          query: 'no results'
        })
      })
    })
    
    await page.fill('#search-input', 'no results')
    await page.press('#search-input', 'Enter')
    
    // Should show no results message
    await expect(page.locator('.no-results')).toBeVisible()
  })

  test('should handle search with many results', async ({ page }) => {
    // Mock many results
    const mockResults = Array.from({ length: 50 }, (_, i) => ({
      id: `post-${i}`,
      title: `Test Post ${i}`,
      content: `Content for post ${i}`,
      date: '2024-01-01',
      slug: `test-post-${i}`,
      excerpt: `Excerpt for post ${i}`
    }))
    
    await page.route('**/api/search', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: mockResults,
          total: 50,
          page: 1,
          limit: 20,
          query: 'many results'
        })
      })
    })
    
    await page.fill('#search-input', 'many results')
    await page.press('#search-input', 'Enter')
    
    // Should show results
    await expect(page.locator('.search-results')).toBeVisible()
    
    // Should show pagination
    await expect(page.locator('.pagination')).toBeVisible()
  })
}) 