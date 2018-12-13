const router = require('express').Router();

router.use("/menu/category", require("./menu_category"));
router.use('/menu', require('./menu'));
router.use('/sales', require('./sales'));
router.use('/sale', require('./sale'));

module.exports = router;