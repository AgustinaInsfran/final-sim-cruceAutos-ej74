import xl from 'excel4node';

export const generarExcel = (resultados) => {
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Simulación Transito');

    const estiloHeader = wb.createStyle({ font: { color: '#FFFFFF', bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#1F4E78' }, alignment: { horizontal: 'center' } });
    const estiloVerde = wb.createStyle({ font: { color: '#006100' }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#C6EFCE' } });
    const estiloRojo = wb.createStyle({ font: { color: '#9C0006' }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#FFC7CE' } });
    const estiloCentrado = wb.createStyle({ alignment: { horizontal: 'center' } });
    const estiloResumen = wb.createStyle({ font: { bold: true } });

    const encabezadosFijos = [
        "Día", "Reloj (Seg)", "Evento", 
        "RND Llegada U", "Tiempo Entre Llegadas U", "Prox Llegada U", 
        "RND Llegada C", "Tiempo Entre Llegadas C", "Prox Llegada C", 
        "Estado Semáforo", "Prox Fin Semáforo",
        "RND Cruce U", "Tiempo Cruce U", "Fin Cruce U (Servidores)",
        "RND Cruce C", "Tiempo Cruce C", "Fin Cruce C (Servidores)",
        "Cola Urquiza", "Cola Colón",
        "Autos Cruzaron U", "Autos Cruzaron C"
    ];

    // Detectar máximo de columnas dinámicas
    let maxAutosSimultaneos = 0;
    resultados.forEach(fila => {
        if (fila.vehiculosActivos && fila.vehiculosActivos.length > maxAutosSimultaneos) {
            maxAutosSimultaneos = fila.vehiculosActivos.length;
        }
    });

    console.log(`   > Máximos autos simultáneos en el rango visualizado: ${maxAutosSimultaneos}`);

    const todosEncabezados = [...encabezadosFijos];
    for (let i = 1; i <= maxAutosSimultaneos; i++) {
        todosEncabezados.push(`Auto ${i} ID`);
        todosEncabezados.push(`Auto ${i} Estado`);
    }

    todosEncabezados.forEach((texto, i) => {
        ws.cell(1, i + 1).string(texto).style(estiloHeader);
    });

    // Anchos
    ws.column(2).setWidth(12);
    ws.column(3).setWidth(25);

    resultados.forEach((fila, index) => {
        const row = index + 2; 

        if (typeof fila.dia === 'number') {
            // Datos fijos
            ws.cell(row, 1).number(fila.dia).style(estiloCentrado);
            ws.cell(row, 2).number(parseFloat(fila.reloj.toFixed(2))); 
            ws.cell(row, 3).string(fila.evento);

            if (fila.rndLlegadaUrquiza !== null) ws.cell(row, 4).number(parseFloat(fila.rndLlegadaUrquiza.toFixed(4)));
            if (fila.tiempoEntreLlegadasUrquiza !== null) ws.cell(row, 5).number(parseFloat(fila.tiempoEntreLlegadasUrquiza.toFixed(2)));
            if (fila.proxLlegadaUrquiza !== null) ws.cell(row, 6).number(parseFloat(fila.proxLlegadaUrquiza.toFixed(2)));

            if (fila.rndLlegadaColon !== null) ws.cell(row, 7).number(parseFloat(fila.rndLlegadaColon.toFixed(4)));
            if (fila.tiempoEntreLlegadasColon !== null) ws.cell(row, 8).number(parseFloat(fila.tiempoEntreLlegadasColon.toFixed(2)));
            if (fila.proxLlegadaColon !== null) ws.cell(row, 9).number(parseFloat(fila.proxLlegadaColon.toFixed(2)));

            if (fila.estadoSemaforo) {
                const textoSemaforo = String(fila.estadoSemaforo);
                const celdaSemaforo = ws.cell(row, 10).string(textoSemaforo).style(estiloCentrado);
                if (textoSemaforo.includes('VERDE')) celdaSemaforo.style(estiloVerde);
                else celdaSemaforo.style(estiloRojo);
            }
            if (fila.proxFinSemaforo !== null) ws.cell(row, 11).number(parseFloat(fila.proxFinSemaforo.toFixed(2)));

            if (fila.rndCruceUrquiza !== null) ws.cell(row, 12).number(parseFloat(fila.rndCruceUrquiza.toFixed(4)));
            if (fila.tiempoCruceUrquiza !== null) ws.cell(row, 13).number(parseFloat(fila.tiempoCruceUrquiza.toFixed(2)));
            const visualServidoresU = Array.isArray(fila.finCruceUrquiza) ? fila.finCruceUrquiza.join(" | ") : "";
            ws.cell(row, 14).string(visualServidoresU).style(estiloCentrado);

            if (fila.rndCruceColon !== null) ws.cell(row, 15).number(parseFloat(fila.rndCruceColon.toFixed(4)));
            if (fila.tiempoCruceColon !== null) ws.cell(row, 16).number(parseFloat(fila.tiempoCruceColon.toFixed(2)));
            const visualServidoresC = Array.isArray(fila.finCruceColon) ? fila.finCruceColon.join(" | ") : "";
            ws.cell(row, 17).string(visualServidoresC).style(estiloCentrado);

            ws.cell(row, 18).number(fila.colaUrquiza).style(estiloCentrado);
            ws.cell(row, 19).number(fila.colaColon).style(estiloCentrado);
            ws.cell(row, 20).number(fila.contadorAutosUrquiza).style(estiloCentrado);
            ws.cell(row, 21).number(fila.contadorAutosColon).style(estiloCentrado);

            // Datos Dinámicos
            if (fila.vehiculosActivos && Array.isArray(fila.vehiculosActivos)) {
                fila.vehiculosActivos.forEach((auto, idx) => {
                    const colId = 21 + (idx * 2) + 1;
                    const colEstado = 21 + (idx * 2) + 2;

                    ws.cell(row, colId).number(auto.id).style(estiloCentrado);
                    ws.cell(row, colEstado).string(auto.estado).style(estiloCentrado);
                });
            }
        } else {
            // Resumen
            if (fila.evento) ws.cell(row, 3).string(fila.evento).style(estiloResumen);
            if (fila.resumenTexto) ws.cell(row, 22).string(fila.resumenTexto).style(estiloHeader);
        }
    });

    const nombreArchivo = `Resultados_Simulacion_${Date.now()}.xlsx`;
    wb.write(nombreArchivo);
    return nombreArchivo;
};