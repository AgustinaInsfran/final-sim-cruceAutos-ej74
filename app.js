import inquirer from 'inquirer';
import { generarExcel } from './src/export/excelExporter.js';
import Simulacion from './src/core/simulacion.js';

const main = async () => {
    try {
        console.clear();
        console.log("==================================================");
        console.log("🚦  TP SIMULACIÓN: CRUCE CHUMBICHA (RANGO PERSONALIZADO) 🚦");
        console.log("==================================================\n");

        const config = await inquirer.prompt([
            {
                type: 'number',
                name: 'diasTotales',
                message: '1. ¿Cuántos días TOTALES desea simular para la estadística? (Ej: 50)',
                default: 50,
            },
            {
                type: 'confirm',
                name: 'verDetalle',
                message: '2. ¿Desea generar Excel detallado de un rango específico?',
                default: true
            },
            // Configuración del Rango de Visualización
            {
                type: 'number',
                name: 'diaInicio',
                message: '   > Día INICIO visualización (Ej: 1)',
                default: 1,
                when: (answers) => answers.verDetalle
            },
            {
                type: 'number',
                name: 'horaInicio',
                message: '   > Hora del reloj INICIO (en segundos, 0 a 14400):',
                default: 0,
                when: (answers) => answers.verDetalle
            },
            {
                type: 'number',
                name: 'diaFin',
                message: '   > Día FIN visualización (Ej: 2, para ver el salto de día)',
                default: 2,
                when: (answers) => answers.verDetalle
            },
            {
                type: 'number',
                name: 'horaFin',
                message: '   > Hora del reloj FIN (en segundos, ej: 1000):',
                default: 1000, // Unos 16 minutos del segundo día
                when: (answers) => answers.verDetalle
            }
        ]);

        console.log("\n🔄 Inicializando motor de simulación...");
        const inicio = Date.now();

        const simulador = new Simulacion();
        
        // Objeto filtro más flexible
        const filtro = config.verDetalle ? {
            diaDesde: config.diaInicio,
            segDesde: config.horaInicio,
            diaHasta: config.diaFin,
            segHasta: config.horaFin
        } : null;

        // Corremos la simulación
        const resultados = simulador.run(config.diasTotales, filtro);

        const fin = Date.now();
        console.log(`✅ Simulación finalizada en ${((fin - inicio) / 1000).toFixed(2)} segundos.`);
        console.log(`📊 Filas capturadas para Excel: ${resultados.length}`);
        
        if (resultados.length > 0) {
            console.log("💾 Generando Excel...");
            const nombreArchivo = generarExcel(resultados);
            console.log(`\n🚀 ¡LISTO! Archivo: ${nombreArchivo}`);
        } else {
            console.log("⚠️ No hay datos para exportar en ese rango.");
        }

    } catch (error) {
        console.error("\n❌ Error:", error);
    }
};

main();