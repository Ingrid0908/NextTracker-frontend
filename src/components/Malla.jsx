import { useEffect, useState } from "react";

import CursoCard from "./CursoCard";
import SelectorCiclos from "./SelectorCiclo";
import CursoDetalleModal from "./CursoDetalleModal";
import RequisitoModal from "./RequisitoModal";
import MallaVisual from "./MallaVisual";
import VistaSelector from "./VistaSelector";

import {
    getCursosPorCiclo,
    getTodosLosCursos,
} from "../services/cursoService";

import { getRequisitosCurso } from "../services/requisitoService";

import styles from "./Malla.module.css";


export default function Malla() {

    const [ciclo, setCiclo] = useState("I");
    const [todosCursos, setTodosCursos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vista, setVista] = useState("cards");

    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [detalleRequisitos, setDetalleRequisitos] = useState(null);
    const [mostrarRequisitos, setMostrarRequisitos] = useState(false);


    useEffect(() => {
        cargarCursos();
    }, [ciclo]);


    useEffect(() => {
        cargarTodosCursos();
    }, []);


    async function cargarCursos() {

        setLoading(true);

        try {

            const data = await getCursosPorCiclo(ciclo);

            setCursos(data);

        } catch (error) {

            console.error("Error cargando cursos:", error);

        } finally {

            setLoading(false);

        }

    }


    async function cargarTodosCursos() {

        try {

            const data = await getTodosLosCursos();

            setTodosCursos(data);

        } catch (error) {

            console.error(error);

        }

    }


    function actualizarCurso(cursoActualizado) {

        setCursos((prevCursos) =>
            prevCursos.map((curso) =>
                curso.id === cursoActualizado.id
                    ? cursoActualizado
                    : curso
            )
        );


        setTodosCursos((prevCursos) =>
            prevCursos.map((curso) =>
                curso.id === cursoActualizado.id
                    ? cursoActualizado
                    : curso
            )
        );


        setCursoSeleccionado(cursoActualizado);

    }


    async function abrirRequisitos(curso) {

        setMostrarRequisitos(false);

        try {

            const data = await getRequisitosCurso(curso.id);

            setDetalleRequisitos({
                curso,
                ...data
            });

            setMostrarRequisitos(true);

        } catch (error) {

            console.error(error);

        }

    }


    if (loading) {
        return <h2>Cargando cursos...</h2>;
    }


    return (

        <div className="page">

            <VistaSelector
                vista={vista}
                setVista={setVista}
            />


            {vista === "cards" && (

                <SelectorCiclos
                    cicloActual={ciclo}
                    onChange={setCiclo}
                />

            )}


            {vista === "cards" ? (

                <div className="container">

                    <div className={styles.grid}>

                        {cursos.map((curso) => (

                            <CursoCard
                                key={curso.id}
                                curso={curso}
                                onOpen={setCursoSeleccionado}
                            />

                        ))}

                    </div>

                </div>

            ) : (

                <div className="containerMalla">

                    <MallaVisual
                        cursos={todosCursos}
                        onCursoClick={setCursoSeleccionado}
                    />

                </div>

            )}


            {cursoSeleccionado && !mostrarRequisitos && (

                <CursoDetalleModal
                    curso={cursoSeleccionado}
                    onClose={() => setCursoSeleccionado(null)}
                    onCursoActualizado={actualizarCurso}
                    onVerRequisitos={abrirRequisitos}
                />

            )}


            {mostrarRequisitos && detalleRequisitos && (

                <RequisitoModal
                    detalle={detalleRequisitos}
                    onClose={() => setMostrarRequisitos(false)}
                />

            )}

        </div>

    );

}