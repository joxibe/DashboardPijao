/**
 * Google Apps Script - API REST de solo lectura para Gestión de Pendientes
 * 
 * Permite exponer los datos de una hoja de cálculo de Google Sheets como un 
 * servicio JSON público para ser consumido por un frontend en GitHub Pages.
 */

/**
 * Función principal para responder a solicitudes GET.
 * Retorna todos los registros de la hoja en formato JSON.
 */
function doGet(e) {
  try {
    const data = getAllPendientes();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lee los datos de la hoja de cálculo activa, normaliza los encabezados 
 * dinámicamente y mapea cada fila a un objeto JSON.
 */
function getAllPendientes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) {
    return {
      headers: [],
      data: []
    };
  }
  
  // Extraer la primera fila como encabezados originales
  const rawHeaders = values[0];
  
  // Normalizar los encabezados (minúscula, sin acentos, sin espacios ni caracteres especiales)
  const headers = rawHeaders.map(function(header) {
    return String(header)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos/tildes
      .replace(/[^a-z0-9]/g, "");      // Eliminar espacios y caracteres no alfanuméricos
  });

  const headersInfo = rawHeaders.map(function(header, index) {
    const key = headers[index];
    const lowerHeader = String(header).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let type = "text";
    
    if (key === "id") {
      type = "id";
    } else if (key === "titulo" || key === "title") {
      type = "title";
    } else if (key === "estado" || key === "status") {
      type = "badge_estado";
    } else if (key === "prioridad" || key === "priority") {
      type = "badge_prioridad";
    } else if (key === "valor" || key === "presupuesto" || key === "costo" || key === "precio" || key === "monto") {
      type = "currency";
    } else if (lowerHeader.includes("fecha") || lowerHeader.includes("date")) {
      type = "date";
    } else if (key === "descripcion" || key === "description" || key === "observaciones" || key === "notas" || key === "comentarios") {
      type = "longtext";
    }
    
    return {
      key: key,
      label: header,
      type: type
    };
  });
  
  const pendientes = [];
  
  // Recorrer las filas restantes y mapear a objetos usando los encabezados normalizados
  for (var i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    let hasData = false;
    
    for (var j = 0; j < headers.length; j++) {
      let val = row[j];
      
      // Si el valor es una fecha de Google Sheets (Date objeto), formatearla a texto yyyy-MM-dd
      if (val instanceof Date && !isNaN(val.getTime())) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      item[headers[j]] = val;
      if (val !== "" && val !== null && val !== undefined) {
        hasData = true; // Verificar si la fila no está completamente vacía
      }
    }
    
    if (hasData) {
      pendientes.push(item);
    }
  }
  
  return {
    headers: headersInfo,
    data: pendientes
  };
}
