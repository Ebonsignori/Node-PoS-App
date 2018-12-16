const app = require("../../app/app").app;
const templates = require("../../app/config/templates.js");
const utils = require("../../app/utility/date");

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.use(chaiAsPromised).should();
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
    sale_date: utils.daysForward(6) // Sale made 6 days in the future
};

describe('Sales', function sales() {
    it('should GET all the sales placed today', function getTodaySales(done) {
        chai.request(app)
            .get('/sales')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(1);
                done();
            });
    });


    it('should GET all the sales placed before tomorrow', async function getAllSalesBeforeTomorrow() {
        // Get the current number of sales
        const request = await requester.get("/sales/before/" + utils.daysForward(1));
        request.should.have.status(200);
        request.body.should.have.lengthOf(templates.sale.length);
    });

    it('should place a new sale and be able to GET it using sales on that date', async function getSalesOn() {
        // Place a new sale
        const request = await requester.post("/sale/").type("form").send(new_sale);

        // Replace new_sale with returned sale containing its database ID to outer scope for future tests
        if (request.status === 200) {
            new_sale = request.body;
        } else {
            new_sale = undefined;
        }
        request.should.have.status(200);

        // Verify that dates are equal down to the millisecond
        let response_date = new Date(request.body.created_date).getMilliseconds();
        let sent_date = new Date(new_sale.created_date).getMilliseconds();
        response_date.should.equal(sent_date);

        // Get sales on sale date
        const request2 = await requester.get("/sales/" + utils.daysForward(6));
        request2.should.have.status(200);

        // There should only be one sale returned and it should be the newly created sale
        request2.body.should.have.lengthOf(1);
        const returned_sale = request2.body[0];
        returned_sale.id.should.equal(new_sale.id);

        // Check that the sale returned from sales fetch is the new sale
        response_date = new Date(returned_sale.created_date).getMilliseconds();
        response_date.should.equal(sent_date);
    });

    it('should GET the new sale placed after today from sales endpoint', async function getSalesAfter() {
        // Skip this test if the new sale wasn't posted
        if (!new_sale) {
            this.skip();
        }

        // Get the sales after today
        const request = await requester.get("/sales/after/" + new Date());
        request.should.have.status(200);

        // Only the single new sale should be returned
        request.body.should.have.lengthOf(1);
        const returned_sale = request.body[0];
        returned_sale.id.should.equal(new_sale.id);


        // Check that the sale returned from sales fetch is the new sale
        const response_date = new Date(returned_sale.created_date).getMilliseconds();
        const sent_date = new Date(new_sale.created_date).getMilliseconds();
        response_date.should.equal(sent_date);
    });
});