import styles from "./SelectorCiclo.module.css";

const CICLOS = [
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
    "XI",
];

export default function SelectorCiclos({ cicloActual, onChange }) {
    return (
        <div className={styles.container}>
            {CICLOS.map((ciclo) => (
                <button
                    key={ciclo}
                    onClick={() => onChange(ciclo)}
                    className={cicloActual === ciclo ? styles.activo : ""}
                >
                    {ciclo}
                </button>
            ))}
        </div>
    );
}