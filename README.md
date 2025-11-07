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
- **[core/src/database/README.md](./core/src/database/README.md)** - Database schema and operations

## Setup

Install dependencies after preparing Node.js v22.21.0 and pnpm v10.20.0.

```bash
pnpm i --frozen-lockfile
```

Copy environment variables and launch Docker services for database and KV storage.

```bash
cp core/.env.example core/.env.local
docker compose up -d
pnpm run -F core migrate
```

For MicroCMS or Resend integration, ask k8o for the `MICROCMS_API_KEY` or `RESEND_API_KEY`.

## Architecture

**Turborepo Monorepo** with 2 workspaces:

- **core** - Main Next.js 15 application with App Router
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
pnpm run -F core storybook
```

### Email Templates

Development server for React Email templates (port 3333).

```bash
pnpm run -F core email
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
pnpm run -F core generate

# Generate custom migration files
pnpm run -F core generate:custom

# Execute database migrations
pnpm run -F core migrate

# Export schema to SQL file
pnpm run -F core export:schema

# Build ERD (Entity Relationship Diagram)
pnpm run -F core build:erd

# Connect to local PostgreSQL
docker compose exec postgres psql -U postgres -d main
```

## Tech Stack

### Frontend

- **Next.js 15.5** - App Router, React 19, TypeScript
- **TailwindCSS 4.1** - Custom design tokens (no standard classes like `text-gray-600`)
- **Motion** - Animations
- **MDX** - Blog content with KaTeX math and Shiki syntax highlighting
- **ArteOdyssey** - UI component library (npm: @k8o/arte-odyssey)

### Backend & Database

- **Drizzle ORM 0.44** - TypeScript-first ORM
- **PostgreSQL 18** - Neon (production), Docker (local)
- **Redis** - Upstash (production), Docker (local)
- **Zod 4.1** - Schema validation

### Development Tools

- **Turbo 2.5** - Monorepo build system
- **Vitest 3.2** - Test runner with browser mode support
- **Storybook 9.1** - Component development environment
- **React Email 4.3** - Email templates
- **MSW 2.11** - API mocking
- **Lefthook 1.13** - Git hooks
- **Playwright 1.56** - E2E testing
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
- **redis**: Redis (port 6379)
- **serverless-redis-http**: Upstash-compatible HTTP proxy (port 8079)

## Key Features

- **Conditional Import Maps**: Environment-specific mocking for Storybook
- **Custom Design System**: TailwindCSS with custom tokens from ArteOdyssey
- **Comprehensive Testing**: In-source, Storybook, Vitest, and Playwright E2E
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Performance**: Bundle analysis, tree shaking, and optimization
- **External UI Library**: ArteOdyssey package for reusable components

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
