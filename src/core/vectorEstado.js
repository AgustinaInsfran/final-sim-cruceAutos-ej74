export default class VectorEstado {
    constructor() {
        this.reloj = 0
        this.evento = 'Inicialización'

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

        this.colaUrquiza = 0
        this.colaColon = 0
        this.estadoSemaforo = ''

        // Estadísticas por calle
        this.contadorAutosUrquiza = 0
        this.contadorAutosColon = 0
        
        // *** REQUERIMIENTO 1: Estadísticas Globales Acumuladas ***
        // Para verificar el cálculo final fila a fila
        this.acumuladorTiempoTotal = 0;
        this.cantidadAutosTotal = 0;

        // Visualización dinámica
        this.vehiculosActivos = []; 

        this.siguienteEventoNombre = null;
    }

    clone() {
        const clon = new VectorEstado()
        Object.assign(clon, this)

        clon.finCruceUrquiza = [...this.finCruceUrquiza]
        clon.finCruceColon = [...this.finCruceColon]
        
        if (this.vehiculosActivos) {
            clon.vehiculosActivos = this.vehiculosActivos.map(v => ({...v}));
        }

        return clon
    }

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