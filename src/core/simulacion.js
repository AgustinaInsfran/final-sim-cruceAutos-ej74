import parametros from "../../config/parametros.js";
import Carriles from "../models/carriles.js";
import Semaforo from "../models/semaforo.js";
import VectorEstado from "./vectorEstado.js";
import * as Randomizer from "../utils/randomizer.js";

export default class Simulacion {
    constructor() {
        this.semaforo = new Semaforo();
        this.carrilesUrquiza = new Carriles('Urquiza', parametros.autos.urquiza.capacidad_cruce);
        this.carrilesColon = new Carriles('Colón', parametros.autos.colon.capacidad_cruce);

        this.vectorEstado = new VectorEstado();
        this.resultados = [];
        
        // *** OPTIMIZACIÓN: Usar MAP en lugar de Array ***
        // El Map permite borrar autos instantáneamente por su ID.
        // El Array tardaba milisegundos en buscar y borrar, lo que sumado millones de veces trababa todo.
        this.todosLosVehiculos = new Map(); 

        this.acumuladorTiempoPermanencia = 0;
        this.totalAutosSalieron = 0;
    }

    run(diasASimular, filtro) {
        console.log(`   (Simulando ${diasASimular} días...)`);
        const max_tiempo = parametros.simulacion.duracion_segundos;

        for (let dia = 1; dia <= diasASimular; dia++) {
            this.vectorEstado.reloj = 0;
            this.inicializarDia(dia, max_tiempo);

            // *** REGLA 1: Guardar Inicialización ***
            if (dia === 1) {
                this.actualizarVisualizacionVehiculos();
                const filaInit = this.vectorEstado.clone();
                filaInit.dia = dia;
                filaInit.evento = "Inicialización";
                this.resultados.push(filaInit);
            }

            while (this.vectorEstado.reloj < max_tiempo) {
                const proximoEvento = this.buscarSiguienteEvento();
                this.vectorEstado.reloj = proximoEvento.tiempo;
                this.vectorEstado.evento = proximoEvento.nombre;
                this.vectorEstado.resetearRND();

                this.procesarEvento(proximoEvento);

                // *** REGLA 2: Guardar si cumple filtro ***
                let guardar = false;
                if (filtro && dia === filtro.dia) {
                    if (this.vectorEstado.reloj >= filtro.desdeSeg && this.vectorEstado.reloj <= filtro.hastaSeg) {
                        guardar = true;
                    }
                }

                if (guardar) {
                    this.actualizarVisualizacionVehiculos();
                    const fila = this.vectorEstado.clone();
                    fila.dia = dia;
                    this.resultados.push(fila);
                }
            }
            if (dia % 10 === 0) process.stdout.write(`.`); 
        }
        
        console.log("\n");
        // *** REGLA 3: Guardar Estadísticas Finales ***
        this.agregarFilaResumen();
        return this.resultados;
    }

