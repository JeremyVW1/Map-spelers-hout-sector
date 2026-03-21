var SHEET_FAV = "Blad1";
var SHEET_TOP = "Top25";
var SHEET_TWIJFEL = "Twijfel";
var SHEET_RED = "NietInteressant";

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function ensureSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.appendRow(headers);
    s.setFrozenRows(1);
    s.getRange("1:1").setFontWeight("bold");
  }
  return s;
}

function ensureTop25() {
  return ensureSheet(SHEET_TOP, ["Rang", "Naam", "Activiteit", "Brutomarge", "Est. EBITDA", "FTE", "Opgericht", "Adres", "BTW", "Website", "Grootte", "Digitaal", "Beoordeling", "Notes Jeremy", "Notes Vincent"]);
}

function ensureTwijfel() {
  return ensureSheet(SHEET_TWIJFEL, ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Rijtijd H", "Rijtijd D", "Notes Jeremy", "Notes Vincent"]);
}

function ensureRed() {
  return ensureSheet(SHEET_RED, ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Rijtijd H", "Rijtijd D", "Notes Jeremy", "Notes Vincent"]);
}

function findRow(sheet, col, value) {
  if (!value) return -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][col]).trim() === String(value).trim()) return i + 1;
  }
  return -1;
}

function sheetToJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j] !== undefined ? data[i][j] : "";
    }
    result.push(row);
  }
  return result;
}

