import React from 'react';

/**
 * Official Indiana University Brick Logo
 * IU Trident mark with "INDIANA UNIVERSITY" wordmark
 */

export interface IULogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'crimson' | 'white' | 'black';
  className?: string;
}

export function IULogo({ 
  variant = 'full', 
  size = 'md',
  color = 'crimson',
  className = '' 
}: IULogoProps) {
  const sizeMap = {
    sm: { height: 24, width: variant === 'icon' ? 24 : 120 },
    md: { height: 32, width: variant === 'icon' ? 32 : 160 },
    lg: { height: 48, width: variant === 'icon' ? 48 : 240 },
    xl: { height: 64, width: variant === 'icon' ? 64 : 320 },
  };

  const colorMap = {
    crimson: 'var(--brand-crimson)',
    white: 'var(--brand-white)',
    black: 'var(--brand-black)',
  };

  const fillColor = colorMap[color];
  const dimensions = sizeMap[size];

  // Icon Only - IU Trident Mark
  if (variant === 'icon') {
    return (
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Indiana University"
      >
        <g>
          {/* IU Trident Icon */}
          <path
            d="M32 8L28 24H24L26 32L22 40H28L32 56L36 40H42L38 32L40 24H36L32 8Z"
            fill={fillColor}
          />
          <path
            d="M16 20H20V44H16V20Z"
            fill={fillColor}
          />
          <path
            d="M44 20H48V44H44V20Z"
            fill={fillColor}
          />
          {/* Decorative elements */}
          <rect x="14" y="18" width="8" height="4" fill={fillColor} />
          <rect x="42" y="18" width="8" height="4" fill={fillColor} />
          <rect x="14" y="42" width="8" height="4" fill={fillColor} />
          <rect x="42" y="42" width="8" height="4" fill={fillColor} />
        </g>
      </svg>
    );
  }

  // Wordmark Only
  if (variant === 'wordmark') {
    return (
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 320 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Indiana University"
      >
        <g>
          {/* INDIANA */}
          <path
            d="M20 16H28V48H20V16Z"
            fill={fillColor}
          />
          <path
            d="M36 16H44L60 40V16H68V48H60L44 24V48H36V16Z"
            fill={fillColor}
          />
          <path
            d="M76 16H92C100 16 106 22 106 32C106 42 100 48 92 48H76V16ZM84 24V40H92C95 40 98 37 98 32C98 27 95 24 92 24H84Z"
            fill={fillColor}
          />
          <path
            d="M114 16H122V48H114V16Z"
            fill={fillColor}
          />
          <path
            d="M134 16H150L162 48H154L151 40H133L130 48H122L134 16ZM136 33H148L142 20L136 33Z"
            fill={fillColor}
          />
          <path
            d="M170 16H178L194 40V16H202V48H194L178 24V48H170V16Z"
            fill={fillColor}
          />
          <path
            d="M214 16H230L242 48H234L231 40H213L210 48H202L214 16ZM216 33H228L222 20L216 33Z"
            fill={fillColor}
          />
          
          {/* UNIVERSITY */}
          <path
            d="M20 56H28V76C28 80 26 82 22 82C18 82 16 80 16 76V56H20V76C20 77 20 78 22 78C24 78 24 77 24 76V56H28Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M36 56H44L60 72V56H68V88H60L44 72V88H36V56Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M76 56H84V88H76V56Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M92 56H108L112 88H104L103 80H97L96 88H88L92 56ZM98 72H102L100 64L98 72Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M120 56H136C140 56 144 58 144 64C144 68 142 70 138 71L144 88H136L132 72H128V88H120V56ZM128 64H134C136 64 136 65 136 66C136 67 136 68 134 68H128V64Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M152 56H168C176 56 180 60 180 68C180 72 178 74 174 75C178 76 180 78 180 82C180 88 176 88 168 88H152V56ZM160 64H166C168 64 172 64 172 68C172 72 168 72 166 72H160V64ZM160 76H168C170 76 172 76 172 80C172 84 170 84 168 84H160V76Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M188 56H204C212 56 216 60 216 68C216 76 212 80 204 80H196V88H188V56ZM196 64V72H204C206 72 208 71 208 68C208 65 206 64 204 64H196Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M224 56H240C248 56 252 60 252 68C252 76 248 80 240 80H232V88H224V56ZM232 64V72H240C242 72 244 71 244 68C244 65 242 64 240 64H232Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M260 56H276C284 56 288 60 288 68V76C288 84 284 88 276 88H260V56ZM268 64V80H276C278 80 280 79 280 76V68C280 65 278 64 276 64H268Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
          <path
            d="M296 56H312V64H304V68H310V76H304V80H312V88H296V56Z"
            fill={fillColor}
            transform="translate(0 -24)"
          />
        </g>
      </svg>
    );
  }

  // Full Logo - Icon + Wordmark
  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 400 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Indiana University"
    >
      <g>
        {/* IU Trident Icon */}
        <g transform="translate(0, 0)">
          <path
            d="M32 8L28 24H24L26 32L22 40H28L32 56L36 40H42L38 32L40 24H36L32 8Z"
            fill={fillColor}
          />
          <path
            d="M16 20H20V44H16V20Z"
            fill={fillColor}
          />
          <path
            d="M44 20H48V44H44V20Z"
            fill={fillColor}
          />
          <rect x="14" y="18" width="8" height="4" fill={fillColor} />
          <rect x="42" y="18" width="8" height="4" fill={fillColor} />
          <rect x="14" y="42" width="8" height="4" fill={fillColor} />
          <rect x="42" y="42" width="8" height="4" fill={fillColor} />
        </g>

        {/* INDIANA UNIVERSITY */}
        <g transform="translate(80, 0)">
          <text
            x="0"
            y="24"
            fill={fillColor}
            fontSize="20"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.5"
          >
            INDIANA
          </text>
          <text
            x="0"
            y="44"
            fill={fillColor}
            fontSize="16"
            fontWeight="500"
            fontFamily="Inter, sans-serif"
            letterSpacing="1"
          >
            UNIVERSITY
          </text>
        </g>
      </g>
    </svg>
  );
}
