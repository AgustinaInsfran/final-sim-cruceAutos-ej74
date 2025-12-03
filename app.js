import inquirer from 'inquirer';
import { generarExcel } from './src/export/excelExporter.js';
import Simulacion from './src/core/simulacion.js';

const main = async () => {
    try {
        console.clear();
        console.log("==================================================");
        console.log("🚦  TP SIMULACIÓN: CRUCE CHUMBICHA (OPTIMIZADO) 🚦");
        console.log("==================================================\n");

        const config = await inquirer.prompt([
            {
                type: 'number',
                name: 'dias',
                message: '1. ¿Cuántos días desea simular para la ESTADÍSTICA? (Ej: 50)',
                default: 50,
            },
            {
                type: 'confirm',
                name: 'verDetalle',
                message: '2. ¿Desea generar el Excel detallado de un rango específico?',
                default: true
            },
            {
                type: 'number',
                name: 'diaDetalle',
                message: '   > ¿De qué día quiere ver el detalle? (Ej: 1)',
                default: 1,
                when: (answers) => answers.verDetalle
            },
            {
                type: 'number',
                name: 'minutoInicio',
                message: '   > ¿Desde qué minuto ver? (0 a 240)',
                default: 0,
                when: (answers) => answers.verDetalle
            },
            {
                type: 'number',
                name: 'minutoFin',
                message: '   > ¿Hasta qué minuto ver? (Ej: 10)',
                default: 10,
                when: (answers) => answers.verDetalle
            }
        ]);

        console.log("\n🔄 Inicializando motor de simulación...");
        const inicio = Date.now();

        const simulador = new Simulacion();
        
        // Creamos el objeto filtro
        const filtro = config.verDetalle ? {
            dia: config.diaDetalle,
            desdeSeg: config.minutoInicio * 60,
            hastaSeg: config.minutoFin * 60
        } : null;

        const resultados = simulador.run(config.dias, filtro);

        const fin = Date.now();
        console.log(`✅ Simulación finalizada en ${((fin - inicio) / 1000).toFixed(2)} segundos.`);
        console.log(`📊 Filas a exportar: ${resultados.length}`);
        
        if (resultados.length > 0) {
            console.log("💾 Generando Excel...");
            const nombreArchivo = generarExcel(resultados);
            console.log(`\n🚀 ¡LISTO! Archivo: ${nombreArchivo}`);
        } else {
            console.log("⚠️ No hay datos para exportar.");
        }

    } catch (error) {
        console.error("\n❌ Error:", error);
    }
};

main();