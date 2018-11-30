module.exports = {
    menu: {
        get:
            "SELECT * FROM menu",
        get_item:
            "SELECT * FROM menu " +
            "WHERE menu.id = $1",
        add_item:
            "INSERT INTO menu(item_name, item_price, category, modified_date, created_date) " +
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