import React, { useState } from 'react';

interface LogoProps {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ 
  size,
  width,
  height,
  className = '',
  dark = true,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Use Opilex logo - works on both dark and light backgrounds
  // The logo has red text which is visible on both
  const logoSource = '/Opilex-Logo.png';

  // Use width/height if provided, otherwise fall back to size for both
  const logoWidth = width || (style?.width ? undefined : (size || 48));
  const logoHeight = height || (style?.height ? undefined : (size || 48));

  const handleError = () => {
    setImageError(true);
    console.error(`Failed to load logo from: ${logoSource}`);
  };

  // Fallback to text if image fails to load
  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center font-ubuntu-black ${dark ? 'text-white' : 'text-[#E31E24]'} ${className}`}
        style={{ width: logoWidth, height: logoHeight, ...style }}
      >
        <span className="text-[#E31E24] font-black" style={{ fontSize: typeof logoWidth === 'number' ? logoWidth * 0.4 : 20 }}>
          OPILEX
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoSource}
      alt="Opilex Logo"
      width={logoWidth}
      height={logoHeight}
      className={`object-contain ${className}`}
      style={{ width: logoWidth, height: logoHeight, ...style }}
      onError={handleError}
      loading="eager"
    />
  );
};
