import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const counterElement = document.getElementById('visit-count-header');
const VISIT_KEY = 'novax_last_visit_timestamp';
const SESSION_TIMEOUT = 1000 * 60 * 30; // 30 minutos entre visitas contadas

// Función para animar el conteo
const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Referencia al documento de contador
// Usaremos la colección "counters" y el documento "landing_stats"
const counterRef = doc(db, "counters", "landing_stats");

// 1. ESCUCHAR CAMBIOS EN TIEMPO REAL
onSnapshot(counterRef, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        const currentVal = parseInt(counterElement.innerText.replace(/,/g, '')) || 0;
        // Animar desde el valor actual al nuevo
        animateValue(counterElement, currentVal, data.count, 2500);
    } else {
        // IMPORTANTE: Ya NO creamos el documento aquí automáticamente con 3100.
        // Esto evita que fallos temporales de conexión reseteen el valor en la DB.
        console.warn("El documento de contador no existe en la base de datos.");
    }
}, (error) => {
    console.error("Error conectando a Firestore:", error);
    counterElement.style.opacity = "0.5";
});

// 2. INCREMENTAR VISITAS
const registerVisit = async () => {
    try {
        const lastVisit = localStorage.getItem(VISIT_KEY);
        const now = Date.now();

        // Solo contamos si no hay registro previo o si pasaron 30 mins
        if (!lastVisit || (now - parseInt(lastVisit) > SESSION_TIMEOUT)) {
            // Usamos updateDoc para incrementar. Si falla porque no existe, el catch lo manejará.
            try {
                await updateDoc(counterRef, {
                    count: increment(1)
                });
                console.log("Visita registrada +1");
            } catch (updateError) {
                // Si el error es que no existe (code: 'not-found'), lo inicializamos UNA VEZ.
                if (updateError.code === 'not-found' || updateError.message.includes('not found')) {
                    console.log("Inicializando contador por primera vez (3100)");
                    await setDoc(counterRef, { count: 3100 });
                } else {
                    throw updateError; // Propagamos otros errores (permisos, etc)
                }
            }
            localStorage.setItem(VISIT_KEY, now.toString());
        } else {
            console.log("Visita recurrente (no incrementa)");
        }
    } catch (error) {
        console.warn("Fallo crítico al registrar visita:", error);
    }
};

// Iniciar registro
registerVisit();
