import CursoNodo from "./CursoNodo";
import styles from "./MallaVisual.module.css";

export default function MallaVisual({ cursos, onCursoClick }) {
    const ciclos = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI"
    ];

    return (
        <div className={styles.wrapper}>

            <div className={styles.leyenda}>

                <span className={styles.leyendaTitulo}>
                    Estado del curso:
                </span>

                <div className={styles.leyendaItem}>
                    <span className={`${styles.color} estado-pendiente`}></span>
                    <span>Pendiente</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span className={`${styles.color} estado-matriculado`}></span>
                    <span>Matriculado</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span className={`${styles.color} estado-aprobado`}></span>
                    <span>Aprobado</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span className={`${styles.color} estado-reprobado`}></span>
                    <span>Reprobado</span>
                </div>

            </div>

            <div className={styles.malla}>
                {ciclos.map((ciclo) => {

                    const cursosCiclo = cursos.filter(
                        (curso) => curso.ciclo === ciclo
                    );

                    return (
                        <section
                            className={styles.semestre}
                            key={ciclo}
                        >
                            <h3>
                                Semestre {ciclo}
                            </h3>

                            {cursosCiclo.map((curso) => (
                                <CursoNodo
                                    key={curso.id}
                                    curso={curso}
                                    onClick={onCursoClick}
                                />
                            ))}
                        </section>
                    );
                })}
            </div>

        </div>
    );
}