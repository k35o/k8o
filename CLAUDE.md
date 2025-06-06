# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `pnpm run dev` - Start development server
- `pnpm run storybook` - Launch Storybook design system (port 6006)

### Database

- `pnpm run generate` - Generate migration from schema files
- `pnpm run migrate` - Execute database migrations
- `docker compose up -d` - Start local PostgreSQL and KV services
- `docker compose exec postgres psql -U postgres -d main` - Connect to local database

### Testing

- `pnpm run test` - Run all tests (Vitest with multiple projects)
- `pnpm run test:ui` - Launch Vitest UI
- `pnpm run coverage` - Generate test coverage report

### Code Quality

- `pnpm run lint` - ESLint with zero warnings policy
- `pnpm run type-check` - TypeScript type checking
- `pnpm run format` - Format code with Prettier

### Build

- `pnpm run build` - Build for production
- `ANALYZE=true pnpm run build` - Build with bundle analysis

## Architecture Overview

### Application Structure

- **Next.js 15** with App Router and TypeScript
- **MDX Integration** for blog content with math/syntax highlighting
- **Database**: Drizzle ORM with PostgreSQL (Neon in production)
- **Styling**: TailwindCSS with design system in Storybook
- **Testing**: Vitest with browser mode for components, separate projects for utils/services

### Key Patterns

**Import Maps**: Uses custom import maps in package.json with environment-specific mocking:

- `#database/db` - Database connection (mocked in Storybook)
- `#api/blog` - Blog API (mocked in Storybook)
- `#libs/react` - React utilities (mocked in Storybook)

**Database Schema**: Located in `src/database/schema/` with organized relations:

- Content: blogs, talks, quizzes
- User data: comments, feedbacks, subscribers
- Tagging system: blog-tag, talk-tag, service-tag

**Component Organization**:

- Reusable UI components in `src/components/`
- Page-specific components in `src/app/[page]/_components/`
- Each component has `.stories.tsx` for Storybook

**Testing Strategy**:

- Utils/services: Node.js environment
- Components: Browser mode with Playwright
- Stories: Storybook integration tests
- MSW for API mocking

### Development Notes

**Environment Setup**: Copy `.env.example` to `.env.local` and start Docker for local database. Production uses Neon PostgreSQL, Upstash KV, MicroCMS, and Resend.

**MDX Processing**: Blog articles use frontmatter, math rendering (KaTeX), and syntax highlighting (Shiki). Located in `src/app/blog/(articles)/`.

**Mock Strategy**: Comprehensive mocking system for Storybook using import maps to swap implementations without conditional imports.
