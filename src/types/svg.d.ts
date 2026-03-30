declare module '*.svg' {
  import React from 'react';
  const SvgComponent: React.FC<{ width?: number; height?: number; [key: string]: any }>;
  export default SvgComponent;
}
