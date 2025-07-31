import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check main elements are present
    await expect(page.locator('h1')).toContainText('به دیجی‌فاین خوش آمدید')
    await expect(page.locator('.hero-description')).toBeVisible()
    
    // Check navigation links
    await expect(page.locator('a[href="/blog"]')).toBeVisible()
    await expect(page.locator('a[href="/blog"]')).toContainText('مشاهده مقالات')
  })

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/')
    
    // Click on blog link
    await page.click('a[href="/blog"]')
    
    // Verify navigation
    await expect(page).toHaveURL('/blog')
  })

  test('should display feature cards', async ({ page }) => {
    await page.goto('/')
    
    // Check feature cards are present
    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(4)
    
    // Check specific features
    await expect(page.locator('text=موبایل')).toBeVisible()
    await expect(page.locator('text=کامپیوتر')).toBeVisible()
    await expect(page.locator('text=گیمینگ')).toBeVisible()
    await expect(page.locator('text=تکنولوژی')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile layout
    await expect(page.locator('.hero-title')).toBeVisible()
    await expect(page.locator('.hero-actions')).toBeVisible()
  })

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3')
    await expect(headings.first()).toHaveText('به دیجی‌فاین خوش آمدید')
    
    // Check for proper link text
    const links = page.locator('a')
    for (const link of await links.all()) {
      const text = await link.textContent()
      expect(text?.trim()).toBeTruthy()
    }
  })
}) 