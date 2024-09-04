/**
 * @file Retrieves and populates inventory data from an external API into a Google Sheet.
 */

const API_URL = "https://dummyjson.com/products";
const START_ROW = 3;
const START_COLUMN = 1;
const DATA_COLUMNS = 5;

/**
 * Retrieves inventory data from the API and populates it into the Google Sheet.
 */
function getShopInventory() {
  const inventorySheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INVENTORY_SHEET_NAME);

  if (!inventorySheet) {
    console.error(`Sheet with name ${INVENTORY_SHEET_NAME} not found.`);
    return;
  }

  // Fetch the inventory data from the API
  let data;
  try {
    const response = UrlFetchApp.fetch(API_URL);
    const json = JSON.parse(response.getContentText());

    // Log the data (optional)
    console.log(json);

    // Populate data
    data = json.products.map((product) => [
      product.id,
      product.title,
      product.sku,
      product.stock,
      "", // Assuming this is for some additional data like notification flag
    ]);
  } catch (error) {
    console.error("Failed to fetch or parse API data:", error);
    SpreadsheetApp.getActive().toast("Failed to retrieve inventory data.");
    return;
  }

  if (data.length === 0) {
    SpreadsheetApp.getActive().toast("There are no products to initialize.");
    return;
  }

  // Clear existing data, excluding headers if needed
  inventorySheet
    .getRange(
      START_ROW,
      START_COLUMN,
      inventorySheet.getLastRow() - START_ROW + 1,
      DATA_COLUMNS
    )
    .clearContent();

  // Populate the sheet with the new data
  inventorySheet
    .getRange(START_ROW, START_COLUMN, data.length, DATA_COLUMNS)
    .setValues(data);
}
