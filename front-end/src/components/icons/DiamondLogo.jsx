import React from 'react';

function DiamondLogo({ size = 40, className = '' }) {
  return (
    <img
      src="/diamond-logo.png"
      alt="Clarity AI"
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.4))',
      }}
    />
  );
}

export default DiamondLogo;
