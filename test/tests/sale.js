const app = require("../../app/app").app;
const templates = require("../templates");
const utils = require("../../app/utility/date");

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const requester = chai.request(app).keepOpen();

let new_sale = {
    tax_percent: "700",
    total: Math.round((175 * 6 + 275 * 3) * 1.07),
    items: [
        {
            item_name: "Soft Drinks or Iced Tea",
            item_price: "175",
            quantity: 6,
            created_date: new Date()
        },
        {
            item_name: "Egg & Cheese Sandwich",
            item_price: "275",
            quantity: 3,
            created_date: new Date()
        }
    ],
    sale_date: utils.daysAgo(2) // Sale made 2 days ago
};

describe('Sale', function Menu() {
    it('should GET all the sales placed today', function getTodaySales(done) {
        chai.request(app)
            .get('/sale')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(1);
                done();
            });
    });

    it('should POST a new sale', async function postNewSale() {
        const request = await requester.post("/sale").type('form').send(new_sale);
        request.should.have.status(200);
        request.body.total.should.equal(new_sale.total);

        // Verify that dates are equal down to the millisecond
        let response_date = new Date(request.body.created_date).getMilliseconds();
        let sent_date = new Date(new_sale.sale_date).getMilliseconds();
        response_date.should.equal(sent_date);
    });
});