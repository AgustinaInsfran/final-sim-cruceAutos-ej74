import inquirer from 'inquirer';
import { generarExcel } from './src/export/excelExporter.js';
import Simulacion from './src/core/simulacion.js';

const main = async () => {
    try {
        // Limpiamos la consola para que se vea prolijo
        console.clear();
        console.log("===========================================");
        console.log("🚦  TP SIMULACIÓN: TRÁNSITO EN CHUMBICHA  🚦");
        console.log("===========================================\n");

        // 1. Preguntar configuración al usuario (Días a simular)
        const respuestas = await inquirer.prompt([
            {
                type: 'number',
                name: 'dias',
                message: '¿Cuántos días desea simular?',
                default: 50,
                validate: (value) => {
                    if (value > 0) return true;
                    return 'Por favor ingresa un número mayor a 0.';
                }
            }
        ]);

        console.log("\n🔄 Inicializando motor de simulación...");
        const inicio = Date.now();

        // 2. Instanciar y Correr Simulación
        const simulador = new Simulacion();
        
        // Ejecutamos el método run pasando los días elegidos
        const resultados = simulador.run(respuestas.dias);

        const fin = Date.now();
        const tiempoTotal = ((fin - inicio) / 1000).toFixed(2);

        console.log(`✅ Simulación finalizada en ${tiempoTotal} segundos.`);
        console.log(`📊 Se generaron ${resultados.length} filas de eventos.`);
        console.log("💾 Generando reporte Excel...");

        // 3. Exportar a Excel
        const nombreArchivo = generarExcel(resultados);

        console.log("\n===========================================");
        console.log(`🚀 ¡LISTO! Abre el archivo: ${nombreArchivo}`);
        console.log("===========================================\n");

    } catch (error) {
        console.error("\n❌ Ocurrió un error inesperado:");
        console.error(error);
    }
};

main();