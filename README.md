# Barbershop Management Software

A comprehensive management system for barbershops, built with modern web technologies.

## Features

- 📅 Appointment Scheduling
- 👥 Customer Management
- ✂️ Service Catalog
- 👨‍💼 Staff Management
- 💳 Payment Processing
- 📊 Analytics and Reporting

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- PostgreSQL
- NextAuth.js (Authentication)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable UI components
├── lib/             # Utility functions and shared logic
├── prisma/          # Database schema and migrations
└── types/           # TypeScript type definitions
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

MIT 