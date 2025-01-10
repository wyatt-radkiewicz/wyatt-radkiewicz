import Image from 'next/image';
import styles from './Techs.module.css';
import { motion } from 'framer-motion';

function Tech({src, alt, ...props}: any) {
  return <motion.img
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    src={src}
    alt={alt}
    width={768}
    height={768}
    className={styles.tech}
    {...props}
  ></motion.img>
}

export default function Techs() {
  return (
    <motion.div
      initial={{ borderRadius: "1rem" }}
      //whileHover={{ scale: 1.05, borderRadius: "8rem" }}
      //transition={{ duration: 0.8, type: "spring" }}
      className={styles.container}>
      <Tech src="/images/techs/c.png" alt="C"></Tech>
      <Tech src="/images/techs/c++.png" alt="C++"></Tech>
      <Tech src="/images/techs/nextjs.png" alt="NextJS"></Tech>
      <Tech src="/images/techs/react.png" alt="React"></Tech>
      <Tech src="/images/techs/rust.png" alt="Rust"></Tech>
      <Tech src="/images/techs/ts.png" alt="TS"></Tech>
      <Tech src="/images/techs/zig.png" alt="Zig"></Tech>
      <Tech src="/images/techs/linux.png" alt="Linux"></Tech>
      <Tech src="/images/techs/haskell.png" alt="Haskell"></Tech>
      <Tech src="/images/techs/opengl.png" alt="OpenGL"></Tech>
      <Tech src="/images/techs/webgl.png" alt="WebGL"></Tech>
    </motion.div>
  );
}
