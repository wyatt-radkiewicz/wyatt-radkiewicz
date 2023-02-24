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
        <TermElement type="cube" starty="15" endy="60" />
        <TermElement type="donut" starty="65" />
        <TermElement type="matrix" amount="4" speed="20" starty="0" endy="10" />
        <TermElement type="string" scroll="true" font="Standard" slide="0.6 0.5" value="Hi, I&apos;m" x="5" y="4" />
        <TermElement type="string" scroll="true" font="Standard" cursor="true" value="Wyatt" slide="0.8 1.0"  x="5" y="10" />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="About Me" slide="0 0.75" x={Math.floor(width / 2)} y="40" />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="Projects" slide="0 0.75" x={Math.floor(width / 2)} y="77" />
        <TermElement type="box" x="0" y="0" w={width} h={height} />
      </Terminal>

      <div className={`${styles.scrollSpace}`}>
        <div className={`${ubuntu_mono.className} ${styles.sectionBox}`}>
          <h2>I am a senior at Timberlake High School</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Auctor augue mauris augue neque gravida in fermentum et sollicitudin. Ultrices dui sapien eget mi proin. Blandit turpis cursus in hac. A diam sollicitudin tempor id eu nisl nunc mi ipsum. Massa massa ultricies mi quis hendrerit dolor magna eget est. Sed viverra tellus in hac habitasse platea. Et ligula ullamcorper malesuada proin. Id neque aliquam vestibulum morbi blandit. Id diam vel quam elementum pulvinar etiam non quam lacus. Risus sed vulputate odio ut. Nunc aliquet bibendum enim facilisis gravida. Risus pretium quam vulputate dignissim suspendisse in est ante in. Amet consectetur adipiscing elit pellentesque habitant morbi tristique.</p>
          <div className={styles.profileAboutMe}>
          <h3>Hi!</h3>
          <Image
            src="/images/profile.jpg"
            width="144"
            height="144"
            alt="A Picture of Me"
            className={styles.profilePic}
          ></Image>
          </div>
        </div>
        <div className={`${ubuntu_mono.className} ${styles.sectionBox}`}>
          Test String this is me Wyat hahahha. FMV games suck.
        </div>
      </div>
    </>
  );
}
