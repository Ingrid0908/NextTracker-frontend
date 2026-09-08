import { useEffect, useState } from "react";

import styles from "./CursoDetalleModal.module.css";

import {
    matricularCurso,
    finalizarCurso
} from "../services/cursoService";

import {
    getEvaluacionesCurso,
    crearEvaluacion,
    actualizarEvaluacion
} from "../services/evaluacionService";

const ESTADO_LABEL = {
    pendiente: "Pendiente",
    matriculado: "Matriculado",
    aprobado: "Aprobado",
    reprobado: "Reprobado",
};

export default function CursoDetalleModal({
    curso,
    onClose,
    onVerRequisitos,
    onCursoActualizado
}) {

    const [evaluaciones, setEvaluaciones] = useState([]);

    const [mostrarNuevaEvaluacion, setMostrarNuevaEvaluacion] =
        useState(false);

    const [nombreEvaluacion, setNombreEvaluacion] = useState("");
    const [porcentajeEvaluacion, setPorcentajeEvaluacion] = useState("");

    const [editando, setEditando] = useState(null);
    const [valorEditado, setValorEditado] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!curso) return;

        cargarEvaluaciones();

    }, [curso]);

    async function cargarEvaluaciones() {

        try {

            setError("");

            const data = await getEvaluacionesCurso(curso.id);

            setEvaluaciones(data);

        } catch (error) {

            console.error(error);

            setError(
                "No se pudieron cargar las evaluaciones."
            );
        }
    }

    if (!curso) return null;

    const acumulado = evaluaciones.reduce(
        (total, evaluacion) =>
            total +
            Number(evaluacion.porcentajeObtenido || 0),
        0
    );

    const porcentajeEvaluado = evaluaciones.reduce(
        (total, evaluacion) =>
            total +
            Number(evaluacion.porcentaje || 0),
        0
    );

    async function handleMatricular() {

        try {

            setLoading(true);
            setError("");

            const cursoActualizado =
                await matricularCurso(curso.id);

            onCursoActualizado?.(cursoActualizado);

        } catch (error) {

            setError(
                error.message ||
                "No se pudo matricular el curso."
            );

        } finally {

            setLoading(false);

        }
    }

    async function agregarEvaluacion() {

        setError("");

        const nombre = nombreEvaluacion.trim();
        const porcentaje = Number(porcentajeEvaluacion);

        if (!nombre) {

            setError(
                "Ingresa el nombre de la evaluación."
            );

            return;
        }

        if (
            isNaN(porcentaje) ||
            porcentaje <= 0 ||
            porcentaje > 100
        ) {

            setError(
                "El porcentaje debe estar entre 0 y 100."
            );

            return;
        }

        if (porcentajeEvaluado + porcentaje > 100) {

            setError(
                `Las evaluaciones no pueden superar el 100%. Actualmente tienes ${porcentajeEvaluado}%.`
            );

            return;
        }

        try {

            setLoading(true);

            const nuevaEvaluacion =
                await crearEvaluacion(
                    curso.id,
                    nombre,
                    porcentaje,
                    0
                );

            setEvaluaciones((prev) => [
                ...prev,
                nuevaEvaluacion
            ]);

            setNombreEvaluacion("");
            setPorcentajeEvaluacion("");
            setMostrarNuevaEvaluacion(false);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "No se pudo agregar la evaluación."
            );

        } finally {

            setLoading(false);

        }
    }

    async function guardarObtenido(evaluacion) {

        const obtenido = Number(valorEditado);

        if (
            isNaN(obtenido) ||
            obtenido < 0 ||
            obtenido > Number(evaluacion.porcentaje)
        ) {

            setError(
                `El valor debe estar entre 0 y ${evaluacion.porcentaje}%.`
            );

            return;
        }

        try {

            setLoading(true);
            setError("");

            const actualizada =
                await actualizarEvaluacion(
                    evaluacion.id,
                    evaluacion.nombre,
                    evaluacion.porcentaje,
                    obtenido
                );

            setEvaluaciones((prev) =>
                prev.map((item) =>
                    item.id === actualizada.id
                        ? actualizada
                        : item
                )
            );

            setEditando(null);
            setValorEditado("");

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "No se pudo actualizar la evaluación."
            );

        } finally {

            setLoading(false);

        }
    }

    async function handleFinalizar() {

        try {

            setLoading(true);
            setError("");

            const cursoActualizado =
                await finalizarCurso(curso.id);

            onCursoActualizado?.(cursoActualizado);

        } catch (error) {

            setError(
                error.message ||
                "No se pudo finalizar el curso."
            );

        } finally {

            setLoading(false);

        }
    }

    const mostrarEvaluaciones =
        curso.estado === "matriculado" ||
        curso.estado === "aprobado" ||
        curso.estado === "reprobado";

    return (

        <div
            className="modalOverlay"
            onClick={onClose}
        >

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

                <h2 className={styles.nombre}>
                    {curso.nombre}
                </h2>

                <div className={styles.estadoContainer}>

                    <span>Estado</span>

                    <strong
                        className={`${styles.estado} estado-${curso.estado}`}
                    >
                        {ESTADO_LABEL[curso.estado]}
                    </strong>

                </div>

                <div className={styles.info}>

                    <div className={styles.row}>
                        <span>Créditos</span>
                        <strong>{curso.creditos}</strong>
                    </div>

                    <div className={styles.row}>
                        <span>Horas</span>
                        <strong>{curso.horas}</strong>
                    </div>

                    <div className={styles.row}>
                        <span>Ciclo</span>
                        <strong>{curso.ciclo}</strong>
                    </div>

                </div>


                {mostrarEvaluaciones && (

                    <div className={styles.evaluaciones}>

                        <div className={styles.evaluacionesHeader}>

                            <h3>Evaluaciones</h3>

                            {curso.estado === "matriculado" &&
                                !mostrarNuevaEvaluacion && (

                                    <button
                                        className={styles.addButton}
                                        onClick={() =>
                                            setMostrarNuevaEvaluacion(true)
                                        }
                                    >
                                        + Agregar
                                    </button>

                                )}

                        </div>


                        {evaluaciones.length === 0 ? (

                            <div className={styles.empty}>
                                No hay evaluaciones registradas.
                            </div>

                        ) : (

                            <div className={styles.evaluacionesList}>

                                {evaluaciones.map((evaluacion) => (

                                    <div
                                        className={styles.evaluacion}
                                        key={evaluacion.id}
                                    >

                                        <div>

                                            <strong>
                                                {evaluacion.nombre}
                                            </strong>

                                            <span>
                                                Vale {evaluacion.porcentaje}%
                                            </span>

                                        </div>


                                        <div className={styles.obtenido}>

                                            <span>
                                                Obtenido
                                            </span>


                                            {editando === evaluacion.id ? (

                                                <div
                                                    className={
                                                        styles.editarObtenido
                                                    }
                                                >

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={
                                                            evaluacion.porcentaje
                                                        }
                                                        step="0.01"
                                                        value={valorEditado}
                                                        onChange={(e) =>
                                                            setValorEditado(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        className={
                                                            styles.guardarButton
                                                        }
                                                        onClick={() =>
                                                            guardarObtenido(
                                                                evaluacion
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        ✓
                                                    </button>

                                                </div>

                                            ) : (

                                                <>

                                                    <strong>
                                                        {
                                                            evaluacion.porcentajeObtenido
                                                        }%
                                                    </strong>


                                                    {curso.estado ===
                                                        "matriculado" && (

                                                        <button
                                                            className={
                                                                styles.editarButton
                                                            }
                                                            onClick={() => {

                                                                setEditando(
                                                                    evaluacion.id
                                                                );

                                                                setValorEditado(
                                                                    evaluacion.porcentajeObtenido
                                                                );

                                                            }}
                                                        >
                                                            Editar
                                                        </button>

                                                    )}

                                                </>

                                            )}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                        <div className={styles.resumen}>

                            <div>

                                <span>
                                    Evaluado
                                </span>

                                <strong>
                                    {porcentajeEvaluado}%
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Acumulado
                                </span>

                                <strong>
                                    {acumulado}%
                                </strong>

                            </div>

                        </div>


                        {curso.estado === "matriculado" &&
                            mostrarNuevaEvaluacion && (

                            <div className={styles.nuevaEvaluacion}>

                                <input
                                    type="text"
                                    placeholder="Nombre de la evaluación"
                                    value={nombreEvaluacion}
                                    onChange={(e) =>
                                        setNombreEvaluacion(
                                            e.target.value
                                        )
                                    }
                                />


                                <div className={styles.porcentajeInput}>

                                    <input
                                        type="number"
                                        placeholder="Porcentaje"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={porcentajeEvaluacion}
                                        onChange={(e) =>
                                            setPorcentajeEvaluacion(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span>%</span>

                                </div>


                                <div className={styles.formActions}>

                                    <button
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={() => {

                                            setMostrarNuevaEvaluacion(
                                                false
                                            );

                                            setNombreEvaluacion("");
                                            setPorcentajeEvaluacion("");
                                            setError("");

                                        }}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        className={styles.saveButton}
                                        onClick={agregarEvaluacion}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Guardando..."
                                            : "Guardar"}
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                )}

                {(curso.estado === "aprobado" ||
                    curso.estado === "reprobado") && (

                    <div className={styles.notaFinal}>

                        <span>
                            Nota final
                        </span>

                        <strong>
                            {curso.nota}
                        </strong>

                    </div>

                )}


                {curso.estado === "pendiente" && (

                    <button
                        className={styles.matricularButton}
                        onClick={handleMatricular}
                        disabled={loading}
                    >
                        {loading
                            ? "Matriculando..."
                            : "Matricular curso"}
                    </button>

                )}


                {curso.estado === "matriculado" && (

                    <button
                        className={styles.finalizarButton}
                        onClick={handleFinalizar}
                        disabled={
                            loading ||
                            porcentajeEvaluado < 100
                        }
                    >
                        {loading
                            ? "Finalizando..."
                            : "Finalizar curso"}
                    </button>

                )}


                {error && (

                    <p className={styles.error}>
                        {error}
                    </p>

                )}

                <div className={styles.actions}>

                    <button
                        className={styles.secondary}
                        onClick={() =>
                            onVerRequisitos(curso)
                        }
                    >
                        Ver requisitos
                    </button>

                </div>

            </div>

        </div>
    );
}