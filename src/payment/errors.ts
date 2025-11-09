export class UnhandledWebhookEventError extends Error {
  constructor(eventType: string) {
    super(`Unhandled webhook event type: ${eventType}`)
    this.name = 'UnhandledWebhookEventError'
  }
}