    inicializarDia(dia, duracionDiaAnterior) {
        this.vectorEstado.resetearRND();
        
        const llegadaUrq = Randomizer.getLlegadaUrquiza();
        this.vectorEstado.rndLlegadaUrquiza = llegadaUrq.rnd;
        this.vectorEstado.tiempoEntreLlegadasUrquiza = llegadaUrq.valor;
        this.vectorEstado.proxLlegadaUrquiza = this.vectorEstado.reloj + llegadaUrq.valor;

        const llegadaCol = Randomizer.getLlegadaColon();
        this.vectorEstado.rndLlegadaColon = llegadaCol.rnd;
        this.vectorEstado.tiempoEntreLlegadasColon = llegadaCol.valor;
        this.vectorEstado.proxLlegadaColon = this.vectorEstado.reloj + llegadaCol.valor;

        if (dia === 1) {
            this.semaforo.setEstado('VERDE_URQUIZA'); 
            this.vectorEstado.estadoSemaforo = 'VERDE_URQUIZA'; 
            this.vectorEstado.proxFinSemaforo = parametros.semaforo.urquiza.verde;
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
                
                const ultimoAutoU = this.obtenerUltimoAuto(this.carrilesUrquiza);
                // MAP SET
                if(ultimoAutoU) this.todosLosVehiculos.set(ultimoAutoU.id, ultimoAutoU);

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
                
                const ultimoAutoC = this.obtenerUltimoAuto(this.carrilesColon);
                // MAP SET
                if(ultimoAutoC) this.todosLosVehiculos.set(ultimoAutoC.id, ultimoAutoC);

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
                const autoSalienteU = this.carrilesUrquiza.servidores[idxU];
                
                const LibUrq = this.carrilesUrquiza.liberarServidor(
                    idxU, this.vectorEstado.reloj, this.semaforo.isUrquizaVerde(), Randomizer.getCruceUrquiza
                );
                if (LibUrq) {
                    this.vectorEstado.rndCruceUrquiza = LibUrq.rnd;
                    this.vectorEstado.tiempoCruceUrquiza = LibUrq.tiempoCruce;
                }
                if (autoSalienteU) {
                    this.eliminarVehiculoDeLista(autoSalienteU.id);
                    this.acumuladorTiempoPermanencia += (this.vectorEstado.reloj - autoSalienteU.horaLlegada);
                    this.totalAutosSalieron++;
                }
                this.vectorEstado.colaUrquiza = this.carrilesUrquiza.cola.length;
                this.vectorEstado.contadorAutosUrquiza++;
                break;

            case evento.nombre.startsWith('FIN_CRUCE_COLON'):
                const idxC = parseInt(evento.nombre.split('_')[3]);
                const autoSalienteC = this.carrilesColon.servidores[idxC];
                
                const LibCol = this.carrilesColon.liberarServidor(
                    idxC, this.vectorEstado.reloj, this.semaforo.isColonVerde(), Randomizer.getCruceColon
                );
                if (LibCol) {
                    this.vectorEstado.rndCruceColon = LibCol.rnd;
                    this.vectorEstado.tiempoCruceColon = LibCol.tiempoCruce;
                }
                if (autoSalienteC) {
                    this.eliminarVehiculoDeLista(autoSalienteC.id);
                    this.acumuladorTiempoPermanencia += (this.vectorEstado.reloj - autoSalienteC.horaLlegada);
                    this.totalAutosSalieron++;
                }
                this.vectorEstado.colaColon = this.carrilesColon.cola.length;
                this.vectorEstado.contadorAutosColon++;
                break;
        }
        this.actualizarVector();
    }
    
    obtenerUltimoAuto(carril) {
        if (carril.cola.length > 0) return carril.cola[carril.cola.length - 1]; 
        return carril.servidores.find(a => a && a.horaLlegada === this.vectorEstado.reloj);
    }

    eliminarVehiculoDeLista(id) {
        // MAP DELETE: O(1) - Instantáneo
        this.todosLosVehiculos.delete(id);
    }

    actualizarVisualizacionVehiculos() {
        // Convertimos el MAP a ARRAY solo cuando necesitamos visualizar
        this.vectorEstado.vehiculosActivos = Array.from(this.todosLosVehiculos.values()).map(v => ({
            id: v.id,
            estado: v.estado
        }));
    }

    agregarFilaResumen() {
        const promedio = this.totalAutosSalieron > 0 
            ? (this.acumuladorTiempoPermanencia / this.totalAutosSalieron).toFixed(2) 
            : 0;

        this.resultados.push({ dia: '', reloj: '', evento: '' }); 

        const resumen = new VectorEstado();
        resumen.evento = "ESTADÍSTICAS FINALES (50 DÍAS)";
        resumen.resumenTexto = `Tiempo Promedio Permanencia: ${promedio} seg`;
        this.resultados.push(resumen);
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
            const auto = carriles.cola.shift(); 
            const tiempoCruce = generadorCruce();
            auto.cruzar(this.vectorEstado.reloj, tiempoCruce.valor); 
            carriles.servidores[idxLibre] = auto;
        }
    }
}