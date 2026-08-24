import Link from 'next/link';
import { Suspense } from 'react';

import { Copyright } from './copyright';

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 p-4">
      <nav aria-label="サイト情報">
        <ul className="flex items-center gap-6">
          <li>
            <Link
              className="text-fg-mute hover:text-fg-base text-sm transition-colors"
              href="/about"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              className="text-fg-mute hover:text-fg-base text-sm transition-colors"
              href="/contact"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              className="text-fg-mute hover:text-fg-base text-sm transition-colors"
              href="/privacy"
            >
              Privacy
            </Link>
          </li>
        </ul>
      </nav>
      <Suspense
        fallback={
          <p className="text-fg-mute md:text-lg">
            ©︎ 2024〜2026 k8o. All Rights Reserved.
          </p>
        }
      >
        <Copyright />
      </Suspense>
    </footer>
  );
}
