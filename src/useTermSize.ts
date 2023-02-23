import { useRef, useState, useEffect } from 'react';

interface Size {
  width: number,
  height: number,
}

function isOnMobile(): boolean {
  return /Android|iPhone|webOS|iPad|iPod|Blackberry|Windows Phone/i.test(navigator.userAgent);
}

function getRealSize(landscape: boolean): Size {
  if (onMobile) {
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

export var onMobile: boolean = false;

export default function useTermSize(fixedWidth: number): { width: number, height: number } {
  const [termSize, setTermSize] = useState<Size | null>(null);
  const orientation = useRef('p');
  const portrait = useRef(null as unknown as MediaQueryList);

  useEffect(() => {
    function handleResize() {
      onMobile = isOnMobile();
      let size = getTermSize(fixedWidth, orientation.current === 'l');
      document.documentElement.style.setProperty('--char-height', `${window.innerHeight / size.height}px`);
      setTermSize(size);
    }

    if (!termSize) {
      portrait.current = window.matchMedia("(orientation: portrait)");
      handlePortrait(portrait.current);
      handleResize();
    }

    function handlePortrait(e: any) {
      if(e.matches && isOnMobile()) {
        orientation.current = 'p';
        handleResize();
      } else {
        orientation.current = 'l';
        handleResize();
      }
    }

    portrait.current.addEventListener('change', handlePortrait);
    window.addEventListener('resize', handleResize);
    return () => {
      portrait.current.removeEventListener('change', handlePortrait);
      window.removeEventListener('resize', handleResize);
    };
  }, [termSize, fixedWidth]);

  return termSize ?? {width: 80, height: 24};
}
