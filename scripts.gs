/**
 * @file Manages inventory notifications and updates in Google Sheets.
 */

/**
 * Checks if the product is below the cut-off quantity for stock.
 * @param {Array} product - The product data array.
 * @return {boolean} - True if the product is below the cut-off quantity, otherwise false.
 */
function isBelowCutQuantity(product) {
  return product && product[4] > 0 && product[3] <= product[4];
}

/**
 * Checks if the product is marked for notification.
 * @param {Array} product - The product data array.
 * @return {boolean} - True if the product is marked for notification, otherwise false.
 */
function isCheckedForNotify(product) {
  return product[5];
}

/**
 * Processes the POST response by updating the stock quantity and evaluating conditions for notifications.
 * @param {string} id - The ID of the product to update.
 * @param {number} quantity - The quantity to be subtracted from the current stock.
 */
function processPostResponse(id, quantity) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(INVENTORY_SHEET_NAME);
  const dataValues = sheet.getRange(3, 1, sheet.getLastRow(), 6).getValues();
  const index = dataValues.findIndex((product) => product[0] === id);

  if (index === -1) {
    console.error(`Product with ID ${id} not found.`);
    return;
  }

  const rangeStock = sheet.getRange(index + 3, 4);
  const stockValue = rangeStock.getValue();

  // Set new stock value
  rangeStock.setValue(stockValue - quantity);

  const productValues = sheet.getRange(index + 3, 1, 1, 6).getValues()[0];

  evaluateAndSendEmail(productValues, rangeStock);
}

/**
 * Evaluates if the product meets the conditions to send an email notification.
 * @param {Array} productValues - The product data array.
 * @param {Range} rangeStock - The range of the stock cell.
 */
function evaluateAndSendEmail(productValues, rangeStock) {
  if (isCheckedForNotify(productValues) && isBelowCutQuantity(productValues)) {
    setRowColor(rangeStock);

    const htmlBody = HtmlService.createTemplateFromFile("email");
    htmlBody.id = productValues[1];
    htmlBody.name = productValues[2];
    htmlBody.stock = productValues[4];

    GmailApp.sendEmail(
      "efraindiazp1@gmail.com",
      `Low stock of ${productValues[1]}`,
      "",
      {
        htmlBody: htmlBody.evaluate().getContent(),
      }
    );
  }
}

/**
 * Sets the row color based on stock levels.
 * Triggered by the onEdit event.
 * @param {Range} range - The range of cells that were edited.
 */
function setRowColor(range) {
  const sheet = range.getSheet();
  const row = range.getRow();
  const column = range.getColumn();

  if (
    sheet.getName() === INVENTORY_SHEET_NAME &&
    row > 2 &&
    [4, 5].includes(column)
  ) {
    const quantity = sheet.getRange(row, 4).getValue();
    const quantityCut = sheet.getRange(row, 5).getValue();

    const backgroundColor = quantity <= quantityCut ? "red" : "white";
    sheet.getRange(row, 1, 1, 6).setBackground(backgroundColor);
  }
}

/**
 * Detects a checkbox click for notification and triggers an email alert if conditions are met.
 * Triggered by the onEdit event.
 * @param {Range} range - The range of cells that were edited.
 */
function detectAlertClick(range) {
  const sheet = range.getSheet();
  const row = range.getRow();
  const column = range.getColumn();

  if (
    sheet.getName() === INVENTORY_SHEET_NAME &&
    row > 2 &&
    column === 6 &&
    range.isChecked()
  ) {
    const id = sheet.getRange(row, 1).getValue();
    const name = sheet.getRange(row, 2).getValue();
    const stock = sheet.getRange(row, 4).getValue();
    const stockCut = sheet.getRange(row, 5).getValue();

    if (stock <= stockCut) {
      const htmlBody = HtmlService.createTemplateFromFile("email");
      htmlBody.id = id;
      htmlBody.name = name;
      htmlBody.stock = stock;

      GmailApp.sendEmail(
        "efraindiazp1@gmail.com",
        `Low quantity of ${name}`,
        "",
        {
          htmlBody: htmlBody.evaluate().getContent(),
        }
      );
    }
  }
}
