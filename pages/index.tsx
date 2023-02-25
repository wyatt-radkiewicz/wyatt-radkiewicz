import Head from 'next/head';
import Image from 'next/image';
import Terminal, {TermElement} from '@/components/terminal';
import styles from '../styles/Home.module.css';
import useCursorStyles from '../styles/UseCursor.module.css';
import useTermSize from '../src/useTermSize';
import { Ubuntu_Mono } from '@next/font/google';
import Section, {sectionPosChars} from '@/components/section';
import { Project, ProjectCarosel } from '@/components/projects';
import Techs from '@/components/techs';

const ubuntu_mono = Ubuntu_Mono({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  let { width, height } = useTermSize(50);

  return (
    <>
      <Head>
        <title>Wyatt Radkiewicz&apos;s Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.scrollSpace}>
        <Section boxId="1">
          <h2 className={`${ubuntu_mono.className}`}>Hello!</h2>
          <p className={`${ubuntu_mono.className} ${styles.sectionBody}`}>I am 18 years old and a senior at Timberlake High School. I've been programming since I was in 4th grade and have ammased a wealth of knowledge and practical skills in coding. I am fluent in C, C++, Rust, Javascript, Typescript, X86 Assembly (Intel), and decent at many other languages. I'm currently learning and quickly picking up on web technologies like React, NextJS, and others. Outside of coding, I am a student of ApogeeStrong led by Matt Beaudreau and Tim Kennedy and have also gotten Eagle Rank in Boy Scouts. My hobbies are coding and bodybuilding.</p>
          <Techs></Techs>
          <div className={styles.contactInfo}>
            <h4 className={ubuntu_mono.className}>wyattwradkiewicz@gmail.com</h4>
            <h4 className={ubuntu_mono.className}>630-947-4984</h4>
            <h4 className={ubuntu_mono.className}>https://www.youtube.com/@wyattradkiewicz1127</h4>
          </div>
          <div className={styles.profilePicContainer}>
            <h3 className={ubuntu_mono.className}>Hi!</h3>
            <Image
              src="/images/profile.jpg"
              width="144"
              height="144"
              alt="A picture of me"
            />
          </div>
        </Section>
        <Section boxId="2">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/cnm1.jpg">
              <h2 className={ubuntu_mono.className}>One of my games: 'CNM ONLINE'</h2>
              <p className={ubuntu_mono.className}>It has online multiplayer. This is one of the levels.</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/cnm-online">{`<Source Code />`}</a>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://napoleon1.itch.io/cnm-online">Play it here!</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/cnm2.jpg">
              <h2 className={ubuntu_mono.className}>The 'ancient' level of the game.</h2>
              <p className={ubuntu_mono.className}>The game has it's own renderer with transparency functionality written in x86 Assembly and with SIMD instructions. It has its own lua scripting system also, and a very efficient netcode.</p>
            </Project>
            <Project imgSrc="/images/projects/editor.jpg">
              <h2 className={ubuntu_mono.className}>A new level made with the level editor!</h2>
              <p className={ubuntu_mono.className}>2 years after the game I decided to make a more user-friendly/useable level editor for the game in Rust.</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/cnm-online-editor">{`<Source Code />`}</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/cnm4.jpg">
              <h2 className={ubuntu_mono.className}>The netcode is really good.</h2>
              <p className={ubuntu_mono.className}>The game never usually has many enemies on the screen, but even if there are the game only uses several kbs per second. You could easily play it on a dial-up connection. </p>
            </Project>
            <Project imgSrc="/images/projects/cnm5.jpg">
              <h2 className={ubuntu_mono.className}>The game is written from the ground up in C.</h2>
              <p className={ubuntu_mono.className}>I learned A lot about the C language through the development of this game and learned a lot about how to look for memory leaks, which are still the bane of the codebase to this day.</p>
            </Project>
          </ProjectCarosel>
        </Section>
        <Section boxId="3">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/smwo1.jpg">
              <h2 className={ubuntu_mono.className}>Super Mario War: Online</h2>
              <p className={ubuntu_mono.className}>This was the first time I coded in Javascript and made a website. I made a lan-multiplayer game where you have to stomp on each other's heads like goombas. (Its based off of the fan game of the same name)</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/smwo">{`<Source Code />`}</a>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://smwo-3b393.web.app/">Play it here!</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/smwo2.jpg">
              <h2 className={ubuntu_mono.className}>Multiple maps</h2>
              <p className={ubuntu_mono.className}>The game has multiple maps and players can create their own maps for others to play!</p>
            </Project>
            <Project imgSrc="/images/projects/smwo3.jpg">
              <h2 className={ubuntu_mono.className}>WebGL</h2>
              <p className={ubuntu_mono.className}>I also made this with WebGL so I could add post processing effects to certain levels like the water distortion one seen here.</p>
            </Project>
          </ProjectCarosel>
        </Section>
        <Section boxId="4">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/fishyman.jpg">
              <h2 className={ubuntu_mono.className}>Fishy Man 2</h2>
              <p className={ubuntu_mono.className}>A short project I made with a friend. Created a very smooth rendering and collision system. Learned the most about collision resolution and trying to squash memory bugs (This was programmed in C).</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/fishy-man2">{`<Source Code />`}</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/ffo.jpg">
              <h2 className={ubuntu_mono.className}>Food Fight Online</h2>
              <p className={ubuntu_mono.className}>This was my first test of making a multiplayer game. Its called 'Food Fight Online' and was written in C++ with SFML.</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/food-fight-online">{`<Source Code />`}</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/grs-p.jpg">
              <h2 className={ubuntu_mono.className}>Grass Protector</h2>
              <p className={ubuntu_mono.className}>One of the first games ever that I made in C/C++ with SFML.</p>
            </Project>
          </ProjectCarosel>
        </Section>
        <Section boxId="5">
          <h2 className={ubuntu_mono.className}>My Blog</h2>
          <div className={styles.contactInfo}>
            <h4 className={ubuntu_mono.className}>wyattwradkiewicz@gmail.com</h4>
            <h4 className={ubuntu_mono.className}>630-947-4984</h4>
            <h4 className={ubuntu_mono.className}>https://www.youtube.com/@wyattradkiewicz1127</h4>
          </div>
        </Section>
      </div>

      <Terminal width={width} height={height} className={styles.terminal}>
        <TermElement type="donut" starty={sectionPosChars(3, height) - height / 1.25} endy={sectionPosChars(6, height) - height}/>
        <TermElement type="cube" starty={sectionPosChars(2, height) - height / 1.25 - 1} endy={sectionPosChars(3, height) - height / 1.25} />
        <TermElement type="matrix" amount="4" speed="20" starty="0" endy={sectionPosChars(2, height) - height / 1.25} />
        <TermElement type="matrix" amount="4" speed="20" starty={sectionPosChars(5, height) - height} />
        <TermElement type="string" scroll="true" font="Standard" slide="0.6 0.5" value="Hi, I&apos;m" x="5" y="4" />
        <TermElement type="string" scroll="true" font="Standard" cursor="true" value="Wyatt" slide="0.8 1.0"  x="5" y="10" />
        <TermElement type="string" scroll="true" align="c" value={`\n Scroll For More! \n`} slide="1.1 0.25"  x={width / 2} y={height - 10} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="About Me" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(1, height) - 9} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="Projects" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(2, height) - 9} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="My Blog" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(5, height) - 9} />
        <TermElement type="box" x="0" y="0" w={width} h={height} />
      </Terminal>
    </>
  );
}
