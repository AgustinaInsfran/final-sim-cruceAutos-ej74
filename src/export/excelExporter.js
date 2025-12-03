import xl from 'excel4node';

export const generarExcel = (resultados) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Simulación Transito');

    // --- ESTILOS ---
    const stHeader = wb.createStyle({ font: { color: '#FFFFFF', bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#1F4E78' }, alignment: { horizontal: 'center' } });
    const stVerde = wb.createStyle({ font: { color: '#006100' }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#C6EFCE' }, alignment: { horizontal: 'center' } });
    const stRojo = wb.createStyle({ font: { color: '#9C0006' }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#FFC7CE' }, alignment: { horizontal: 'center' } });
    const stCenter = wb.createStyle({ alignment: { horizontal: 'center' } });
    const stBold = wb.createStyle({ font: { bold: true } });
    
    // Estilo para el "próximo evento" (Texto Rojo)
    const stNextEvent = wb.createStyle({ font: { color: '#FF0000', bold: true }, alignment: { horizontal: 'center' } });

    // Estilo para la fila final de RESULTADOS (Borde y Fondo Amarillo)
    const stResultadoFinal = wb.createStyle({
        font: { bold: true },
        fill: { type: 'pattern', patternType: 'solid', fgColor: '#FFFF00' }, // Amarillo
        border: {
            left: { style: 'medium', color: '#000000' },
            right: { style: 'medium', color: '#000000' },
            top: { style: 'medium', color: '#000000' },
            bottom: { style: 'medium', color: '#000000' },
        },
        alignment: { horizontal: 'center' }
    });

    // --- ENCABEZADOS REORDENADOS ---
    // Grupos: General | Llegadas | Calle Urquiza | Calle Colón | Stats
    const headers = [
        // 1-3
        "Día", "Reloj", "Evento", 
        // 4-6 (Llegadas U)
        "RND Llegada U", "Tiempo Entre U", "Prox Llegada U", 
        // 7-9 (Llegadas C)
        "RND Llegada C", "Tiempo Entre C", "Prox Llegada C", 
        // 10 (Semáforo Fin - Común)
        "Prox Fin Semáforo",
        // GRUPO URQUIZA (11-14)
        "Estado Sem U", "Cola U", "RND Cruce U", "Tiempo Cruce U", "Servidores U",
        // GRUPO COLÓN (15-18)
        "Estado Sem C", "Cola C", "RND Cruce C", "Tiempo Cruce C", "Servidores C",
        // STATS (19-20)
        "Acum. Tiempo", "Cant. Autos"
    ];

    // Detectar máximo de columnas dinámicas
    let maxAutos = 0;
    resultados.forEach(f => { if (f.vehiculosActivos && f.vehiculosActivos.length > maxAutos) maxAutos = f.vehiculosActivos.length; });

    const allHeaders = [...headers];
    for (let i = 1; i <= maxAutos; i++) {
        allHeaders.push(`Auto ${i}`);
        allHeaders.push(`Estado ${i}`);
    }

    // Escribir headers
    allHeaders.forEach((txt, i) => ws.cell(1, i + 1).string(txt).style(stHeader));

    // Anchos optimizados
    ws.column(2).setWidth(12);
    ws.column(3).setWidth(25);
    ws.column(15).setWidth(30); // Servidores U
    ws.column(20).setWidth(30); // Servidores C

    // --- LLENAR DATOS ---
    resultados.forEach((fila, index) => {
        const r = index + 2; 
        const isStatsRow = fila.evento && fila.evento.includes("ESTADÍSTICAS");
        const rowStyle = isStatsRow ? stResultadoFinal : stCenter;

        if (typeof fila.dia === 'number' || isStatsRow) {
            
            // Función helper para aplicar estilo rojo si es el evento ganador
            const cell = (c, val, eventNameToCheck) => {
                const cellRef = ws.cell(r, c);
                // Si es número
                if (typeof val === 'number') cellRef.number(parseFloat(val.toFixed(2)));
                else cellRef.string(val || "-");

                // Prioridad de estilo: Resultado Final > Rojo Evento > Normal
                if (isStatsRow) {
                    cellRef.style(stResultadoFinal);
                } else if (eventNameToCheck && fila.siguienteEventoNombre === eventNameToCheck) {
                    cellRef.style(stNextEvent);
                } else {
                    cellRef.style(stCenter);
                }
                return cellRef;
            };

            // 1-3 Basicos
            cell(1, fila.dia);
            cell(2, fila.reloj);
            ws.cell(r, 3).string(fila.evento).style(isStatsRow ? stResultadoFinal : stCenter);

            // 4-6 Llegadas Urquiza
            cell(4, fila.rndLlegadaUrquiza);
            cell(5, fila.tiempoEntreLlegadasUrquiza);
            cell(6, fila.proxLlegadaUrquiza, 'LLEGADA_URQUIZA'); // Check Red

            // 7-9 Llegadas Colón
            cell(7, fila.rndLlegadaColon);
            cell(8, fila.tiempoEntreLlegadasColon);
            cell(9, fila.proxLlegadaColon, 'LLEGADA_COLON'); // Check Red

            // 10 Fin Semáforo
            cell(10, fila.proxFinSemaforo, 'FIN_SEMAFORO'); // Check Red

            // Lógica Semáforos Separados
            let estadoU = "-", estadoC = "-";
            if (fila.estadoSemaforo) {
                const est = String(fila.estadoSemaforo);
                if (est.includes("URQUIZA")) {
                    estadoU = est.replace("_URQUIZA", ""); // VERDE
                    estadoC = "ROJO";
                } else if (est.includes("COLON")) { // (Si tuvieras lógica explícita para colón)
                    estadoC = est.replace("_COLON", "");
                    estadoU = "ROJO";
                }
            }

            // 11-15 GRUPO URQUIZA
            const celdaSemU = ws.cell(r, 11).string(estadoU);
            if (isStatsRow) celdaSemU.style(stResultadoFinal);
            else if (estadoU === "VERDE") celdaSemU.style(stVerde);
            else celdaSemU.style(stRojo);

            cell(12, fila.colaUrquiza);
            cell(13, fila.rndCruceUrquiza);
            cell(14, fila.tiempoCruceUrquiza);
            
            // Servidores U: Array a String visual
            const servU = Array.isArray(fila.finCruceUrquiza) ? fila.finCruceUrquiza.join(" | ") : "-";
            // Check Red COMPLEX: Fin Cruce puede ser cualquiera de los servidores
            // Si el evento ganador es "FIN_CRUCE_URQUIZA_0", pintamos toda la celda de servidores (limitación simple)
            // O idealmente pintaríamos solo el texto, pero excel4node es celda por celda.
            // Pintaremos la celda si ALGUNO de los servidores dispara el evento.
            const isFinU = fila.siguienteEventoNombre && fila.siguienteEventoNombre.startsWith('FIN_CRUCE_URQUIZA');
            const cellServU = ws.cell(r, 15).string(servU);
            if(isStatsRow) cellServU.style(stResultadoFinal);
            else if(isFinU) cellServU.style(stNextEvent);
            else cellServU.style(stCenter);


            // 16-20 GRUPO COLON
            const celdaSemC = ws.cell(r, 16).string(estadoC);
            if (isStatsRow) celdaSemC.style(stResultadoFinal);
            else if (estadoC === "VERDE") celdaSemC.style(stVerde);
            else celdaSemC.style(stRojo);

            cell(17, fila.colaColon);
            cell(18, fila.rndCruceColon);
            cell(19, fila.tiempoCruceColon);

            const servC = Array.isArray(fila.finCruceColon) ? fila.finCruceColon.join(" | ") : "-";
            const isFinC = fila.siguienteEventoNombre && fila.siguienteEventoNombre.startsWith('FIN_CRUCE_COLON');
            const cellServC = ws.cell(r, 20).string(servC);
            if(isStatsRow) cellServC.style(stResultadoFinal);
            else if(isFinC) cellServC.style(stNextEvent);
            else cellServC.style(stCenter);

            // 21-22 STATS
            cell(21, fila.acumuladorTiempoTotal);
            cell(22, fila.cantidadAutosTotal);

            // DINAMICOS
            if (fila.vehiculosActivos && Array.isArray(fila.vehiculosActivos)) {
                fila.vehiculosActivos.forEach((auto, idx) => {
                    const colId = 23 + (idx * 2);
                    const colEst = 23 + (idx * 2) + 1;
                    
                    ws.cell(r, colId).number(auto.id).style(isStatsRow ? stResultadoFinal : stCenter);
                    ws.cell(r, colEst).string(auto.estado).style(isStatsRow ? stResultadoFinal : stCenter);
                });
            }

            if (fila.resumenTexto) {
                // Si es la fila de resumen, ponemos el texto en la primera columna libre
                ws.cell(r, 23).string(fila.resumenTexto).style(stResultadoFinal);
            }
        }
    });

    const nombreArchivo = `Resultados_Simulacion_${Date.now()}.xlsx`;
    wb.write(nombreArchivo);
    return nombreArchivo;
};