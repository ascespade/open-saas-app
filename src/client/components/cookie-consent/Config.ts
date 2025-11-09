import type { CookieConsentConfig } from 'vanilla-cookieconsent'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

const getConfig = () => {
  // See https://cookieconsent.orestbida.com/reference/configuration-reference.html for configuration options.
  const config: CookieConsentConfig = {
    // Default configuration for the modal.
    root: 'body',
    autoShow: true,
    disablePageInteraction: false,
    hideFromBots: process.env.NODE_ENV === 'production' ? true : false,
    mode: 'opt-in',
    revision: 0,

    // Default configuration for the cookie.
    cookie: {
      name: 'cc_cookie',
      domain: typeof window !== 'undefined' ? window.location.hostname : '',
      path: '/',
      sameSite: 'Lax',
      expiresAfterDays: 365,
    },

    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
        flipButtons: false,
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        autoClear: {
          cookies: [
            {
              name: /^_ga/,
            },
            {
              name: '_gid',
            },
          ],
        },

        services: {
          ga: {
            label: 'Google Analytics',
            onAccept: () => {
              try {
                const GA_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
                if (!GA_ANALYTICS_ID || GA_ANALYTICS_ID.length === 0) {
                  throw new Error('Google Analytics ID is missing')
                }
                window.dataLayer = window.dataLayer || []
                function gtag(...args: unknown[]) {
                  window.dataLayer.push(args)
                }
                gtag('js', new Date())
                gtag('config', GA_ANALYTICS_ID)

                const script = document.createElement('script')
                script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ANALYTICS_ID}`
                script.async = true
                document.body.appendChild(script)
              } catch (error) {
                console.error(error)
              }
            },
            onReject: () => {},
          },
        },
      },
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use cookies primarily for analytics to enhance your experience. By accepting, you agree to our use of these cookies. You can manage your preferences or learn more about our cookie policy.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            footer: `
            <a href="<your-url-here>" target="_blank">Privacy Policy</a>
            <a href="<your-url-here>" target="_blank">Terms and Conditions</a>
                    `,
          },
          preferencesModal: {
            sections: [],
          },
        },
      },
    },
  }

  return config
}

export default getConfig
