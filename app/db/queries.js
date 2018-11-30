module.exports = {
    menu_category: {
        get:
            "SELECT * FROM menu_category",
        get_category:
            "SELECT * FROM menu_category " +
            "WHERE menu_category.name = $1",
        add_category:
            "INSERT INTO menu(name, modified_date, created_date) " +
            "VALUES($1, $2, $2) " +
            "RETURNING *",
        remove_category:
            "DELETE FROM menu_category " +
            "WHERE menu_category.name = $1 " +
            "RETURNING *",
        edit_category:
             "UPDATE menu_category SET name = $1 WHERE menu_category.name = $2"
    },
    menu: {
        get:
            "SELECT * FROM menu",
        get_item:
            "SELECT * FROM menu " +
            "WHERE menu.id = $1",
        add_item:
            "INSERT INTO menu(item_name, item_price, menu_category, modified_date, created_date) " +
            "VALUES($1, $2, $3, $4, $4) " +
            "RETURNING *",
        remove_item:
            "DELETE FROM menu " +
            "WHERE menu.id = $1 " +
            "RETURNING *",

        // Build an edit_item query based on which deconstructed arguments are passed in
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
                update_string += `category = $${update_args.length}, `;
            }

            // Modified date will always be present, and add id as the last argument
            update_args.push(modified_date);
            update_string += `modified_date = $${update_args.length} WHERE menu.id = $${update_args.length + 1} RETURNING *`;
            update_args.push(id);


            return [update_string, update_args];
        }
    },
};