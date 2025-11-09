import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/client/Main.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Open SaaS App',
  description: 'Your apps main description and features.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="description" content="Your apps main description and features." />
        <meta name="author" content="Your (App) Name" />
        <meta name="keywords" content="saas, solution, product, app, service" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Your Open SaaS App" />
        <meta property="og:site_name" content="Your Open SaaS App" />
        <meta property="og:url" content="https://your-saas-app.com" />
        <meta property="og:description" content="Your apps main description and features." />
        <meta property="og:image" content="https://your-saas-app.com/public-banner.webp" />
        <meta name="twitter:image" content="https://your-saas-app.com/public-banner.webp" />
        <meta name="twitter:image:width" content="800" />
        <meta name="twitter:image:height" content="400" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
