import parametros from "../../config/parametros.js";
import Carriles from "../models/carriles.js";
import Semaforo from "../models/semaforo.js";
import VectorEstado from "./vectorEstado.js";
import * as Randomizer from "../utils/randomizer.js";


export default class Simulacion {
    constructor() {
        // 1. Inicializar modelos
        this.semaforo = new Semaforo();

        // Inicializo carriles
        this.carrilesUrquiza = new Carriles('Urquiza', parametros.autos.urquiza.capacidad_cruce);
        this.carrilesColon = new Carriles('Colón', parametros.autos.colon.capacidad_cruce);

        // Estado y resultados 
        this.vectorEstado = new VectorEstado();
        this.resultados = [];
    }

    run(diasASimular) {
        console.log(`Iniciando simulación de ${diasASimular} días...`);
        const max_tiempo = parametros.simulacion.duracion_segundos;

        for (let dia = 1; dia <= diasASimular; dia++) {
            this.vectorEstado.reloj = 0;

            // Configuración inicial del día
            this.inicializarDia(dia, max_tiempo);

            while (this.vectorEstado.reloj < max_tiempo) {
                // 1. Buscar evento
                const proximoEvento = this.buscarSiguienteEvento();

                // 2. Avanzar reloj
                this.vectorEstado.reloj = proximoEvento.tiempo;
                this.vectorEstado.evento = proximoEvento.nombre;

                this.vectorEstado.resetearRND();

                // 3. Lógica
                this.procesarEvento(proximoEvento);

                // 4. Guardar
                const filaGuardada = this.vectorEstado.clone();
                filaGuardada.dia = dia;
                this.resultados.push(filaGuardada);
            }
        }
        return this.resultados;
    }

    inicializarDia(dia, duracionDiaAnterior) {
        this.vectorEstado.resetearRND();

        // Llegadas
        const llegadaUrq = Randomizer.getLlegadaUrquiza();
        this.vectorEstado.rndLlegadaUrquiza = llegadaUrq.rnd;
        this.vectorEstado.tiempoEntreLlegadasUrquiza = llegadaUrq.valor;
        this.vectorEstado.proxLlegadaUrquiza = this.vectorEstado.reloj + llegadaUrq.valor;

        const llegadaCol = Randomizer.getLlegadaColon();
        this.vectorEstado.rndLlegadaColon = llegadaCol.rnd;
        this.vectorEstado.tiempoEntreLlegadasColon = llegadaCol.valor;
        this.vectorEstado.proxLlegadaColon = this.vectorEstado.reloj + llegadaCol.valor;

        // Semáforo
        if (dia === 1) {
            this.semaforo.setEstado('VERDE_URQUIZA'); 
            this.vectorEstado.estadoSemaforo = parametros.semaforo.urquiza.verde;
        } else {
            this.vectorEstado.estadoSemaforo = this.semaforo.estadoActual;
            this.vectorEstado.proxFinSemaforo = this.vectorEstado.proxFinSemaforo - duracionDiaAnterior;
        }

        this.ajustarTiempoServidores(this.carrilesUrquiza, duracionDiaAnterior);
        this.ajustarTiempoServidores(this.carrilesColon, duracionDiaAnterior);

        this.actualizarVector();
    }

    buscarSiguienteEvento() {
        const candidatos = [
            { tiempo: this.vectorEstado.proxLlegadaUrquiza, nombre: 'LLEGADA_URQUIZA' },
            { tiempo: this.vectorEstado.proxLlegadaColon, nombre: 'LLEGADA_COLON' },
            { tiempo: this.vectorEstado.proxFinSemaforo, nombre: 'FIN_SEMAFORO' }
        ];

        this.carrilesUrquiza.servidores.forEach((auto, index) => {
            if (auto) candidatos.push({ tiempo: auto.horaFinCruce, nombre: `FIN_CRUCE_URQUIZA_${index}` });
        });
        this.carrilesColon.servidores.forEach((auto, index) => {
            if (auto) candidatos.push({ tiempo: auto.horaFinCruce, nombre: `FIN_CRUCE_COLON_${index}` });
        });

        
        candidatos.sort((a, b) => a.tiempo - b.tiempo);
        
        return candidatos[0];
    }

