module.exports = {
    menu_category:
        `menu_category(
           name text PRIMARY KEY NOT NULL,
           modified_date TIMESTAMP,
           created_date TIMESTAMP NOT NULL
         )`,

    // Prices are in cents
    menu:
        `menu(
           id SERIAL PRIMARY KEY NOT NULL,
           item_name varchar(50) NOT NULL,
           item_price integer NOT NULL,
           category varchar(50) references menu_category(name) ON UPDATE CASCADE ON DELETE SET NULL,
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