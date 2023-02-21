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
  let { width, height } = useTermSize(80);

  return (
    <>
      <Head>
        <title>Wyatt Radkiewicz&apos;s Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Terminal width={width} height={height} className={styles.terminal}>
        <TermElement type="matrix" amount="10" speed="10" />
        <TermElement type="string" scroll="true" font="Banner" value=" | " x="69" y="12" />
        <TermElement type="string" scroll="true" font="Banner" value="V" x="69" y="20" />
        <TermElement type="string" scroll="true" font="Basic" slide="0 0.5" value="Hi, I&apos;m" x="5" y="10" />
        <TermElement type="string" scroll="true" font="Banner3-D" value="Wyatt" slide="0.15 0.5" cursor="true" x="5" y="20" />
        <TermElement type="string" scroll="true" font="Contrast" align="c" value="About Me" slide="0 0.5" x={Math.floor(width / 2)} y={height} />
        <TermElement type="box" scroll="true" clear="true" x="8" y={height + 9} w="60" h="5" />
        <TermElement type="string" scroll="true" x="10" y={height + 10} value={`Hi! I&apos;m Wyatt, I am 18 years old and I
go to Timberlake High School`} />
        <TermElement type="box" x="1" y="1" w={width - 2} h={height - 2} />
        <TermElement type="box" x="0" y="0" w={width} h={height} />
      </Terminal>

      <div className={`${styles.charSize} ${styles.scrollSpace}`}>
        
      </div>
    </>
  );

        // <Image
        //   src="/images/profile.jpg"
        //   height={144}
        //   width={144}
        //   alt="Me, Wyatt"
        //   priority={true}
        //   className={`${styles.charSize} ${styles.profile}`}
        // />
}