    procesarEvento(evento) {
        switch (true) {
            case evento.nombre === 'LLEGADA_URQUIZA':
                const nuevaLlegadaU = Randomizer.getLlegadaUrquiza(); 
                this.vectorEstado.rndLlegadaUrquiza = nuevaLlegadaU.rnd;
                this.vectorEstado.tiempoEntreLlegadasUrquiza = nuevaLlegadaU.valor;
                this.vectorEstado.proxLlegadaUrquiza += nuevaLlegadaU.valor;

                const resCruceU = this.carrilesUrquiza.llegadaVehiculo(
                    this.vectorEstado.reloj,
                    this.semaforo.isUrquizaVerde(),
                    Randomizer.getCruceUrquiza
                );

                if (resCruceU) {
                    this.vectorEstado.rndCruceUrquiza = resCruceU.rnd;
                    this.vectorEstado.tiempoCruceUrquiza = resCruceU.tiempoCruce;
                }
                this.vectorEstado.colaUrquiza = this.carrilesUrquiza.cola.length;
                break;

            case evento.nombre === 'LLEGADA_COLON':
                const nuevaLlegadaC = Randomizer.getLlegadaColon();
                this.vectorEstado.rndLlegadaColon = nuevaLlegadaC.rnd;
                this.vectorEstado.tiempoEntreLlegadasColon = nuevaLlegadaC.valor;
                this.vectorEstado.proxLlegadaColon += nuevaLlegadaC.valor;

                const resCruceC = this.carrilesColon.llegadaVehiculo(
                    this.vectorEstado.reloj,
                    this.semaforo.isColonVerde(),
                    Randomizer.getCruceColon
                );

                if (resCruceC) {
                    this.vectorEstado.rndCruceColon = resCruceC.rnd;
                    this.vectorEstado.tiempoCruceColon = resCruceC.tiempoCruce;
                }
                this.vectorEstado.colaColon = this.carrilesColon.cola.length;
                break;

            case evento.nombre === 'FIN_SEMAFORO':
                const sig = this.semaforo.getSiguienteEstado();
                this.semaforo.setEstado(sig.estado);

                this.vectorEstado.estadoSemaforo = sig.estado;
                this.vectorEstado.proxFinSemaforo = this.vectorEstado.reloj + sig.duracion;

                this.intentarIngresoDesdeCola();
                break;

            case evento.nombre.startsWith('FIN_CRUCE_URQUIZA'):
                const idxU = parseInt(evento.nombre.split('_')[3]);
                
                
                const LibUrq = this.carrilesUrquiza.liberarServidor(
                    idxU,
                    this.vectorEstado.reloj,
                    this.semaforo.isUrquizaVerde(), 
                    Randomizer.getCruceUrquiza
                );

                if (LibUrq) {
                    this.vectorEstado.rndCruceUrquiza = LibUrq.rnd;
                    this.vectorEstado.tiempoCruceUrquiza = LibUrq.tiempoCruce;
                }

                this.vectorEstado.colaUrquiza = this.carrilesUrquiza.cola.length;
                this.vectorEstado.contadorAutosUrquiza++;
                break;

            case evento.nombre.startsWith('FIN_CRUCE_COLON'):
                const idxC = parseInt(evento.nombre.split('_')[3]);
                const LibCol = this.carrilesColon.liberarServidor(
                    idxC,
                    this.vectorEstado.reloj,
                    this.semaforo.isColonVerde(),
                    Randomizer.getCruceColon
                );

                if (LibCol) {
                    this.vectorEstado.rndCruceColon = LibCol.rnd;
                    this.vectorEstado.tiempoCruceColon = LibCol.tiempoCruce;
                }

                this.vectorEstado.colaColon = this.carrilesColon.cola.length;
                this.vectorEstado.contadorAutosColon++;
                break;
        }
        this.actualizarVector();
    }

    actualizarVector() {
        this.vectorEstado.colaUrquiza = this.carrilesUrquiza.cola.length;
        this.vectorEstado.colaColon = this.carrilesColon.cola.length;
        this.vectorEstado.finCruceUrquiza = this.carrilesUrquiza.getEstadoServidores();
        this.vectorEstado.finCruceColon = this.carrilesColon.getEstadoServidores();
    }

    ajustarTiempoServidores(carriles, tiempoRestar) {
        carriles.servidores.forEach(auto => {
            if (auto && auto.horaFinCruce > tiempoRestar) {
                auto.horaFinCruce = auto.horaFinCruce - tiempoRestar;
            }
        });
    }

    intentarIngresoDesdeCola() {
        if (this.semaforo.isUrquizaVerde()) { 
            this.llenarServidoresVacios(this.carrilesUrquiza, Randomizer.getCruceUrquiza);
        }
        if (this.semaforo.isColonVerde()) {
            this.llenarServidoresVacios(this.carrilesColon, Randomizer.getCruceColon);
        }
    }

    llenarServidoresVacios(carriles, generadorCruce) {
        let idxLibre;
        while (carriles.cola.length > 0 && (idxLibre = carriles.buscarServidorLibre()) !== -1) {
            const auto = carriles.cola.shift(); // Saco el objeto Auto real
            const tiempoCruce = generadorCruce();
            
            auto.cruzar(this.vectorEstado.reloj, tiempoCruce.valor); // .valor porque ahora devuelve objeto
            carriles.servidores[idxLibre] = auto;
        }
    }
}