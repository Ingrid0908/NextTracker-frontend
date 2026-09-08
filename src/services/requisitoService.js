const API = `${import.meta.env.VITE_API_URL}/malla/requisitos`;

export async function getRequisitosCurso(idCurso) {
  const [preRes, coRes] = await Promise.all([
    fetch(`${API}/prerequisitos/${idCurso}`),
    fetch(`${API}/correquisitos/${idCurso}`),
  ]);

  if (!preRes.ok || !coRes.ok) {
    throw new Error("No se pudieron cargar los requisitos");
  }

  return {
    prerequisitos: await preRes.json(),
    correquisitos: await coRes.json(),
  };
}