const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
chai.use(chaiAsPromised).should();
chai.use(chaiHttp);

const app = require("../../app/app").app;
const requester = chai.request(app).keepOpen();
const templates = require("../templates");

let new_item = {
    "item_name": "Beer",
    "item_price": "666",
    "category": "beverages",
};

describe('Menu', function Menu() {
    it('it should GET all the menu items', (done) => {
        chai.request(app)
            .get('/menu')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(templates.menu.length);
                done();
            });
    });

    it('it should individually GET every individual menu item', async function getEachMenuItem() {
        let i = 1;
        for await (const menu_item of templates.menu) {
            const res = await requester.get('/menu/' + i);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.id.should.equal(i);
            res.body.item_name.should.equal(menu_item.item_name);
            i++;
        }

        return true;
    });

    it('it should POST a new menu item', async function postNewMenuItem() {
        const request = await requester.post("/menu").type('form').send(new_item);
        console.log(request.body);
        request.should.have.status(200);
    })
});