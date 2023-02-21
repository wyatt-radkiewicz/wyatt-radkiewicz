import { useState, useEffect } from 'react';

interface WindowSize {
  width: number,
  height: number,
}

function getWindowSize(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export default function useWindowSize(): { width: number, height: number } {
  const [windowSize, setWindowSize] = useState<WindowSize | null>(null);

  useEffect(() => {
    function handleResize() {
      setWindowSize(getWindowSize());
    }

    if (!windowSize) {
      setWindowSize(getWindowSize());
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [windowSize]);

  return windowSize ?? {width: 300, height: 300};
}
