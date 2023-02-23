import Head from 'next/head';
import Image from 'next/image';
import Terminal, {TermElement} from '@/components/terminal';
import styles from '../styles/Home.module.css';
import useTermSize from '../src/useTermSize';
import { Ubuntu_Mono } from '@next/font/google';

const ubuntu_mono = Ubuntu_Mono({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  let { width, height } = useTermSize(50);
//<TermElement type="matrix" amount="10" speed="10" />
  return (
    <>
      <Head>
        <title>Wyatt Radkiewicz&apos;s Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Terminal width={width} height={height} className={styles.terminal}>
        <TermElement type="cube" />
        <TermElement type="string" scroll="true" font="Standard" slide="0 0.5" value="Hi, I&apos;m" x="5" y="4" />
        <TermElement type="string" scroll="true" font="Standard" cursor="true" value="Wyatt" slide="0.15 1.0"  x="5" y="10" />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="About Me" slide="0 0.75" x={Math.floor(width / 2)} y="25" />
        <TermElement type="string" scroll="true" align="c" x={width / 2} y="30" value={
` 
   Hi! I'm Wyatt, I am 18 years old and I go to   
   Timberlake High School
 `} />
        <TermElement type="box" x="0" y="0" w={width} h={height} />
      </Terminal>

      <div className={`${styles.scrollSpace}`}></div>
    </>
  );
}
