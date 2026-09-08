const API = `${import.meta.env.VITE_API_URL}/malla/cursos`;

export async function getCursosPorCiclo(ciclo) {
  const response = await fetch(`${API}/ciclo/${ciclo}`);

  if (!response.ok) {
    throw new Error("Error al obtener los cursos");
  }

  return response.json();
}

export async function getTodosLosCursos() {
  const response = await fetch(API);

  if (!response.ok) {
    throw new Error("Error al obtener los cursos");
  }

  return response.json();
}

export async function actualizarNota(id, nota) {

    const response = await fetch(
        `${API}/updateNota/${id}/${nota}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) {
        throw new Error("No se pudo actualizar la nota");
    }

    return response.json();
}

export async function matricularCurso(id) {

    const response = await fetch(
        `${API}/matricular/${id}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) {
        throw new Error("No se pudo matricular el curso");
    }

    return response.json();
}


export async function finalizarCurso(id) {

    const response = await fetch(
        `${API}/finalizar/${id}`,
        {
            method: "PUT",
        }
    );

    if (!response.ok) {
        throw new Error("No se pudo finalizar el curso");
    }

    return response.json();
}