import { chromium } from 'playwright'

async function testLoginAPI() {
  console.log('🧪 Testing login API route directly...\n')

  const browser = await chromium.launch({ headless: false, channel: 'chrome' })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' })
    console.log('✅ Page loaded')

    // Fill form
    await page.fill('input[type="email"]', 'khaledjamal51@gmail.com')
    await page.fill('input[type="password"]', 'A123456')

    // Intercept the API call
    let apiResponse: any = null
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/login')) {
        apiResponse = {
          status: response.status(),
          body: await response.json().catch(() => null),
          headers: response.headers(),
        }
        console.log('📡 API Response:', apiResponse)
      }
    })

    // Click login
    console.log('🔘 Clicking Sign In...')
    await page.click('button:has-text("Sign In")')

    // Wait for API call
    await page.waitForTimeout(3000)

    // Check cookies
    const cookies = await context.cookies()
    console.log('\n🍪 Cookies after login:')
    cookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        console.log(`   ${cookie.name}: ${cookie.value.substring(0, 20)}...`)
      }
    })

    // Try to navigate to demo-app
    console.log('\n🔄 Navigating to /demo-app...')
    await page.goto('http://localhost:3000/demo-app', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const finalUrl = page.url()
    console.log(`📍 Final URL: ${finalUrl}`)

    if (finalUrl.includes('/demo-app')) {
      console.log('✅ SUCCESS! Login worked and redirect succeeded!')
    } else if (finalUrl.includes('/login')) {
      console.log('❌ FAILED - Redirected back to login')
    }

    // Keep browser open
    await page.waitForTimeout(5000)

  } catch (error) {
    console.error('❌ Test error:', error)
  } finally {
    await browser.close()
  }
}

testLoginAPI().catch(console.error)

