const parametros = {
    simulacion: {
        hora_inicio: 8,
        hora_fin: 12,

        get duracion_segundos() {
            return (this.hora_fin - this.hora_inicio) * 3600;
        }
    },
    semaforo: {
        urquiza: {
            verde: 45,
            amarillo: 10,
            rojo: 35
        },
        colon: {
            verde: 25,
            amarillo: 10,
            rojo: 55
        }
    },
    autos: {
        urquiza: {
            llegada_promedio: 2,
            llegada_desviacion: 1,
            capacidad_cruce: 3,
            tiempo_cruce: 4,
            desviacion_cruce: 0.5,

            //Calculo los límites automáticamente
            get min() { return this.llegada_promedio - this.llegada_desviacion;},
            get max() { return this.llegada_promedio + this.llegada_desviacion;},
            get min_cruce() { return this.tiempo_cruce - this.desviacion_cruce;},
            get max_cruce() { return this.tiempo_cruce + this.desviacion_cruce;}
        },
        colon: {
            llegada_promedio: 3,
            llegada_desviacion: 1,
            capacidad_cruce: 2,
            tiempo_cruce: 4,
            desviacion_cruce: 1,

            //Calculo los límites automáticamente
            get min() { return this.llegada_promedio - this.llegada_desviacion;},
            get max() { return this.llegada_promedio + this.llegada_desviacion;},
            get min_cruce() { return this.tiempo_cruce - this.desviacion_cruce;},
            get max_cruce() { return this.tiempo_cruce + this.desviacion_cruce;}
        }

    }
}

export default parametros;