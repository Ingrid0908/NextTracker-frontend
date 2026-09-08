import styles from "./VistaSelector.module.css";

export default function VistaSelector({ vista, setVista }) {

    return (
        <div className={styles.container}>

            <button
                className={vista === "cards" ? styles.active : ""}
                onClick={() => setVista("cards")}
            >
                 Lista
            </button>


            <button
                className={vista === "malla" ? styles.active : ""}
                onClick={() => setVista("malla")}
            >
                 Malla
            </button>

        </div>
    );
}