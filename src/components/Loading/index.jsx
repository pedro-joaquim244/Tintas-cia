import styles from "./Loading.module.css";

export default function Loading({ closing }) {
  return (
    <div
      className={`${styles.loadingScreen} ${
        closing ? styles.fadeOut : ""
      }`}
    >
      <div className={styles.container}>
        <div className={styles.badge}>
          Coleção Premium 2026
        </div>

        <h1 className={styles.logo}>
          Tintas<span>+</span>
        </h1>

        <div className={styles.loader}>
          <div className={styles.fill}></div>
        </div>

        <p className={styles.text}>
          Preparando as melhores cores para você...
        </p>
      </div>
    </div>
  );
}