const utils = require("../app/utility/date");

module.exports = {
    menu_category: [
        "egg-specialties",
        "breakfast-sandwiches",
        "beverages"
    ],

    menu: [
        // Egg Specialities
        {
            item_name: "Two Eggs",
            item_price: 475,
            category: "egg-specialties",
            created_date: new Date()
        },
        {
            item_name: "Two Eggs w/ Meat",
            item_price: 575,
            category: "egg-specialties",
            created_date: new Date()
        },
        // Breakfast Sandwiches
        {
            item_name: "Egg Sandwich",
            item_price: 225,
            category: "breakfast-sandwiches",
            created_date: new Date()
        },
        {
            item_name: "Egg & Cheese Sandwich",
            item_price: 275,
            category: "breakfast-sandwiches",
            created_date: new Date()
        },
        // Beverages
        {
            item_name: "Coffee, Hot Tea, Hot Chocolate",
            item_price: 165,
            category: "beverages",
            created_date: new Date()
        },
        {
            item_name: "Soft Drinks or Iced Tea",
            item_price: 175,
            category: "beverages",
            created_date: new Date()
        }
    ],

    sale: [
        {
            tax_percent: .07, // 7%
            total: Math.round((175 * 4 + 225 * 3) * 1.07),
            items: [
                {
                    item_name: "Soft Drinks or Iced Tea",
                    item_price: 175,
                    quantity: 4,
                    created_date: new Date()
                },
                {
                    item_name: "Egg Sandwich",
                    item_price: 225,
                    quantity: 3,
                    created_date: new Date()
                }
            ],
            sale_date: new Date() // Sale made "today"
        },
        {
            tax_percent: .07, // 7%
            total: Math.round((175 * 2 + 275 * 1) * 1.07),
            items: [
                {
                    item_name: "Soft Drinks or Iced Tea",
                    item_price: 175,
                    quantity: 2,
                    created_date: new Date()
                },
                {
                    item_name: "Egg & Cheese Sandwich",
                    item_price: 275,
                    quantity: 1,
                    created_date: new Date()
                }
            ],
            sale_date: utils.daysAgo(2) // Sale made 2 days ago
        }
    ]

};