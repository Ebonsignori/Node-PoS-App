# Point of Sale System Server
This backend provides a RESTful API to management the data needed by a restaurant's point of sale system. 

**Supports CRUD operations on the following persistent data:**
   - Menu items with prices. 
   - Menu categories to which any menu item may belong. 
   - Sales of menu items. Includes the total of the sale and the sales tax used to calculate it. 
   - Day summaries of all sales made in each day.

### Interacting with the backend
If you are unfamiliar with how to interact with a RESTful API, see the *Interacting with a RESTful API* section in the [topmost README of this repo](../../README.md).
  

# Reference
- [API](#api)
- [Data Management Scrips](#data-management)

## API
The routes for the API can be found in [app/routes/index.js](./src/routes/index.js). The specific parameters after each route in [index.js](./src/routes/index.js) are imported from the JS files in the same directory. 

Terminology: 
- **Parameters or Params:** Will refer to the URI endpoints. For instance, to GET a specific menu item by it's ID, you would call `GET "/menu/:id"`, where `:id` is a numeric parameter referring to the specific menu item (i.e. `GET /menu/1`). In this case `:id` is a **param**
- **Body:** Will refer to the JSON contents passed to the endpoint. For instance, to POST a new menu item, you would call 
    ```
    POST "/menu", {
        item_name: "New item",
        item_price: 42,
        category: "beverages"
    }
    ```
    The data sent alongside the POST is the body. In this case, `item_name` belongs to the **body**.
    
In summary, `:id` belongs to the **params** and `item_name` belongs to the **body**. 


## Data Management 
These are scripts that help developers create, delete, and populate the backend's database to ease development. Each script can be found in the "scrips" key in the toplevel [package.json](../../package.json).  

#### Create Tables
 `npm run create_tables`

Creates each of the tables using the keys in [table_management.js](./src/db/table_management.js). The tables are created in order of dependencies. This means that the *menu_categories* table will be created before the *menu* table to account for the optional foreign key dependency of *menu_category* in each *menu* item.   

#### Remove Tables
 `npm run drop_tables`

Drops each of the tables using the keys in [table_management.js](./src/db/table_management.js). The tables are dropped in reverse order of dependencies.

#### Populate Tables
 `npm run populate_tables`

Populates already-created tables with the data found in [templates.js](./src/config/templates.js). Each top-level key in templates.js must match the table name, and the objects in each of the top-level key's arrays must be consistent with the data expected in each table, as described in [tables.js](./src/db/tables.js). 

**Note:** The templates in the [/app/config/templates.js](./src/config/templates.js) file are separate from the templates used for testing in the [/test/test_templates.js](./test/test_templates.js) file. If you wish to modify the templates in the development environment, modify [/app/config/templates.js](./src/config/templates.js) instead of the test templates. 