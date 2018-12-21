# Point of Sale System

Features:
   - Menu items with categories
   - Sales of menu items
   - Day sumaries of all sales made in a day (TODO)
   
API reference:
   - *API* section of the [Server README](./app/server/README.md)

## Getting Started
Start here to set up the development environment for the PoS system. 

### Install Docker and Docker-Compose
The first step is to install [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) on your OS. If you already have both installed and working, you can skip this step. 

If you are using a Mac and have the [brew package manager](https://brew.sh/), you can follow [this tutorial](https://pilsniak.com/how-to-install-docker-on-mac-os-using-brew/) to get docker working on your machine.
 
 To test if your set up is correct, try navigating to the parent directory of this repo and run `docker-compose build` followed by `docker-compose up` (for future runs, you should only have to build once). 
  
  If everything worked you should see a series of postgres status messages, then something like this
  ![What the command line should look like](docs/imgs/first_run_example.png)
  
  If you receive an error message related to Docker, try to Google the error while specifying your OS. Using Mac, I ran into the [Couldn't connect to Docker daemon](https://github.com/docker/compose/issues/2180)  error, and then did a bit more troubleshooting after `docker-machine start default` didn't work. Don't lose heart, just keep Googling. After you set up Docker once, it shouldn't need additional tinkering. 
  
### Starting the client and server
After successfully getting docker to work, build the backend image once by using `docker-compose build`, then you can run the backend at any time using `docker-compose up` or `npm start`. 

### Initializing the server database
To initialize the database, run `npm run create_tables`. If you want to work with an empty database that is all you need to do. However, if you'd like to initialize the tables with data for testing your environment with, run `npm run populate_tables` to fill each table with the contents found in [templates.js](app/server/src/config/templates.js). 

Feel free to edit the contents of [templates.js](app/server/src/config/templates.js) as needed. Just make sure to enter data that is consistent with the PostgreSQL tables defined in [tables.js](app/server/src/db/tables.js).  


### Interacting with the backend
You should now have the backend up and running. You can interact with the data by using the endpoints documented in the *API* section of the [backend document](./app/server/README.md).  

If you are unfamiliar with how to interact with a RESTful API, see [Appendix A: Interacting with the API](#interacting-with-a-restful-api) to learn how to inspect the API using `curl` or how to access it on a frontend using Javascript's `fetch(...)`.
  

# Tutorials
This section contains written tutorials and other links/resources that may you find find helpful when developing this system.

## Interacting with a RESTful API
Interacting with the API involves sending *(POST)* and receiving *(GET)* JSON documents through specific parameters (URLs/URIs).

There are four HTTP methods that each map to a CRUD (Create, Read, Update, Delete) operation. 
- POST: Create
- GET: Read
- PUT: Update
- DELETE: Delete

When you perform an HTTP method, you will call it on a *route/endpoint/URL*.

For example, you can call **GET** on **localhost:3000/menu/1** to *get* the first menu item. Notice that for a GET request you don't pass any data. 

If you were to send a **POST** on **localhost:3000/menu** you would send a body or data parameters. In JSON that could look like the following object: 
```json
 {
    "item_name": "Two Eggs",
    "item_price": 475,
    "category": "egg-specialties"
 }
```
and a new menu item would be created using the data you sent.

To verify that your item was created, a **HTTP Status** response will be sent to you. If created successfully your `response.status` would be `201`. If you entered invalid data, for instance `item_price: "a string"`, you would receive a `400` status code. 

To see a full list of status codes, visit [https://httpstatuses.com/](https://httpstatuses.com/), a site I'd recommend adding to your bookmarks. 

Some responses (such as GET) return contents in addition to an HTTP status. For instance, a **GET** call to **localhost:3000/sales** would return an array of all says made in the current day. Parsing that array into JSON or an array object is language specific. 

### Implementing the Interactions
Here we will cover how you can interact with an API from the command line using `curl` (to quickly test out an endpoint), and how to fetch/send data using the `fetch` command in Javascript. 

#### Using `curl`

**Note:** Curl is only available on Linux/Mac by default.

**Note 2:** For these examples to work properly, make sure you've run `npm populate_tables` after creating the tables, to insure that you have data to actually fetch in each command.  


By default, you can simply perform a get request with curl as follows:
 - `curl localhost:3000/menu`
 
To make the output of the JSON more readable, you can pipe the output to `json_pp`
 - `curl localhost:3000/menu | json_pp`
 
 You should get something like this: 
 
 ![Curl GET example](docs/imgs/curl_get_example.png)
 
 You can also send other types of HTTP methods, like POST. In this example we will create a new menu item.
 - `curl localhost:3000/menu -X POST -H "Content-Type: application/json" -d '{"item_name": "New item", "item_price": 42, "category": "beverages"}'`
 
 If created successfully, it should return the newly created item. 
 
 You can double check by calling `curl localhost:3000/menu | json_pp` again, and you should see the "New item" listed. 
 
 For a GUI environment with many more features, look into [Postman](https://www.getpostman.com/) for developing/naive testing the API. 
 
 #### Using `fetch`
 Despise the name, fetch can be used to implement any HTTP method (GET, POST, PUT, DELETE, etc). 
 
 For official documentation for using fetch, see [Mozilla's Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
 
 This section will just include a quick bootstrapped examples to get you started with fetch. 
  
  
  
**Fetching menu items using async await (preferred method)**
```javascript
 // Can only "await" from async function
 async function main() {
   console.log(await fetchMenuItems());
 }
 
 async function fetchMenuItems(){
         const response = await fetch('http://localhost:3000/menu');
         // response.json must be awaited 
         return JSON.stringify(await response.json());
 }
 
 main();
```

**Fetching menu items using promises**
```javascript
 function fetchMenuItems(){
        return fetch('http://localhost:3000/menu')
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                return JSON.stringify(myJson);
            });
    }
    
  // Promise "awaits" until finish before passing results to .then
 fetchMenuItems().then((results) => {
     console.log(results)
 });
```
 
 **Posting a new menu item using async await**
```javascript
(async () => {
    // Call the postObject method located below. Specify the endpoint: /menu
    const response = await postObject("/menu",  {
       item_name: "New item 2",
       item_price: 666,
       category: "egg-specialties"
    }, {
        // Options for the postObject function
        return_response: true,
        log_results: true
    });
    
    if (response.status === 200) {
        let user_response = await response.text();
        // If JSON, parse
        if (user_response[0] === "{") {
            user_response = JSON.parse(user_response);
        }
        
        console.log(user_response);
    } else {
        console.error("Error creating a new menu item");
    }
})();

// Put this function somewhere and export it since you will likely use it for all POSTs
async function postObject(uri, send_object, options) {
    const response = await fetch("http://localhost:3000" + uri, {
                        // Specify the method (Could replace with PUT, POST, or DELETE)
                        method: "POST",
                        // Tell the server you are sending a JSON object
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Cache': 'no-cache'
                        },
                        // Body sent in HTTP method must be converted into a String. It will be parsed back into a JSON object by server
                        body: JSON.stringify(send_object),
                    });

    options.log_results && console.log(response.ok ? "Successful response!" : "Failed response");

    // Response will be returned if return_response is set to true
    if (options.return_response) {
        return response;
    }
}
```
 