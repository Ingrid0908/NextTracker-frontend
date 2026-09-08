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

    function normalizarNombre(nombre) {

        return nombre
            .toLowerCase()
            .trim()
            .replace(/^laboratorio\s+de\s+/i, "")
            .replace(/\s+/g, " ");
    }


    function ordenarCursos(cursosCiclo) {

        const cursos = [...cursosCiclo];

        const laboratorios = cursos.filter((curso) =>
            /^laboratorio\s+de\s+/i.test(curso.nombre.trim())
        );

        const usados = new Set();

        const resultado = [];

        cursos.forEach((curso) => {

            if (usados.has(curso.id)) {
                return;
            }

            if (
                /^laboratorio\s+de\s+/i.test(
                    curso.nombre.trim()
                )
            ) {
                return;
            }

            resultado.push(curso);
            usados.add(curso.id);

            const laboratorio = laboratorios.find(
                (lab) =>
                    !usados.has(lab.id) &&
                    normalizarNombre(lab.nombre) ===
                    normalizarNombre(curso.nombre)
            );

            if (laboratorio) {

                resultado.push(laboratorio);

                usados.add(laboratorio.id);
            }
        });

        cursos.forEach((curso) => {

            if (!usados.has(curso.id)) {

                resultado.push(curso);

                usados.add(curso.id);
            }
        });

        return resultado;
    }


    return (
        <div className={styles.wrapper}>

            <div className={styles.leyenda}>

                <span className={styles.leyendaTitulo}>
                    Estado del curso:
                </span>

                <div className={styles.leyendaItem}>
                    <span
                        className={`${styles.color} estado-pendiente`}
                    ></span>

                    <span>Pendiente</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span
                        className={`${styles.color} estado-matriculado`}
                    ></span>

                    <span>Matriculado</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span
                        className={`${styles.color} estado-aprobado`}
                    ></span>

                    <span>Aprobado</span>
                </div>

                <div className={styles.leyendaItem}>
                    <span
                        className={`${styles.color} estado-reprobado`}
                    ></span>

                    <span>Reprobado</span>
                </div>

            </div>


            <div className={styles.malla}>

                {ciclos.map((ciclo) => {

                    const cursosCiclo = cursos.filter(
                        (curso) => curso.ciclo === ciclo
                    );

                    const cursosOrdenados =
                        ordenarCursos(cursosCiclo);

                    return (

                        <section
                            className={styles.semestre}
                            key={ciclo}
                        >

                            <h3>
                                Semestre {ciclo}
                            </h3>

                            {cursosOrdenados.map((curso) => (

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