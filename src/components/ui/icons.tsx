/**
 * Icons in the house style: 16px grid, 1.4 stroke, round caps, currentColor.
 * Decorative by default; label the control that holds them instead.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ className = "size-4", children, ...props }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={className} {...props}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
  </Icon>
);

export const ArrowDownLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.5 4.5 4.5 11.5M10 11.5H4.5V6" />
  </Icon>
);

export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3v10M3 8h10" />
  </Icon>
);

export const Home = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.75 7 8 2.75 13.25 7v5.5c0 .41-.34.75-.75.75H10V9.5H6v3.75H3.5a.75.75 0 0 1-.75-.75V7Z" />
  </Icon>
);

export const CardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2" />
    <path d="M1.75 6.5h12.5M4.5 10h2" />
  </Icon>
);

export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
  </Icon>
);

export const Eye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.5 8S3.75 3.5 8 3.5 14.5 8 14.5 8 12.25 12.5 8 12.5 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </Icon>
);

export const EyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.6 3.65A6.3 6.3 0 0 1 8 3.5c4.25 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.55 2.15M4.2 4.95C2.45 6.1 1.5 8 1.5 8S3.75 12.5 8 12.5c1.3 0 2.4-.4 3.3-.95M6.6 6.6a2 2 0 0 0 2.8 2.8M2 2l12 12" />
  </Icon>
);

export const Snowflake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 1.75v12.5M2.6 4.9l10.8 6.2M2.6 11.1l10.8-6.2M6.25 2.75 8 4.25l1.75-1.5M6.25 13.25 8 11.75l1.75 1.5" />
  </Icon>
);

export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4 4 8 8m0-8-8 8" />
  </Icon>
);

export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.5 5.5 8l4.5 4.5" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 3.5 4.5 4.5L6 12.5" />
  </Icon>
);

export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </Icon>
);

export const Backspace = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.25 3.5h7.5c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-7.5L1.75 8l3.5-4.5Z" />
    <path d="m7.5 6 3 4m0-4-3 4" />
  </Icon>
);

export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 8.5 3.2 3L13 4.5" />
  </Icon>
);

export const Contactless = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5.5a3.5 3.5 0 0 1 0 5M7.75 4a6 6 0 0 1 0 8M10.5 2.5a8.5 8.5 0 0 1 0 11" />
  </Icon>
);

export const Globe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M1.75 8h12.5M8 1.75c1.75 1.8 2.6 3.9 2.6 6.25S9.75 12.45 8 14.25C6.25 12.45 5.4 10.35 5.4 8S6.25 3.55 8 1.75Z" />
  </Icon>
);

export const Cash = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.75" y="4" width="12.5" height="8" rx="1.5" />
    <circle cx="8" cy="8" r="1.75" />
  </Icon>
);

export const Cup = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.75 6h8.5v3.25a3.75 3.75 0 0 1-3.75 3.75h-1a3.75 3.75 0 0 1-3.75-3.75V6ZM11.25 7h.75a1.75 1.75 0 0 1 0 3.5h-1M5.5 2.5v1.5M8 2.5v1.5" />
  </Icon>
);

export const Tram = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.25" y="2.25" width="9.5" height="9" rx="2" />
    <path d="M3.25 7h9.5M5.75 9.25h.01M10.25 9.25h.01M5.5 11.25 4 13.75M10.5 11.25l1.5 2.5" />
  </Icon>
);

export const Bag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 5.25h10l-.75 8H3.75L3 5.25ZM5.75 5.25V4.5a2.25 2.25 0 0 1 4.5 0v.75" />
  </Icon>
);

export const Ticket = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.75 5.5V4.25c0-.41.34-.75.75-.75h11c.41 0 .75.34.75.75V5.5a2.5 2.5 0 0 0 0 5v1.25c0 .41-.34.75-.75.75h-11a.75.75 0 0 1-.75-.75V10.5a2.5 2.5 0 0 0 0-5ZM9.75 3.5v9" />
  </Icon>
);

export const Plane = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6.75 9.25-3 .75-1.25-1.25 3-1.75L3.75 3.5l1.5-.5 3.5 3 3-2.25c.6-.45 1.45-.39 1.85.15.4.53.25 1.3-.35 1.75L10.25 8l.5 4.5-1.5.5-2.5-3.75Z" />
  </Icon>
);

export const Bolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 1.75 3.25 9H8l-1 5.25L12.75 7H8l1-5.25Z" />
  </Icon>
);

export const Repeat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.75 7V6a2 2 0 0 1 2-2h8.5M11 1.75 13.25 4 11 6.25M13.25 9v1a2 2 0 0 1-2 2h-8.5M5 14.25 2.75 12 5 9.75" />
  </Icon>
);

export const Sun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="2.75" />
    <path d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
  </Icon>
);

export const Moon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
  </Icon>
);
