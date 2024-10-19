# k8o

This is a website for everything created by k8o!

## setup

Install the package after preparing `Node.js` and `pnpm` with reference to the version described in `package.json`.

```command
pnpm i --frozen-lockfile
```

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

## composition

### framework

[next.js](https://nextjs.org/)

### styling

[tailwdindcss](https://tailwindcss.com/)

### icon

[heroicons](https://heroicons.com/)

### animation

[FramerMotion](https://www.framer.com/motion/)
