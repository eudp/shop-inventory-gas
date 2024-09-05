# Google Sheets Inventory Management

This repository contains Google Apps Script code for managing inventory in Google Sheets. The scripts perform the following functions:

- Fetch Inventory Data: Retrieves inventory data from an external API and populates the Google Sheet.
- Update Inventory: Processes POST requests to update stock quantities in the sheet.
- Send Notifications: Sends email alerts when inventory falls below a defined threshold.
- Highlight Low Stock: Colors rows in the sheet based on stock levels.

## Scripts
- `getShopInventory()`: Fetches and populates inventory data from an API.
- `processPostResponse(id, quantity)`: Updates stock for a specific product.
- `evaluateAndSendEmail(productValues, rangeStock)`: Sends email notifications for low stock.
- `setRowColor(range)`: Changes row color based on stock levels.
- `detectAlertClick(range)`: Sends email alerts when a checkbox is checked and stock is low.
- `sendEmailTest()`: Sends a test email with sample data.

## Setup

1. Configure the email template file in your Google Apps Script project.
2. Update constants such as `SHEET_ID` and `INVENTORY_SHEET_NAME` as needed.

## Usage

- Run `getShopInventory()` to fetch and populate data.
- POST updates to the script URL to modify stock quantities.
- Row colors and alerts are handled automatically on edits.
