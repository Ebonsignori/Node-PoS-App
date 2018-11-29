module.exports = {
    // Prices are in cents
    menu:
        `menu(
           id SERIAL PRIMARY KEY,
           item_name text NOT NULL,
           item_price integer NOT NULL,
           category menu_category NOT NULL,
           modified_date TIMESTAMP,
           created_date TIMESTAMP NOT NULL
         )`,
    sales:
        `sales(
           id SERIAL PRIMARY KEY,
           tax integer NOT NULL,
           total integer NOT NULL,
           menu_items json NOT NULL,
           modified_date TIMESTAMP,
           created_date TIMESTAMP NOT NULL
         )`,
};