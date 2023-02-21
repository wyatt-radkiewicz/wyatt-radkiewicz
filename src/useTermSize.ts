import { useState, useEffect } from 'react';

interface Size {
  width: number,
  height: number,
}

function getTermSize(fixedWidth: number): Size {
  return {
    width: fixedWidth,
    height: Math.round((fixedWidth * window.innerHeight) / window.innerWidth),
  };
}

export default function useTermSize(fixedWidth: number): { width: number, height: number } {
  const [termSize, setTermSize] = useState<Size | null>(null);

  useEffect(() => {
    function handleResize() {
      let size = getTermSize(fixedWidth);
      //document.documentElement.style.setProperty('--char-width', `${window.innerWidth / size.width}px`);
      document.documentElement.style.setProperty('--char-height', `${window.innerHeight / size.height}px`);
      setTermSize(size);
    }

    if (!termSize) {
      handleResize();
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [termSize]);

  return termSize ?? {width: 80, height: 24};
}
