import styles from "./CursoCard.module.css";

const ESTADO_LABEL = {
    pendiente: "Pendiente",
    matriculado: "Matriculado",
    aprobado: "Aprobado",
    reprobado: "Reprobado",
};

export default function CursoCard({
    curso,
    onOpen
}) {
    return (
        <article
            className={styles.card}
            data-estado={curso.estado}
            onClick={() => onOpen(curso)}
        >

            <span className={styles.sigla}>
                {curso.sigla}
            </span>

            <h3 className={styles.nombre}>
                {curso.nombre}
            </h3>

            <div className={styles.footer}>

                <span
                    className={`${styles.badge} estado-${curso.estado}`}
                >
                    {ESTADO_LABEL[curso.estado]}
                </span>

            </div>

        </article>
    );
}

