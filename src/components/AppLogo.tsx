import React from 'react';
import appLogoImg from '../assets/app-logo.png';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  showBackground?: boolean;
  onClick?: () => void;
  title?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "w-10 h-10",
  size,
  showBackground = false,
  onClick,
  title = "Nascent Player TV Logo"
}) => {
  const style = size ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size } : undefined;

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden select-none ${showBackground ? 'bg-[#131313] rounded-xl border border-white/10' : ''} ${className}`} 
      style={style}
      onClick={onClick}
      title={title}
    >
      <img 
        src={appLogoImg} 
        alt={title}
        className="w-full h-full object-contain bg-transparent transition-transform duration-200"
        draggable={false}
        onError={(e) => {
          // Graceful fallback to static public asset path if necessary
          (e.currentTarget as HTMLImageElement).src = '/app-logo.png';
        }}
      />
    </div>
  );
};

export default AppLogo;

