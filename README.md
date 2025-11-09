# OpenSaaS Application

OpenSaaS application built with Wasp, connected to Neon PostgreSQL database.

## 🚀 Features

- Full-stack React + Node.js application
- Authentication system (Email/Password)
- Database migrations ready
- Admin dashboard
- Payment integration ready (Stripe/Lemon Squeezy)
- File upload support (AWS S3)
- Analytics integration ready

## 📋 Prerequisites

- Node.js >= 22.12
- Wasp CLI installed
- Neon PostgreSQL database (already configured)

## 🛠️ Setup

1. Install dependencies:
   ```bash
   wasp start
   ```

2. Environment variables are configured in:
   - `.env.server` - Server-side environment variables
   - `.env.client` - Client-side environment variables

3. Database is already connected to Neon PostgreSQL

## 🗄️ Database

The application is connected to a Neon PostgreSQL database. All migrations have been run and the database is ready to use.

## 📝 Environment Variables

See `.env.server.example` and `.env.client.example` for all available configuration options.

**Important:** Never commit `.env.server` or `.env.client` files to version control.

## 🚀 Development

Start the development server:
```bash
wasp start
```

## 📚 Documentation

For more information, visit:
- [OpenSaaS Documentation](https://docs.opensaas.sh)
- [Wasp Documentation](https://wasp.sh/docs)

## 📄 License

This project is open-source and free to use.
