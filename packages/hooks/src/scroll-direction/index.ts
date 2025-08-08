'use client';

import { useEffect, useState } from 'react';

type ScrollDirection = {
  x: 'left' | 'right';
  y: 'up' | 'down';
};

export const useScrollDirection = (threshold = 50): ScrollDirection => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({
    x: 'right',
    y: 'up',
  });
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [prevScrollX, setPrevScrollX] = useState(0);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      const newDirection: ScrollDirection = { ...scrollDirection };

      // Vertical scroll direction
      if (currentScrollY > prevScrollY && currentScrollY > threshold) {
        newDirection.y = 'down';
      } else if (currentScrollY < prevScrollY) {
        newDirection.y = 'up';
      }

      // Horizontal scroll direction
      if (currentScrollX > prevScrollX && currentScrollX > threshold) {
        newDirection.x = 'right';
      } else if (currentScrollX < prevScrollX) {
        newDirection.x = 'left';
      }

      setScrollDirection(newDirection);
      setPrevScrollY(currentScrollY);
      setPrevScrollX(currentScrollX);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return (): void => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollY, prevScrollX, scrollDirection, threshold]);

  return scrollDirection;
};
