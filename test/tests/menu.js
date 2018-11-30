const app = require("../../app/app").app;
const templates = require("../templates");

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const requester = chai.request(app).keepOpen();

let new_item = {
    item_name: "Beer",
    item_price: "666",
    category: "beverages",
};
let bad_new_item = {
    item_name: "Ring",
    item_price: "9999",
    category: "jewelry",
};

describe('Menu', function Menu() {
    it('should GET all the menu items', function getEntireMenu(done) {
        chai.request(app)
            .get('/menu')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(templates.menu.length);
                done();
            });
    });

    it('should individually GET every individual menu item', async function getEachMenuItem() {
        let i = 1;
        for await (const menu_item of templates.menu) {
            const res = await requester.get('/menu/' + i);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.id.should.equal(i);
            res.body.item_name.should.equal(menu_item.item_name);
            i++;
        }
    });

    it('should POST a new menu item', async function postNewMenuItem() {
        const request = await requester.post("/menu").type('form').send(new_item);
        request.should.have.status(200);
        request.body.item_name.should.equal(new_item.item_name);

        // Overwrite new item with returned item. It will contain it's DB ID for later
        new_item = request.body;
    });

    // Example of using the mocha done() callback instead of async to signal end of async test
    it('should fail to POST a new menu item with a bad menu_category name', function postNewMenuItemFail(done) {
        this.timeout(2000);
        requester.post("/menu").type('form').send(bad_new_item).then((err, res) => {
            should.exist(err);
            should.not.exist(res);
            err.status.should.equal(400);
            err.body.category.should.equal(bad_new_item.category);
            done();
        });
    });

    it('should use PUT to edit an existing item', async function putEditMenuItem() {
        // Use id returned from creation of new item to change its name to Whiskey
        const new_name = "Whiskey";

        const request = await requester.put("/menu/" + new_item.id).type('form').send({
            item_name: new_name,
        });

        request.should.have.status(200);
        request.body.item_name.should.equal(new_name);
    });

    it('should use DELETE to delete an existing item', async function deleteMenuItem() {
        // Get the number of menu item in the database before deleting
        const request1 = await requester.get("/menu");
        request1.should.have.status(200);
        const original_length = request1.body.length;

        // Use id returned from creation of new item to delete it
        const request2 = await requester.delete("/menu/" + new_item.id);
        request2.should.have.status(200);
        request2.body.item_price.should.equal(new_item.item_price);

        // The new number of menu items should be one less than before
        const request3 = await requester.get("/menu");
        request3.should.have.status(200);
        request3.body.should.have.lengthOf(original_length - 1);
    });
});