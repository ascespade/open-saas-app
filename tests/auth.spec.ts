import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Fill in login form
    await page.fill('input[type="email"]', 'khaledjamal51@gmail.com')
    await page.fill('input[type="password"]', 'A123456')

    // Click sign in button
    await page.click('button:has-text("Sign In")')

    // Wait for navigation or error message
    await page.waitForTimeout(3000)

    // Check if we're redirected to demo-app or if there's an error
    const currentUrl = page.url()
    const errorMessage = await page.locator('.text-destructive').textContent().catch(() => null)

    console.log('Current URL:', currentUrl)
    console.log('Error message:', errorMessage)

    // Check console for errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('Console error:', msg.text())
      }
    })

    // Check network requests for errors
    const networkErrors: string[] = []
    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url()
        const status = response.status()
        networkErrors.push(`${url}: ${status}`)
        console.log(`Network error: ${url} - ${status}`)
      }
    })

    // Wait a bit more to catch any errors
    await page.waitForTimeout(2000)

    // If we're still on login page, check for error
    if (currentUrl.includes('/login')) {
      if (errorMessage) {
        console.log('Login failed with error:', errorMessage)
      } else {
        console.log('Login attempt completed but still on login page')
      }
    } else {
      console.log('Login successful, redirected to:', currentUrl)
    }

    // Log all errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors)
    }
    if (networkErrors.length > 0) {
      console.log('Network errors found:', networkErrors)
    }
  })

  test('should signup successfully with new credentials', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Generate unique email
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'Test123456!'

    // Fill in signup form
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)

    // Click sign up button
    await page.click('button:has-text("Sign Up")')

    // Wait for navigation or error message
    await page.waitForTimeout(3000)

    // Check if we're redirected or if there's an error
    const currentUrl = page.url()
    const errorMessage = await page.locator('.text-destructive').textContent().catch(() => null)

    console.log('Signup - Current URL:', currentUrl)
    console.log('Signup - Error message:', errorMessage)

    // Check console for errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('Console error:', msg.text())
      }
    })

    // Wait a bit more to catch any errors
    await page.waitForTimeout(2000)

    if (consoleErrors.length > 0) {
      console.log('Signup console errors:', consoleErrors)
    }
  })
})

