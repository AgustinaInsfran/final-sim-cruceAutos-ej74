import vehiculos from "./vehiculos.js"

export default class Carriles {
    constructor(nombre, maxServidores) {
        this.nombre = nombre
        this.maxServidores = maxServidores
        this.cola = [] // Array de objetos vehículos

        // Array que representa a los servidores. Si es null, está libre, sino ocupado con el tiempo de fin de cruce
        this.servidores = new Array(maxServidores).fill(null)

        this.contadorIds = 1
        this.autosAtendidos = []
    }

    llegadaVehiculo(reloj, semaforoEnVerde, generadorTiempo) {
        const nuevoAuto = new vehiculos(this.contadorIds++, reloj)

        // 1. Si el semáforo no está en verde, va a la cola 
        if (!semaforoEnVerde) {
            nuevoAuto.esperar()
            this.cola.push(nuevoAuto)
            return null
        }

        // 2. Si está en verde, busco un carril libre
        const indiceLibre = this.buscarServidorLibre(reloj)

        if (indiceLibre !== -1) {
            // Hay lugar
            const resultadoRND = generadorTiempo()

            nuevoAuto.cruzar(reloj, resultadoRND.valor)
            this.servidores[indiceLibre] = nuevoAuto

            return {
                finCruce: nuevoAuto.horaFinCruce, 
                indice: indiceLibre,
                rnd: resultadoRND.rnd,
                tiempoCruce: resultadoRND.valor
            }
        } else {
            // Semáforo en verde pero todo ocupado
            nuevoAuto.esperar()
            this.cola.push(nuevoAuto)
            return null
        }
    }

    liberarServidor(indiceServidor, reloj, semaforoEnVerde, generadorTiempo) {
        // 1. Sacar el auto que primero ingresó
        const autoSaliente = this.servidores[indiceServidor]
        if (autoSaliente) {
            autoSaliente.estado = 'FINALIZADO'
            this.autosAtendidos.push(autoSaliente)
        }

        this.servidores[indiceServidor] = null // Queda libre

        // 2. Revisar la cola 
        if (this.cola.length > 0 && semaforoEnVerde){
            const siguienteAuto = this.cola.shift() // Saco el primero
            const resultadoRND = generadorTiempo()
            siguienteAuto.cruzar(reloj, resultadoRND.valor)
            this.servidores[indiceServidor] = siguienteAuto

            return {
                finCruce: siguienteAuto.horaFinCruce,
                rnd: resultadoRND.rnd,
                tiempoCruce: resultadoRND.valor
            }

        }

        return null
    }

    buscarServidorLibre() {
        for (let i = 0; i < this.maxServidores; i++) {
            if (this.servidores[i] === null) {
                return i
            }
        }
        return -1
    }

    getEstadoServidores() {
        return this.servidores.map(car => car ? `Auto ${car.id}` : '-' )
    }
}