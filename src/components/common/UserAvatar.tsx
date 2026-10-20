import React, { useState } from 'react';
import { getInitials, getAvatarColorPalette, isCustomPhoto } from '../../utils/avatarUtils';

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'header' | 'lg' | 'xl' | '2xl' | '3xl' | 'profile' | 'hero' | number;
  className?: string;
  rounded?: 'full' | '3xl' | '2xl' | 'xl';
  status?: 'Active' | 'On Leave' | 'Inactive' | 'Disabled' | 'Graduated' | 'Suspended';
  showStatus?: boolean;
  ring?: boolean | string;
  alt?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  status,
  showStatus = false,
  ring = false,
  alt,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const hasPhoto = Boolean(avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && isCustomPhoto(avatarUrl) && !imageError);
  const initials = getInitials(name);
  const palette = getAvatarColorPalette(name);

  // Size mapping with clean typographic scale
  const sizeClasses: Record<string, { container: string; text: string; statusDot: string }> = {
    xs: { container: 'w-6 h-6 min-w-6 min-h-6', text: 'text-[10px] font-bold', statusDot: 'w-1.5 h-1.5' },
    sm: { container: 'w-8 h-8 min-w-8 min-h-8', text: 'text-xs font-bold', statusDot: 'w-2 h-2' },
    md: { container: 'w-10 h-10 min-w-10 min-h-10', text: 'text-sm font-bold', statusDot: 'w-2.5 h-2.5' },
    header: { container: 'w-11 h-11 min-w-11 min-h-11', text: 'text-base font-bold', statusDot: 'w-3 h-3' },
    lg: { container: 'w-12 h-12 min-w-12 min-h-12', text: 'text-base font-bold', statusDot: 'w-3 h-3' },
    xl: { container: 'w-16 h-16 min-w-16 min-h-16', text: 'text-xl font-bold', statusDot: 'w-3.5 h-3.5' },
    '2xl': { container: 'w-24 h-24 min-w-24 min-h-24', text: 'text-3xl font-bold', statusDot: 'w-4 h-4' },
    '3xl': { container: 'w-28 h-28 min-w-28 min-h-28', text: 'text-4xl font-bold', statusDot: 'w-5 h-5' },
    profile: { container: 'w-28 h-28 min-w-28 min-h-28', text: 'text-4xl font-bold', statusDot: 'w-5 h-5' },
    hero: { container: 'w-32 h-32 min-w-32 min-h-32', text: 'text-5xl font-bold', statusDot: 'w-5 h-5' },
  };

  const selectedSize = typeof size === 'string' ? sizeClasses[size] || sizeClasses.md : null;

  let ringClass = '';
  if (ring === true) {
    ringClass = 'ring-2 ring-sky-200/80 shadow-2xs';
  } else if (typeof ring === 'string') {
    ringClass = ring;
  }

  const customStyle: React.CSSProperties =
    typeof size === 'number'
      ? {
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          fontSize: `${Math.round(size * 0.4)}px`,
        }
      : {};

  const getStatusColor = () => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500 ring-white';
      case 'On Leave':
        return 'bg-amber-500 ring-white';
      case 'Disabled':
      case 'Suspended':
      case 'Inactive':
        return 'bg-rose-500 ring-white';
      case 'Graduated':
        return 'bg-[#3B82F6] ring-white';
      default:
        return 'bg-emerald-500 ring-white';
    }
  };

  return (
    <div
      onClick={onClick}
      style={customStyle}
      className={`relative inline-flex items-center justify-center shrink-0 select-none rounded-full overflow-hidden ${
        typeof size === 'string' ? selectedSize?.container : ''
      } ${ringClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      title={name}
    >
      {hasPhoto ? (
        <img
          src={avatarUrl!}
          alt={alt || name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        /* Automatic Circular Initials Avatar with Soft Light-Blue Background & Dark Blue Uppercase Initials */
        <div
          className={`w-full h-full flex items-center justify-center rounded-full ${palette.bg} ${palette.text} transition-colors`}
          style={{ backgroundColor: palette.subtleBg, color: palette.subtleText }}
        >
          <span
            className={`${
              typeof size === 'string' ? selectedSize?.text : 'font-bold'
            } uppercase select-none leading-none tracking-normal font-sans`}
          >
            {initials}
          </span>
        </div>
      )}

      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ${getStatusColor()} ${
            typeof size === 'string' ? selectedSize?.statusDot : 'w-2.5 h-2.5'
          }`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
