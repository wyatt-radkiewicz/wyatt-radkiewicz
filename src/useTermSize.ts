import { useRef, useState, useEffect } from 'react';

interface Size {
  width: number,
  height: number,
}

function isOnMobile(): boolean {
  return /Android|iPhone|webOS|iPad|iPod|Blackberry|Windows Phone/i.test(navigator.userAgent);
}

export function getRealSize(): Size {
  if (onMobile) {
    if (isLandscape) {
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

export function getRealSizeForScroll(): Size {
  if (onMobile) {
    if (canSetMobileMaxInteriorHeight) {
      mobileMaxInteriorHeight = Math.max(mobileMaxInteriorHeight, window.innerHeight);
    }

    if (isLandscape) {
      return {
        width: screen.height,
        height: mobileMaxInteriorHeight,
      };
    } else {
      
      return {
        width: screen.width,
        height: mobileMaxInteriorHeight,
      };
    }
  } else {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}

function getTermSize(fixedWidth: number): Size {
  let size = getRealSize();
  return {
    width: fixedWidth,
    height: Math.round((fixedWidth * size.height) / size.width),
  };
}

export var onMobile: boolean = false;
export var isLandscape: boolean = true;
var mobileMaxInteriorHeight: number = 0;
var canSetMobileMaxInteriorHeight: boolean = true;

export default function useTermSize(fixedWidth: number): { width: number, height: number } {
  const [termSize, setTermSize] = useState<Size | null>(null);
  const orientation = useRef('p');
  const portrait = useRef(null as unknown as MediaQueryList);

  useEffect(() => {
    function handleResize() {
      onMobile = isOnMobile();
      let size = getTermSize(fixedWidth);
      document.documentElement.style.setProperty('--char-height', `${getRealSize().height / size.height}px`);
      setTermSize(size);
    }

    if (!termSize) {
      portrait.current = window.matchMedia("(orientation: portrait)");
      handlePortrait(portrait.current);
      handleResize();
    }

    function handlePortrait(e: any) {
      mobileMaxInteriorHeight = window.innerHeight;
      canSetMobileMaxInteriorHeight = false;
      setTimeout(() => {
        mobileMaxInteriorHeight = window.innerHeight;
        canSetMobileMaxInteriorHeight = true;
      }, 500);
      if(e.matches) {
        orientation.current = 'p';
        isLandscape = false;
        handleResize();
      } else {
        orientation.current = 'l';
        isLandscape = true;
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
