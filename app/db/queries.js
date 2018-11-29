module.exports = {
    menu: {
        get:
            "SELECT * FROM menu",
        new_item:
            "INSERT INTO menu(item_name, item_price, category, modified_date, created_date) " +
            "VALUES($1, $2, $3, $4, $5)"
    },
};