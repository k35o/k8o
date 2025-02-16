# k8o

This is a website for everything created by k8o!

## setup

Install the package after preparing `Node.js` and `pnpm` with reference to the version described in `package.json`.

```command
pnpm i --frozen-lockfile
```

Copy environment variables and launch docker to use SQL and KV.

```command
cp .env.example .env.local
docker compose up -d
pnpm run migration
```

If you want to use the MicroCMS locally, ask k8o for the MICROCMS_API_KEY.

## development

### dev server

Starts the application in development mode with hot-code reloading, error reporting, and more.

```
pnpm run dev
```

### storybook

There is a collection of components and a design system.

```command
pnpm run storybook
```

### tests

One side is tested by VITEST. It will run in `browser mode` except for the `utils` test.

```command
pnpm run test

# using Vitest UI
pnpm run test:ui

# If you want to get covarage result ...
pnpm run coverage
```

### lint

Using `elsint` affected by `next.js`.

```command
pnpm run lint
```

### format

By `prettier`.

```
pnpm run format
```

### type-check

It work in `typescript`(`tsc --noEmit`).

```command
pnpm run type-check
```

### database

Generate migration file by schema file(`src/drizzle/schema.ts`).

```command
pnpm run generate
```

Generate custom migration file, such as seeding data.

```command
pnpm run generage:custom
```

Execute database migration in `migrations/*.sql`.

```command
pnpm run migrate
```

Connect local postgres database.

```command
docker compose exec postgres psql -U postgres -d main
```

## composition

### platform

#### Application

[Vercel](https://vercel.com/k35o/k8o)

#### Database

[Neon](https://console.neon.tech/app/projects/cool-king-69719941)

#### KV

[Upstash](https://console.upstash.com/vercel/kv/6ae3d043-1c14-4a5e-b4e2-18872bbd81bb)

#### CMS

[MicroCMS](https://k35o.microcms.io)

### framework

[next.js](https://nextjs.org/)

### styling

[tailwdindcss](https://tailwindcss.com/)

### icon

[heroicons](https://heroicons.com/)

### animation

[motion](https://motion.dev)
