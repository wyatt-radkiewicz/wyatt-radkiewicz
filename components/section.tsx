import styles from './Section.module.css';
import useCursorStyles from '../styles/UseCursor.module.css';

export default function Section({ children, boxId, ...props }: any) {
  let boxStyles = [
    styles.boxPos1,
    styles.boxPos2,
    styles.boxPos3,
    styles.boxPos4,
    styles.boxPos5,
    styles.boxPos6,
  ];
  return(
    <div className={`${boxStyles[boxId-1]} ${styles.sectionBox} ${useCursorStyles.useCursor} ${styles.aboutMeSectionBox}`}>
      <div className={styles.sectionBoxContainer}>
        {children}
      </div>
    </div>
  );
}

export function sectionPosChars(boxId: number, termHeight: number): number {
  return Math.floor((termHeight + 15) * boxId);
}
