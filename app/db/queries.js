module.exports = {
    menu_category: {
        get:
            "SELECT * FROM menu_category",
        get_category:
            "SELECT * FROM menu_category " +
            "WHERE menu_category.name = $1",
        add_category:
            "INSERT INTO menu_category(name, modified_date, created_date) " +
            "VALUES($1, $2, $2) " +
            "RETURNING *",
        remove_category:
            "DELETE FROM menu_category " +
            "WHERE menu_category.name = $1 " +
            "RETURNING *",
        edit_category:
            "UPDATE menu_category SET name = $2 WHERE menu_category.name = $1 " +
            "RETURNING *"
    },

    menu: {
        get:
            "SELECT * FROM menu",
        get_item:
            "SELECT * FROM menu " +
            "WHERE menu.id = $1",
        add_item:
            "INSERT INTO menu(item_name, item_price, category, modified_date, created_date) " +
            "VALUES($1, $2, (SELECT name FROM menu_category WHERE name = $3), $4, $4) " +
            "RETURNING *",
        remove_item:
            "DELETE FROM menu " +
            "WHERE menu.id = $1 " +
            "RETURNING *",

        // Build an edit query based on which deconstructed arguments are passed in
        edit_item: (id, {
            item_name = undefined,
            item_price = undefined,
            category = undefined,
            modified_date = new Date()
        } = {}) => {
            let update_string = "UPDATE menu SET ";
            let update_args = [];
            if (item_name) {
                update_args.push(item_name);
                update_string += `item_name = $${update_args.length}, `;
            }
            if (item_price) {
                update_args.push(item_price);
                update_string += `item_price = $${update_args.length}, `;
            }
            if (category) {
                update_args.push(category);
                update_string += `category = (SELECT name FROM menu_category WHERE name = $${update_args.length}), `;
            }

            // Modified date will always be present, and add id as the last argument
            update_args.push(modified_date);
            update_string += `modified_date = $${update_args.length} ` +
                `WHERE menu.id = $${update_args.length + 1} RETURNING *`;
            update_args.push(id);


            return [update_string, update_args];
        }
    },

    sale: {
        // Period must be "on", "before", or "after". Date paramer $1 must be in ISO-8601 format. i.e. YYYY-MM-DD
        get: (period) => {
            let query_string =  "SELECT * FROM sale ";
            let operand;

            switch (period) {
                case "on":
                    operand = "=";
                    break;
                case "before":
                    operand = "<";
                    break;
                case "after":
                    operand = ">";
                    break;
                default:
                    throw `Invalid period. Must be "on", "before", or "after".`
            }

            // Return the query string with the appropriate operand for the desired period
            return query_string + "WHERE date(created_date) " + operand + " $1"
        },
        get_sale:
            "SELECT * FROM sale " +
            "WHERE sale.id = $1",
        new_sale:
            "INSERT INTO sale(tax_percent, total, items, modified_date, created_date) " +
            "VALUES($1, $2, $3, $4, $5) " +
            "RETURNING *",
        remove_sale:
            "DELETE FROM sale " +
            "WHERE sale.id = $1 " +
            "RETURNING *",
        // Build the edit query based on which deconstructed arguments are passed in
        edit_sale:
            "UPDATE sale " +
            "SET tax_percent = $2, total = $3, items = $4, modified_date = $5, created_date = $6 " +
            "WHERE sale.id = $1 " +
            "RETURNING *"
    }
};