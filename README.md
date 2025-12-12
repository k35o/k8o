# k8o

This is a website for everything created by k8o!

## Documentation

Comprehensive documentation is available:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development workflow and coding standards
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[docs/API.md](./docs/API.md)** - API endpoints documentation
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing strategies and guidelines
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment procedures
- **[docs/SECURITY.md](./docs/SECURITY.md)** - Security policies and best practices
- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Setup

Install dependencies after preparing Node.js v22.21.1 and pnpm v10.24.0.

```bash
pnpm i --frozen-lockfile
```

Copy environment variables and launch Docker services for database and KV storage.

```bash
cp apps/main/.env.example apps/main/.env.local
docker compose up -d
pnpm run -F database migrate
```

For MicroCMS or Resend integration, ask k8o for the `MICROCMS_API_KEY` or `RESEND_API_KEY`.

## Architecture

**Turborepo Monorepo** with 3 workspaces:

- **apps/main** - Main Next.js 16 application with App Router
- **packages/database** - Database client and schema with Drizzle ORM
- **packages/helpers** - Utility functions with in-source testing

External packages:

- **@k8o/arte-odyssey** - Reusable UI component library (published on npm, external repository: [ArteOdyssey](https://github.com/k35o/ArteOdyssey))

## Development

### Development Server

Start the application in development mode with hot-code reloading.

```bash
pnpm run dev
```

### Build

Build for production using Turbo.

```bash
pnpm run build

# Build with bundle analysis
ANALYZE=true pnpm run build
```

### Storybook

Component library and design system.

```bash
pnpm run -F main storybook
```

### Email Templates

Development server for React Email templates (port 3333).

```bash
pnpm run -F main email
```

## Testing

All tests use Vitest with timezone set to UTC.

```bash
pnpm run test

# Install Playwright dependencies
pnpm run install-playwright
```

**Testing Strategy**:

- **Helpers**: In-source testing with `if (import.meta.vitest)` blocks
- **UI**: Storybook stories with `@storybook/addon-vitest`
- **Core App**: Browser mode for React components, Node.js for services/utils

## Code Quality

### Linting & Formatting

Using Biome.

```bash
pnpm run check

# Auto-fix
pnpm run check:write
```

### Type Checking

TypeScript type checking with `tsc --noEmit`.

```bash
pnpm run type-check
```

## Database

Using Drizzle ORM with PostgreSQL.

```bash
# Generate migration files from schema
pnpm run -F database generate

# Generate custom migration files
pnpm run -F database generate:custom

# Execute database migrations
pnpm run -F database migrate

# Export schema to SQL file
pnpm run -F database export:schema

# Build ERD (Entity Relationship Diagram)
pnpm run -F database build:erd

# Connect to local PostgreSQL
docker compose exec postgres psql -U postgres -d main
```

## Tech Stack

### Frontend

- **Next.js** - App Router, React, TypeScript
- **TailwindCSS** - Custom design tokens (no standard classes like `text-gray-600`)
- **Motion** - Animations
- **MDX** - Blog content with KaTeX math and Shiki syntax highlighting
- **ArteOdyssey** - UI component library (npm: @k8o/arte-odyssey)

### Backend & Database

- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - Neon (production), Docker (local)
- **Redis** - Upstash (production), Docker (local)
- **Zod** - Schema validation

### Development Tools

- **Turbo** - Monorepo build system
- **Vitest** - Test runner with browser mode support
- **Storybook** - Component development environment
- **React Email** - Email templates
- **MSW** - API mocking
- **Lefthook** - Git hooks
- **Playwright** - E2E testing
- **Biome** - Linter and formatter (ESLint/Prettier alternative)

## Production Services

- **Hosting**: [Vercel](https://vercel.com/k35o/k8o)
- **Database**: [Neon](https://console.neon.tech/app/projects/cool-king-69719941)
- **KV Storage**: [Upstash](https://console.upstash.com/vercel/kv/6ae3d043-1c14-4a5e-b4e2-18872bbd81bb)
- **CMS**: [MicroCMS](https://k35o.microcms.io)
- **Email**: [Resend](https://resend.com)

## Docker Services

Local development services (via `docker compose up -d`):

- **postgres**: PostgreSQL 18 (port 5432)
- **neon-proxy**: Neon WebSocket proxy (port 5433)
- **redis**: Redis (port 6380)
- **serverless-redis-http**: Upstash-compatible HTTP proxy (port 8079)

## Key Features

- **Conditional Import Maps**: Environment-specific mocking for Storybook
- **Custom Design System**: TailwindCSS with custom tokens from ArteOdyssey
- **Comprehensive Testing**: In-source, Storybook, Vitest, and Playwright E2E
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Performance**: Bundle analysis, tree shaking, and optimization
- **External UI Library**: ArteOdyssey package for reusable components

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
