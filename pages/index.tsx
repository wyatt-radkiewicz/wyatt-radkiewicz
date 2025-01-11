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
          <h2 className={`${ubuntu_mono.className}`}>About Me</h2>
          <p className={`${ubuntu_mono.className} ${styles.sectionBody}`}>I love to code in my free time and loved working with my team in my previous jobs. I am positive and enthusiastic, work well in a team, and try my hardest with my work and projects. I enjoy both the creative and programming side of projects. I like to write clean fast code and my past projects reflect this.</p>
          <Techs></Techs>
          <div className={styles.contactInfo}>
            <h4 className={ubuntu_mono.className}>wyattwradkiewicz@gmail.com</h4>
            <h4 className={ubuntu_mono.className}>630-947-4984</h4>
            <h4 className={ubuntu_mono.className}>https://github.com/wyatt-radkiewicz</h4>
          </div>
        </Section>
        <Section boxId="2">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/scummvm1.png">
              <h2 className={ubuntu_mono.className}>Google Summer of Code 2023 - Optimizing ScummVM Renderer</h2>
              <p className={ubuntu_mono.className}>So originally, the goals for the project were to optimize the pixel blending code in the rendering code for the AGS game engine in ScummVM. The problem was: I completed that goal about half way through the coding period. So me and my mentors talked and what I did after was optimize the rendering code that most other engines in ScummVM use. I used SIMD cpu extensions to net a pretty huge performance gain.</p>
            </Project>
            <Project imgSrc="/images/projects/scummvm2.png">
              <h2 className={ubuntu_mono.className}>Renderer speed ups</h2>
              <p className={ubuntu_mono.className}>In the AGS renderer, it got a 5x improvement all around and a 14x improvement in the best scenarios. In the global rendering code for all engines to use it got a 2x improvement all around. Here are the speed up results.</p>
            </Project>
            <Project imgSrc="/images/projects/scummvm3.png">
              <h2 className={ubuntu_mono.className}>Some bugs along the way</h2>
              <p className={ubuntu_mono.className}>I’d like to thank Google Summer of Code 2023, ScummVM for the opportunity to work on a project like this and learn so much. And I’d like to thank my mentors for helping me when I was stuck, and teaching me how to work in a team.</p>
            </Project>
          </ProjectCarosel>
        </Section>
        <Section boxId="3">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/cnm1.jpg">
              <h2 className={ubuntu_mono.className}>One of my games: &apos;CNM ONLINE&apos;</h2>
              <p className={ubuntu_mono.className}>It has online multiplayer. This is one of the levels.</p>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://github.com/wyatt-radkiewicz/cnm-online">{`<Source Code />`}</a>
                <a className={`${ubuntu_mono.className} ${styles.link}`} href="https://napoleon1.itch.io/cnm-online">Play it here!</a>
              </div>
            </Project>
            <Project imgSrc="/images/projects/cnm2.jpg">
              <h2 className={ubuntu_mono.className}>The &apos;ancient&apos; level of the game.</h2>
              <p className={ubuntu_mono.className}>The game has it&apos;s own renderer with transparency functionality written in x86 Assembly and with SIMD instructions. It has its own lua scripting system also, and a very efficient netcode.</p>
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
              <p className={ubuntu_mono.className}>I learned A lot about the C language through the development of this game and learned a lot about how to look for memory leaks. The codebase uses its own custom memory allocators like arenas, stacks, and pools. It never uses traditional heap allocators and because of this, tracking the lifetime of memory in the program is really easy now and can be debugged much more efficiently due to this system and essentially makes memory leaks impossible.</p>
            </Project>
          </ProjectCarosel>
        </Section>
        <Section boxId="4">
          <ProjectCarosel>
            <Project imgSrc="/images/projects/smwo1.jpg">
              <h2 className={ubuntu_mono.className}>Super Mario War: Online</h2>
              <p className={ubuntu_mono.className}>This was the first time I coded in Javascript and made a website. I made a lan-multiplayer game where you have to stomp on each other&apos;s heads like goombas. (Its based off of the fan game of the same name)</p>
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
        <Section boxId="5">
          <h2 className={ubuntu_mono.className}>My Blog</h2>
          <a href="https://blogs.scummvm.org/eklipsed/#site-header">
            <Image className={styles.blogPortal}
              src="/images/scummvm_blog.jpg"
              width="386"
              height="386"
              alt="Scummvm blog"
            />
          </a>
          <div className={styles.contactInfo}>
            <h4 className={ubuntu_mono.className}>wyattwradkiewicz@gmail.com</h4>
            <h4 className={ubuntu_mono.className}>630-947-4984</h4>
            <h4 className={ubuntu_mono.className}>https://github.com/wyatt-radkiewicz</h4>
            <h4 className={ubuntu_mono.className}>https://blogs.scummvm.org/eklipsed/#site-header</h4>
          </div>
        </Section>
      </div>

      <Terminal width={width} height={height} className={styles.terminal}>
        <TermElement type="donut" starty={sectionPosChars(3, height) - height / 1.25} endy={sectionPosChars(6, height) - height}/>
        <TermElement type="cube" starty={sectionPosChars(2, height) - height / 1.25 - 1} endy={sectionPosChars(3, height) - height / 1.25} />
        <TermElement type="matrix" amount="4" speed="20" starty="0" endy={sectionPosChars(2, height) - height / 1.25} />
        <TermElement type="matrix" amount="4" speed="20" starty={sectionPosChars(5, height) - height} />
        <TermElement type="string" scroll="true" font="Standard" slide="0.6 0.5" value="Wyatt" x="3" y="4" />
        <TermElement type="string" scroll="true" font="Standard" cursor="true" value="Portfolio" slide="0.8 1.0"  x="3" y="10" />
        <TermElement type="string" scroll="true" align="c" value={`\n Scroll For More! \n`} slide="1.1 0.25"  x={width / 2} y={height - 10} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="About Me" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(1, height) - 9} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="Projects" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(2, height) - 9} />
        <TermElement type="string" scroll="true" font="Mini" align="c" value="My Blog" slide="0 0.75" x={Math.floor(width / 2)} y={sectionPosChars(5, height) - 9} />
        <TermElement type="box" x="0" y="0" w={width} h={height} />
      </Terminal>
    </>
  );
}
