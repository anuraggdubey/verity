import React from 'react';

export interface VyLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: 'mark' | 'badge' | 'full';
  theme?: 'dark' | 'light';
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export function VyLogoMark({
  size = 28,
  variant = 'mark',
  theme = 'light',
  className = '',
  ...props
}: Omit<VyLogoProps, 'showWordmark' | 'wordmarkClassName'>) {
  const hasBadge = variant === 'badge';

  return (
    <svg
      width={size}
      height={size}
      viewBox={hasBadge ? "0 0 100 100" : "13 16 70 70"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 ${className}`}
      aria-label="Verity Vy Logo"
      role="img"
      {...props}
    >
      <defs>
        {/* Titanium Grey Gradient for Capital V (Dark Mode / Dark Surfaces) */}
        <linearGradient id="vy_v_dark" x1="16" y1="18" x2="56" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E4E4E7" />
          <stop offset="85%" stopColor="#A1A1AA" />
          <stop offset="100%" stopColor="#8E8E93" />
        </linearGradient>

        {/* Liquid Slate Gradient for lowercase y (Dark Mode / Dark Surfaces) */}
        <linearGradient id="vy_y_dark" x1="48" y1="34" x2="82" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F4F4F5" />
          <stop offset="35%" stopColor="#D4D4D8" />
          <stop offset="70%" stopColor="#A1A1AA" />
          <stop offset="100%" stopColor="#52525B" />
        </linearGradient>

        {/* Charcoal / Graphite Gradient for Capital V (Light Mode / White Surfaces) */}
        <linearGradient id="vy_v_light" x1="16" y1="18" x2="56" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#18181B" />
          <stop offset="40%" stopColor="#27272A" />
          <stop offset="85%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#52525B" />
        </linearGradient>

        {/* Charcoal / Slate Gradient for lowercase y (Light Mode / White Surfaces) */}
        <linearGradient id="vy_y_light" x1="48" y1="34" x2="82" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="35%" stopColor="#3F3F46" />
          <stop offset="70%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>

        <linearGradient id="vy_bevelGlow_comp" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Optional squircle badge container if explicitly requested */}
      {hasBadge && (
        <>
          <rect
            width="100"
            height="100"
            rx="22"
            fill={theme === 'dark' ? '#0C0D10' : '#FFFFFF'}
            stroke={theme === 'dark' ? '#22242B' : '#E4E4E7'}
            strokeWidth="1.2"
          />
          {theme === 'dark' && <rect width="100" height="100" rx="22" fill="url(#vy_bevelGlow_comp)" />}
        </>
      )}

      {/* Pure Vy Typographic Ligature: Conjoined Capital V + Lowercase y */}
      <g id="vy-conjoined-mark">
        {/* Capital V Left Pillar */}
        <polygon
          points="16,19 28,19 42.5,70 30.5,70"
          fill={theme === 'dark' ? 'url(#vy_v_dark)' : 'url(#vy_v_light)'}
        />

        {/* Capital V Right Arm (Flows directly to y apex at x-height) */}
        <polygon
          points="30.5,70 42.5,70 57,34 47.5,34"
          fill={theme === 'dark' ? 'url(#vy_v_dark)' : 'url(#vy_v_light)'}
        />

        {/* Conjoined Lowercase y Left Wing (attached to V right arm apex) */}
        <polygon
          points="47.5,34 57,34 66.5,54 58,54.5"
          fill={theme === 'dark' ? 'url(#vy_y_dark)' : 'url(#vy_y_light)'}
          opacity="0.95"
        />

        {/* Lowercase y Descender Blade with architectural return terminal */}
        <path
          d="M 70 34 L 81 34 L 54.5 84 L 40 84 L 40 76.5 L 51 76.5 Z"
          fill={theme === 'dark' ? 'url(#vy_y_dark)' : 'url(#vy_y_light)'}
        />
      </g>
    </svg>
  );
}

export function VyLogo({
  size = 24,
  variant = 'mark',
  theme = 'light',
  showWordmark = false,
  wordmarkClassName = '',
  className = '',
  ...props
}: VyLogoProps) {
  if (!showWordmark) {
    return <VyLogoMark size={size} variant={variant} theme={theme} className={className} {...props} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <VyLogoMark size={size} variant={variant} theme={theme} {...props} />
      <span
        className={`font-semibold tracking-[-0.03em] lowercase text-zinc-950 dark:text-white ${wordmarkClassName}`}
        style={{ fontSize: `${Math.round(size * 0.72)}px` }}
      >
        verity
      </span>
    </div>
  );
}

export default VyLogo;
