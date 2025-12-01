export default class VectorEstado {
    constructor() {
        // 1. Reloj y evento de inicialización
        this.reloj = 0
        this.evento = 'Inicialización'

        // 2. Eventos
        this.rndLlegadaUrquiza = null
        this.tiempoEntreLlegadasUrquiza = null
        this.proxLlegadaUrquiza = null 

        this.rndLlegadaColon = null
        this.tiempoEntreLlegadasColon = null
        this.proxLlegadaColon = null

        this.rndCruceUrquiza = null
        this.tiempoCruceUrquiza = null

        this.rndCruceColon = null
        this.tiempoCruceColon = null

        this.proxFinSemaforo = null
        this.finCruceUrquiza = [null, null, null]
        this.finCruceColon = [null, null]

        // 3. Estado del sistema
        this.colaUrquiza = 0
        this.colaColon = 0
        this.estadoSemaforo = ''

        // 4. Estadísticas
        this.contadorAutosUrquiza = 0
        this.contadorAutosColon = 0
        this.tiempoPermanenciaUrquiza = 0
        this.tiempoPermanenciaColon = 0
    }

    clone() {
        const clon = new VectorEstado()

        Object.assign(clon, this)

        clon.finCruceUrquiza = [...this.finCruceUrquiza]
        clon.finCruceColon = [...this.finCruceColon]

        return clon
    }

    // Limpia los RNDs de la fila anterior 
    resetearRND() {
        this.rndLlegadaUrquiza = null;
        this.tiempoEntreLlegadasUrquiza = null;
        this.rndLlegadaColon = null;
        this.tiempoEntreLlegadasColon = null;
        this.rndCruceUrquiza = null;
        this.tiempoCruceUrquiza = null;
        this.rndCruceColon = null;
        this.tiempoCruceColon = null;
    }
}

