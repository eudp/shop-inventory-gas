/**
 * @file Manages inventory notifications and updates in Google Sheets.
 */

/**
 * Checks if the product is below the cut-off quantity for stock.
 * @param {Array} product - The product data array.
 * @return {boolean} - True if the product is below the cut-off stock, otherwise false.
 */
function isBelowStockCut(product) {
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

  const stockRange = sheet.getRange(index + 3, 4);
  const stockValue = stockRange.getValue();

  // Set new stock value
  stockRange.setValue(stockValue - quantity);

  setRowColor(stockRange);
}

/**
 * Send an email notification.
 * @param {Array} productValues - The product data array.
 */
function sendEmail(productValues) {
  const htmlBody = HtmlService.createTemplateFromFile("email");
  htmlBody.id = productValues[0];
  htmlBody.name = productValues[1];
  htmlBody.stock = productValues[3];

  GmailApp.sendEmail(
    "efraindiazp1@gmail.com",
    `Low stock of ${productValues[1]}`,
    "",
    {
      htmlBody: htmlBody.evaluate().getContent(),
    }
  );
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
    const stock = sheet.getRange(row, 4).getValue();
    const stockCut = sheet.getRange(row, 5).getValue();

    const backgroundColor = stock <= stockCut ? "red" : "white";
    sheet.getRange(row, 1, 1, 7).setBackground(backgroundColor);
  }
}

/**
 * Sends notification emails for products that meet certain criteria.
 * Triggered by a time-driven event.
 */
function sendNotificationsEmails() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(INVENTORY_SHEET_NAME);
  if (!sheet) {
    console.error(`Sheet with name ${INVENTORY_SHEET_NAME} not found.`);
    return;
  }
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(3, 1, lastRow - 3, 7).getValues();
  values.forEach((productValues, index) => {
    if (validateSendEmail(productValues) && !productValues[6]) {
      sendEmail(productValues);
      sheet.getRange(index + 3, 7).setValue("✅"); // Mark email as sent
    }
  });
}

/**
 * Validates whether an email should be sent for a specific product.
 *
 * @param {Array} productValues - Array containing the product data.
 * @returns {boolean} - Returns true if the product should trigger an email notification.
 */
function validateSendEmail(productValues) {
  return isCheckedForNotify(productValues) && isBelowStockCut(productValues);
}

/**
 * Detects a checkbox click for clearing notification sent value.
 * Triggered by the onEdit event.
 * @param {Range} range - The range of cells that were edited.
 */
function detectAlertClick(range) {
  const sheet = range.getSheet();
  const row = range.getRow();
  const column = range.getColumn();

  if (sheet.getName() === INVENTORY_SHEET_NAME && row > 2 && column === 6) {
    sheet.getRange(row, 7).setValue("");
  }
}
