import React from 'react';

interface IleysBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'dark' | 'light' | 'auto';
  className?: string;
}

export const IleysBrandLogo: React.FC<IleysBrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'auto',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const isLightText = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem: Navy Graduation Cap atop Golden Open Book */}
      <svg
        className={`${iconSizes[size]} shrink-0 transition-transform duration-200 hover:scale-105`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Golden Open Book Base */}
        <path
          d="M6 31C11.5 28 18.5 28 24 31C29.5 28 36.5 28 42 31V41C36.5 38 29.5 38 24 41C18.5 38 11.5 38 6 41V31Z"
          fill="#F7A914"
        />
        {/* Book Spine & Center Shadow */}
        <path
          d="M24 31V41"
          stroke="#E59807"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 31C11.5 28 18.5 28 24 31V41C18.5 38 11.5 38 6 41V31Z"
          fill="#FABD38"
        />

        {/* Navy Graduation Cap (Mortarboard Diamond) */}
        <polygon
          points="24,8 44,17 24,26 4,17"
          fill="#122E52"
        />
        {/* Cap Base Skullcap */}
        <path
          d="M13 21V28C13 32.5 17.9 35 24 35C30.1 35 35 32.5 35 28V21L24 25.5L13 21Z"
          fill="#0B1B32"
        />
        {/* Golden Tassel & Knot */}
        <circle cx="24" cy="17" r="1.5" fill="#F7A914" />
        <path
          d="M24 17L37 21V26"
          stroke="#F7A914"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="37" cy="26" r="1.2" fill="#F7A914" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight leading-none ${
            isLightText
              ? 'text-white'
              : 'text-[#12233F] dark:text-white'
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          Ileys
        </span>
      )}
    </div>
  );
};
