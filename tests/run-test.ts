import { chromium } from 'playwright'

async function runTest() {
  console.log('🚀 Starting Playwright test with Chrome...\n')

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome' // Use system Chrome
  })

  const context = await browser.newContext()
  const page = await context.newPage()

  // Collect console errors
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error') {
      consoleErrors.push(text)
      console.log(`❌ Console Error: ${text}`)
    } else if (type === 'warning') {
      console.log(`⚠️  Console Warning: ${text}`)
    }
  })

  // Collect network errors
  const networkErrors: { url: string; status: number; statusText: string }[] = []
  page.on('response', (response) => {
    const status = response.status()
    if (status >= 400) {
      networkErrors.push({
        url: response.url(),
        status,
        statusText: response.statusText(),
      })
      console.log(`❌ Network Error: ${response.url()} - ${status} ${response.statusText()}`)
    }
  })

  try {
    console.log('📄 Navigating to login page...')
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })

    console.log('✅ Page loaded')
    console.log(`📍 Current URL: ${page.url()}`)

    // Wait for form to be ready
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })

    console.log('\n📝 Filling login form...')
    await page.fill('input[type="email"]', 'khaledjamal51@gmail.com')
    await page.fill('input[type="password"]', 'A123456')

    console.log('🔘 Clicking Sign In button...')

    // Wait for navigation after clicking
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('supabase.co') && resp.status() < 400, { timeout: 10000 }).catch(() => null),
      page.click('button:has-text("Sign In")')
    ])

    // Wait for navigation or error
    console.log('⏳ Waiting for navigation or response...')

    try {
      // Wait for either redirect to /demo-app or error message
      await Promise.race([
        page.waitForURL('**/demo-app**', { timeout: 5000 }),
        page.waitForSelector('.text-destructive', { timeout: 5000 }),
        page.waitForTimeout(5000)
      ])
    } catch (e) {
      // Timeout is okay, we'll check the state
    }

    const finalUrl = page.url()
    console.log(`\n📍 Final URL: ${finalUrl}`)

    // Check for error message
    const errorElement = await page.locator('.text-destructive').first().textContent().catch(() => null)
    if (errorElement) {
      console.log(`❌ Error message displayed: ${errorElement}`)
    }

    // Check if we're logged in by checking for user-specific content
    const isLoggedIn = finalUrl.includes('/demo-app') || finalUrl.includes('/dashboard')
    if (isLoggedIn) {
      console.log('✅ Login successful! Redirected to app.')
    } else if (finalUrl.includes('/login')) {
      console.log('⚠️  Still on login page. Checking if login succeeded...')

      // Check if there's a session by trying to access a protected route
      await page.goto('http://localhost:3000/demo-app', { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      const demoAppUrl = page.url()

      if (demoAppUrl.includes('/demo-app')) {
        console.log('✅ Login actually succeeded! Can access protected route.')
      } else if (demoAppUrl.includes('/login')) {
        console.log('❌ Login failed - redirected back to login')
      }
    }

    // Check page title
    const title = await page.title()
    console.log(`📄 Page title: ${title}`)

    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`   Console Errors: ${consoleErrors.length}`)
    console.log(`   Network Errors: ${networkErrors.length}`)

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:')
      consoleErrors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`)
      })
    }

    if (networkErrors.length > 0) {
      console.log('\n❌ Network Errors Found:')
      networkErrors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.url} - ${error.status} ${error.statusText}`)
      })
    }

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n✅ No runtime errors detected!')
    }

    // Keep browser open for inspection
    console.log('\n⏸️  Keeping browser open for 10 seconds for inspection...')
    await page.waitForTimeout(10000)

  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
  } finally {
    await browser.close()
    console.log('\n✅ Test completed')
  }
}

runTest().catch(console.error)

