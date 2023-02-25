import PropTypes from 'prop-types';
import { useState, cloneElement, ReactElement, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './Projects.module.css';
import { motion, TargetAndTransition } from 'framer-motion';

export function ProjectCarosel({children, ...props}: any) {
  let [currentChild, setCurrentChild] = useState<[number, number, string]>([0, -1, 'r']);
  let [startAnim, setStartAnim] = useState(true);

  let clickedLeft = () => {
    setCurrentChild([currentChild[0] - 1 < 0 ? children.length - 1 : currentChild[0] - 1, currentChild[0], 'l']);
    setStartAnim(false);
    setTimeout(() => {
      setStartAnim(true);
    }, 10);
  };
  let clickedRight = () => {
    setCurrentChild([(currentChild[0] + 1) % children.length, currentChild[0], 'r']);
    setStartAnim(false);
    setTimeout(() => {
      setStartAnim(true);
    }, 10);
  };

  return (
    <>
      <div className={styles.projectCaroselContainer}>
        {children.map((child: any, idx: number) => {
          let anim: TargetAndTransition = { opacity: 0 };
          let nonStyle = "";
          if (currentChild[0] == idx) {
            anim["opacity"] = 0.8;
            anim["translateX"] = "0%";
            if (!startAnim) {
              if (currentChild[2] == 'r') {
                anim["translateX"] = "100%";
              } else {
                anim["translateX"] = "-100%";
              }
            }
          }
          if (currentChild[1] == idx) {
            if (currentChild[2] == 'r') {
              anim["translateX"] = "-100%";
            } else {
              anim["translateX"] = "100%";
            }
          }
          if (!startAnim && currentChild[1] != idx && currentChild[0] != idx) {
            anim["opacity"] = 0;
          }
          if (currentChild[0] != idx) {
            nonStyle = styles.projectContainerIgnore;
          }

          return<motion.div
            key={"Panel" + idx}
            initial={{ opacity: 0 }}
            animate={anim}
            transition={{ duration: !startAnim && currentChild[0] == idx ? 0.0 : 0.5 }}
            className={`${styles.projectContainer} ${nonStyle}`}>
            {child}
          </motion.div>;
        })}
      </div>
      <button className={`${styles.button} ${styles.buttonRight}`} onClick={clickedRight}>&gt;</button>
      <button className={`${styles.button} ${styles.buttonLeft}`} onClick={clickedLeft}>&lt;</button>
    </>
  );
}

export function Project({imgSrc, children, ...props}: any) {
  return (
    <>
      {children[0]}
      <Image
        src={imgSrc}
        alt="This is an image"
        width="1024"
        height="768"
      />
      {children.slice(1)}
    </>
  );
}
