import React from 'react';

// Logo lives in public/app-logo.png (single copy — also used by
// index.html for favicon / og:image). Previously there were three
// identical copies (root, public/, src/assets/); the src/assets one
// was removed in the dead-code cleanup.
const appLogoImg = '/app-logo.png';

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
      />
    </div>
  );
};

export default AppLogo;