function doGet(e) {
  var tab = "favorieten";
  if (e && e.parameter && e.parameter.tab) {
    tab = e.parameter.tab;
  }
  var sheetName = SHEET_FAV;
  if (tab === "top25") sheetName = SHEET_TOP;
  else if (tab === "twijfel") { ensureTwijfel(); sheetName = SHEET_TWIJFEL; }
  else if (tab === "nietinteressant") { ensureRed(); sheetName = SHEET_RED; }

  var sheet = getSheet(sheetName);
  var result = sheet ? sheetToJson(sheet) : [];
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var p;
  try {
    p = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({status: "error", message: "Invalid JSON"});
  }

  var action = p.action || "add";
  var naam = p.naam || "";

  // === FAVORIETEN (Blad1) ===
  if (action === "remove") {
    var s = getSheet(SHEET_FAV);
    if (!s) return reply({status: "error", message: "Sheet niet gevonden"});
    var r = findRow(s, 0, naam);
    if (r > 0) s.deleteRow(r);
    return reply({status: "ok", action: "removed"});
  }

  if (action === "update_note") {
    var s = getSheet(SHEET_FAV);
    if (!s) return reply({status: "error", message: "Sheet niet gevonden"});
    var r = findRow(s, 0, naam);
    if (r > 0) {
      s.getRange(r, 10).setValue(p.notes || "");
      s.getRange(r, 11).setValue(p.notes_vincent || "");
    }
    return reply({status: "ok", action: "note_updated"});
  }

  if (action === "add") {
    var s = getSheet(SHEET_FAV);
    if (!s) return reply({status: "error", message: "Sheet niet gevonden"});
    var existing = findRow(s, 0, naam);
    var rowData = [naam, p.regio || "", p.activiteiten || "", p.grootte || "", p.adres || "", p.btw || "", p.website || "", p.rijtijd_hertsberge || "", p.rijtijd_drongen || "", p.notes || "", p.notes_vincent || ""];
    if (existing > 0) {
      s.getRange(existing, 1, 1, rowData.length).setValues([rowData]);
    } else {
      s.appendRow(rowData);
    }
    return reply({status: "ok", action: "added"});
  }

  // === TOP 25 ===
  if (action === "sync_top25") {
    var s = ensureTop25();
    var items = p.items || [];
    if (s.getLastRow() > 1) {
      s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
    }
    for (var i = 0; i < items.length; i++) {
      var c = items[i];
      s.appendRow([c.rang, c.naam, c.activiteit, c.brutomarge || "", c.est_ebitda || "", c.fte || "", c.opgericht || "", c.adres || "", c.btw || "", c.website || "", c.grootte || "", c.digitaal || "", c.notitie || "", c.notes_jeremy || "", c.notes_vincent || ""]);
    }
    return reply({status: "ok", action: "top25_synced", count: items.length});
  }

  if (action === "update_top25_note") {
    var s = getSheet(SHEET_TOP);
    if (s) {
      var r = findRow(s, 1, p.naam);
      if (r > 0) {
        if (p.notes_jeremy !== undefined) s.getRange(r, 14).setValue(p.notes_jeremy);
        if (p.notes_vincent !== undefined) s.getRange(r, 15).setValue(p.notes_vincent);
      }
    }
    return reply({status: "ok", action: "top25_note_updated"});
  }

  // === TWIJFEL (oranje) ===
  if (action === "add_twijfel") {
    var s = ensureTwijfel();
    var existing = findRow(s, 0, naam);
    var rowData = [naam, p.regio || "", p.activiteiten || "", p.grootte || "", p.adres || "", p.btw || "", p.website || "", p.rijtijd_hertsberge || "", p.rijtijd_drongen || "", p.notes_jeremy || "", p.notes_vincent || ""];
    if (existing > 0) {
      s.getRange(existing, 1, 1, rowData.length).setValues([rowData]);
    } else {
      s.appendRow(rowData);
    }
    // Verwijder uit NietInteressant als het daar stond
    var sr = getSheet(SHEET_RED);
    if (sr) { var rr = findRow(sr, 0, naam); if (rr > 0) sr.deleteRow(rr); }
    return reply({status: "ok", action: "twijfel_added"});
  }

  if (action === "remove_twijfel") {
    var s = getSheet(SHEET_TWIJFEL);
    if (s) { var r = findRow(s, 0, naam); if (r > 0) s.deleteRow(r); }
    return reply({status: "ok", action: "twijfel_removed"});
  }

  if (action === "update_twijfel_note") {
    var s = getSheet(SHEET_TWIJFEL);
    if (s) {
      var r = findRow(s, 0, naam);
      if (r > 0) {
        s.getRange(r, 10).setValue(p.notes_jeremy || "");
        s.getRange(r, 11).setValue(p.notes_vincent || "");
      }
    }
    return reply({status: "ok", action: "twijfel_note_updated"});
  }

  // === NIET INTERESSANT (rood) ===
  if (action === "add_red") {
    var s = ensureRed();
    var existing = findRow(s, 0, naam);
    var rowData = [naam, p.regio || "", p.activiteiten || "", p.grootte || "", p.adres || "", p.btw || "", p.website || "", p.rijtijd_hertsberge || "", p.rijtijd_drongen || "", p.notes_jeremy || "", p.notes_vincent || ""];
    if (existing > 0) {
      s.getRange(existing, 1, 1, rowData.length).setValues([rowData]);
    } else {
      s.appendRow(rowData);
    }
    // Verwijder uit Twijfel als het daar stond
    var st = getSheet(SHEET_TWIJFEL);
    if (st) { var rt = findRow(st, 0, naam); if (rt > 0) st.deleteRow(rt); }
    return reply({status: "ok", action: "red_added"});
  }

  if (action === "remove_red") {
    var s = getSheet(SHEET_RED);
    if (s) { var r = findRow(s, 0, naam); if (r > 0) s.deleteRow(r); }
    return reply({status: "ok", action: "red_removed"});
  }

  if (action === "update_red_note") {
    var s = getSheet(SHEET_RED);
    if (s) {
      var r = findRow(s, 0, naam);
      if (r > 0) {
        s.getRange(r, 10).setValue(p.notes_jeremy || "");
        s.getRange(r, 11).setValue(p.notes_vincent || "");
      }
    }
    return reply({status: "ok", action: "red_note_updated"});
  }

  return reply({status: "error", message: "Unknown action"});
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
