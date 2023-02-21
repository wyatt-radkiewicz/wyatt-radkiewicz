import { useRef, useEffect } from 'react';
import Term from '../src/term';
import localFont from '@next/font/local';
const terminalFont = localFont({ src: '../public/terminal_font.ttf' });

export default function Terminal({ width, height, children, ...rest }: any) {
  const terminalRef = useRef<Term | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let timerId: number | null = null;

    if (!terminalRef.current && canvasRef.current) {
      terminalRef.current = new Term(terminalFont.style.fontFamily, canvasRef.current, width, height, children.map((child: any) => child.props));
    }

    function animate(timeStamp: DOMHighResTimeStamp) {
      terminalRef.current?.render(timeStamp);
      timerId = window.requestAnimationFrame(animate);
    }
    timerId = window.requestAnimationFrame(animate);

    let onMouseMove = (e: any) => {
      if (terminalRef.current) {
        terminalRef.current.onMouseUpdate(e);
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (timerId) {
        window.cancelAnimationFrame(timerId);
      }
      if (terminalRef.current) {
        terminalRef.current.destroy();
        terminalRef.current = null;
      }
    }
  }, [width, height]);

  return <canvas ref={canvasRef} {...rest}>Your browser doesn&apos;t support WebGL2</canvas>;
}

export function TermElement(_props: any) {
  return <></>;
}
