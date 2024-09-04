/**
 * @file Manages inventory notifications and updates in Google Sheets.
 */

const SHEET_ID = "1Z8hHlW4X9ea_-lDscja07jcINn7cToxFazvDixZCKvs";
const INVENTORY_SHEET_NAME = "Inventory";

/**
 * Handles GET requests and returns inventory data in JSON format.
 * @param {Object} e - Event object from the GET request.
 * @return {TextOutput} - JSON-formatted inventory data.
 */
function doGet(e) {
  const inventorySheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(INVENTORY_SHEET_NAME);
  const data = inventorySheet.getDataRange().getValues();

  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Handles POST requests to update inventory data.
 * @param {Object} request - Request object containing POST data.
 * @return {HtmlOutput} - Response message after processing the POST request.
 */
function doPost(request) {
  const { parameter, postData: { contents, type } = {} } = request;
  let jsonData = null;

  if (type === "application/json" && contents) {
    jsonData = JSON.parse(contents);
    processPostResponse(jsonData.id, jsonData.stock);
  }

  return HtmlService.createHtmlOutput(
    `Log: ${jsonData ? JSON.stringify(jsonData) : "No data received"}`
  );
}

/**
 * Adds a custom menu to the Google Sheets UI.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Custom Actions")
    .addItem("Setup", "getShopInventory")
    .addToUi();
}

/**
 * Handles edit events in the spreadsheet.
 * @param {Object} e - Event object from the edit action.
 */
function onEdit(e) {
  const range = e.range;
  setRowColor(range);
  detectAlertClick(range);
}
