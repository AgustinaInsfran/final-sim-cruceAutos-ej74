import carriles from './src/models/carriles.js';
import Semaforo from './src/models/semaforo.js';

console.log('--- INICIANDO PRUEBAS DE MODELOS ---\n');

// ==========================================
// 1. PRUEBA DEL SEMÁFORO
// ==========================================
console.log('1. TEST TRAFFIC LIGHT');
const semaforo = new Semaforo();

console.log(`Estado Inicial: ${semaforo.estadoActual}`); // Debería ser VERDE_URQUIZA

// Simulamos avanzar el ciclo completo
for (let i = 0; i < 4; i++) {
    const siguiente = semaforo.getSiguienteEstado();
    console.log(`Si estoy en ${semaforo.estadoActual} -> El siguiente es ${siguiente.estado} (Dura: ${siguiente.duracion}s)`);
    semaforo.setEstado(siguiente.estado);
}
console.log('\n');

// ==========================================
// 2. PRUEBA DE CARRILES (LANE GROUP)
// ==========================================
console.log('2. TEST LANE GROUP (URQUIZA - 3 Carriles)');
const urquiza = new carriles("Urquiza", 3);

// Función "fake" para simular tiempo de cruce fijo de 4 segundos
const mockRandomCruce = () => 4; 

console.log('--- A. Llegada con Semáforo ROJO ---');
urquiza.llegadaVehiculo(100, false, mockRandomCruce); 
urquiza.llegadaVehiculo(105, false, mockRandomCruce);
console.log(`Cola actual: ${urquiza.cola.length} (Esperado: 2)`);
console.log(`Servidores ocupados: ${JSON.stringify(urquiza.getEstadoServidores())}`); 
// Esperado: ["-", "-", "-"] porque no pasaron

console.log('\n--- B. Cambio a VERDE y Entrada de Autos ---');
// Forzamos llegada con verde. 
// OJO: Los que estaban en cola NO entran solos aquí, 
// eso lo hace el método liberarServidor o una lógica externa.
// Probemos meter uno nuevo con verde:
const resultado = urquiza.llegadaVehiculo(110, true, mockRandomCruce);
console.log(`Auto entró en servidor: ${resultado.indice}`);
console.log(`Fin de cruce programado: ${resultado.finCruce}`); // Debería ser 110 + 4 = 114

console.log(`Estado Servidores: ${JSON.stringify(urquiza.getEstadoServidores())}`);
// Esperado: ["Auto 3", "-", "-"] (El 3 porque el 1 y 2 quedaron en cola)

console.log('\n--- C. Liberar Servidor y procesar Cola ---');
// Simulamos que llegamos al segundo 114 y se libera el servidor 0
const nuevoFin = urquiza.liberarServidor(0, 114, true, mockRandomCruce);

console.log(`Se liberó el servidor. ¿Entró alguien de la cola? SI.`);
console.log(`Nuevo Fin de Cruce: ${nuevoFin}`); // Debería ser 114 + 4 = 118
console.log(`Cola restante: ${urquiza.cola.length} (Esperado: 1)`);
console.log(`Estado Servidores: ${JSON.stringify(urquiza.getEstadoServidores())}`);
// Esperado: ["Auto 1", "-", "-"] (Entró el Auto 1 que estaba esperando desde el tiempo 100)

console.log('\n--- PRUEBAS FINALIZADAS ---');