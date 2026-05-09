import React from 'react';

// Web build: use ESM imports for assets (Vite resolves these to URLs)
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';

interface LogoWebProps {
  size?: number;
  style?: React.CSSProperties & { width?: string | number; height?: string | number };
  forceDark?: boolean;
  dark?: boolean;
}

export const Logo: React.FC<LogoWebProps> = ({
  size = 48,
  style,
  forceDark = false,
  dark = false,
}) => {
  const useDarkBackground = Boolean(dark || forceDark);
  const src = useDarkBackground ? logoLight : logoDark;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={src}
        alt="Opilex Logo"
        style={{
          width: style?.width ?? size,
          height: style?.height ?? size,
          objectFit: 'contain',
          ...style,
        }}
      />
    </div>
  );
};

export default Logo;
