function validateSaleTotal(items, tax, declared_total) {
    let calculated_total = 0;

    // Calculate the actual total using the price and quantity of each item
    for (const item of items) {
        calculated_total += Number(item.item_price) * Number(item.quantity);
    }

    // Calculate tax
    calculated_total = safePercent(calculated_total, tax);

    // If declared_total is passed in, return true if calculated total matches declared total, false otherwise
    if (declared_total) {
        return calculated_total === Number(declared_total);
    // Otherwise just return the calculated total
    } else {
        return calculated_total;
    }
}

/*
  Validate the array of sale items. Each item is as follows:
  {
    item_name: "string",
    item_price: "number" (Integer)
    item_quantity: "number" (Integer)
  }
 */
function validateSaleItems(items) {
    for (const item of items) {
        if (!item.item_name || typeof item.item_name !== "string"
            || !item.item_price || !Number.isInteger(Number(item.item_price))
            || !item.quantity || !Number.isInteger(Number(item.quantity))) {
            return `Each menu item must contain item_name, item_price, and quantity as follows:
                 {
                    item_name: "string"
                    item_price: integer // in cents
                    quantity: integer // in cents
                }
                `;
        }
    }

    return undefined;
}

function safePercent(number, percent) {
    return Math.round(number * (1 + Number(percent)));
}

module.exports = {
    validateSaleTotal: validateSaleTotal,
    validateSaleItems: validateSaleItems
};