import xl from 'excel4node';

export const generarExcel = (resultados) => {
    // 1. Crear el Libro y la Hoja
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Simulación Transito');

    // 2. Definir Estilos
    const estiloHeader = wb.createStyle({
        font: { color: '#FFFFFF', bold: true },
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#1F4E78' }, // Azul oscuro
        alignment: { horizontal: 'center' }
    });

    const estiloVerde = wb.createStyle({
        font: { color: '#006100' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#C6EFCE' }
    });

    const estiloRojo = wb.createStyle({
        font: { color: '#9C0006' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#FFC7CE' }
    });

    const estiloCentrado = wb.createStyle({ alignment: { horizontal: 'center' } });

    // 3. Definir las Columnas (Encabezados)
    const encabezados = [
        "Día", "Reloj (Seg)", "Evento", 
        // Grupo Urquiza Llegadas
        "RND Llegada U", "Tiempo Entre Llegadas U", "Prox Llegada U", 
        // Grupo Colón Llegadas
        "RND Llegada C", "Tiempo Entre Llegadas C", "Prox Llegada C", 
        // Semáforos
        "Estado Semáforo", "Prox Fin Semáforo",
        // Cruce Urquiza
        "RND Cruce U", "Tiempo Cruce U", "Fin Cruce U (Servidores)",
        // Cruce Colón
        "RND Cruce C", "Tiempo Cruce C", "Fin Cruce C (Servidores)",
        // Colas y Contadores
        "Cola Urquiza", "Cola Colón",
        "Autos Cruzaron U", "Autos Cruzaron C"
    ];

    // Escribir encabezados en fila 1
    encabezados.forEach((texto, i) => {
        ws.cell(1, i + 1).string(texto).style(estiloHeader);
    });

    // Anchos de columna sugeridos para que se vea bien
    ws.column(2).setWidth(12); // Reloj
    ws.column(3).setWidth(25); // Evento
    ws.column(10).setWidth(20); // Estado Semáforo
    ws.column(14).setWidth(25); // Servidores U
    ws.column(17).setWidth(25); // Servidores C

    // 4. Llenar los datos (Fila a fila)
    resultados.forEach((fila, index) => {
        const row = index + 2; // Empezamos en la fila 2

        // Datos Básicos
        ws.cell(row, 1).number(fila.dia).style(estiloCentrado);
        ws.cell(row, 2).number(parseFloat(fila.reloj.toFixed(2))); 
        ws.cell(row, 3).string(fila.evento);

        // --- URQUIZA LLEGADAS ---
        if (fila.rndLlegadaUrquiza !== null) {
            ws.cell(row, 4).number(parseFloat(fila.rndLlegadaUrquiza.toFixed(4)));
        }
        if (fila.tiempoEntreLlegadasUrquiza !== null) {
            ws.cell(row, 5).number(parseFloat(fila.tiempoEntreLlegadasUrquiza.toFixed(2)));
        }
        ws.cell(row, 6).number(parseFloat(fila.proxLlegadaUrquiza.toFixed(2)));

        // --- COLÓN LLEGADAS ---
        if (fila.rndLlegadaColon !== null) {
            ws.cell(row, 7).number(parseFloat(fila.rndLlegadaColon.toFixed(4)));
        }
        if (fila.tiempoEntreLlegadasColon !== null) {
            ws.cell(row, 8).number(parseFloat(fila.tiempoEntreLlegadasColon.toFixed(2)));
        }
        ws.cell(row, 9).number(parseFloat(fila.proxLlegadaColon.toFixed(2)));

        // --- SEMÁFORO ---
        const celdaSemaforo = ws.cell(row, 10).string(fila.estadoSemaforo).style(estiloCentrado);
        // Formato condicional simple
        if (fila.estadoSemaforo.includes('VERDE')) celdaSemaforo.style(estiloVerde);
        else celdaSemaforo.style(estiloRojo);

        ws.cell(row, 11).number(parseFloat(fila.proxFinSemaforo.toFixed(2)));

        // --- CRUCE URQUIZA ---
        if (fila.rndCruceUrquiza !== null) {
            ws.cell(row, 12).number(parseFloat(fila.rndCruceUrquiza.toFixed(4)));
        }
        if (fila.tiempoCruceUrquiza !== null) {
            ws.cell(row, 13).number(parseFloat(fila.tiempoCruceUrquiza.toFixed(2)));
        }
        // Unimos el array de servidores visualmente: "Auto 1 | - | Auto 3"
        const visualServidoresU = Array.isArray(fila.finCruceUrquiza) ? fila.finCruceUrquiza.join(" | ") : "";
        ws.cell(row, 14).string(visualServidoresU).style(estiloCentrado);

        // --- CRUCE COLÓN ---
        if (fila.rndCruceColon !== null) {
            ws.cell(row, 15).number(parseFloat(fila.rndCruceColon.toFixed(4)));
        }
        if (fila.tiempoCruceColon !== null) {
            ws.cell(row, 16).number(parseFloat(fila.tiempoCruceColon.toFixed(2)));
        }
        const visualServidoresC = Array.isArray(fila.finCruceColon) ? fila.finCruceColon.join(" | ") : "";
        ws.cell(row, 17).string(visualServidoresC).style(estiloCentrado);

        // --- COLAS Y CONTADORES ---
        ws.cell(row, 18).number(fila.colaUrquiza).style(estiloCentrado);
        ws.cell(row, 19).number(fila.colaColon).style(estiloCentrado);
        ws.cell(row, 20).number(fila.contadorAutosUrquiza).style(estiloCentrado);
        ws.cell(row, 21).number(fila.contadorAutosColon).style(estiloCentrado);
    });

    // 5. Guardar archivo
    const nombreArchivo = `Resultados_Simulacion_${Date.now()}.xlsx`;
    wb.write(nombreArchivo);
    
    console.log(`\n✅ ¡Éxito! Archivo generado: ${nombreArchivo}`);
    return nombreArchivo;
};