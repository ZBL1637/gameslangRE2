import React from 'react';
import './Icon.scss';

export type IconName = 'lock' | 'check' | 'star' | 'exp' | 'flag' | 'arrow-right' | 'arrow-down' | 'skull';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
}

const icons: Record<IconName, React.ReactNode> = {
  lock: '🔒',
  check: '✅',
  star: '⭐',
  exp: '💎',
  flag: '🚩',
  'arrow-right': '▶',
  'arrow-down': '▼',
  skull: '💀',
};

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '', 'aria-label': ariaLabel, ...props }) => {
  return (
    <span
      className={`rpg-icon size-${size} ${className}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
    >
      {icons[name]}
    </span>
  );
};
