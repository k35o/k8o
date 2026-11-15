import { BaseIcon } from '@k8ordo/ui/icons';
import type { BaseIconProps, IconRenderProps } from '@k8ordo/ui/icons';
import { useId } from 'react';
import type { FC } from 'react';

const Safari: FC<IconRenderProps> = (props) => {
  const uid = useId();
  return (
    <svg
      {...props}
      viewBox="194.5 190.1 135.1 135.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`${uid}-a`}
          x1="132.55"
          x2="134.37"
          y1="111.67"
          y2="-105.3"
          href={`#${uid}-b`}
        >
          <stop offset="0" stopColor="#d2d2d2" />
          <stop offset=".53" stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id={`${uid}-b`} gradientUnits="userSpaceOnUse" />
        <linearGradient
          id={`${uid}-c`}
          x1="65.44"
          x2="67.4"
          y1="115.72"
          y2="17.14"
          href={`#${uid}-b`}
        >
          <stop offset="0" stopColor="#005ad5" />
          <stop offset=".16" stopColor="#0875f0" />
          <stop offset=".31" stopColor="#218cee" />
          <stop offset=".63" stopColor="#27a5f3" />
          <stop offset=".81" stopColor="#25aaf2" />
          <stop offset="1" stopColor="#21aaef" />
        </linearGradient>
        <linearGradient
          id={`${uid}-d`}
          x1="158.7"
          x2="176.28"
          y1="96.71"
          y2="79.53"
          href={`#${uid}-b`}
        >
          <stop offset="0" stopColor="#c72e24" />
          <stop offset="1" stopColor="#fd3b2f" />
        </linearGradient>
        <filter id={`${uid}-e`} colorInterpolationFilters="sRGB">
          <feFlood floodOpacity=".28" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feGaussianBlur stdDeviation="3" />
          <feOffset dx=".3" dy="2.8" />
          <feComposite in="SourceGraphic" />
        </filter>
        <filter id={`${uid}-f`} colorInterpolationFilters="sRGB">
          <feFlood floodOpacity=".31" />
          <feComposite floodOpacity=".31" in2="SourceGraphic" operator="out" />
          <feGaussianBlur floodOpacity=".3" stdDeviation=".7" />
          <feOffset dy="1.8" />
          <feComposite in2="SourceGraphic" operator="atop" />
        </filter>
        <filter id={`${uid}-g`} colorInterpolationFilters="sRGB">
          <feFlood floodOpacity=".61" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feGaussianBlur stdDeviation=".5" />
          <feOffset dx=".8" dy=".8" />
          <feComposite in="SourceGraphic" result="A" />
          <feColorMatrix values="0 0 0 -1 0 0 0 0 -1 0 0 0 0 -1 0 0 0 0 1 0" />
          <feFlood floodOpacity=".4" />
          <feComposite in2="A" operator="in" />
          <feGaussianBlur stdDeviation="3.8" />
          <feOffset dx="2.3" dy="3.3" />
          <feComposite in="A" />
        </filter>
        <filter id={`${uid}-h`} width="110%" height="110%" x="-1%" y="-1%">
          <feGaussianBlur in="SourceAlpha" stdDeviation=".4" />
          <feOffset dx=".1" dy=".2" />
          <feComponentTransfer result="A">
            <feFuncA type="linear" />
          </feComponentTransfer>
          <feFlood floodColor="rgba(0,0,0,0.5)" />
          <feComposite in2="A" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient
          id={`${uid}-i`}
          cx="-69.88"
          cy="69.29"
          r="54.01"
          gradientTransform="matrix(.9023 -.01249 .0377 2.7234 -9.44 -120.29)"
          href={`#${uid}-b`}
        >
          <stop offset="0" stopColor="#24a5f3" stopOpacity=".01" />
          <stop offset="1" stopColor="#1e8ceb" stopOpacity=".98" />
        </radialGradient>
        <radialGradient
          id={`${uid}-j`}
          cx="109.35"
          cy="13.76"
          r="93.08"
          gradientTransform="matrix(-.01822 1.0922 -1.042 -.01765 136.95 -115.33)"
          href={`#${uid}-b`}
        >
          <stop offset="0" stopOpacity="0" />
          <stop offset=".96" stopColor="#5488d6" stopOpacity="0" />
          <stop offset="1" stopColor="#5d96eb" />
        </radialGradient>
      </defs>
      <g filter={`url(#${uid}-f)`} transform="translate(194.2 190.07)">
        <ellipse
          cx="67.77"
          cy="67.73"
          fill={`url(#${uid}-c)`}
          paintOrder="stroke fill markers"
          rx="54.01"
          ry="53.98"
        />
        <ellipse
          cx="-69.88"
          cy="69.29"
          fill={`url(#${uid}-i)`}
          rx="54.01"
          ry="53.98"
          transform="translate(137.65 -1.55)"
        />
      </g>
      <ellipse
        cx="120"
        cy="14.15"
        fill={`url(#${uid}-j)`}
        rx="93.08"
        ry="93.67"
        transform="matrix(.58082 0 0 .57636 192.3 249.63)"
      />
      <g
        filter={`url(#${uid}-g)`}
        transform="matrix(.58289 0 0 .56508 196.8 181.63)"
      >
        <path
          fill="#cac7c8"
          d="m46 191.66.73.35 72.18-48.2-7.34-8.95L46 191.66Z"
        />
        <path
          fill="#fbfffc"
          d="m45.8 190.87.2.8 65.57-56.8-6.95-8.92-58.83 64.92Z"
        />
        <path
          fill={`url(#${uid}-d)`}
          d="m118.91 143.81-7.35-8.95 66.08-57.2.27.73-59 65.42Z"
        />
        <path
          fill="#fb645c"
          d="m104.62 125.95 6.94 8.92 66.08-57.2-.65-.35-72.37 48.63Z"
        />
      </g>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeMiterlimit="1"
        strokeWidth="1.33"
        d="m286.59 278.44 3.14-2.14m-11.23-17.8 7.8-1.37m-8.32-2.9 3.78-.3m-3.3-12.47 7.8 1.38m-8.2 3.03 3.76.38m-1.2-13.05 7.47 2.73m-3.77-10.5 6.86 3.96m-1.87-10.96 6.07 5.09m.05-11.07 5.09 6.07m1.97-10.99 3.97 6.86m3.7-10.53 2.71 7.43m5.62-9.62 1.37 7.8m15.62-7.89-1.38 7.8m9.82-5.6-2.72 7.42m10.5-3.75-3.96 6.86m10.98-1.89-5.12 6.07m16.18 6.96-6.87 3.96m10.45 3.88-7.45 2.7m9.64 5.6-7.82 1.38m7.81 15.79-7.82-1.39m5.6 9.7-7.44-2.71m3.8 10.47-6.87-3.95m1.91 10.98-6.07-5.07m-.05 11.2-5.1-6.08m-1.95 10.99-4-6.88m-3.87 10.5-2.7-7.43m-5.61 9.61-1.37-7.78m-15.78 7.75 1.4-7.86m-9.7 5.58 2.72-7.47m-10.5 3.73 3.97-6.87m-10.96 1.9 5.08-6.03m-8.26 3.13 2.75-2.68m3.84 8.23 2.2-3.1m5.2 7.44 1.66-3.45m6.43 6.47 1.02-3.7m7.52 5.32.43-3.82m8.08 3.8-.31-3.84m8.81 2.33-.97-3.69m9.06.75-1.58-3.48m9.05-.76-2.16-3.18m8.78-2.38-2.68-2.73m8.24-3.85-3.11-2.2m7.42-5.2-3.47-1.67m6.42-6.41-3.7-1.03m5.17-7.46-3.78-.37m3.8-8.24-3.81.3m2.35-8.8-3.7.97m.8-9.06-3.49 1.61m-1.03-9.12-3.2 2.2m-2.12-8.62-2.72 2.7m-3.84-8.28-2.23 3.12m-5.21-7.45-1.66 3.44m-6.55-6.32-1.02 3.63m-7.42-5.2-.38 3.81m-8.09-3.66.28 3.8m-8.79-2.34.95 3.68m-8.9-.72 1.61 3.46m-9.06.82 2.18 3.16m-8.82 2.27 2.68 2.7m-8.25 3.85 3.1 2.23m-7.44 5.17 3.42 1.66m-6.3 6.36 3.7 1.05m-3.71 24.39 3.7-.91m-2.44 5.03 7.48-2.72m-5.86 6.73 3.5-1.61m-1.53 5.43 6.87-3.95m-13.33-20.52 7.96.01m41.16-41.44v-7.96m.02 98.74.01-7.94m49.33-41.4-7.95-.01"
        filter={`url(#${uid}-h)`}
        transform="translate(-65 7.73)"
      />
    </svg>
  );
};

export const SafariIcon: FC<Partial<BaseIconProps>> = ({ size = 'md' }) => (
  <BaseIcon renderItem={(props) => <Safari {...props} />} size={size} />
);
