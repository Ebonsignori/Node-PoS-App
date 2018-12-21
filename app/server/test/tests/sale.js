const app = require("../../src/app").app;
const utils = require("../../src/utility/date");

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const requester = chai.request(app).keepOpen();

const new_sale_amount = 175 * 6 + 275 * 3;
let new_sale = {
    tax_percent: .07, // 7%
    total: Math.round(new_sale_amount * 1.07),
    items: [
        {
            item_name: "Soft Drinks or Iced Tea",
            item_price: 175,
            quantity: 6,
            created_date: new Date()
        },
        {
            item_name: "Egg & Cheese Sandwich",
            item_price: 275,
            quantity: 3,
            created_date: new Date()
        }
    ],
    sale_date: utils.daysAgo(2) // Sale made 2 days ago
};

describe('Sale', function sale() {
    it('should POST a new sale', async function postNewSale() {
        const request = await requester.post("/sale").type('form').send(new_sale);
        request.should.have.status(200);
        request.body.total.should.equal(new_sale.total);

        // Verify that dates are equal down to the millisecond
        let response_date = new Date(request.body.created_date).getMilliseconds();
        let sent_date = new Date(new_sale.sale_date).getMilliseconds();
        response_date.should.equal(sent_date);

        // If added sale returned its ID (it will if it was added correctly) then replace new_sale object for future tests
        if (request.body.id) {
            new_sale = request.body;
        } else {
            new_sale = undefined;
        }
    });

    it('should GET the newly posted sale', async function postNewSale() {
        // Skip this test if the new sale wasn't posted
        if (!new_sale) {
            this.skip();
        }

        const request = await requester.get("/sale/" + new_sale.id);

        request.should.have.status(200);
        request.body.total.should.equal(new_sale.total);

        // Verify that id's are equal
        request.body.id.should.equal(new_sale.id);
    });


    it("should use PUT to edit an existing sale's tax", async function editSaleTax() {
        // Skip this test if the new sale wasn't posted
        if (!new_sale) {
            this.skip();
        }

        const new_tax_percent = .11; // 11%
        const new_total = Math.round(new_sale_amount * (1 + new_tax_percent));

        const request = await requester.put("/sale/" + new_sale.id + "/change_tax").type('form').send({
            tax_percent: new_tax_percent,
            total: new_total,
        });

        request.should.have.status(200);
        request.body.total.should.equal(new_total)
    });

    const new_item = {
        item_name: "Two Eggs w/ Meat",
        item_price: 575,
        quantity: 2,
        created_date: new Date()
    };
    let sales_tax_changed_back = false;
    it("should use PUT to edit an existing sale's tax and add an item.", async function editSaleTaxAndAddItem() {
        // Skip this test if the new sale wasn't posted
        if (!new_sale) {
            this.skip();
        }

        const new_tax_percent = .07; // 7%
        const new_total = Math.round((new_sale_amount + (2 * 575)) * (1 + new_tax_percent)); // Add new item to calculations

        const request = await requester.put("/sale/" + new_sale.id + "/add").type('form').send({
            tax_percent: new_tax_percent,
            items: [new_item],
            total: new_total,
        });

        request.should.have.status(200);
        request.body.total.should.equal(new_total);
        request.body.items.length.should.equal(new_sale.items.length + 1);
        sales_tax_changed_back = true;
    });

    it("should use PUT to remove the added item in a sale.", async function removeAddedItem() {
        // Skip this test if the new sale wasn't posted
        if (!new_sale) {
            this.skip();
        }

        const request = await requester.put("/sale/" + new_sale.id + "/remove").type('form').send({
            items: [new_item],
            total: new_sale.total // Total will be unchanged from original item (since removing added item)
        });

        request.should.have.status(200);
        request.body.items.length.should.equal(new_sale.items.length);
        request.body.total.should.equal(new_sale.total);
    });

    const new_item2 = {
        item_name: "Coffee, Hot Tea, Hot Chocolate",
        item_price: 165,
        quantity: 3,
    };
    let two_items_added = false;
    it("should use PUT to add two items in a sale.", async function addTwoItems() {
        // Skip this test if the new sale wasn't posted or the tax wasn't changed back to .07
        if (!new_sale || !sales_tax_changed_back) {
            this.skip();
        }

        const new_total = Math.round((new_sale_amount + (2 * 575) + (3 * 165)) * (1 + .07)); // Add 2 items to calc

        const request = await requester.put("/sale/" + new_sale.id + "/add").type('form').send({
            items: [new_item, new_item2],
            total: new_total,
        });

        request.should.have.status(200);
        request.body.total.should.equal(new_total);
        request.body.items.length.should.equal(new_sale.items.length + 2);
        two_items_added = true;
    });

    it("should use PUT to edit an existing item in a sale.", async function editExistingItem() {
        // Skip this test if the new sale wasn't posted or the two items weren't added
        if (!new_sale || !two_items_added) {
            this.skip();
        }

        const new_quantity = 4;

        // Change the quantity of tea from 3 (in previous test) to 4
        const new_total = Math.round((new_sale_amount + (2 * 575) + (new_quantity * 165)) * (1 + .07));
        new_item2.quantity = new_quantity;

        const request = await requester.put("/sale/" + new_sale.id + "/edit").type('form').send({
            item: new_item2,
            total: new_total,
        });

        request.should.have.status(200);
        request.body.total.should.equal(new_total);
        request.body.items[request.body.items.length - 1].quantity.should.equal(String(new_quantity));
    });

    it("should use PUT to edit the date of an existing sale.", async function editExistingItemDate() {
        const new_date = utils.daysAgo(6);

        const request = await requester.put("/sale/1/change_date").type('form').send({
            sale_date: new_date,
        });

        request.should.have.status(200);

        // Verify that dates are equal down to the millisecond
        let response_date = new Date(request.body.created_date).getMilliseconds();
        let sent_date = new Date(new_date).getMilliseconds();
        response_date.should.equal(sent_date);
    });

    it('should use DELETE to delete an existing sale', async function deleteSale() {
        // Get the current number of sales
        const request1 = await requester.get("/sales/before/" + new Date());
        request1.should.have.status(200);
        const original_length = request1.body.length;

        const request2 = await requester.delete("/sale/" + new_sale.id);
        request2.should.have.status(200);
        request2.body.id.should.equal(new_sale.id);


        // The new number of sales should be one less than before
        const request3 = await requester.get("/sales/before/" + new Date());

        request3.should.have.status(200);
        request3.body.should.have.lengthOf(original_length - 1);
    });

});