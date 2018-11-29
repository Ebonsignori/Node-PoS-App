module.exports = {
    menu: {
        get:
            "SELECT * FROM menu",
        get_item:
            "SELECT * FROM menu " +
            "WHERE menu.id = $1",
        new_item:
            "INSERT INTO menu(item_name, item_price, category, modified_date, created_date) " +
            "VALUES($1, $2, $3, $4, $5)",
        remove_item:
            "DELETE FROM menu" +
            "WHERE menu.id = $1",
        edit_item: (id, {
            item_name = undefined,
            item_price = undefined,
            category = undefined,
            modified_date = new Date()
        } = {}) => {
            let insert_string = "INSERT INTO menu(";
            let insert_args = [];
            if (item_name) {
                insert_string += "item_name, ";
                insert_args.push(item_name)
            }
            if (item_price) {
                insert_string += "item_price, ";
                insert_args.push(item_price)
            }
            if (category) {
                insert_string += "category, "
            }
            insert_args.push(modified_date);
            insert_string += "modified_date) VALUES(";
            for (let i = 1; i < insert_args.length; i++) {
                insert_string += "$" + i;
            }
            insert_string += ")";

            return [insert_string, insert_args];
        }
    },
};