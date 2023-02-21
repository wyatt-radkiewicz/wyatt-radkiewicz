import { useRef, useState, useEffect } from 'react';

interface Size {
  width: number,
  height: number,
}

function isOnMobile(): boolean {
  return /Android|iPhone|webOS|iPad|iPod|Blackberry|Windows Phone/i.test(navigator.userAgent);
}

function getRealSize(landscape: boolean): Size {
  if (isOnMobile()) {
    if (landscape) {
      return {
        width: screen.height,
        height: screen.width,
      };
    } else {
      return {
        width: screen.width,
        height: screen.height,
      };
    }
  } else {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}

function getTermSize(fixedWidth: number, landscape: boolean): Size {
  let size = getRealSize(landscape);
  return {
    width: fixedWidth,
    height: Math.round((fixedWidth * size.height) / size.width),
  };
}

export default function useTermSize(fixedWidth: number): { width: number, height: number } {
  const [termSize, setTermSize] = useState<Size | null>(null);
  const [orientation, setOrientation] = useState('p');
  const portrait = useRef(null as unknown as MediaQueryList);
  const landscape = useRef(null as unknown as MediaQueryList);

  useEffect(() => {
    function handleResize() {
      let size = getTermSize(fixedWidth, orientation === 'l');
      document.documentElement.style.setProperty('--char-height', `${window.innerHeight / size.height}px`);
      setTermSize(size);
    }

    if (!termSize) {
      portrait.current = window.matchMedia("(orientation: portrait)");
      landscape.current = window.matchMedia("(orientation: landscape)");
      handleResize();
    }

    function handlePortrait(e: MediaQueryListEvent) {
      if(e.matches && isOnMobile()) {
        setOrientation('p');
        handleResize();
      }
    }
    function handleLandscape(e: MediaQueryListEvent) {
      if(e.matches && isOnMobile()) {
        setOrientation('l');
        handleResize();
      }
    }

    portrait.current.addEventListener('change', handlePortrait);
    landscape.current.addEventListener('change', handleLandscape);
    window.addEventListener('resize', handleResize);
    return () => {
      portrait.current.removeEventListener('change', handlePortrait);
      landscape.current.addEventListener('change', handleLandscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [termSize, fixedWidth, orientation]);

  return termSize ?? {width: 80, height: 24};
}
