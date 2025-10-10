# k8o

This is a website for everything created by k8o!

## Setup

Install dependencies after preparing Node.js v22.17.1 and pnpm v10.13.1.

```bash
pnpm i --frozen-lockfile
```

Copy environment variables and launch Docker services for database and KV storage.

```bash
cp .env.example .env.local
docker compose up -d
pnpm run -F core migrate
```

For MicroCMS or Resend integration, ask k8o for the `MICROCMS_API_KEY` or `RESEND_API_KEY`.

## Architecture

**Turborepo Monorepo** with 3 workspaces:

- **core** - Main Next.js 15 application with App Router
- **packages/arte-odyssey** - Reusable UI component library with Storybook
- **packages/helpers** - Utility functions with in-source testing
- **packages/hooks** - Custom React hooks

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
pnpm run -F ui storybook
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
- **Hooks**: `.test.tsx` files with `vitest-browser-react`
- **Core App**: Browser mode for React components, Node.js for services/utils

## Code Quality

### Linting & Formatting

Using Biome.

```bash
pnpm run check

# Auto-fix
pnpm run check:fix
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

- **Next.js 15** - App Router, React 19, TypeScript
- **TailwindCSS 4** - Custom design tokens (no standard classes like `text-gray-600`)
- **Motion** - Animations
- **MDX** - Blog content with KaTeX math and Shiki syntax highlighting

### Backend & Database

- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - Neon (production), Docker (local)
- **Redis** - Upstash (production), Docker (local)

### Development Tools

- **Turbo** - Monorepo build system
- **Vitest** - Test runner with browser mode support
- **Storybook** - Component development environment
- **React Email** - Email templates
- **MSW** - API mocking
- **Lefthook** - Git hooks

## Production Services

- **Hosting**: [Vercel](https://vercel.com/k35o/k8o)
- **Database**: [Neon](https://console.neon.tech/app/projects/cool-king-69719941)
- **KV Storage**: [Upstash](https://console.upstash.com/vercel/kv/6ae3d043-1c14-4a5e-b4e2-18872bbd81bb)
- **CMS**: [MicroCMS](https://k35o.microcms.io)
- **Email**: [Resend](https://resend.com)

## Docker Services

Local development services (via `docker compose up -d`):

- **postgres**: PostgreSQL 17 (port 5432)
- **neon-proxy**: Neon WebSocket proxy (port 5433)
- **redis**: Redis (port 6379)
- **serverless-redis-http**: Upstash-compatible HTTP proxy (port 8079)

## Key Features

- **Conditional Import Maps**: Environment-specific mocking for Storybook
- **Custom Design System**: TailwindCSS with custom tokens in `@theme`
- **Comprehensive Testing**: In-source, Storybook, and Vitest integration
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Performance**: Bundle analysis, tree shaking, and optimization

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
