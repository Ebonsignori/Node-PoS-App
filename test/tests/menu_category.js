const app = require("../../app/app").app;
const templates = require("../templates");

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const requester = chai.request(app).keepOpen();

let new_category = "sides";

describe('Menu Categories', function Menu() {
    it('should GET all the categories', function getAllCategory(done) {
        chai.request(app)
            .get('/menu/menu_category')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(templates.menu_category.length);
                done();
            });
    });

    it('should individually GET every category', async function getEachCategory() {
        for await (const category of templates.menu_category) {
            const res = await requester.get('/menu/category/' + category);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.category_name.should.equal(category);
        }
    });

    it('should POST a new category', async function postNewCategory() {
        const request = await requester.post("/menu/category").type('form').send(new_category);
        request.should.have.status(200);
        request.body.category_name.should.equal(new_category);
    });

    const old_name = "breakfast-sandwiches";
    const new_name = "sandwiches";
    it('it should use PUT to edit an existing category', async function putEditCategory() {
        const request = await requester.put("/menu/category/" + old_name).type('form').send({
            category_name: new_name,
        });

        request.should.have.status(200);
        request.body.category_name.should.equal(new_name);
    });

    it('menu items should cascade the category name update of the new category name', async function checkOnCascadeUpdate() {
        // Get menu items with the old name
        let i = 0;
        for await (const menu_item of templates.menu) {
            i++;
            if (menu_item.category === old_name) {
                const res = await requester.get('/menu/' + i);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.id.should.equal(i);

                // Check that the item's category name is the new category name
                res.body.category.should.equal(new_name);
            }
        }
    });

    const category_to_delete = "beverages";
    it('should use DELETE to delete an existing category', async function deleteCategory() {
        // Delete the beverages category
        const request2 = await requester.delete("/menu/category/" + category_to_delete);
        request2.should.have.status(200);
        request2.body.category_name.should.equal(category_to_delete);
    });

    it("menu items that were referencing the deleted category should now have a NULL category", async function checkOnDeleteNull() {
        // Get menu items that had a category name that was deleted
        let i = 0;
        for await (const menu_item of templates.menu) {
            i++;
            if (menu_item.category === category_to_delete) {
                const res = await requester.get('/menu/' + i);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.id.should.equal(i);

                // Check that the item's category name is null
                console.log(res.body.category);
                should.not.exist(res.body.category);
            }
        }
    })
});