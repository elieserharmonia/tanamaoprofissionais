import React from 'react';

interface LogoProps {
  size?: number; // width/height size in px
  mode?: 'original' | 'header' | 'white' | 'dark' | 'simple';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  mode = 'original', 
  className = '' 
}) => {
  const hasBackground = mode === 'original';
  
  let fillBg = '#F5C800';
  let fillMain = '#1A1A1A'; // for the "T"
  
  if (mode === 'header') {
    fillMain = '#F5C800';
  } else if (mode === 'dark') {
    fillMain = '#FFFFFF';
  } else if (mode === 'white') {
    fillMain = '#1B2A6B';
  } else if (mode === 'simple') {
    fillMain = '#1A1A1A';
  }

  return (
    <svg 
      id="tanamao-logo-svg"
      viewBox="0 0 300 300" 
      width={size} 
      height={size} 
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shape (only for original) */}
      {hasBackground && (
        <rect 
          id="logo-bg-rect"
          fill={fillBg} 
          width="300" 
          height="300"
        />
      )}
      
      {/* Letra T - Travessão e Haste */}
      {/* Travessão do T: x=40 y=80 width=220 height=60 */}
      <rect 
        id="logo-t-bar"
        x="40" 
        y="80" 
        width="220" 
        height="60" 
        fill={fillMain} 
      />
      {/* Haste do T: x=110 y=140 width=80 height=130 */}
      <rect 
        id="logo-t-stem"
        x="110" 
        y="140" 
        width="80" 
        height="130" 
        fill={fillMain} 
      />
    </svg>
  );
};

export default Logo;
