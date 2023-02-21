import Head from 'next/head'
import Terminal, {TermElement} from '@/components/terminal';
import styles from '../styles/home.module.css';
import useWindowSize from '../src/windowSize';
import { Ubuntu_Mono } from '@next/font/google'

const ubuntu_mono = Ubuntu_Mono({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  let windowSize = useWindowSize();
  let widthChars = 80;
  let heightChars = Math.round((widthChars * windowSize.height) / windowSize.width);

  return (
    <>
      <Head>
        <title>Wyatt Radkiewicz's Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Terminal width={widthChars} height={heightChars} className={styles.terminal}>
        <TermElement type="matrix" amount="10" speed="10" />
        <TermElement type="string" scroll="true" font="Banner" value=" | " x="69" y="12" />
        <TermElement type="string" scroll="true" font="Banner" value="V" x="69" y="20" />
        <TermElement type="string" scroll="true" font="Basic" slide="0 0.5" value="Hi, I'm" x="5" y="10" />
        <TermElement type="string" scroll="true" font="Banner3-D" value="Wyatt" slide="0.15 0.5" cursor="true" x="5" y="20" />
        <TermElement type="string" scroll="true" font="Contrast" align="c" value="About Me" slide="0 0.5" x={Math.floor(widthChars / 2)} y={heightChars} />
        <TermElement type="box" x="1" y="1" w={widthChars - 2} h={heightChars - 2} />
        <TermElement type="box" x="0" y="0" w={widthChars} h={heightChars} />
      </Terminal>

      <div className={styles.scrollSpace}></div>
    </>
  );

  // <div className={`${styles.sections} ${ubuntu_mono.className}`}>
  //   <button className={styles.sectionButton}>
  //     My Projects
  //   </button>
  // </div>
}
