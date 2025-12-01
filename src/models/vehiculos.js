export default class vehiculos {
    constructor(id, horaLlegada) {
        this.id = id
        this.horaLlegada = horaLlegada
        this.estado = 'EN_COLA'
        this.horaInicioCruce = null
        this.horaFinCruce = null
    }

    esperar() {
        this.estado = 'EN_COLA'
    }

    cruzar(horaActual, tiempoDeCruce) {
        this.estado = 'CRUZANDO'
        this.horaInicioCruce = horaActual
        this.horaFinCruce = horaActual + tiempoDeCruce
    }

    // Cálculo de cuánto esperó en cola 
    getTiempoEspera(){
        if (!this.horaInicioCruce) return 0 
        return this.horaInicioCruce - this.horaLlegada
    }
}

