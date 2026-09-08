import styles from "./RequisitoModal.module.css";

const ESTADO = {
    aprobado: "Aprobado",
    pendiente: "Pendiente",
    matriculado: "Matriculado",
    reprobado: "Reprobado",
};

function agrupar(lista) {
    return lista.reduce((acc, item) => {
        const grupo = item.grupoNum;

        if (!acc[grupo]) {
            acc[grupo] = [];
        }

        acc[grupo].push(item);

        return acc;
    }, {});
}

function ListaRequisitos({ titulo, requisitos }) {
    if (!requisitos || requisitos.length === 0) {
        return (
            <>
                <h4>{titulo}</h4>
                <p>No tiene.</p>
            </>
        );
    }

    const grupos = agrupar(requisitos);

    return (
        <>
            <h4>{titulo}</h4>

            {Object.entries(grupos).map(([grupo, cursos]) => (
                <div
                    key={grupo}
                    className={styles.grupo}
                >
                    {Object.keys(grupos).length > 1 && (
                        <p className={styles.grupoTitulo}>
                            Grupo {grupo}
                        </p>
                    )}

                    {cursos.map((req) => (
                        <div
                            key={req.id}
                            className={styles.reqCard}
                        >
                            <div className={styles.header}>
                                <div>
                                    <strong>
                                        {req.requisitoCurso?.sigla ??
                                            req.requisitoSigla}
                                    </strong>

                                    <p>
                                        {req.requisitoCurso?.nombre ??
                                            "Curso no encontrado"}
                                    </p>
                                </div>

                                <span
                                    className={`${styles.estado} estado-${
                                        req.requisitoCurso?.estado
                                    }`}
                                >
                                    {ESTADO[req.requisitoCurso?.estado] ??
                                        "Desconocido"}
                                </span>
                            </div>

                            <div className={styles.footer}>
                                <span>
                                    Nota:{" "}
                                    {req.requisitoCurso?.nota ?? "—"}
                                </span>

                                <span>
                                    Créditos:{" "}
                                    {req.requisitoCurso?.creditos ?? "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
}

export default function RequisitoModal({
    detalle,
    onClose,
}) {
    const {
        curso,
        prerequisitos,
        correquisitos,
    } = detalle;

    return (
        <div className="modalOverlay">
            <div
                className={`modalBase ${styles.modal}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.close}
                    onClick={onClose}
                >
                    ✕
                </button>

                <span className={styles.sigla}>
                    {curso.sigla}
                </span>

                <h2>
                    {curso.nombre}
                </h2>

                <ListaRequisitos
                    titulo="Prerequisitos"
                    requisitos={prerequisitos}
                />

                <ListaRequisitos
                    titulo="Correquisitos"
                    requisitos={correquisitos}
                />
            </div>
        </div>
    );
}