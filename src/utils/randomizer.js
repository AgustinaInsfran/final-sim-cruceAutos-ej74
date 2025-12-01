import parametros from "../../config/parametros.js"

const generarUniforme = (min, max) => {
    const rnd = Math.random()
    const valor = min + rnd * (max - min)
    return {rnd, valor}
}

// Llegadas
export const getLlegadaUrquiza = () => {
    return generarUniforme(
        parametros.autos.urquiza.min,
        parametros.autos.urquiza.max
    )
}

export const getLlegadaColon = () => {
    return generarUniforme(
        parametros.autos.colon.min,
        parametros.autos.colon.max
    )
}

// Cruces
export const getCruceUrquiza = () => {
    return generarUniforme(
        parametros.autos.urquiza.min_cruce,
        parametros.autos.urquiza.max_cruce
    )
}
export const getCruceColon = () => {
    return generarUniforme(
        parametros.autos.colon.min_cruce,
        parametros.autos.colon.max_cruce
    )
}