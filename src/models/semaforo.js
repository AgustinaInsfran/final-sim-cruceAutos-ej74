import parametros from "../../config/parametros.js";


export default class Semaforo {
    constructor() {
        this.estadoActual = 'VERDE_URQUIZA'
    }

    // Calculo cuál es el siguiente color y cuánto dura. Se retorna un objeto con el nuevo estado y la duración
    getSiguienteEstado() {
        let nuevoEstado = '';
        let duracion = 0;

        switch (this.estadoActual) {
            case 'VERDE_URQUIZA':
                nuevoEstado = 'AMARILLO_URQUIZA';
                duracion = parametros.semaforo.urquiza.amarillo;
                break;
            case 'AMARILLO_URQUIZA':
                nuevoEstado = 'VERDE_COLON';
                duracion = parametros.semaforo.colon.verde;
                break;
            case 'VERDE_COLON':
                nuevoEstado = 'AMARILLO_COLON';
                duracion = parametros.semaforo.colon.amarillo;
                break;
            case 'AMARILLO_COLON':
                nuevoEstado = 'VERDE_URQUIZA';
                duracion = parametros.semaforo.urquiza.verde;
                break;
        }

        return { estado: nuevoEstado, duracion: duracion }
    }

    // Actualizar estado interno cuando llega el evento fin de semáforo
    setEstado(nuevoEstado) {
        this.estadoActual = nuevoEstado;
    }

    // Helpers
    isUrquizaVerde() { return this.estadoActual === 'VERDE_URQUIZA'; }
    isColonVerde() { return this.estadoActual === 'VERDE_COLON'; }
}


