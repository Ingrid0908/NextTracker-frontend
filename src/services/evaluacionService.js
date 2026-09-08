const API_URL =  `${import.meta.env.VITE_API_URL}/malla/evaluaciones`;


export async function getEvaluacionesCurso(idCurso) {

    const response = await fetch(
        `${API_URL}/curso/${idCurso}`
    );

    if (!response.ok) {
        throw new Error("Error obteniendo evaluaciones");
    }

    return response.json();
}


export async function crearEvaluacion(
    idCurso,
    nombre,
    porcentaje,
    porcentajeObtenido = 0
) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            idCurso,

            nombre,

            porcentaje,

            porcentajeObtenido

        })

    });

    if (!response.ok) {

        const mensaje = await response.text();

        throw new Error(mensaje);

    }

    return response.json();
}


export async function actualizarEvaluacion(
    id,
    nombre,
    porcentaje,
    porcentajeObtenido
) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                nombre,

                porcentaje,

                porcentajeObtenido

            })

        }
    );


    if (!response.ok) {

        const mensaje = await response.text();

        throw new Error(mensaje);

    }

    return response.json();
}


export async function eliminarEvaluacion(id) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );


    if (!response.ok) {
        throw new Error("Error eliminando evaluación");
    }

}