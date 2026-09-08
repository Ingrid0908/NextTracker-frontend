import styles from "./CursoNodo.module.css";


export default function CursoNodo({ curso, onClick }) {

    return (

        <div
            className={`${styles.card} ${styles[curso.estado]}`}
            onClick={() => onClick?.(curso)}
        >

            <div className={styles.header}>

                <span className={styles.sigla}>
                    {curso.sigla}
                </span>

                <span className={styles.creditos}>
                    {curso.creditos} cr
                </span>

            </div>


            <h4>
                {curso.nombre}
            </h4>

        </div>

    );

}