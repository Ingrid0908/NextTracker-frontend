import { useEffect, useState } from "react";

import styles from "./CursoDetalleModal.module.css";

import {
    matricularCurso,
    finalizarCurso
} from "../services/cursoService";

import {
    getEvaluacionesCurso,
    crearEvaluacion,
    actualizarEvaluacion,
    actualizarPorcentajeObtenido,
    eliminarEvaluacion
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

    const [nombreEditado, setNombreEditado] = useState("");
    const [porcentajeEditado, setPorcentajeEditado] = useState("");
    const [valorEditado, setValorEditado] = useState("");

    const [notaObtenida, setNotaObtenida] = useState({});
    const [editandoNota, setEditandoNota] = useState(null);

    const [evaluacionAEliminar, setEvaluacionAEliminar] =
        useState(null);

    const [mostrarConfirmacionMatricula, setMostrarConfirmacionMatricula] =
        useState(false);

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

            const notas = {};

            data.forEach((evaluacion) => {
                notas[evaluacion.id] =
                    evaluacion.porcentajeObtenido ?? 0;
            });

            setNotaObtenida(notas);

        } catch (error) {
            console.error(error);

            setError(
                "No se pudieron cargar las evaluaciones."
            );
        }
    }

    if (!curso) return null;

    const acumuladoRaw = evaluaciones.reduce(
        (total, evaluacion) =>
            total + Number(evaluacion.porcentajeObtenido || 0),
        0
    );

    const acumulado =
        acumuladoRaw >= 99.5
            ? 100
            : Number(acumuladoRaw.toFixed(2));

    const porcentajeEvaluadoRaw = evaluaciones.reduce(
        (total, evaluacion) =>
            total + Number(evaluacion.porcentaje || 0),
        0
    );

    const porcentajeEvaluado =
        porcentajeEvaluadoRaw >= 99.5
            ? 100
            : Number(porcentajeEvaluadoRaw.toFixed(2));

    async function handleMatricular() {
        try {
            setLoading(true);
            setError("");

            const cursoActualizado =
                await matricularCurso(curso.id);

            setMostrarConfirmacionMatricula(false);

            setEvaluaciones([]);
            setNotaObtenida({});
            setEditandoNota(null);

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

    function solicitarMatricula() {
        setError("");

        if (curso.estado === "reprobado") {
            setMostrarConfirmacionMatricula(true);
            return;
        }

        handleMatricular();
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

            setNotaObtenida((prev) => ({
                ...prev,
                [nuevaEvaluacion.id]:
                    nuevaEvaluacion.porcentajeObtenido ?? 0
            }));

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

    function iniciarEdicion(evaluacion) {
        setError("");

        setEditando(evaluacion.id);

        setNombreEditado(evaluacion.nombre);
        setPorcentajeEditado(evaluacion.porcentaje);
        setValorEditado(evaluacion.porcentajeObtenido);
    }

    function cancelarEdicion() {
        setEditando(null);

        setNombreEditado("");
        setPorcentajeEditado("");
        setValorEditado("");

        setError("");
    }

    async function guardarEdicion(evaluacion) {
        const nombre = nombreEditado.trim();
        const porcentaje = Number(porcentajeEditado);
        const obtenido = Number(valorEditado);

        if (!nombre) {
            setError(
                "El nombre de la evaluación no puede estar vacío."
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

        const porcentajeOtros =
            evaluaciones
                .filter((item) => item.id !== evaluacion.id)
                .reduce(
                    (total, item) =>
                        total + Number(item.porcentaje || 0),
                    0
                );

        if (porcentajeOtros + porcentaje > 100) {
            setError(
                `Las evaluaciones no pueden superar el 100%. Las demás evaluaciones representan ${porcentajeOtros}%.`
            );
            return;
        }

        if (
            isNaN(obtenido) ||
            obtenido < 0 ||
            obtenido > porcentaje
        ) {
            setError(
                `El porcentaje obtenido debe estar entre 0 y ${porcentaje}%.`
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const actualizada =
                await actualizarEvaluacion(
                    evaluacion.id,
                    nombre,
                    porcentaje,
                    obtenido
                );

            setEvaluaciones((prev) =>
                prev.map((item) =>
                    item.id === actualizada.id
                        ? actualizada
                        : item
                )
            );

            setNotaObtenida((prev) => ({
                ...prev,
                [actualizada.id]:
                    actualizada.porcentajeObtenido
            }));

            setEditandoNota(null);

            cancelarEdicion();

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

    async function guardarPorcentajeObtenido(evaluacion) {
        const obtenido = Number(
            notaObtenida[evaluacion.id]
        );

        if (
            isNaN(obtenido) ||
            obtenido < 0 ||
            obtenido > Number(evaluacion.porcentaje)
        ) {
            setError(
                `El porcentaje obtenido debe estar entre 0 y ${evaluacion.porcentaje}%.`
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const actualizada =
                await actualizarPorcentajeObtenido(
                    evaluacion.id,
                    obtenido
                );

            setEvaluaciones((prev) =>
                prev.map((item) =>
                    item.id === actualizada.id
                        ? actualizada
                        : item
                )
            );

            setNotaObtenida((prev) => ({
                ...prev,
                [actualizada.id]:
                    actualizada.porcentajeObtenido
            }));

            setEditandoNota(null);

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "No se pudo actualizar el porcentaje obtenido."
            );

        } finally {
            setLoading(false);
        }
    }

    function solicitarEliminar(evaluacion) {
        setError("");
        setEvaluacionAEliminar(evaluacion);
    }

    async function confirmarEliminar() {
        if (!evaluacionAEliminar) return;

        try {
            setLoading(true);
            setError("");

            await eliminarEvaluacion(
                evaluacionAEliminar.id
            );

            setEvaluaciones((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== evaluacionAEliminar.id
                )
            );

            setNotaObtenida((prev) => {
                const nuevasNotas = { ...prev };

                delete nuevasNotas[
                    evaluacionAEliminar.id
                ];

                return nuevasNotas;
            });

            if (
                editandoNota === evaluacionAEliminar.id
            ) {
                setEditandoNota(null);
            }

            setEvaluacionAEliminar(null);

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "No se pudo eliminar la evaluación."
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
                                            setMostrarNuevaEvaluacion(
                                                true
                                            )
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

                                        {editando === evaluacion.id ? (

                                            <div
                                                className={
                                                    styles.editarEvaluacion
                                                }
                                            >
                                                <h4>
                                                    Editar evaluación
                                                </h4>

                                                <div
                                                    className={
                                                        styles.campoEdicion
                                                    }
                                                >
                                                    <label>
                                                        Nombre
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            nombreEditado
                                                        }
                                                        onChange={(e) =>
                                                            setNombreEditado(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Nombre de la evaluación"
                                                    />
                                                </div>

                                                <div
                                                    className={
                                                        styles.porcentajes
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.campoEdicion
                                                        }
                                                    >
                                                        <label>
                                                            Porcentaje que vale
                                                        </label>

                                                        <div
                                                            className={
                                                                styles.inputConUnidad
                                                            }
                                                        >
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={
                                                                    porcentajeEditado
                                                                }
                                                                onChange={(e) =>
                                                                    setPorcentajeEditado(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.campoEdicion
                                                        }
                                                    >
                                                        <label>
                                                            Porcentaje obtenido
                                                        </label>

                                                        <div
                                                            className={
                                                                styles.inputConUnidad
                                                            }
                                                        >
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={
                                                                    porcentajeEditado
                                                                }
                                                                step="0.01"
                                                                value={
                                                                    valorEditado
                                                                }
                                                                onChange={(e) =>
                                                                    setValorEditado(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className={
                                                        styles.edicionActions
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.cancelButton
                                                        }
                                                        onClick={
                                                            cancelarEdicion
                                                        }
                                                        disabled={loading}
                                                    >
                                                        Cancelar
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.saveButton
                                                        }
                                                        onClick={() =>
                                                            guardarEdicion(
                                                                evaluacion
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        {loading
                                                            ? "Guardando..."
                                                            : "Guardar"}
                                                    </button>
                                                </div>
                                            </div>

                                        ) : (

                                            <>
                                                <div>
                                                    <strong>
                                                        {evaluacion.nombre}
                                                    </strong>

                                                    <span>
                                                        Valor{" "}
                                                        {
                                                            evaluacion.porcentaje
                                                        }
                                                        %
                                                    </span>
                                                </div>

                                                <div
                                                    className={
                                                        styles.evaluacionAcciones
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.obtenido
                                                        }
                                                    >
                                                        <span>
                                                            Obtenido
                                                        </span>

                                                        {curso.estado === "matriculado" ? (

                                                            editandoNota === evaluacion.id ? (

                                                                <div
                                                                    className={
                                                                        styles.notaObtenida
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.notaInput
                                                                        }
                                                                    >
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={
                                                                                evaluacion.porcentaje
                                                                            }
                                                                            step="0.01"
                                                                            value={
                                                                                notaObtenida[
                                                                                    evaluacion.id
                                                                                ] ?? 0
                                                                            }
                                                                            onChange={(e) =>
                                                                                setNotaObtenida(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [evaluacion.id]:
                                                                                            e.target.value
                                                                                    })
                                                                                )
                                                                            }
                                                                            autoFocus
                                                                        />

                                                                        <span>
                                                                            %
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        className={
                                                                            styles.saveNotaButton
                                                                        }
                                                                        onClick={() =>
                                                                            guardarPorcentajeObtenido(
                                                                                evaluacion
                                                                            )
                                                                        }
                                                                        disabled={loading}
                                                                    >
                                                                        {loading
                                                                            ? "Guardando..."
                                                                            : "Guardar"}
                                                                    </button>
                                                                </div>

                                                            ) : (

                                                                <button
                                                                    className={
                                                                        styles.notaValor
                                                                    }
                                                                    onClick={() => {
                                                                        setError("");
                                                                        setEditandoNota(
                                                                            evaluacion.id
                                                                        );
                                                                    }}
                                                                >
                                                                    {
                                                                        notaObtenida[
                                                                            evaluacion.id
                                                                        ] ?? 0
                                                                    }%
                                                                </button>

                                                            )

                                                        ) : (

                                                            <strong>
                                                                {
                                                                    evaluacion.porcentajeObtenido ??
                                                                    0
                                                                }%
                                                            </strong>

                                                        )}
                                                    </div>

                                                    {curso.estado === "matriculado" && (
                                                        <div
                                                            className={
                                                                styles.evaluacionBotones
                                                            }
                                                        >
                                                            <button
                                                                className={
                                                                    styles.editarButton
                                                                }
                                                                onClick={() =>
                                                                    iniciarEdicion(
                                                                        evaluacion
                                                                    )
                                                                }
                                                            >
                                                                Editar
                                                            </button>

                                                            <button
                                                                className={
                                                                    styles.eliminarButton
                                                                }
                                                                onClick={() =>
                                                                    solicitarEliminar(
                                                                        evaluacion
                                                                    )
                                                                }
                                                                disabled={loading}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    )}

                                                </div>
                                            </>
                                        )}

                                    </div>
                                ))}

                            </div>
                        )}

                        <div className={styles.resumen}>

                            <div>
                                <span>Evaluado</span>

                                <strong>
                                    {porcentajeEvaluado}%
                                </strong>
                            </div>

                            <div>
                                <span>Acumulado</span>

                                <strong>
                                    {acumulado}%
                                </strong>
                            </div>

                        </div>

                        {curso.estado === "matriculado" &&
                            mostrarNuevaEvaluacion && (

                                <div
                                    className={
                                        styles.nuevaEvaluacion
                                    }
                                >

                                    <input
                                        type="text"
                                        placeholder="Nombre de la evaluación"
                                        value={
                                            nombreEvaluacion
                                        }
                                        onChange={(e) =>
                                            setNombreEvaluacion(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div
                                        className={
                                            styles.porcentajeInput
                                        }
                                    >
                                        <input
                                            type="number"
                                            placeholder="Porcentaje"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={
                                                porcentajeEvaluacion
                                            }
                                            onChange={(e) =>
                                                setPorcentajeEvaluacion(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <span>
                                            %
                                        </span>
                                    </div>

                                    <div
                                        className={
                                            styles.formActions
                                        }
                                    >
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
                                            className={
                                                styles.saveButton
                                            }
                                            onClick={
                                                agregarEvaluacion
                                            }
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
                            {curso.nota > 99.5
                                ? 100
                                : curso.nota}
                        </strong>

                    </div>
                )}

                {(curso.estado === "pendiente" ||
                    curso.estado === "reprobado") && (

                    <button
                        className={styles.matricularButton}
                        onClick={solicitarMatricula}
                        disabled={loading}
                    >
                        {loading
                            ? "Matriculando..."
                            : curso.estado === "reprobado"
                                ? "Volver a matricular"
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

            {evaluacionAEliminar && (

                <div
                    className={styles.confirmOverlay}
                    onClick={() =>
                        setEvaluacionAEliminar(null)
                    }
                >
                    <div
                        className={styles.confirmModal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className={styles.confirmIcon}>
                            ?
                        </div>

                        <h3>
                            ¿Eliminar evaluación?
                        </h3>

                        <p>
                            Estás a punto de eliminar
                            <strong>
                                {" "}
                                "{evaluacionAEliminar.nombre}"
                            </strong>.
                            Esta acción no se puede deshacer.
                        </p>

                        <div
                            className={
                                styles.confirmActions
                            }
                        >

                            <button
                                className={
                                    styles.confirmCancel
                                }
                                onClick={() =>
                                    setEvaluacionAEliminar(
                                        null
                                    )
                                }
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                            <button
                                className={
                                    styles.confirmDelete
                                }
                                onClick={
                                    confirmarEliminar
                                }
                                disabled={loading}
                            >
                                {loading
                                    ? "Eliminando..."
                                    : "Eliminar"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {mostrarConfirmacionMatricula && (

                <div
                    className={styles.confirmOverlay}
                    onClick={() =>
                        setMostrarConfirmacionMatricula(
                            false
                        )
                    }
                >
                    <div
                        className={styles.confirmModal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className={styles.confirmIcon}>
                            ?
                        </div>

                        <h3>
                            ¿Volver a matricular?
                        </h3>

                        <p>
                            Al volver a matricular este curso,
                            se eliminarán las evaluaciones de la
                            matrícula anterior y podrás registrar
                            las nuevas evaluaciones desde cero.
                        </p>

                        <div
                            className={
                                styles.confirmActions
                            }
                        >

                            <button
                                className={
                                    styles.confirmCancel
                                }
                                onClick={() =>
                                    setMostrarConfirmacionMatricula(
                                        false
                                    )
                                }
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                            <button
                                className={
                                    styles.saveButton
                                }
                                onClick={handleMatricular}
                                disabled={loading}
                            >
                                {loading
                                    ? "Matriculando..."
                                    : "Volver a matricular"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}