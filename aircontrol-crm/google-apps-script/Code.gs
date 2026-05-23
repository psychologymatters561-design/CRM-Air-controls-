// ─── Air Control CRM — Google Apps Script Backend ────────────────────────────
//
// SETUP (one-time, ~3 minutes):
//   1. Open script.google.com  →  New project
//   2. Paste this entire file, save (Ctrl+S)
//   3. Click Deploy  →  New deployment
//      • Type: Web app
//      • Execute as: Me
//      • Who has access: Anyone
//   4. Click Deploy  →  copy the URL that ends in /exec
//   5. Paste that URL into the CRM Settings drawer  →  Google Sheets Sync
//
// The script creates a "Prospects" sheet automatically on first use.
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = "Prospects";

const FIELDS = [
  "id", "name", "company", "segment", "location",
  "email", "phone", "dm", "acs", "estValue",
  "priority", "status", "lastContact", "nextFollowup",
  "notes", "sentEmail", "sentWA",
  "msgEmail", "msgWA"
];

// ── Entry points ──────────────────────────────────────────────────────────────

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "get";
  if (action === "get") return respond({ ok: true, prospects: loadProspects() });
  return respond({ ok: false, error: "Unknown GET action: " + action });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === "save") {
      saveProspects(body.prospects || []);
      return respond({ ok: true, saved: (body.prospects || []).length });
    }
    return respond({ ok: false, error: "Unknown POST action: " + body.action });
  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

// ── Sheet helpers ─────────────────────────────────────────────────────────────

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const header = sheet.getRange(1, 1, 1, FIELDS.length);
    header.setValues([FIELDS]);
    header.setFontWeight("bold");
    header.setBackground("#0f172a");
    header.setFontColor("#38bdf8");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 60);   // id
    sheet.setColumnWidth(2, 180);  // name
    sheet.setColumnWidth(3, 180);  // company
    sheet.setColumnWidth(5, 200);  // location
    sheet.setColumnWidth(18, 400); // msgEmail
    sheet.setColumnWidth(19, 300); // msgWA
  }
  return sheet;
}

function loadProspects() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      var val = row[i];
      if (h === "sentEmail" || h === "sentWA") {
        obj[h] = (val === true || val === "true" || val === "TRUE");
      } else if (h === "acs" || h === "estValue" || h === "id") {
        obj[h] = Number(val) || 0;
      } else {
        obj[h] = (val === null || val === undefined) ? "" : String(val);
      }
    });
    return obj;
  });
}

function saveProspects(prospects) {
  const sheet = getSheet();

  // Clear data rows, keep header
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, FIELDS.length).clearContent();
  }

  if (!prospects || prospects.length === 0) return;

  const rows = prospects.map(function(p) {
    return FIELDS.map(function(f) {
      var v = p[f];
      return (v === null || v === undefined) ? "" : v;
    });
  });

  sheet.getRange(2, 1, rows.length, FIELDS.length).setValues(rows);

  // Colour-code priority column (column 10 = estValue, col 11 = priority)
  var prioCol = FIELDS.indexOf("priority") + 1;
  var statusCol = FIELDS.indexOf("status") + 1;
  rows.forEach(function(row, i) {
    var r = i + 2;
    var prio = row[FIELDS.indexOf("priority")];
    var bg = prio === "hot" ? "#3d1010" : prio === "warm" ? "#3d2e10" : "#0f1e10";
    sheet.getRange(r, 1, 1, FIELDS.length).setBackground(bg);
  });
}

// ── Response helper ───────────────────────────────────────────────────────────

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
